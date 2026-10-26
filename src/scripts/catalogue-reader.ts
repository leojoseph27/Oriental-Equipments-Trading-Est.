/*
 * Digital catalogue reader — 3D page-turn book.
 *
 * Pages come from pre-rendered WebP images (scripts/render-catalog-pages.mjs
 * runs at build time from the original PDF), so the browser fetches only the
 * spreads being viewed instead of the whole 24 MB source PDF. The original
 * PDF is still available for download from the toolbar.
 *
 * Leaf j holds page 2j+1 (front) and 2j+2 (back), so flipping leaf f moves
 * exactly one physical sheet, in the correct direction for Next and Previous.
 * Images are loaded lazily for the current window (flipped-1..+1) plus the
 * likely next spread, through a small priority scheduler.
 */

const MANIFEST_SRC = "/catalogue-pages/manifest.json";
const PAGES_DIR = "/catalogue-pages";

const els = {
  root: document.getElementById("catalogue-reader") as HTMLElement,
  loading: document.getElementById("cr-loading") as HTMLElement,
  error: document.getElementById("cr-error") as HTMLElement,
  retry: document.getElementById("cr-retry") as HTMLButtonElement | null,
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

let numPages = 0;
let numLeaves = 0;
let flipped = 0; // leaves currently turned to the left side
let animating = false;
let queued: 1 | -1 | null = null; // one pending flip while one is in flight
let singleMode = false;
let stageWidth = 0;
let booted = false;

/* ---------- page image cache (LRU) ---------- */

type Entry = { canvas: HTMLCanvasElement };
const pageCache = new Map<number, Entry>();
const CACHE_MAX = 14;

function evictCache() {
  if (pageCache.size <= CACHE_MAX) return;
  for (const key of pageCache.keys()) {
    if (pageCache.size <= CACHE_MAX) break;
    pageCache.delete(key);
  }
}

function pageUrl(p: number) {
  return `${PAGES_DIR}/page-${String(p).padStart(2, "0")}.webp`;
}

function loadImage(p: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${pageUrl(p)}`));
    img.src = pageUrl(p);
  });
}

async function renderTask(pageNo: number): Promise<Entry> {
  const img = await loadImage(pageNo);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext("2d")!.drawImage(img, 0, 0);
  const entry = { canvas };
  pageCache.set(pageNo, entry);
  evictCache();
  return entry;
}

/* ---------- priority render scheduler ----------
 * priority 1 = visible window (current spread +/- 1 leaf)
 * priority 2 = prefetch: the spread ahead (next likely action)
 * priority 3 = prefetch: the spread behind (backward navigation)
 */
const MAX_ACTIVE_RENDERS = 2;
type Job = { priority: number; promise: Promise<Entry | null>; resolve: (e: Entry | null) => void };
const pending = new Map<number, Job>();
const inflight = new Map<number, Promise<Entry | null>>();
let activeRenders = 0;

function pump() {
  while (activeRenders < MAX_ACTIVE_RENDERS && pending.size > 0) {
    // while a flip animation runs, only window work; prefetch waits for settle
    let bestNo = -1;
    let bestPri = Infinity;
    for (const [no, job] of pending) {
      if (animating && job.priority > 1) continue;
      if (job.priority < bestPri) { bestPri = job.priority; bestNo = no; }
    }
    if (bestNo < 0) return;
    const job = pending.get(bestNo)!;
    pending.delete(bestNo);
    inflight.set(bestNo, job.promise);
    activeRenders++;
    renderTask(bestNo).then(job.resolve, () => job.resolve(null)).finally(() => {
      activeRenders--;
      inflight.delete(bestNo);
      pump();
    });
  }
}

function schedule(pageNo: number, priority: number): Promise<Entry | null> {
  const cached = pageCache.get(pageNo);
  if (cached) {
    pageCache.delete(pageNo);
    pageCache.set(pageNo, cached); // refresh LRU order
    return Promise.resolve(cached);
  }
  const queuedJob = pending.get(pageNo);
  if (queuedJob) { queuedJob.priority = Math.min(queuedJob.priority, priority); return queuedJob.promise; }
  const running = inflight.get(pageNo);
  if (running) return running;
  const job: Job = { priority, promise: null!, resolve: null! };
  job.promise = new Promise<Entry | null>((resolve) => { job.resolve = resolve; });
  pending.set(pageNo, job);
  pump();
  return job.promise;
}

function pruneQueue(wanted: Set<number>) {
  for (const [no, job] of pending) {
    if (job.priority >= 2 && !wanted.has(no)) {
      pending.delete(no);
      job.resolve(null);
    }
  }
}

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

function updateFsArrows() {
  if (!els.fsPrev || !els.fsNext) return;
  const maxFlipped = singleMode ? numPages - 1 : numLeaves - 1;
  els.fsPrev.disabled = flipped <= 0;
  els.fsNext.disabled = flipped >= maxFlipped;
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
  schedule(pageNo, priority).then((entry) => {
    if (!entry) return;
    // face may have moved out of the wanted window while rendering
    if (!face.isConnected || face.dataset.page !== String(pageNo)) return;
    if (slot.firstChild !== entry.canvas) slot.replaceChildren(entry.canvas);
    slot.classList.add("rendered");
  });
}

function needsPaint(face: HTMLElement, pageNo: number): boolean {
  if (face.dataset.page !== String(pageNo)) return true;
  const slot = face.querySelector<HTMLElement>(".cr-page-slot")!;
  if (!slot.classList.contains("rendered")) return true;
  const canvas = slot.querySelector("canvas");
  return !canvas || canvas.width === 0;
}

function syncLeaves(force = false) {
  const want = new Set<number>();
  for (let j = flipped - 2; j <= flipped + 2; j++) {
    if (j >= 0 && j <= numLeaves - 1) want.add(j);
  }
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
    // visible window at priority 1; the +1 leaf doubles as turn-ahead prefetch
    const priority = j <= flipped + 1 ? 1 : 2;
    if (force || needsPaint(front, frontNo)) {
      front.dataset.page = String(frontNo);
      front.querySelector(".cr-page-slot")!.classList.remove("rendered");
      paintFace(front, frontNo, priority);
    }
    if (force || needsPaint(back, backNo)) {
      back.dataset.page = String(backNo);
      back.querySelector(".cr-page-slot")!.classList.remove("rendered");
      paintFace(back, backNo, priority);
    }
    wantedPages.add(frontNo);
    wantedPages.add(backNo);
  }

  // prefetch one leaf behind at lowest priority (backward navigation)
  const behind = flipped - 2;
  if (behind >= 0 && behind <= numLeaves - 1) {
    for (const p of [2 * behind + 1, 2 * behind + 2]) {
      if (p >= 1 && p <= numPages) { wantedPages.add(p); schedule(p, 3); }
    }
  }

  pruneQueue(wantedPages);
  pump(); // resume deferred low-priority work after a flip settles
  updateCounter();
  updateFsArrows();
  markActiveThumbs();
  els.prev.disabled = animating || flipped <= 0;
  els.next.disabled = animating || flipped >= (singleMode ? numPages - 1 : numLeaves - 1);
}

function leafForPage(p: number): number {
  return p % 2 === 1 ? (p - 1) / 2 : p / 2;
}

function flip(direction: 1 | -1) {
  if (!numPages) return;
  if (animating) { queued = direction; return; }
  const target = flipped + direction;
  const maxFlipped = singleMode ? numPages - 1 : numLeaves - 1;
  if (target < 0 || target > maxFlipped) return;
  const j = direction === 1 ? flipped : flipped - 1;
  if (j < 0 || j >= numLeaves) return;

  if (singleMode) {
    flipped = Math.min(target, numPages - 1);
    syncLeaves();
    renderSingle();
    return;
  }

  animating = true; // locked synchronously so rapid clicks can never overlap
  flipped = target;
  const leaf = leafEl(j);

  if (reducedMotion.matches || document.documentElement.classList.contains("cr-reduced")) {
    settle();
    return;
  }

  // animation starts immediately; the turning faces are pre-rendered by the
  // idle prefetch and paint in mid-turn if they were ever evicted
  syncLeaves();
  leaf.style.zIndex = String(numLeaves + 2);
  leaf.addEventListener("transitionend", () => finishFlip(leaf), { once: true });
  setTimeout(() => finishFlip(leaf), 1200); // safety net if transitionend is missed
}

function settle() {
  animating = false;
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
  if (!singleMode || !numPages) return;
  const p = Math.min(flipped + 1, numPages);
  schedule(p, 1).then((entry) => {
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

function buildThumbs() {
  if (thumbsBuilt || !numPages || !els.thumbs) return;
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
    img.src = `${PAGES_DIR}/thumb-${String(p).padStart(2, "0")}.webp`;
    btn.appendChild(img);
    const label = document.createElement("span");
    label.textContent = String(p);
    btn.appendChild(label);
    btn.addEventListener("click", () => {
      jumpToPage(p);
      if (els.thumbPanel?.classList.contains("open")) closeThumbs();
    });
    els.thumbs.appendChild(btn);
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
}
function closeThumbs() {
  if (!els.thumbPanel || !els.thumbToggle) return;
  els.thumbPanel.classList.remove("open");
  els.thumbPanel.setAttribute("hidden", "");
  els.thumbToggle.setAttribute("aria-expanded", "false");
  els.thumbToggle.focus();
}

/* ---------- fullscreen ---------- */

els.fsPrev?.addEventListener("click", () => flip(-1));
els.fsNext?.addEventListener("click", () => flip(1));
els.fsExit?.addEventListener("click", () => document.exitFullscreen());
els.fullscreen?.addEventListener("click", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    (els.root.closest(".cr-reader-wrap") ?? els.root).requestFullscreen();
  }
});
document.addEventListener("fullscreenchange", () => {
  const on = !!document.fullscreenElement;
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
els.retry?.addEventListener("click", () => boot());
els.thumbToggle?.addEventListener("click", () => {
  els.thumbPanel!.classList.contains("open") ? closeThumbs() : openThumbs();
});

const ro = new ResizeObserver(() => {
  const w = Math.round(els.stage.getBoundingClientRect().width);
  if (w && Math.abs(w - stageWidth) > 40) {
    stageWidth = w;
    if (numPages) { syncLeaves(); renderSingle(); }
  }
});
ro.observe(els.stage);

matchMedia("(max-width: 767px)").addEventListener("change", () => {
  singleMode = matchMedia("(max-width: 767px)").matches;
  if (numPages) { syncLeaves(true); renderSingle(); }
});

reducedMotion.addEventListener?.("change", () => {
  document.documentElement.classList.toggle("cr-reduced", reducedMotion.matches);
});

function showError() {
  els.loading.hidden = true;
  els.book.hidden = true;
  els.error.hidden = false;
}

async function boot(): Promise<void> {
  if (booted) return;
  booted = true;
  els.error.hidden = true;
  els.loading.hidden = false;
  try {
    // never leave the reader stuck on "Loading": hard deadline for init
    const manifest = await Promise.race([
      fetch(MANIFEST_SRC).then((r) => {
        if (!r.ok) throw new Error(`manifest ${r.status}`);
        return r.json();
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("manifest timeout")), 15000)),
    ]) as { pages: number };
    numPages = manifest.pages;
    numLeaves = Math.ceil(numPages / 2);
    const meta = document.getElementById("cr-download-meta");
    if (meta) meta.textContent = `${numPages} pages · original PDF`;

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

    singleMode = matchMedia("(max-width: 767px)").matches;
    els.book.hidden = false;
    stageWidth = Math.round(els.stage.getBoundingClientRect().width);
    syncLeaves();
    // first spread renders before the loading state is dismissed
    const firstSpread = singleMode ? [1] : [1, 2];
    await Promise.race([
      Promise.all(firstSpread.map((p) => schedule(p, 1))),
      new Promise((_, reject) => setTimeout(() => reject(new Error("render timeout")), 20000)),
    ]);
    els.loading.hidden = true;
    renderSingle();
  } catch (err) {
    console.error("Catalogue failed to load:", err);
    booted = false; // allow the retry button to try again
    showError();
  }
}

boot();

// small introspection handle for automated tests
(window as unknown as Record<string, unknown>).__catalogueReader = {
  stats: () => ({ cached: pageCache.size, pending: pending.size, active: activeRenders, flipped }),
};
