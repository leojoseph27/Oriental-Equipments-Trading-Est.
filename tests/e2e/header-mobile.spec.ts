import { test, expect } from "@playwright/test";

// Mobile WebKit *animates* programmatic scrollTo and oscillates between two
// positions for a while, so scroll-direction assertions are only reliable on
// engines with deterministic scrolling. Layout, overflow and menu checks run
// on every project; the real-device behavior of the debounced direction logic
// is covered on all four projects via the cumulative detector.
const SCROLL_SAFE = { chromium: true, webkit: true, "iphone-13": true, "iphone-14-pro-max": true } as Record<string, boolean>;

// Wait until no scroll events fire for 400ms before asserting header state.
async function scrollAndSettle(page: import("@playwright/test").Page, top: number) {
  await page.evaluate((t) => window.scrollTo({ top: t }), top);
  await page.evaluate(() => {
    (window as any).__sc = 0;
    document.addEventListener("scroll", () => (window as any).__sc++, { passive: true });
  });
  for (let i = 0; i < 15; i++) {
    const before = await page.evaluate(() => (window as any).__sc);
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => (window as any).__sc);
    if (before === after) break;
  }
  await page.waitForTimeout(200); // let the debounced header decision apply
}

test.describe("mobile two-row header", () => {
  for (const [w, h] of [[320, 800], [360, 800], [375, 812], [390, 844], [414, 896], [430, 932]] as const) {
    test(`${w}px: layout, scroll hide/show, return to top`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Row 1: name on one line, fully visible, no page overflow;
      // Row 2 visible at the top of the page.
      const nameBox = await page.locator(".brand-name").boundingBox();
      expect(nameBox!.height).toBeLessThan(24); // single line
      expect(nameBox!.x).toBeGreaterThanOrEqual(0);
      expect(nameBox!.x + nameBox!.width).toBeLessThanOrEqual(w); // full name visible
      await expect(page.locator(".bar-row2 .vision-badge")).toBeVisible();
      await expect(page.locator(".menu-btn")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);

      const checkScroll = SCROLL_SAFE[test.info().projectName] ?? false;
      if (checkScroll) {
        // scroll down → Row 2 hidden; Row 1 still visible at the top
        await scrollAndSettle(page, 600);
        await scrollAndSettle(page, 800);
        await expect(page.locator(".site-header")).toHaveClass(/row2-hidden/);
        const row2Box = await page.locator(".bar-row2").boundingBox();
        expect(row2Box!.height).toBeLessThan(4); // no blank gap left behind
        const brandBox = await page.locator(".brand").boundingBox();
        expect(brandBox!.y).toBeGreaterThanOrEqual(0);

        // continued downward scrolling → stays hidden (no reappear)
        await scrollAndSettle(page, 1200);
        await expect(page.locator(".site-header")).toHaveClass(/row2-hidden/);
        // pausing → stays hidden
        await page.waitForTimeout(500);
        await expect(page.locator(".site-header")).toHaveClass(/row2-hidden/);

        // small upward drift (< 20px threshold) → stays hidden
        await scrollAndSettle(page, 1190);
        await expect(page.locator(".site-header")).toHaveClass(/row2-hidden/);

        // deliberate scroll up → Row 2 returns
        await scrollAndSettle(page, 400);
        await expect(page.locator(".site-header")).not.toHaveClass(/row2-hidden/);
        await expect(page.locator(".bar-row2 .vision-badge")).toBeVisible();

        // back to top → both rows visible
        await scrollAndSettle(page, 0);
        await expect(page.locator(".site-header")).not.toHaveClass(/row2-hidden/);
        await expect(page.locator(".bar-row2 .vision-badge")).toBeVisible();
      }

      // menu still works with drawer; opening it keeps Row 2 shown
      await page.click(".menu-btn");
      await expect(page.locator("#mobile-nav")).toBeVisible();
      await expect(page.locator(".site-header")).not.toHaveClass(/row2-hidden/);
      await page.screenshot({ path: `test-results/hdr-${test.info().projectName}-${w}.png` });
    });
  }
});
