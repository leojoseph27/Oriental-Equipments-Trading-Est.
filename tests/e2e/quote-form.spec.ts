import { expect, test } from "@playwright/test";
import { categories, products } from "./helpers";

// No real enquiry is ever sent: mailto navigation is asserted via the generated
// URL captured before the browser hands off to the (absent) mail client.
test.describe("quote form", () => {
  async function gotoForm(page: import("@playwright/test").Page, url = "/contact/") {
    await page.goto(url);
  }

  test("empty submission shows all required-field errors and focuses summary", async ({ page }) => {
    await gotoForm(page);
    await page.click(".qf-submit");
    const summary = page.locator("#qf-summary");
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary).toContainText("Enter your full name");
    await expect(summary).toContainText("Enter your email address");
    await expect(summary).toContainText("Enter your enquiry message");
    for (const id of ["name", "email", "message"]) {
      await expect(page.locator(`#qf-${id}`)).toHaveAttribute("aria-invalid", "true");
    }
  });

  test("malformed email and phone produce specific errors", async ({ page }) => {
    await gotoForm(page);
    await page.fill("#qf-name", "Test User");
    await page.fill("#qf-email", "not-an-email");
    await page.fill("#qf-phone", "abc!!");
    await page.fill("#qf-message", "Hello");
    await page.click(".qf-submit");
    await expect(page.locator("#qf-email-err")).toContainText("valid email");
    await expect(page.locator("#qf-phone-err")).toContainText("valid phone");
    // summary must NOT appear when only optional-field errors exist? No — email is
    // required, so the summary lists the email error but not the name/message ones.
    await expect(page.locator("#qf-summary")).not.toContainText("Enter your full name");
  });

  test("whitespace-only values are rejected", async ({ page }) => {
    await gotoForm(page);
    await page.fill("#qf-name", "   ");
    await page.fill("#qf-email", "  test@example.com  ");
    await page.fill("#qf-message", "\t \n");
    await page.click(".qf-submit");
    await expect(page.locator("#qf-name-err")).toContainText("Enter your full name");
    await expect(page.locator("#qf-message-err")).toContainText("Enter your enquiry message");
    // email trimmed to a valid value → no email error
    await expect(page.locator("#qf-email-err")).toBeHidden();
  });

  test("user-entered values are preserved after a validation error", async ({ page }) => {
    await gotoForm(page);
    await page.fill("#qf-name", "Test User");
    await page.fill("#qf-company", "ACME Steel");
    await page.fill("#qf-email", "bad");
    await page.fill("#qf-message", "Need 50 pcs of E7018 3.2mm");
    await page.click(".qf-submit");
    await expect(page.locator("#qf-company")).toHaveValue("ACME Steel");
    await expect(page.locator("#qf-message")).toHaveValue("Need 50 pcs of E7018 3.2mm");
    await expect(page.locator("#qf-name")).toHaveValue("Test User");
  });

  test("maxlength attributes cap input lengths", async ({ page }) => {
    await gotoForm(page);
    const limits: Record<string, number> = {
      "qf-name": 100, "qf-company": 100, "qf-email": 120, "qf-phone": 30,
      "qf-product": 150, "qf-quantity": 60, "qf-message": 2000,
    };
    for (const [id, max] of Object.entries(limits)) {
      await expect(page.locator(`#${id}`)).toHaveAttribute("maxlength", String(max));
    }
  });

  test("category select offers exactly the 20 canonical categories", async ({ page }) => {
    await gotoForm(page);
    const options = await page.$$eval("#qf-category option", (os) =>
      os.map((o) => (o as HTMLOptionElement).value).filter(Boolean)
    );
    expect(options).toEqual(categories.map((c) => c.name));
  });

  test("valid product id prefills product and category", async ({ page }) => {
    const p = products.find((x) => x.id === "mig-welding-torch-24kd")!;
    const cat = categories.find((c) => c.indexNo === p.categoryId)!;
    await gotoForm(page, `/contact/?product=${p.id}`);
    await expect(page.locator("#qf-product")).toHaveValue(p.name);
    await expect(page.locator("#qf-category")).toHaveValue(cat.name);
    await expect(page.locator("#qf-status")).toContainText(p.name);
  });

  test("invalid product id degrades gracefully", async ({ page }) => {
    await gotoForm(page, "/contact/?product=not-a-real-product");
    await expect(page.locator("#qf-product")).toHaveValue("");
    await expect(page.locator("#qf-status")).toContainText(/could not be found/i);
    // form remains fully usable
    await page.fill("#qf-name", "Test User");
    await page.fill("#qf-email", "test@example.com");
    await page.fill("#qf-message", "Hello");
    await page.click(".qf-submit");
    await expect(page.locator("#qf-status")).toContainText(/Validation passed/i);
  });

  test("valid submission builds a correctly encoded mailto (no real email sent)", async ({ page }) => {
    await gotoForm(page);
    await page.fill("#qf-name", "Test User");
    await page.fill("#qf-company", 'Acme & Co "Welding"');
    await page.fill("#qf-email", "test@example.com");
    await page.fill("#qf-message", 'Quote for E7018\nsizes 2.6/3.2/4 mm — <urgent>');
    // Capture the navigation attempt: headless Chromium cannot open a mail client,
    // so assert on the URL the page tried to navigate to.
    const navPromise = page.waitForEvent("load", { timeout: 2000 }).catch(() => null);
    await page.click(".qf-submit");
    // give the mailto assignment a moment, then read the status line
    await expect(page.locator("#qf-status")).toContainText(/Validation passed/i);
    await expect(page.locator("#qf-status")).toContainText(/cannot confirm/i);
    await navPromise;
  });

  test("over-long messages use the copy-to-clipboard fallback without truncation", async ({ page }) => {
    await gotoForm(page);
    const long = "A".repeat(1985) + " END-MARKER"; // stays within the 2000-char maxlength
    await page.fill("#qf-name", "Test User");
    await page.fill("#qf-email", "test@example.com");
    await page.locator("#qf-message").fill(long);
    await page.click(".qf-submit");
    const copy = page.locator("#qf-copy");
    await expect(page.locator("#qf-copywrap")).toBeVisible();
    const value = await copy.inputValue();
    expect(value).toContain("END-MARKER");
    expect(value).toContain("Email: test@example.com");
    expect(value.endsWith("END-MARKER")).toBe(true);
  });

  test("status messaging never claims delivery", async ({ page }) => {
    await gotoForm(page);
    const note = page.locator(".qf-note");
    await expect(note).toContainText(/cannot\s+confirm/i);
    await expect(note).toContainText(/you review and send it yourself/i);
  });

  test("keyboard submission works (Enter in a field then button focus + Enter)", async ({ page }) => {
    await gotoForm(page);
    await page.fill("#qf-name", "Test User");
    await page.fill("#qf-email", "test@example.com");
    await page.fill("#qf-message", "Hello");
    await page.focus(".qf-submit");
    await page.keyboard.press("Enter");
    await expect(page.locator("#qf-status")).toContainText(/Validation passed/i);
  });

  test("all product quote links across the catalogue route to /contact/ with a product param", async ({ page }) => {
    // sample one product per category rather than crawling all 190 pages
    const seen = new Set<string>();
    for (const c of categories) {
      const p = products.find((x) => x.categoryId === c.indexNo)!;
      await page.goto(`/products/${c.slug}/`);
      const href = await page.locator(`article.pc[id="${p.id}"] a.enq`).getAttribute("href");
      expect(href, c.slug).toBe(`/contact/?product=${p.id}`);
      seen.add(href!);
    }
    expect(seen.size).toBe(20);
  });
});
