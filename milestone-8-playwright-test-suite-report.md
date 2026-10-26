# Milestone 8 — Playwright Regression Test Suite Report

**Date:** 2026-10-22 · **Result: 119 tests, all passing** against the production build served by `astro preview`.

---

## 1. Environment & tooling

- Inspected `package.json` (Astro 7.4.2, Node 24 / npm 11, no prior Playwright), lockfile, scripts, and the Milestone 7 report before installing anything.
- Added dev dependencies: **`@playwright/test`** and **`@axe-core/playwright`** (axe was evaluated per instruction and added as a small, documented integration — see §5). Chromium only (`npx playwright install chromium`). Both recorded in `package-lock.json`. No other dependencies added.
- New files: `playwright.config.ts`, `tests/e2e/{helpers,routes,catalogue,search,responsive,accessibility,quote-form}.spec.ts`.
- New scripts: `npm run test:e2e` (**builds first**, then runs Playwright) and `npm run test:e2e:ui`.
- Server strategy: config `webServer` starts `astro preview` on **127.0.0.1:4172** (port chosen to avoid the 4321 dev port) and shuts it down with the run; the site is always freshly built by `test:e2e`, so tests exercise the exact deployable static output. Screenshots + traces retained on failure; `test-results/` is the artifact folder. CI-friendly: `forbidOnly`, retries on CI, 2 workers on CI, non-interactive reporters.
- Confirmed **no orphaned server processes** remain after runs.

## 2. Coverage

| Suite | Tests | What it protects |
|---|---|---|
| `routes.spec.ts` | 30 | Homepage, /products/, **all 20 category routes** (status 200, correct card count per category), /search, /contact/; one h1 + meaningful title per page; every header/footer link resolves (unique hrefs GET-checked); homepage-section anchors clicked from a subpage land on visible sections; footer Contact link; breadcrumbs `aria-current`; a product quote link navigates to `/contact/?product=<id>`; unknown route → 404 (Astro default, asserted against actual behaviour); no overflow on /contact/ desktop. |
| `catalogue.spec.ts` | 9 | **190 / 20 / 30 / 6 counts imported from the canonical `src/data/catalog.ts`** (no copied fixture); unique product IDs; valid category references; slugs; non-empty names + printed/PDF page refs (ranges like "1-2" accepted); brand+industry image URLs all resolve; representative card (first per category) shows its real name; quote links use stable IDs; zero broken images on 5 sampled pages. |
| `search.spec.ts` | 11 | Empty state; E7018 (count asserted against the canonical data — matches E7018 *and* E7018-1, as the site's index does); 24KD → the MIG torch; K4000 → navigates to `/products/gouging-rod-torches/#k4000` with the card in view; ER70S-6; broad "gloves" (>5 results, status line); no-match state; case-insensitivity; Clear resets URL + refocuses input; typing updates `?q=`; zero console errors during interactions. |
| `responsive.spec.ts` | 43 | All **7 viewports × 5 page states** (home, catalogue, category, search results, contact) with **≤2px** overflow tolerance (rounding only — one failing pixel would fail the test); mobile menu open/Escape/focus-return and link navigation at 390/360px; search usable at 320px; no product card or form control outside the viewport at 320px; sticky header does not obscure the first card (hit-test). |
| `accessibility.spec.ts` | 15 | Skip link focus → `main#main` focused; keyboard reachability of nav/search; menu `aria-expanded` toggle; visible focus outlines (≥1px, style ≠ none) on quote link, search button, breadcrumb; zero duplicate IDs on 5 routes; `lang="en"` on all pages; **quote-link accessible names unique and product-specific** (asserted against canonical names for category 19); persistent labels + `required` semantics; error summary focus with `aria-invalid` + hint-preserving `aria-describedby` transitions; deterministic WCAG contrast math against the design tokens (incl. the M7 tertiary-ink fix, 4.5:1 minimums). |
| `quote-form.spec.ts` | 13 | Full M7 matrix, replayed as automation: empty submit → all 3 errors + focused summary; malformed email/phone; whitespace-only rejection (trimmed email accepted); value preservation; maxlength caps; category dropdown equals the 20 canonical names in order; valid-ID prefill (product + category + status); invalid-ID graceful degradation with usable form; mailto path status wording ("Validation passed … cannot confirm"); over-long message → copy fallback with **full text incl. END-MARKER** (no truncation); note never claims delivery; keyboard submission; one quote link per category → 20 unique correct hrefs. **No real email is ever sent** — the mailto handoff is asserted via its status text and (in the Axe probe runs) never executed. |

Total: **119 tests, 119 passed, 0 skipped** (full run ≈ 26–60 s).

## 3. Real defect found by the suite (fixed)

- **Homepage "Request a Quote Online" button had ink-on-red text (2.53:1 contrast).** The axe scan flagged it; computed styles confirmed `.card a { color: var(--ink) }` (later in the scoped stylesheet, equal specificity) overrode the button's white text. Fixed in `src/pages/index.astro` with `.card a:not(.btn)`. This bug existed since Milestone 4 and was missed by manual checks. Site rebuilt and re-tested after the fix.

Five initial test-side failures were corrected during development (not site bugs): string page-range values ("1-2"), product IDs starting with a digit needing attribute selectors (`[id="250a-edon"]`), the E7018 count expected the prefix match the index actually performs, a 2001-char test string clipped by the real maxlength, and a textarea asserted with `toContainText` instead of `inputValue()`.

## 4. axe-core integration — exactly what it checks

- `@axe-core/playwright` runs with `withTags(["wcag2a", "wcag2aa"])` on four pages: homepage, a category page, populated search, and contact.
- The assertion fails only on **serious or critical** impact violations. Currently zero on all four pages.
- **Scope disclaimer:** these are automated static checks. They do **not** prove WCAG conformance and say nothing about actual screen-reader behaviour. Manual M7 limitations (no screen-reader testing; hero text contrast over a photo scrim; ~33px card link touch targets) remain open.

## 5. Constraints respected

No website features added, no content or product data changed (the suite reads `src/data/catalog.ts`, it does not copy it), no form provider activated (mailto path only), no deployment, Milestone 9 content audit not started.

## 6. Changed / added files

- Added: `playwright.config.ts`, `tests/e2e/helpers.ts`, `tests/e2e/routes.spec.ts`, `tests/e2e/catalogue.spec.ts`, `tests/e2e/search.spec.ts`, `tests/e2e/responsive.spec.ts`, `tests/e2e/accessibility.spec.ts`, `tests/e2e/quote-form.spec.ts`.
- Modified: `package.json` (+2 dev deps, +2 scripts), `src/pages/index.astro` (contrast fix only).
- Generated: `test-results/` (artifacts; safe to delete/regenerate).

## 7. Commands executed

- `npm install -D @playwright/test @axe-core/playwright` · `npx playwright install chromium`
- `npm run build` → 24 pages · `node scripts/validate-catalog.mjs` → **VALIDATION OK (190/20/30/6)**
- `npx playwright test` → **119 passed (26.1s)** · orphaned-process check → none listening

## 8. Recommendations for Milestone 9

1. The catalogue data assertions in `catalogue.spec.ts` pin 190/20/30/6 — if Milestone 9's line-by-line audit legitimately changes a count, update those pins together with `scripts/validate-catalog.mjs`.
2. Consider adding the remaining 14 category pages to the axe route list once run-time budget allows (currently one representative category).
3. `test-results/` should be gitignored when the project gets version control.
