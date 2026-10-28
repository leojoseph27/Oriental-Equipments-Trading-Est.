import { expect, test } from "@playwright/test";
import { categories, products, expectNoOverflow, disableIntro } from "./helpers";

test.beforeEach(async ({ page }) => {
  await disableIntro(page);
});
const canon = (p: string) => p; // routes are served with trailing slashes

test.describe("routes & navigation", () => {
  test("homepage loads with one h1 and a meaningful title", async ({ page }) => {
    await page.goto(canon("/"));
    await expect(page).toHaveTitle(/Oriental Equipments Trading Est\./);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator("main h1")).toContainText(/welding/i);
  });

  test("/products/ loads", async ({ page }) => {
    await page.goto(canon("/products/"));
    await expect(page.locator("main h1")).toHaveText(/Product Catalogue/i);
  });

  test("Catalogue appears in desktop nav, in order, and opens /catalogue/", async ({ page }) => {
    await page.goto(canon("/"));
    const labels = await page.locator(".desktop-nav a").allTextContents();
    expect(labels).toEqual(["Home", "Products", "Catalogue", "Contact", "Search"]);
    await page.click('.desktop-nav a[href="/catalogue/"]');
    await expect(page).toHaveURL(/\/catalogue\/$/);
    await expect(page.locator("main h1")).toBeVisible();
  });

  test("Catalogue appears in the mobile menu and opens /catalogue/", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(canon("/"));
    await page.click(".menu-btn");
    await expect(page.locator('#mobile-nav a[href="/catalogue/"]')).toBeVisible();
    await page.click('#mobile-nav a[href="/catalogue/"]');
    await expect(page).toHaveURL(/\/catalogue\/$/);
  });

  test("Catalogue is marked active on /catalogue/", async ({ page }) => {
    await page.goto(canon("/catalogue/"));
    await expect(page.locator('.desktop-nav a[href="/catalogue/"]')).toHaveAttribute("aria-current", "page");
    await expect(page.locator('.desktop-nav a[href="/products/"]')).not.toHaveAttribute("aria-current", "page");
  });

  for (const c of categories) {
    test(`category /products/${c.slug}/ loads`, async ({ page }) => {
      const res = await page.goto(`/products/${c.slug}/`);
      expect(res?.status(), `route for ${c.slug}`).toBe(200);
      await expect(page.locator("main h1")).not.toBeEmpty();
      const expected = products.filter((p) => p.categoryId === c.indexNo).length;
      await expect(page.locator("article.pc")).toHaveCount(expected);
    });
  }

  test("/search loads", async ({ page }) => {
    await page.goto(canon("/search"));
    await expect(page.locator("main h1")).toHaveText(/Search the Catalogue/i);
  });

  test("/contact/ loads", async ({ page }) => {
    await page.goto(canon("/contact/"));
    await expect(page.locator("main h1")).toHaveText(/Contact & Quote Enquiries/i);
  });

  test("header and footer links resolve to valid routes", async ({ page }) => {
    await page.goto(canon("/products/"));
    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll("header a[href], footer a[href]")]
        .map((a) => (a as HTMLAnchorElement).getAttribute("href")!)
        .filter((h) => h.startsWith("/"))
    );
    expect(hrefs.length).toBeGreaterThan(5);
    const seen = [...new Set(hrefs)];
    for (const href of seen) {
      const target = href.split("#")[0] || "/";
      const res = await page.request.get(target);
      expect(res.status(), `header/footer link ${href}`).toBe(200);
    }
  });

  test("brands/industries/about sections exist on the homepage but are not in the nav", async ({ page }) => {
    await page.goto(canon("/"));
    for (const anchor of ["#brands", "#industries", "#about"]) {
      await expect(page.locator(anchor)).toBeAttached();
      await expect(page.locator(`header nav a[href="/${anchor}"]`)).toHaveCount(0);
    }
  });

  test("footer contact link navigates to /contact/", async ({ page }) => {
    await page.goto(canon("/products/"));
    await page.click('footer nav a[href="/contact/"]');
    await expect(page).toHaveURL(/\/contact\/$/);
  });

  test("breadcrumbs identify the current page", async ({ page }) => {
    await page.goto(canon("/products/abrasives/"));
    const crumb = page.locator('nav[aria-label="Breadcrumb"] [aria-current="page"]');
    await expect(crumb).toHaveText(/Abrasives/i);
  });

  test("product quote links preserve the product id in the contact URL", async ({ page }) => {
    for (const { category, product } of [{ category: categories[0], product: products[0] }]) {
      await page.goto(`/products/${category.slug}/`);
      const link = page.locator(`article.pc[id="${product.id}"] a.enq`);
      await expect(link).toHaveCount(1);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`product=${encodeURIComponent(product.id)}$`));
    }
  });

  test("unknown route returns 404 status (Astro default, no custom page)", async ({ page }) => {
    const res = await page.goto("/this-route-does-not-exist/");
    expect(res?.status()).toBe(404);
  });

  test("contact page does not overflow on desktop", async ({ page }) => {
    await page.goto(canon("/contact/"));
    await expectNoOverflow(page);
  });
});
