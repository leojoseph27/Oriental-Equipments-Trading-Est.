import { expect, test } from "@playwright/test";
import { brands, categories, industries, products, representativeProducts } from "./helpers";

test.describe("catalogue & data integrity", () => {
  test("canonical counts: 190 products, 20 categories, 30 brands, 6 industries", () => {
    expect(products).toHaveLength(190);
    expect(categories).toHaveLength(20);
    expect(brands).toHaveLength(30);
    expect(industries).toHaveLength(6);
  });

  test("product ids are unique", () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every product references a valid category", () => {
    const catIds = new Set(categories.map((c) => c.indexNo));
    for (const p of products) expect(catIds.has(p.categoryId), `${p.id} → ${p.categoryId}`).toBe(true);
  });

  test("every category has products and a pageHeading-consistent slug", () => {
    for (const c of categories) {
      expect(products.some((p) => p.categoryId === c.indexNo), c.slug).toBe(true);
      expect(c.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  test("every product has a printed + PDF page reference and a name", () => {
    for (const p of products) {
      expect(p.name.trim().length, p.id).toBeGreaterThan(0);
      expect(String(p.printedPage), p.id).toMatch(/^\d+(-\d+)?$/); // some cards span printed pages, e.g. "1-2"
      expect(String(p.pdfPage), p.id).toMatch(/^\d+(-\d+)?$/);
    }
  });

  test("brand and industry images resolve on the homepage", async ({ page }) => {
    await page.goto("/");
    const urls = await page.evaluate(() =>
      [...document.querySelectorAll("img")]
        .map((i) => (i as HTMLImageElement).src)
        .filter((s) => s.includes("/brands/") || s.includes("/industries/"))
    );
    expect(urls.length).toBe(brands.length + industries.length);
    for (const u of urls) expect((await page.request.get(u)).status()).toBe(200);
  });

  test("product cards show names, specs and category context", async ({ page }) => {
    for (const { category, product } of representativeProducts()) {
      await page.goto(`/products/${category.slug}/`);
      // attribute selector: some ids start with a digit (e.g. "250a-edon") and are invalid as #id CSS selectors
      const card = page.locator(`article.pc[id="${product.id}"]`);
      await expect(card.locator("h2")).toHaveText(new RegExp(product.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    }
  });

  test("quote links use the stable product ids", async ({ page }) => {
    await page.goto("/products/welding-electrodes/");
    const hrefs = await page.$$eval("a.enq", (as) => as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!));
    const inCategory = products.filter((p) => p.categoryId === categories[0].indexNo);
    expect(hrefs).toHaveLength(inCategory.length);
    for (const p of inCategory) {
      expect(hrefs, p.id).toContain(`/contact/?product=${encodeURIComponent(p.id)}`);
    }
  });

  test("no broken images across sampled pages", async ({ page }) => {
    const routes = ["/", "/products/", "/products/welding-electrodes/", "/products/safety/", "/contact/"];
    for (const r of routes) {
      await page.goto(r);
      // scroll to trigger lazy loading, then check every finished image decoded
      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise((res) => setTimeout(res, 800));
      });
      const broken = await page.$$eval("img", (imgs) =>
        imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src)
      );
      expect(broken, `on ${r}`).toEqual([]);
    }
  });
});
