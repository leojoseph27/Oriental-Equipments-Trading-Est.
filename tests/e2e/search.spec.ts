import { expect, test } from "@playwright/test";
import { collectConsoleErrors, disableIntro } from "./helpers";
import { products } from "./helpers";
test.beforeEach(async ({ page }) => {
  await disableIntro(page);
});
async function searchFor(page: import("@playwright/test").Page, q: string) {
  await page.goto(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  await page.waitForTimeout(400); // allow index fetch + render
  return page;
}

test.describe("search", () => {
  test("initial empty state", async ({ page }) => {
    await searchFor(page, "");
    await expect(page.locator("#results li")).toHaveCount(0);
    await expect(page.locator("#status")).toContainText(/Type a query/i);
  });

  test("E7018 returns the expected electrode products", async ({ page }) => {
    await searchFor(page, "E7018");
    const count = products.filter((p) => (p.awsNo || "").toUpperCase().startsWith("E7018")).length; // E7018 and E7018-1 both match the query text
    await expect(page.locator("#results li")).toHaveCount(count);
    await expect(page.locator("#status")).toContainText(/result/i);
    await expect(page.locator("#results")).toContainText(/E7018/i);
  });

  test("24KD returns the MIG welding torch", async ({ page }) => {
    await searchFor(page, "24KD");
    await expect(page.locator("#results li")).toHaveCount(1);
    await expect(page.locator("#results .rname")).toHaveText(/MIG WELDING TORCH/i);
  });

  test("K4000 returns the gouging torch product linking to its category anchor", async ({ page }) => {
    await searchFor(page, "K4000");
    const link = page.locator("#results a").first();
    await expect(link).toContainText(/K4000/i);
    await link.click();
    await expect(page).toHaveURL(/\/products\/gouging-rod-torches\/#k4000$/);
    await expect(page.locator("article.pc#k4000 h2")).toContainText(/K4000/i);
  });

  test("ER70S-6 returns its expected result", async ({ page }) => {
    await searchFor(page, "ER70S-6");
    await expect(page.locator("#results")).toContainText(/ER70S-6/i);
    expect(page.url()).toContain("q=ER70S-6");
  });

  test("broad query 'gloves' returns multiple hand-protection results", async ({ page }) => {
    await searchFor(page, "gloves");
    const n = await page.locator("#results li").count();
    expect(n).toBeGreaterThan(5);
    await expect(page.locator("#status")).toContainText(/results for “gloves”/);
  });

  test("no-match query shows a helpful empty state", async ({ page }) => {
    await searchFor(page, "zzzznope");
    await expect(page.locator("#results li")).toHaveCount(0);
    await expect(page.locator("#status")).toContainText(/No results/i);
  });

  test("search is case-insensitive", async ({ page }) => {
    await searchFor(page, "e7018");
    await expect(page.locator("#results")).toContainText(/E7018/i);
    await searchFor(page, "24kd");
    await expect(page.locator("#results")).toContainText(/MIG WELDING TORCH/i);
  });

  test("clear resets state and URL", async ({ page }) => {
    await searchFor(page, "gloves");
    await expect(page.locator("#clear")).toBeVisible();
    await page.click("#clear");
    await expect(page.locator("#results li")).toHaveCount(0);
    expect(page.url()).not.toContain("q=");
    await expect(page.locator("#q")).toBeFocused();
  });

  test("typing updates the URL query parameter", async ({ page }) => {
    await searchFor(page, "");
    await page.fill("#q", "tig");
    await expect(page).toHaveURL(/q=tig/);
  });

  test("no console errors during search interactions", async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await searchFor(page, "gloves");
    await page.fill("#q", "");
    await page.fill("#q", "24kd");
    await page.waitForTimeout(400);
    expect(errors).toEqual([]);
  });
});
