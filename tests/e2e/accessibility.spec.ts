import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { products, disableIntro } from "./helpers";
test.beforeEach(async ({ page }) => {
  await disableIntro(page);
});
test.describe("keyboard & accessibility", () => {
  test("skip link appears on focus and moves focus to main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.locator(".skip-link");
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main")).toBeFocused();
  });

  test("header navigation and search are keyboard reachable", async ({ page }) => {
    await page.goto("/products/");
    await page.keyboard.press("Tab"); // skip link
    await page.keyboard.press("Tab"); // brand link
    await page.keyboard.press("Tab"); // first nav link
    await expect(page.locator("header nav a").first()).toBeFocused();
    const search = page.locator("#q");
    await search.focus();
    await expect(search).toBeFocused();
  });

  test("menu button toggles aria-expanded", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const btn = page.locator(".menu-btn");
    await expect(btn).toHaveAttribute("aria-expanded", "false");
    await btn.click();
    await expect(btn).toHaveAttribute("aria-expanded", "true");
  });

  test("focus styles are visible on representative elements", async ({ page }) => {
    await page.goto("/products/welding-electrodes/");
    for (const selector of ["a.enq", ".searchbar button", ".crumbs a"]) {
      const el = page.locator(selector).first();
      await el.focus();
      const outline = await el.evaluate((e) => {
        const s = getComputedStyle(e);
        return { width: parseFloat(s.outlineWidth), style: s.outlineStyle, color: s.outlineColor };
      });
      expect(outline.style, selector).not.toBe("none");
      expect(outline.width, selector).toBeGreaterThanOrEqual(1);
    }
  });

  test("no duplicate ids on representative routes", async ({ page }) => {
    for (const route of ["/", "/products/", "/products/gouging-rod-torches/", "/search", "/contact/"]) {
      await page.goto(route);
      const dupes = await page.evaluate(() => {
        const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
        return ids.filter((v, i) => ids.indexOf(v) !== i);
      });
      expect(dupes, route).toEqual([]);
    }
  });

  test("html lang is set on all pages", async ({ page }) => {
    for (const route of ["/", "/products/", "/contact/", "/search"]) {
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
    }
  });

  test("quote links have product-specific accessible names", async ({ page }) => {
    await page.goto("/products/hand-protections/");
    const labels = await page.$$eval("a.enq", (as) => as.map((a) => a.getAttribute("aria-label") || ""));
    expect(labels.length).toBeGreaterThanOrEqual(7);
    expect(new Set(labels).size).toBe(labels.length);
    for (const p of products.filter((x) => x.categoryId === 19)) {
      expect(labels).toContain(`Request a quote for ${p.name}`);
    }
  });

  test("form labels are persistent and required fields are semantic", async ({ page }) => {
    await page.goto("/contact/");
    for (const id of ["name", "email", "message"]) {
      const input = page.locator(`#qf-${id}`);
      await expect(input).toHaveAttribute("required", "");
      const labelFor = await input.evaluate((el) => document.querySelector(`label[for="${el.id}"]`)?.textContent || "");
      expect(labelFor.length, id).toBeGreaterThan(0);
      expect(labelFor).toMatch(/required/i);
    }
  });

  test("error summary takes focus; aria-invalid and describedby update", async ({ page }) => {
    await page.goto("/contact/");
    await page.click(".qf-submit");
    const summary = page.locator("#qf-summary");
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary).toContainText("Enter your full name");
    const email = page.locator("#qf-email");
    await expect(email).toHaveAttribute("aria-invalid", "true");
    const described = await email.getAttribute("aria-describedby");
    expect(described).toContain("qf-email-err");
    expect(described).toContain("qf-email-hint"); // hint preserved alongside the error
    // correcting the value clears the error and restores the hint-only association
    await page.fill("#qf-email", "test@example.com");
    await expect(email).not.toHaveAttribute("aria-invalid");
    await expect(email).toHaveAttribute("aria-describedby", "qf-email-hint");
  });

  test("key contrast values from the design tokens meet WCAG AA", () => {
    const lum = (hex: string) => {
      const c = hex.match(/../g)!.map((x) => parseInt(x, 16) / 255)
        .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const cr = (a: string, b: string) => {
      const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (l1 + 0.05) / (l2 + 0.05);
    };
    // [fg, bg, minimum] — ink on paper/card, secondary, tertiary (M7 fix), brand colours
    expect(cr("231f20", "f4f3f1")).toBeGreaterThanOrEqual(4.5);
    expect(cr("5b5657", "f4f3f1")).toBeGreaterThanOrEqual(4.5);
    expect(cr("6d6869", "f4f3f1")).toBeGreaterThanOrEqual(4.5);
    expect(cr("6d6869", "ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(cr("157a44", "ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(cr("b82020", "ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(cr("8e1a12", "ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(cr("e8efe9", "0b3d1f")).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe("axe-core scans", () => {
  // Automated axe checks catch common structural issues; they do NOT prove WCAG
  // compliance and say nothing about real screen-reader behaviour.
  const routes = ["/", "/products/welding-electrodes/", "/search?q=gloves", "/contact/"];

  for (const route of routes) {
    test(`axe: no serious/critical violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(
        bad.map((v) => `${v.id}: ${v.nodes.length} node(s)`),
        `${route} axe violations`
      ).toEqual([]);
    });
  }
});
