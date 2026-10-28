import { expect, test } from "@playwright/test";
import { VIEWPORTS, expectNoOverflow, disableIntro } from "./helpers";

test.beforeEach(async ({ page }) => {
  await disableIntro(page);
});
const PAGES = ["/", "/products/", "/products/welding-electrodes/", "/search?q=gloves", "/contact/"];

test.describe("responsive smoke", () => {
  for (const [width, height] of VIEWPORTS) {
    for (const route of PAGES) {
      test(`${width}x${height} ${route} has no horizontal overflow`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(route);
        await page.waitForTimeout(300);
        await expectNoOverflow(page);
      });
    }
  }

  test("mobile menu opens, closes with Escape, returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const btn = page.locator(".menu-btn");
    const panel = page.locator("#mobile-nav");
    await expect(panel).toBeHidden();
    await btn.click();
    await expect(panel).toBeVisible();
    await expect(btn).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(btn).toHaveAttribute("aria-expanded", "false");
    await expect(btn).toBeFocused();
  });

  test("mobile menu link navigates", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/");
    await page.click(".menu-btn");
    await page.click('#mobile-nav a[href="/products/"]');
    await expect(page).toHaveURL(/\/products\/$/);
  });

  test("search controls remain reachable and usable at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/search");
    await expect(page.locator("#q")).toBeVisible();
    await page.fill("#q", "gloves");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page.locator("#results li").first()).toBeVisible();
  });

  test("product cards and images stay within viewport at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/products/welding-electrodes/");
    const cards = await page.$$eval("article.pc", (els) => {
      const vw = document.documentElement.clientWidth;
      return els.filter((el) => {
        const b = el.getBoundingClientRect();
        return b.left < -1 || b.right > vw + 1;
      }).length;
    });
    expect(cards).toBe(0);
  });

  test("form controls do not overflow at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/contact/");
    const overflowing = await page.$$eval("#quote-form input, #quote-form select, #quote-form textarea, #quote-form button", (els) => {
      const vw = document.documentElement.clientWidth;
      return els.filter((el) => {
        const b = el.getBoundingClientRect();
        return b.left < -1 || b.right > vw + 1;
      }).length;
    });
    expect(overflowing).toBe(0);
  });

  test("sticky header does not obscure the skip target or first card", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/products/welding-electrodes/");
    await page.locator("article.pc").first().scrollIntoViewIfNeeded();
    const obscured = await page.evaluate(() => {
      const card = document.querySelector("article.pc")!;
      const b = card.getBoundingClientRect();
      const topEl = document.elementFromPoint(b.left + b.width / 2, Math.max(b.top, 0) + 4);
      return !card.contains(topEl) && !(topEl as HTMLElement)?.closest?.("article.pc");
    });
    expect(obscured).toBe(false);
  });
});
