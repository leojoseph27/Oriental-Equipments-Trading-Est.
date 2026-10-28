import { expect, test } from "@playwright/test";
import { collectConsoleErrors, expectNoOverflow, VIEWPORTS } from "./helpers";

const LOGO_SRC = "/images/logo/oriental-logo.png";
const MAIN_ROUTES = ["/", "/products/", "/catalogue/", "/contact/", "/search/"];

test.describe("navbar logo", () => {
  for (const route of MAIN_ROUTES) {
    test(`logo renders on ${route}`, async ({ page }) => {
      const errors = await collectConsoleErrors(page);
      await page.goto(route);
      const img = page.locator(".brand img");
      await expect(img).toHaveAttribute("src", LOGO_SRC);
      await expect(img).toHaveAttribute("alt", /Oriental Equipments Trading Est\. logo/);
      // Aspect ratio of the supplied PNG is 521x479 ≈ 1.088.
      const box = await img.boundingBox();
      expect(box).not.toBeNull();
      const ratio = box!.width / box!.height;
      expect(ratio).toBeGreaterThan(0.9);
      expect(ratio).toBeLessThan(1.3);
      // The image request itself succeeded (no broken asset).
      const status = await page.request.get(LOGO_SRC);
      expect(status.status()).toBe(200);
      expect(errors).toEqual([]);
    });
  }

  test("logo PNG keeps transparency", async ({ page }) => {
    const res = await page.request.get(LOGO_SRC);
    expect(res.headers()["content-type"]).toBe("image/png");
    const buf = await res.body();
    // PNG colour type byte (IHDR offset 25): 6 = RGBA (has alpha channel).
    expect(buf[25]).toBe(6);
  });
});

test.describe("site loader", () => {
  test("shows on first visit, then removes itself", async ({ page }) => {
    await page.goto("/");
    const loader = page.locator("#site-loader");
    await expect(loader).toBeVisible();
    // Off-white overlay (#fcfcfc), never dark.
    await expect
      .poll(() => loader.evaluate((el) => getComputedStyle(el).backgroundColor), { timeout: 3000 })
      .toBe("rgb(252, 252, 252)");
    // The overlay self-removes after the 5s intro + fade (~5.4s).
    await page.waitForFunction(
      () => !document.getElementById("site-loader"),
      null,
      { timeout: 12000 },
    );
    expect(await loader.count()).toBe(0);
    // Page content is interactive after dismissal.
    await expect(page.locator("main h1")).toBeVisible();
  });

  test("does not replay on subsequent navigation in the same session", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => !document.getElementById("site-loader"));
    // sessionStorage flag now set — next page must not replay the intro
    // (the markup stays in the DOM but is hidden by CSS).
    await page.goto("/products/");
    await expect(page.locator("#site-loader")).toBeHidden();
    await expect(page.locator("main h1")).toBeVisible();
  });

  test("replays the intro on an explicit page reload (Ctrl+Shift+R behaviour)", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => !document.getElementById("site-loader"));
    await page.reload();
    const loader = page.locator("#site-loader");
    await expect(loader).toBeVisible();
    await page.waitForFunction(() => !document.getElementById("site-loader"), null, {
      timeout: 12000,
    });
    await expect(page.locator("main h1")).toBeVisible();
  });

  test("reload replay also works on /products/ and /catalogue/", async ({ page }) => {
    for (const route of ["/products/", "/catalogue/"]) {
      await page.goto(route);
      // First route in the loop is a fresh session → intro plays (~8s);
      // second is same-session navigation → markup present but hidden.
      await expect(page.locator("#site-loader")).toBeHidden({ timeout: 15000 });
      await page.reload();
      await expect(page.locator("#site-loader")).toBeVisible();
      await page.waitForFunction(() => !document.getElementById("site-loader"), null, {
        timeout: 12000,
      });
      await expect(page.locator("main h1")).toBeVisible();
    }
  });

  test("reduced motion: quick fade, no zoom transform animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForFunction(() => !document.getElementById("site-loader"), null, {
      timeout: 4000,
    });
    await expect(page.locator("main h1")).toBeVisible();
  });

  test("no loader without JavaScript — content stays accessible", async ({ page }) => {
    const context = await page.context();
    const noJs = await context.browser().newContext({ javaScriptEnabled: false });
    const p = await noJs.newPage();
    await p.goto("/");
    await expect(p.locator("#site-loader")).toBeHidden();
    await expect(p.locator("main h1")).toBeVisible();
    await noJs.close();
  });

  test("no horizontal overflow with the loader at common viewports", async ({ page }) => {
    for (const [width, height] of [[320, 800], [390, 844], [768, 1024], [1024, 768], [1440, 900]] as const) {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      await expectNoOverflow(page);
      // First goto in the loop plays the full video intro (~8s).
      await expect(page.locator("#site-loader")).toBeHidden({ timeout: 15000 });
      await expectNoOverflow(page);
    }
    // VIEWPORTS list from helpers covers the remaining widths for the settled page.
    for (const [width, height] of VIEWPORTS) {
      await page.setViewportSize({ width, height });
      await page.goto("/products/");
      await expectNoOverflow(page);
    }
  });
});
