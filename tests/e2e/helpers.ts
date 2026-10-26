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

/** Every product whose category page is worth spot-checking (first of each category). */
export function representativeProducts() {
  return categories.map((c) => {
    const p = products.find((x) => x.categoryId === c.indexNo)!;
    return { category: c, product: p };
  });
}
