import { test, expect } from "@playwright/test";
import { readdirSync } from "node:fs";

// Site-wide overscroll / horizontal-overflow guard: every route at every
// supported width must stay exactly viewport-wide, refuse horizontal scroll,
// and keep scroll chaining disabled at the document edges.
const slugs = readdirSync("dist/products", { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => `/products/${d.name}/`);
const routes = ["/", "/products/", "/contact/", "/search/", "/search/?q=torch", "/catalogue/", ...slugs];
const widths = [320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1920];

for (const width of widths) {
  test.describe(`overscroll @ ${width}px`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
    });

    for (const route of routes) {
      test(`${route} has no horizontal overflow`, async ({ page }) => {
        await page.goto(route);
        // Run scroll reveals / lazy content, then try to scroll sideways.
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await page.waitForTimeout(400);
        const r = await page.evaluate(() => {
          const d = document.documentElement;
          window.scrollTo(5000, window.scrollY);
          const offEdge = [...document.querySelectorAll("body *")]
            .filter((el) => {
              const rc = el.getBoundingClientRect();
              return (
                rc.width > 1 &&
                (rc.right > innerWidth + 1 || rc.left < -1) &&
                getComputedStyle(el).position !== "fixed" &&
                !el.matches(".skip-link, .visually-hidden") &&
                !el.closest(".cr-stage, .hero-media, [aria-hidden='true'], .visually-hidden")
              );
            })
            .slice(0, 3)
            .map((el) => `${el.tagName}.${String(el.className).slice(0, 30)}`);
          return {
            overflow: d.scrollWidth - innerWidth,
            scrollX: window.scrollX,
            offEdge,
            obx: getComputedStyle(d).overscrollBehaviorX,
            oby: getComputedStyle(d).overscrollBehaviorY,
          };
        });
        expect(r).toEqual({ overflow: 0, scrollX: 0, offEdge: [], obx: "none", oby: "none" });
      });
    }

    test("vertical scrolling, sticky header, nav and fixed buttons still work", async ({ page }) => {
      await page.goto("/");
      await page.waitForTimeout(2500); // loader
      await page.evaluate(() => window.scrollTo(0, 900));
      await page.waitForTimeout(300);
      const st = await page.evaluate(() => ({
        y: Math.round(window.scrollY),
        headerTop: Math.round(document.querySelector("header")!.getBoundingClientRect().top),
      }));
      expect(st.y).toBeGreaterThan(500);
      expect(st.headerTop).toBe(0);

      const fixedOffEdge = await page.evaluate(() =>
        [...document.querySelectorAll("body *")]
          .filter((el) => {
            const rc = el.getBoundingClientRect();
            return getComputedStyle(el).position === "fixed" && rc.width > 0 && rc.width < innerWidth &&
              (rc.right > innerWidth + 1 || rc.left < -1);
          })
          .map((el) => String(el.className)),
      );
      expect(fixedOffEdge).toEqual([]);

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      if (width <= 900) {
        await page.locator(".menu-btn").click();
        await expect(page.locator("#mobile-nav")).toBeVisible();
      } else {
        await expect(page.locator(".desktop-nav")).toBeVisible();
      }
    });

    test("catalogue stage contains its own scroll", async ({ page }) => {
      await page.goto("/catalogue/");
      const stage = page.locator(".cr-stage");
      await expect(stage).toBeVisible();
      expect(await stage.evaluate((s) => getComputedStyle(s).overscrollBehaviorY)).toBe("contain");
    });
  });
}
