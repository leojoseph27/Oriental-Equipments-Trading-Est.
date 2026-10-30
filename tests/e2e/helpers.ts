import { expect, type Page } from "@playwright/test";
import { categories, products, brands, industries } from "../../src/data/catalog";

export { categories, products, brands, industries };

export const VIEWPORTS: [number, number][] = [
  [320, 800],
  [360, 800],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1440, 900],
  [1920, 1080],
];

/** Horizontal document overflow in px. 2px tolerance covers browser rounding. */
export async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => {
    const el = document.scrollingElement as HTMLElement;
    return el.scrollWidth - el.clientWidth;
  });
}

export async function expectNoOverflow(page: Page) {
  expect(await horizontalOverflow(page), "document must not scroll horizontally").toBeLessThanOrEqual(2);
}

export async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

/**
 * Marks the first-visit cinematic intro as already shown for this test
 * session. Use in tests that are not about the intro itself, so the
 * overlay never intercepts early interactions.
 *
 * The loader keys its stamp per build day ("oriental-intro-shown:<date>"),
 * so instead of guessing the key we make sessionStorage answer with a
 * fresh timestamp for any version of it.
 */
export async function disableIntro(page: Page) {
  await page.addInitScript(() => {
    try {
      const original = sessionStorage.getItem.bind(sessionStorage);
      sessionStorage.getItem = (key: string) =>
        key.startsWith("oriental-intro-shown") ? String(Date.now()) : original(key);
    } catch { /* ignore */ }
  });
}

/** Every product whose category page is worth spot-checking (first of each category). */
export function representativeProducts() {
  return categories.map((c) => {
    const p = products.find((x) => x.categoryId === c.indexNo)!;
    return { category: c, product: p };
  });
}
