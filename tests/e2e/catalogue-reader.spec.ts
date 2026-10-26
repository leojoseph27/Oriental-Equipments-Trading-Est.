import { expect, test, type Page } from "@playwright/test";
import { expectNoOverflow, collectConsoleErrors } from "./helpers";

const TOTAL_PAGES = 29;

/**
 * Wait until the reader has initialised: the book (or single view) is visible
 * and the counter reflects page 1 of 29.
 */
async function ready(page: Page) {
  await page.goto("/catalogue/");
  const counter = page.locator("#cr-counter");
  await expect(counter).toHaveText(`Page 1 of ${TOTAL_PAGES}`, { timeout: 20_000 });
  // the loader hides only once the first spread is rendered and readable
  await expect(page.locator("#cr-loading")).toBeHidden({ timeout: 30_000 });
}

/** Read the counter text as "current pages" — e.g. "2–3" or "1". */
async function counterPages(page: Page): Promise<string> {
  const text = await page.locator("#cr-counter").textContent();
  return text!.replace(/^Page\s+/, "").replace(new RegExp(`\\s+of\\s+${TOTAL_PAGES}$`), "");
}

type ReaderStats = { cached: number; pending: number; active: number; flipped: number };
async function readerStats(page: Page): Promise<ReaderStats> {
  return page.evaluate(() => (window as any).__catalogueReader.stats());
}

/** Every face of leaf j that has been assigned a page must hold a painted canvas. */
async function leafReady(page: Page, j: number): Promise<boolean> {
  return page.evaluate((leafIndex) => {
    const leaf = document.querySelector(`[data-leaf="${leafIndex}"]`);
    if (!leaf) return false;
    return [...leaf.querySelectorAll(".face")].every((f) => {
      if (!f.hasAttribute("data-page")) return true; // beyond the last page
      const c = f.querySelector("canvas");
      return !!c && c.width > 0;
    });
  }, j);
}

test.describe("digital catalogue reader", () => {
  test("route loads and the book renders page 1", async ({ page }) => {
    await ready(page);
    await expect(page).toHaveTitle(/Digital Catalogue/);
    await expect(page.locator("#cr-book")).toBeVisible();
    // cover is the front face of leaf 0, on the right half
    const cover = page.locator('[data-leaf="0"] .face.front .cr-page-slot canvas');
    await expect(cover).toBeVisible();
    await expect(page.locator('[data-leaf="0"]')).not.toHaveClass(/flipped/);
    await expect(page.locator("#cr-prev")).toBeDisabled();
    await expect(page.locator("#cr-next")).toBeEnabled();
  });

  test("download link serves the original PDF", async ({ request }) => {
    const res = await request.get("/pdfs/oriental-catalogue.pdf");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
    const body = await res.body();
    // %PDF magic bytes and a sane size for the original file
    expect(body.subarray(0, 5).toString()).toBe("%PDF-");
    expect(body.length).toBeGreaterThan(500_000);
  });

  test("next/previous navigate sequentially with correct direction and boundaries", async ({ page }) => {
    await ready(page);
    // Next: leaf 0 flips; spread becomes 2–3
    await page.locator("#cr-next").click();
    await expect(page.locator("#cr-counter")).toHaveText(`Page 2–3 of ${TOTAL_PAGES}`, { timeout: 10_000 });
    // leaf 0 should now sit flipped to the left; leaf 1 top-right
    await expect(page.locator('[data-leaf="0"]')).toHaveClass(/flipped/);
    await expect(page.locator('[data-leaf="1"]')).not.toHaveClass(/flipped/);
    // Previous returns to the cover
    await page.locator("#cr-prev").click();
    await expect(page.locator("#cr-counter")).toHaveText(`Page 1 of ${TOTAL_PAGES}`, { timeout: 10_000 });
    await expect(page.locator("#cr-prev")).toBeDisabled();
    // rapid clicks must not overlap transitions: still coherent at the end
    for (let i = 0; i < 6; i++) await page.locator("#cr-next").click();
    // clicks never overlap transitions: 6 clicks advance at most 6 spreads
    // and the counter settles to a coherent, stable value
    await page.waitForTimeout(2500);
    const settled = await counterPages(page);
    const landed = settled.includes("–") ? Number(settled.split("–")[0]) : Number(settled);
    expect(landed).toBeGreaterThanOrEqual(1);
    expect(landed).toBeLessThanOrEqual(7);
    expect(await counterPages(page)).toBe(settled); // stable
  });

  test("all 29 pages are reachable via sequential navigation", async ({ page }) => {
    test.setTimeout(300_000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await ready(page);
    // desktop spread: 29 pages = 15 leaves, so 14 flips reach the end
    const flips = Math.ceil(TOTAL_PAGES / 2) - 1;
    for (let i = 0; i < flips; i++) {
      const before = await counterPages(page);
      await page.locator("#cr-next").click();
      await expect
        .poll(() => counterPages(page), { timeout: 10_000 })
        .not.toBe(before);
    }
    await expect(page.locator("#cr-counter")).toHaveText(`Page 28–29 of ${TOTAL_PAGES}`);
    await expect(page.locator("#cr-next")).toBeDisabled();
    // leaf 13 holds pages 27–28 and is turned; leaf 14 shows page 29 on the right
    await expect(page.locator('[data-leaf="13"]')).toHaveClass(/flipped/);
    await expect(page.locator('[data-leaf="14"]')).not.toHaveClass(/flipped/);
  });

  test("thumbnail navigation jumps to the chosen page", async ({ page }) => {
    await ready(page);
    await page.locator("#cr-thumb-toggle").click();
    const panel = page.locator("#cr-thumb-panel");
    await expect(panel).toBeVisible();
    await expect(page.locator(".cr-thumb")).toHaveCount(TOTAL_PAGES);
    await page.locator('.cr-thumb[data-page="11"]').click();
    // page 11 is odd → becomes the right page of spread 10–11
    await expect(page.locator("#cr-counter")).toHaveText(`Page 10–11 of ${TOTAL_PAGES}`);
    await expect(page.locator('.cr-thumb[data-page="11"]')).toHaveClass(/active/);
    // panel closes after selection
    await expect(panel).toBeHidden();
  });

  test("keyboard arrows turn pages and boundaries are respected", async ({ page }) => {
    await ready(page);
    await page.locator("#catalogue-reader").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#cr-counter")).toHaveText(`Page 2–3 of ${TOTAL_PAGES}`, { timeout: 10_000 });
    await page.waitForTimeout(900); // let the flip transition finish
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("#cr-counter")).toHaveText(`Page 1 of ${TOTAL_PAGES}`, { timeout: 10_000 });
    // at the start boundary, ArrowLeft does nothing
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("#cr-counter")).toHaveText(`Page 1 of ${TOTAL_PAGES}`);
  });

  test("fullscreen toggles where supported", async ({ page }) => {
    await ready(page);
    const fsButton = page.locator("#cr-fullscreen");
    await fsButton.click();
    const isFullscreen = await page.evaluate(() => !!document.fullscreenElement);
    if (isFullscreen) {
      await expect(fsButton).toHaveAttribute("aria-pressed", "true");
      // exit via the toggle (native Escape handling is browser-owned and
      // unreliable under headless test runners)
      await fsButton.click();
      await expect(page.locator("#cr-fullscreen")).toHaveAttribute("aria-pressed", "false", { timeout: 10_000 });
    }
    // headless environments may deny fullscreen — the reader must not error
    await expect(page.locator("#cr-counter")).toContainText(`of ${TOTAL_PAGES}`);
  });

  test("zoom controls are removed from the toolbar", async ({ page }) => {
    await ready(page);
    await expect(page.locator("#cr-zoom-in")).toHaveCount(0);
    await expect(page.locator("#cr-zoom-out")).toHaveCount(0);
  });

  test("reduced motion turns pages immediately (no long transition)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await ready(page);
    const start = Date.now();
    await page.locator("#cr-next").click();
    await expect(page.locator("#cr-counter")).toHaveText(`Page 2–3 of ${TOTAL_PAGES}`);
    const leafTransform = await page.locator('[data-leaf="0"]').evaluate(
      (el) => getComputedStyle(el).transitionDuration
    );
    expect(parseFloat(leafTransform)).toBeLessThanOrEqual(0.05);
    expect(Date.now() - start).toBeLessThan(10_000);
  });

  test("next spread is pre-rendered before the turn begins", async ({ page }) => {
    await ready(page);
    // the idle prefetch keeps the next leaf (and the one after) painted
    await expect.poll(() => leafReady(page, 0), { timeout: 15_000 }).toBe(true);
    await expect.poll(() => leafReady(page, 1), { timeout: 15_000 }).toBe(true);
    await expect.poll(() => leafReady(page, 2), { timeout: 15_000 }).toBe(true);
  });

  test("turn animation starts immediately (no render wait)", async ({ page }) => {
    await ready(page);
    await page.waitForFunction(() => {
      const s = (window as any).__catalogueReader?.stats?.();
      return s && s.pending === 0 && s.active === 0;
    }, undefined, { timeout: 20_000 });
    const delay = await page.evaluate(() => new Promise<number>((resolve) => {
      const leaf = document.querySelector('[data-leaf="0"]')!;
      const t0 = performance.now();
      const mo = new MutationObserver(() => {
        if (leaf.classList.contains("flipped")) { mo.disconnect(); resolve(performance.now() - t0); }
      });
      mo.observe(leaf, { attributes: true, attributeFilter: ["class"] });
      document.getElementById("cr-next")!.click();
      setTimeout(() => { mo.disconnect(); resolve(-1); }, 2_000);
    }));
    expect(delay).toBeGreaterThanOrEqual(0);
    expect(delay).toBeLessThan(200);
  });

  test("revisiting pages reuses the cache without re-rendering", async ({ page }) => {
    test.setTimeout(60_000);
    await ready(page);
    // forward two spreads, then back to the start
    await page.locator("#cr-next").click();
    await expect(page.locator("#cr-counter")).toHaveText(`Page 2–3 of ${TOTAL_PAGES}`, { timeout: 10_000 });
    await page.locator("#cr-next").click();
    await expect(page.locator("#cr-counter")).toHaveText(`Page 4–5 of ${TOTAL_PAGES}`, { timeout: 10_000 });
    await page.locator("#cr-prev").click();
    await expect(page.locator("#cr-counter")).toHaveText(`Page 2–3 of ${TOTAL_PAGES}`, { timeout: 10_000 });
    await page.locator("#cr-prev").click();
    await expect(page.locator("#cr-counter")).toHaveText(`Page 1 of ${TOTAL_PAGES}`, { timeout: 10_000 });
    // the returned-to spreads must still be painted (served from cache)
    await expect.poll(() => leafReady(page, 0)).toBe(true);
    await expect.poll(() => leafReady(page, 1)).toBe(true);
    // renderer is idle and the cache stays bounded
    await expect.poll(async () => {
      const s = await readerStats(page);
      return s.pending === 0 && s.active === 0;
    }, { timeout: 15_000 }).toBe(true);
    expect((await readerStats(page)).cached).toBeLessThanOrEqual(14);
  });

  test("PDF loading failure shows the fallback state", async ({ page }) => {
    await page.route("**/pdfs/oriental-catalogue.pdf", (route) => route.fulfill({
      status: 500,
      body: "server error",
    }));
    await page.goto("/catalogue/");
    await expect(page.locator("#cr-error")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("#cr-book")).toBeHidden();
    await expect(page.locator('#cr-error a[download]')).toBeVisible();
  });

  for (const [w, h] of [[320, 800], [390, 844], [768, 1024], [1024, 768], [1440, 900]] as const) {
    test(`responsive layout ${w}x${h}: no overflow, no console errors`, async ({ page }) => {
      const errors = await collectConsoleErrors(page);
      await page.setViewportSize({ width: w, height: h });
      await ready(page);
      await page.locator("#cr-next").click();
      await expect(page.locator("#cr-counter")).not.toHaveText(`Page 1 of ${TOTAL_PAGES}`, { timeout: 10_000 });
      await page.locator("#cr-thumb-toggle").click();
      await expect(page.locator("#cr-thumb-panel")).toBeVisible();
      await expectNoOverflow(page);
      expect(errors, "console errors").toEqual([]);
    });
  }

  test("single-page mode on narrow screens shows one page at a time", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ready(page);
    await expect(page.locator("#cr-single")).toBeVisible();
    await expect(page.locator(".cr-book-perspective")).toBeHidden();
    await page.locator("#cr-next").click();
    await expect(page.locator("#cr-counter")).toHaveText("Page 2 of 29", { timeout: 10_000 });
    await page.locator("#cr-next").click();
    await expect(page.locator("#cr-counter")).toHaveText("Page 3 of 29", { timeout: 10_000 });
  });
});

// Homepage embeds the reader in compact mode (`.cr-reader-wrap.cr-compact`).
// Regression: rapid double-tapping Previous/Next on touch devices used to
// trigger the mobile browser's double-tap-to-zoom because the controls kept
// the default touch behaviour. `touch-action: manipulation` on the toolbar
// and buttons suppresses that gesture without affecting taps, swipes,
// scrolling, or desktop input.
test.describe("homepage compact catalogue reader", () => {
  test.use({ hasTouch: true });

  for (const [w, h] of [[320, 800], [390, 844]] as const) {
    test(`${w}x${h}: controls opt out of double-tap zoom and stay responsive`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/");
      const counter = page.locator("#cr-counter");
      await expect(counter).toHaveText(`Page 1 of ${TOTAL_PAGES}`, { timeout: 20_000 });

      // The compact reader is the only reader on the homepage and carries
      // the cr-compact class.
      await expect(page.locator(".cr-reader-wrap")).toHaveClass(/cr-compact/);
      await expect(page.locator(".cr-reader-wrap")).toHaveCount(1);

      // touch-action: manipulation on buttons and their toolbar.
      for (const sel of ["#cr-prev", "#cr-next", ".cr-toolbar"]) {
        await expect(page.locator(sel).first()).toHaveCSS("touch-action", "manipulation");
      }

      // Rapid repeated taps on Next remain responsive and coherent.
      for (let i = 0; i < 5; i++) await page.locator("#cr-next").tap();
      await page.waitForTimeout(2500);
      const text = await counter.textContent();
      const current = Number(text!.replace(/^Page\s+/, "").split(/[\s–-]/)[0]);
      expect(current).toBeGreaterThanOrEqual(1);
      expect(current).toBeLessThanOrEqual(6);

      // A single tap on Previous still turns back a page.
      await page.locator("#cr-prev").tap();
      await expect
        .poll(() => counter.textContent(), { timeout: 10_000 })
        .not.toBe(text);
    });
  }

  test("compact reader hides secondary toolbar and keyboard still works", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const counter = page.locator("#cr-counter");
    await expect(counter).toHaveText(`Page 1 of ${TOTAL_PAGES}`, { timeout: 20_000 });
    await expect(page.locator("#cr-thumb-toggle")).toHaveCount(0);
    await expect(page.locator("#cr-fullscreen")).toHaveCount(0);
    await expect(page.locator("#cr-prev")).toHaveAccessibleName("Previous page");
    await expect(page.locator("#cr-next")).toHaveAccessibleName("Next page");
    await page.locator("#catalogue-reader").focus();
    await page.keyboard.press("ArrowRight");
    await expect(counter).toHaveText(`Page 2 of ${TOTAL_PAGES}`, { timeout: 10_000 });
    await page.keyboard.press("ArrowLeft");
    await expect(counter).toHaveText(`Page 1 of ${TOTAL_PAGES}`, { timeout: 10_000 });
  });
});
