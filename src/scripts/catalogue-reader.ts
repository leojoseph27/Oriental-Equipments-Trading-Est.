/*
 * Digital catalogue reader — 3D page-turn book.
 *
 * Renders the original 29-page PDF page-for-page with PDF.js and animates
 * double-sided "leaves" rotating around the spine (rotateY on a perspective
 * parent). No page-flip library: leaf j holds page 2j+1 (front) and 2j+2
 * (back), so flipping leaf f moves exactly one physical sheet, in the correct
 * direction for Next and Previous.
 *
 * Pages are rasterised through a small priority scheduler so that page turns
 * never wait on rendering: the turn animation starts immediately, and the
 * faces of the turning leaf are painted as they arrive. While the reader is
 * idle the next spread (turn-ahead) and the previous spread (turn-back) are
 * pre-rendered at lower priority, with at most two pages rendering at once so
 * the main thread stays responsive. Rendered canvases are cached (LRU) and
 * reused, so revisiting a spread never re-renders.
 */
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const PDF_SRC = "/pdfs/oriental-catalogue.pdf";

// Optional controls are absent in the compact (home-page) embed; the reader
// works with Previous/Next alone there.
const els = {
  root: document.getElementById("catalogue-reader") as HTMLElement,
  loading: document.getElementById("cr-loading") as HTMLElement,
  error: document.getElementById("cr-error") as HTMLElement,
  book: document.getElementById("cr-book") as HTMLElement,
  leaves: document.getElementById("cr-leaves") as HTMLElement,
  single: document.getElementById("cr-single") as HTMLElement,
  singleCanvas: document.getElementById("cr-single-canvas") as HTMLCanvasElement,
  prev: document.getElementById("cr-prev") as HTMLButtonElement,
  next: document.getElementById("cr-next") as HTMLButtonElement,
  counter: document.getElementById("cr-counter") as HTMLElement,
  thumbs: document.getElementById("cr-thumbs") as HTMLElement | null,
  thumbToggle: document.getElementById("cr-thumb-toggle") as HTMLButtonElement | null,
  thumbPanel: document.getElementById("cr-thumb-panel") as HTMLElement | null,
  fsPrev: document.getElementById("cr-fs-prev") as HTMLButtonElement | null,
  fsNext: document.getElementById("cr-fs-next") as HTMLButtonElement | null,
  fsExit: document.getElementById("cr-fs-exit") as HTMLButtonElement | null,
  fullscreen: document.getElementById("cr-fullscreen") as HTMLButtonElement | null,
  stage: document.getElementById("cr-stage") as HTMLElement,
};

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

let doc: PDFDocumentProxy | null = null;
let numPages = 0;
let numLeaves = 0;
let flipped = 0; // leaves currently turned to the left side
let animating = false;
let queued: 1 | -1 | null = null; // one pending flip while one is in flight
let singleMode = false;

type CacheEntry = { canvas: HTMLCanvasElement; scale: number };
const pageCache = new Map<number, CacheEntry>(); // 1-based page -> rendered canvas
const CACHE_MAX = 14;
let stageWidth = 0;

function updateCounter() {
  if (!numPages) return;
  let text: string;
  if (singleMode) {
    text = `${Math.min(flipped + 1, numPages)}`;
  } else if (flipped === 0) {
    text = "1";
  } else {
    const left = Math.min(2 * flipped, numPages);
    const right = Math.min(2 * flipped + 1, numPages);
    text = left === right ? `${left}` : `${left}–${right}`;
  }
  els.counter.textContent = `Page ${text} of ${numPages}`;
}

/* ---------- priority render scheduler ----------
 * priority 0 = face of the leaf currently turning (must arrive mid-animation)
 * priority 1 = visible window (current spread +/- 1 leaf)
 * priority 2 = prefetch: the spread ahead (next likely action)
 * priority 3 = prefetch: the spread behind (backward navigation)
 */
const MAX_ACTIVE_RENDERS = 2;
type Job = {
  scale: number;
  priority: number;
  promise: Promise<CacheEntry | null>;
  resolve: (entry: CacheEntry | null) => void;
};
const pending = new Map<number, Job>(); // pageNo -> queued job
const inflightPromises = new Map<number, Promise<CacheEntry | null>>();
let activeRenders = 0;

function evictCache() {
  if (pageCache.size <= CACHE_MAX) return;
  // evict least-recently-used (Map preserves insertion order)
  for (const key of pageCache.keys()) {
    if (pageCache.size <= CACHE_MAX) break;
    pageCache.delete(key);
  }
}

async function renderTask(pageNo: number, targetScale: number): Promise<CacheEntry> {
  const page: PDFPageProxy = await doc!.getPage(pageNo);
  const base = page.getViewport({ scale: 1 });
  // targetScale is a desired pixel width; guard against 0 (stage not laid
  // out yet) so we never render a 0x0 canvas
  const scale = targetScale > 0
    ? Math.min(Math.max(targetScale / base.width, 1.5), 3)
    : 2;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  const entry = { canvas, scale };
  pageCache.set(pageNo, entry);
  evictCache();
  return entry;
}

function pump() {
  while (activeRenders < MAX_ACTIVE_RENDERS && pending.size > 0) {
    // while a flip animation runs, only render work that the animation
    // itself needs (priority <= 1); the rest waits for the settle
    let bestNo = -1;
    let bestPri = Infinity;
    for (const [no, job] of pending) {
      if (animating && job.priority > 1) continue;
      if (job.priority < bestPri) {
        bestPri = job.priority;
        bestNo = no;
      }
    }
    if (bestNo < 0) return;
    const job = pending.get(bestNo)!;
    pending.delete(bestNo);
    inflightPromises.set(bestNo, job.promise);
    activeRenders++;
    renderTask(bestNo, job.scale)
      .then(
        (entry) => job.resolve(entry),
        () => job.resolve(null), // best-effort: leave the slot blank
      )
      .finally(() => {
        activeRenders--;
        inflightPromises.delete(bestNo);
        pump();
      });
  }
}

/** Queue a page render at a priority; resolves with the cached entry (or
 * null if the job was pruned or rendering failed). Never blocks the caller
 * unless awaited. Cached pages resolve immediately without re-rendering. */
function schedule(pageNo: number, targetScale: number, priority: number): Promise<CacheEntry | null> {
  const cached = pageCache.get(pageNo);
  if (cached && cached.canvas.width >= targetScale * 0.8) {
    // refresh LRU order
    pageCache.delete(pageNo);
    pageCache.set(pageNo, cached);
    return Promise.resolve(cached);
  }
  const queuedJob = pending.get(pageNo);
  if (queuedJob) {
    // upgrade priority and resolution if the request became more urgent
    queuedJob.priority = Math.min(queuedJob.priority, priority);
    queuedJob.scale = Math.max(queuedJob.scale, targetScale);
    return queuedJob.promise;
  }
  const inflight = inflightPromises.get(pageNo);
  if (inflight) return inflight;
  const job: Job = { scale: targetScale, priority, promise: null!, resolve: null! };
  job.promise = new Promise<CacheEntry | null>((resolve) => { job.resolve = resolve; });
  pending.set(pageNo, job);
  pump();
  return job.promise;
}

/** Drop queued low-priority jobs that are no longer wanted (obsolete after
 * navigation). In-flight renders cannot be cancelled and finish normally. */
function pruneQueue(wanted: Set<number>) {
  for (const [no, job] of pending) {
    if (job.priority >= 2 && !wanted.has(no)) {
      pending.delete(no);
      job.resolve(null);
    }
  }
}

function pageScale(): number {
  const pageWidthPx = singleMode ? stageWidth : stageWidth / 2;
  return pageWidthPx * (window.devicePixelRatio || 1);
}

function leafEl(j: number): HTMLElement {
  return els.leaves.querySelector<HTMLElement>(`[data-leaf="${j}"]`)!;
}

function paintFace(face: HTMLElement, pageNo: number, priority = 1) {
  const slot = face.querySelector<HTMLElement>(".cr-page-slot")!;
  if (pageNo > numPages) {
    slot.replaceChildren(); // blank back of the final leaf
    return;
  }
  schedule(pageNo, pageScale(), priority).then((entry) => {
    if (!entry) return;
    // face may have moved out of the wanted window while rendering
    if (!face.isConnected || face.dataset.page !== String(pageNo)) return;
    if (slot.firstChild !== entry.canvas) {
      slot.replaceChildren(entry.canvas);
    }
    slot.classList.add("rendered");
  });
}

function needsPaint(face: HTMLElement, pageNo: number): boolean {
  if (face.dataset.page !== String(pageNo)) return true;
  const slot = face.querySelector<HTMLElement>(".cr-page-slot")!;
  if (!slot.classList.contains("rendered")) return true;
  const canvas = slot.querySelector("canvas");
  // a 0x0 canvas means the page was rendered before the stage had a size
  return !canvas || canvas.width === 0;
}

/** Leaves kept ready: the visible window (flipped-1..+1), plus one leaf of
 * prefetch on each side (ahead at higher priority than behind). */
function wantedLeaves(): Array<{ leaf: number; priority: number }> {
  const out: Array<{ leaf: number; priority: number }> = [];
  const push = (j: number, priority: number) => {
    if (j >= 0 && j <= numLeaves - 1) out.push({ leaf: j, priority });
  };
  for (let j = flipped - 1; j <= flipped + 1; j++) push(j, 1);
  if (singleMode) {
    push(flipped + 2, 2);
    push(flipped - 2, 3);
  } else {
    push(flipped + 2, 2);
    push(flipped - 2, 3);
  }
  return out;
}

function syncLeaves(force = false) {
  const want = new Set<number>(wantedLeaves().map((w) => w.leaf));
  const wantedPages = new Set<number>();

  for (let j = 0; j < numLeaves; j++) {
    const leaf = leafEl(j);
    if (!want.has(j)) {
      if (leaf.style.display !== "none") leaf.style.display = "none";
      continue;
    }
    leaf.style.display = "";
    leaf.classList.toggle("flipped", j < flipped);
    leaf.classList.toggle("is-top", j === flipped);
    // z-order: unflipped stack counts down from the top, flipped counts up
    leaf.style.zIndex = String(j < flipped ? j + 1 : numLeaves - j);
    const front = leaf.querySelector<HTMLElement>(".face.front")!;
    const back = leaf.querySelector<HTMLElement>(".face.back")!;
    const frontNo = 2 * j + 1;
    const backNo = 2 * j + 2;
    if (force || needsPaint(front, frontNo)) {
      front.dataset.page = String(frontNo);
      front.querySelector(".cr-page-slot")!.classList.remove("rendered");
      paintFace(front, frontNo, 1);
    }
    if (force || needsPaint(back, backNo)) {
      back.dataset.page = String(backNo);
      back.querySelector(".cr-page-slot")!.classList.remove("rendered");
      paintFace(back, backNo, 1);
    }
    wantedPages.add(frontNo);
    wantedPages.add(backNo);
  }

  // idle prefetch beyond the visible window (never blocks the current spread)
  for (const { leaf: j, priority } of wantedLeaves()) {
    if (priority < 2) continue;
    for (const p of [2 * j + 1, 2 * j + 2]) {
      if (p >= 1 && p <= numPages) {
        wantedPages.add(p);
        if (force || !pageCache.has(p)) schedule(p, pageScale(), priority);
      }
    }
  }

  pruneQueue(wantedPages);
  pump(); // resume any low-priority work that was deferred during a flip
  updateCounter();
  markActiveThumbs();
  els.prev.disabled = animating || flipped <= 0;
  els.next.disabled = animating || flipped >= (singleMode ? numPages - 1 : numLeaves - 1);
  updateFsArrows();
}

function leafForPage(p: number): number {
  // leaf whose front is an odd page p, or whose back is an even page p
  return p % 2 === 1 ? (p - 1) / 2 : p / 2;
}

function flip(direction: 1 | -1) {
  if (!doc) return;
  if (animating) { queued = direction; return; }
  const target = flipped + direction;
  const maxFlipped = singleMode ? numPages - 1 : numLeaves - 1;
  if (target < 0 || target > maxFlipped) return;
  const j = direction === 1 ? flipped : flipped - 1;
  if (j < 0 || j >= numLeaves) return;

  singleMode = matchMedia("(max-width: 767px)").matches;
  if (singleMode) {
    // single-page mode: one step == one page, no 3D flip
    flipped = Math.min(target, numPages - 1);
    syncLeaves();
    renderSingle();
    return;
  }

  animating = true; // locked synchronously so rapid clicks can never overlap
  flipped = target;
  const leaf = leafEl(j);

  if (reducedMotion.matches || document.documentElement.classList.contains("cr-reduced")) {
    // reduced motion: settle instantly, pages paint in as they arrive
    settle();
    return;
  }

  // The animation starts immediately. The turning leaf's faces are usually
  // already pre-rendered (the idle prefetch keeps flipped-1..+1 ready); if
  // not, they are scheduled at top priority and paint in mid-turn.
  syncLeaves();
  leaf.style.zIndex = String(numLeaves + 2);
  leaf.addEventListener("transitionend", () => finishFlip(leaf), { once: true });
  // safety net in case transitionend never fires
  setTimeout(() => finishFlip(leaf), 1200);
}

function settle() {
  animating = false; // clear before syncLeaves so buttons re-enable
  syncLeaves();
  renderSingle();
  runQueued();
}

function runQueued() {
  if (queued && !animating) {
    const d = queued;
    queued = null;
    flip(d);
  }
}

function finishFlip(leaf: HTMLElement) {
  if (!animating) return;
  animating = false;
  leaf.style.zIndex = "";
  syncLeaves();
  renderSingle();
  runQueued();
}

function renderSingle() {
  if (!singleMode || !doc) return;
  const p = Math.min(flipped + 1, numPages);
  schedule(p, pageScale(), 1).then((entry) => {
    if (!singleMode || !entry) return;
    const ctx = els.singleCanvas.getContext("2d")!;
    els.singleCanvas.width = entry.canvas.width;
    els.singleCanvas.height = entry.canvas.height;
    ctx.drawImage(entry.canvas, 0, 0);
    els.single.classList.add("rendered");
  });
}

function jumpToPage(p: number) {
  if (p < 1 || p > numPages || animating) return;
  const targetLeaf = leafForPage(p);
  if (targetLeaf === flipped && !singleMode) return;
  singleMode = matchMedia("(max-width: 767px)").matches;
  if (singleMode) {
    flipped = p - 1;
    syncLeaves();
    renderSingle();
    return;
  }
  if (Math.abs(targetLeaf - flipped) === 1 && !reducedMotion.matches) {
    flip(targetLeaf > flipped ? 1 : -1);
    return;
  }
  // distant jump: settle instantly, no fan of intermediate flips
  flipped = targetLeaf;
  syncLeaves();
}

/* ---------- thumbnails ---------- */

let thumbsBuilt = false;
const thumbCache = new Map<number, string>();

function buildThumbs() {
  if (thumbsBuilt || !doc || !els.thumbs) return;
  thumbsBuilt = true;
  for (let p = 1; p <= numPages; p++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cr-thumb";
    btn.dataset.page = String(p);
    btn.setAttribute("aria-label", `Go to page ${p}`);
    const img = document.createElement("img");
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    btn.appendChild(img);
    const label = document.createElement("span");
    label.textContent = String(p);
    btn.appendChild(label);
    btn.addEventListener("click", () => {
      jumpToPage(p);
      if (els.thumbPanel.classList.contains("open")) closeThumbs();
    });
    els.thumbs.appendChild(btn);
  }
  renderThumbs();
}

function renderThumbs() {
  if (!doc || !els.thumbs) return;
  for (let p = 1; p <= numPages; p++) {
    const btn = els.thumbs.querySelector<HTMLElement>(`[data-page="${p}"]`)!;
    const img = btn.querySelector("img")!;
    if (thumbCache.has(p)) {
      img.src = thumbCache.get(p)!;
      continue;
    }
    // render lazily: only thumbs near the viewport of the panel
    const r = btn.getBoundingClientRect();
    if (r.top < innerHeight + 200 && r.bottom > -200) {
      doc.getPage(p).then((page) => {
        const base = page.getViewport({ scale: 1 });
        const scale = 150 / base.width;
        const viewport = page.getViewport({ scale });
        const c = document.createElement("canvas");
        c.width = Math.round(viewport.width);
        c.height = Math.round(viewport.height);
        return page.render({ canvasContext: c.getContext("2d")!, viewport }).promise
          .then(() => {
            const url = c.toDataURL("image/jpeg", 0.7);
            thumbCache.set(p, url);
            btn.querySelector("img")!.src = url;
          });
      }).catch(() => { /* thumb renders are best-effort */ });
    }
  }
}

function markActiveThumbs() {
  if (!els.thumbs) return;
  const active = singleMode
    ? Math.min(2 * flipped + 1, numPages)
    : [2 * flipped, 2 * flipped + 1].filter((p) => p >= 1 && p <= numPages);
  els.thumbs.querySelectorAll<HTMLElement>(".cr-thumb").forEach((b) => {
    const p = Number(b.dataset.page);
    b.classList.toggle("active", Array.isArray(active) ? active.includes(p) : p === active);
    b.setAttribute("aria-current", b.classList.contains("active") ? "true" : "false");
  });
}

function openThumbs() {
  if (!els.thumbPanel || !els.thumbToggle) return;
  buildThumbs();
  els.thumbPanel.classList.add("open");
  els.thumbPanel.removeAttribute("hidden");
  els.thumbToggle.setAttribute("aria-expanded", "true");
  renderThumbs();
}
function closeThumbs() {
  if (!els.thumbPanel || !els.thumbToggle) return;
  els.thumbPanel.classList.remove("open");
  els.thumbPanel.setAttribute("hidden", "");
  els.thumbToggle.setAttribute("aria-expanded", "false");
  els.thumbToggle.focus();
}

/* ---------- fullscreen ---------- */

function updateFsArrows() {
  if (!els.fsPrev || !els.fsNext) return;
  const maxFlipped = singleMode ? numPages - 1 : numLeaves - 1;
  els.fsPrev.disabled = flipped <= 0;
  els.fsNext.disabled = flipped >= maxFlipped;
}

els.fsPrev?.addEventListener("click", () => flip(-1));
els.fsNext?.addEventListener("click", () => flip(1));
els.fsExit?.addEventListener("click", () => document.exitFullscreen());
els.fullscreen?.addEventListener("click", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    const wrap = els.root.closest(".cr-reader-wrap") ?? els.root;
    wrap.requestFullscreen();
  }
});
document.addEventListener("fullscreenchange", () => {
  const on = !!document.fullscreenElement;
  // overlay arrows live inside the fullscreened wrap
  (els.root.closest(".cr-reader-wrap") ?? els.root)?.classList.toggle("cr-reading-fs", on);
  if (els.fullscreen) {
    els.fullscreen.setAttribute("aria-pressed", String(on));
    els.fullscreen.querySelector("span")!.textContent = on ? "Exit fullscreen" : "Fullscreen";
  }
  if (on) updateFsArrows();
});

/* ---------- keyboard ---------- */

els.root.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    e.preventDefault();
    flip(1);
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    flip(-1);
  } else if (e.key === "Escape" && document.fullscreenElement) {
    // belt-and-braces: native Escape handling is browser-owned and flaky
    // in some environments (headless runners); exit explicitly
    document.exitFullscreen();
  }
});

/* ---------- wiring ---------- */

els.prev.addEventListener("click", () => flip(-1));
els.next.addEventListener("click", () => flip(1));
els.thumbToggle?.addEventListener("click", () => {
  els.thumbPanel!.classList.contains("open") ? closeThumbs() : openThumbs();
});
els.fullscreen?.addEventListener("click", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    const wrap = els.root.closest(".cr-reader-wrap") ?? els.root;
    wrap.requestFullscreen();
  }
});
document.addEventListener("fullscreenchange", () => {
  if (!els.fullscreen) return;
  const on = !!document.fullscreenElement;
  els.fullscreen.setAttribute("aria-pressed", String(on));
  els.fullscreen.querySelector("span")!.textContent = on ? "Exit fullscreen" : "Fullscreen";
});

const ro = new ResizeObserver(() => {
  const w = Math.round(els.stage.getBoundingClientRect().width);
  if (w && Math.abs(w - stageWidth) > 40) {
    stageWidth = w;
    if (doc) { syncLeaves(true); renderSingle(); }
  }
});
ro.observe(els.stage);

matchMedia("(max-width: 767px)").addEventListener("change", () => {
  singleMode = matchMedia("(max-width: 767px)").matches;
  syncLeaves(true);
  renderSingle();
});

reducedMotion.addEventListener?.("change", () => {
  document.documentElement.classList.toggle("cr-reduced", reducedMotion.matches);
});

/* ---------- boot ---------- */

function showError() {
  els.loading.hidden = true;
  els.book.hidden = true;
  els.error.hidden = false;
}

(async function init() {
  document.documentElement.classList.toggle("cr-reduced", reducedMotion.matches);
  try {
    stageWidth = Math.round(els.stage.getBoundingClientRect().width);
    const task = pdfjsLib.getDocument({ url: PDF_SRC });
    doc = await task.promise;
    numPages = doc.numPages;
    numLeaves = Math.ceil(numPages / 2);
    const meta = document.getElementById("cr-download-meta");
    if (meta) meta.textContent = `${numPages} pages · original PDF`;
    // build leaves
    const frag = document.createDocumentFragment();
    for (let j = 0; j < numLeaves; j++) {
      const leaf = document.createElement("div");
      leaf.className = "leaf";
      leaf.dataset.leaf = String(j);
      leaf.innerHTML =
        `<div class="face front"><div class="cr-page-slot"></div></div>` +
        `<div class="face back"><div class="cr-page-slot"></div></div>`;
      frag.appendChild(leaf);
    }
    els.leaves.replaceChildren(frag);
    // unhide the book and paint the first spread before the loading state
    // is dismissed, so the reader is never shown with a blank spread
    singleMode = matchMedia("(max-width: 767px)").matches;
    els.book.hidden = false;
    stageWidth = Math.round(els.stage.getBoundingClientRect().width);
    syncLeaves();
    const firstSpread = singleMode ? [1] : [1, 2];
    await Promise.all(firstSpread.map((p) => schedule(p, pageScale(), 1)));
    els.loading.hidden = true;
    renderSingle();
  } catch (err) {
    (window as unknown as Record<string, unknown>).__crInitError = String((err as Error)?.stack ?? err);
    console.error("Catalogue PDF failed to load:", err);
    showError();
  }
})();

// small introspection handle for automated tests
(window as unknown as Record<string, unknown>).__catalogueReader = {
  stats: () => ({
    cached: pageCache.size,
    pending: pending.size,
    active: activeRenders,
    flipped,
  }),
};
