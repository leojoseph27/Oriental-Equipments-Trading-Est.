import { expect, test, type Page } from "@playwright/test";
import { categories, products, expectNoOverflow, disableIntro } from "./helpers";

test.beforeEach(async ({ page }) => {
  await disableIntro(page);
});

const label = (p: (typeof products)[number]) => {
  const code = p.awsNo || p.model;
  return code ? `${p.name} (${code})` : p.name;
};

async function fill(page: Page) {
  await page.fill("#qm-name", "Test Buyer");
  await page.fill("#qm-email", "buyer@example.com");
  await page.fill("#qm-phone", "+966 50 000 0000");
  await page.fill("#qm-company", "Example Co");
}

test.describe("unified quote modal", () => {
  test("every product button on all 20 category pages opens the modal with its own product", async ({ page }, info) => {
    test.skip(info.project.name !== "chromium", "full sweep runs once on desktop Chromium");
    test.setTimeout(240_000);
    expect(categories.length).toBe(20);
    for (const c of categories) {
      await page.goto(`/products/${c.slug}/`);
      const items = products.filter((p) => p.categoryId === c.indexNo);
      await expect(page.locator("a.enq")).toHaveCount(items.length);
      for (const p of items) {
        await page.locator(`article.pc[id="${p.id}"] a.enq`).click();
        await expect(page.locator("#quote-modal")).toBeVisible();
        await expect(page.locator("#qm-product")).toHaveValue(label(p));
        expect(page.url()).not.toContain("/contact/");
        await page.keyboard.press("Escape");
        await expect(page.locator("#quote-modal")).toBeHidden();
      }
    }
  });

  test("open/close, focus, scroll lock, no CAPTCHA, validation, submission", async ({ page }) => {
    const c = categories.find((x) => x.slug === "mig-welding-wire")!;
    const items = products.filter((p) => p.categoryId === c.indexNo);
    await page.goto(`/products/${c.slug}/`);
    const btn = page.locator(`article.pc[id="${items[1].id}"] a.enq`);
    await btn.scrollIntoViewIfNeeded();
    const y = await page.evaluate(() => scrollY);
    await btn.click();
    const modal = page.locator("#quote-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByRole("heading", { name: "Let's Discuss Your Requirement" })).toBeVisible();
    await expect(page.locator("#qm-name")).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");
    expect(await page.evaluate(() => scrollY)).toBe(y);
    await expect(page.locator('iframe[src*="recaptcha"], .g-recaptcha, [class*="captcha" i]')).toHaveCount(0);
    await expect(page.getByText(/not a robot/i)).toHaveCount(0);
    await expectNoOverflow(page);

    // required-field validation
    await page.click(".qm-submit");
    for (const id of ["name", "email", "phone", "company"]) {
      await expect(page.locator(`#qm-${id}`)).toHaveAttribute("aria-invalid", "true");
    }
    await expect(page.locator("#qm-name")).toBeFocused();
    await page.fill("#qm-email", "bad");
    await page.click(".qm-submit");
    await expect(page.locator("#qm-email-err")).toContainText("valid email");

    // success path: mailto draft, honest message, duplicate submit blocked
    await fill(page);
    await page.fill("#qm-message", "200 kg, 1.2mm");
    await page.click(".qm-submit");
    await expect(page.locator("#qm-status")).toContainText("press send");
    await expect(page.locator(".qm-submit")).toBeDisabled();

    // X closes, focus returns, scroll restored
    await page.waitForTimeout(1600);
    await page.click(".qm-close");
    await expect(modal).toBeHidden();
    await expect(btn).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");

    // a different product replaces stale info; message & status reset
    const other = page.locator(`article.pc[id="${items[0].id}"] a.enq`);
    await other.click();
    await expect(page.locator("#qm-product")).toHaveValue(label(items[0]));
    await expect(page.locator("#qm-message")).toHaveValue("");
    await expect(page.locator("#qm-status")).toBeHidden();

    // fallback path: too long for mailto -> copy text shown, nothing discarded
    await fill(page);
    await page.fill("#qm-message", "x".repeat(1900));
    await page.click(".qm-submit");
    await expect(page.locator("#qm-copy")).toBeVisible();
    await expect(page.locator("#qm-copy")).toHaveValue(new RegExp(`Product: ${items[0].name}`));

    // backdrop click closes
    await page.waitForTimeout(1600);
    await page.mouse.click(3, 3);
    await expect(modal).toBeHidden();
  });

  for (const w of [320, 360, 375, 390, 414, 430, 768, 1024]) {
    test(`${w}px layout fits without overflow`, async ({ page }, info) => {
      test.skip(info.project.name !== "chromium", "viewport sweep on Chromium");
      await page.setViewportSize({ width: w, height: 800 });
      await page.goto("/products/abrasives/");
      await page.locator("a.enq").first().click();
      const box = (await page.locator("#quote-modal").boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(w);
      const submit = (await page.locator(".qm-submit").boundingBox())!;
      expect(submit.height).toBeGreaterThanOrEqual(44);
      await expectNoOverflow(page);
    });
  }
});
