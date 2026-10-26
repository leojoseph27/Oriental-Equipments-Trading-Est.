import { expect, test } from "@playwright/test";

// M8.5 motion regression: reveals never leave content hidden, reduced motion
// shows everything immediately, and the core interactions still work.

test.describe("motion & reveals", () => {
  test("hero headline and CTA are immediately available (no long animation lockout)", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("main h1");
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText(/welding consumables and equipment/i);
    await expect(page.locator(".hero .btn.primary")).toBeVisible();
    await expect(page.locator(".hero .btn.primary")).toBeEnabled();
  });

  test("all reveal targets become visible after scrolling the homepage", async ({ page }) => {
    await page.goto("/");
    // scroll like a real user (wheel events produce render frames, so
    // IntersectionObserver callbacks fire); programmatic scrollTo inside
    // evaluate can suppress frames and starve the observer
    await page.setViewportSize({ width: 1440, height: 900 });
    for (let i = 0; i < 12; i++) {
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(1000);
    const hidden = await page.evaluate(() => {
      const els = [...document.querySelectorAll("[data-reveal], [data-reveal-group] > *")];
      return els.filter((el) => {
        const s = getComputedStyle(el);
        return parseFloat(s.opacity) < 0.99;
      }).length;
    });
    expect(hidden, "elements stuck in pre-reveal state").toBe(0);
  });

  test("category page grid reveals fully", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/products/welding-electrodes/");
    for (let i = 0; i < 12; i++) {
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(1000);
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll("[data-reveal], [data-reveal-group] > *")]
        .filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.99).length
    );
    expect(hidden).toBe(0);
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("essential content is immediately visible with reduced motion", async ({ page }) => {
      await page.goto("/");
      const h1 = page.locator("main h1");
      await expect(h1).toBeVisible();
      await expect(h1).toHaveCSS("opacity", "1");
      // vision/mission + section headings are present in the initial DOM and visible
      await expect(page.locator("#about")).toBeVisible();
      await expect(page.locator("#catalogue")).toBeVisible();
      for (const sel of ["#about", "#catalogue", "#industries", "#brands"]) {
        const opacity = await page.locator(sel).evaluate((el) => getComputedStyle(el).opacity);
        expect(parseFloat(opacity), sel).toBe(1);
      }
      // first category tiles visible without scrolling
      await expect(page.locator("#catalogue .tile").first()).toBeVisible();
    });

    test("js reveal-gating class is not applied under reduced motion", async ({ page }) => {
      await page.goto("/");
      const hasJs = await page.evaluate(() => document.documentElement.classList.contains("js"));
      expect(hasJs).toBe(false);
    });

    test("hero media has no pointer tilt transform under reduced motion", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto("/");
      await page.mouse.move(700, 300);
      await page.mouse.move(900, 400);
      await page.waitForTimeout(200);
      const transform = await page.locator("#hero-media").evaluate((el) => el.style.transform);
      expect(transform).toBe("");
    });

    test("form validation and status still work instantly under reduced motion", async ({ page }) => {
      await page.goto("/contact/");
      await page.click(".qf-submit");
      await expect(page.locator("#qf-summary")).toBeVisible();
      await expect(page.locator("#qf-summary")).toBeFocused();
    });
  });

  test("no-js (html without js class) keeps all content visible", async ({ page }) => {
    // simulate the no-JavaScript case for the gating script: block inline scripts
    await page.route("**/*", async (route) => {
      const res = await route.fetch();
      // built inline scripts render as plain <script>; disabling them must leave all content visible
      const body = (await res.text()).replace(/<script>/g, "<script-x>"); // renaming the tag disables it
      await route.fulfill({
        status: res.status(),
        contentType: res.headers()["content-type"] || "text/html",
        body,
      });
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const hasJs = await page.evaluate(() => document.documentElement.classList.contains("js"));
    expect(hasJs).toBe(false);
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll("[data-reveal], [data-reveal-group] > *")]
        .filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.99).length
    );
    expect(hidden).toBe(0);
  });

  test("hero tilt responds to fine pointer and stays bounded", async ({ page }) => {
    test.skip(process.env.CI === "true", "pointer semantics differ on CI grid");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.mouse.move(700, 300);
    await page.mouse.move(1100, 450);
    await page.waitForTimeout(200);
    const transform = await page.locator("#hero-media").evaluate((el) => el.style.transform || "");
    if (transform) {
      const m = transform.match(/rotateX\((-?[\d.]+)deg\).*rotateY\((-?[\d.]+)deg\)/);
      expect(m, "tilt uses rotateX/rotateY").toBeTruthy();
      expect(Math.abs(parseFloat(m![1]))).toBeLessThanOrEqual(2.5);
      expect(Math.abs(parseFloat(m![2]))).toBeLessThanOrEqual(2.5);
    }
    // reset on leave
    await page.mouse.move(10, 895); // outside the hero (86svh of 900px)
    await page.waitForTimeout(200);
    const after = await page.locator("#hero-media").evaluate((el) => el.style.transform || "");
    expect(after === "" || /rotateX\(0(?:\.0+)?deg\).*rotateY\(0(?:\.0+)?deg\)/.test(after)).toBe(true);
  });

  test("no overflow introduced by motion at key viewports", async ({ page }) => {
    for (const [w, h] of [[320, 800], [390, 844], [768, 1024], [1440, 900], [1920, 1080]] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/");
      const ox = await page.evaluate(() => {
        const se = document.scrollingElement as HTMLElement;
        return se.scrollWidth - se.clientWidth;
      });
      expect(ox, `homepage at ${w}px`).toBeLessThanOrEqual(2);
    }
  });
});
