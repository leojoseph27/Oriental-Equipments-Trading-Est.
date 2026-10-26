# Milestone 7 — Responsive & Accessibility Hardening Report

**Date:** 2026-10-22 · **Scope:** audit + targeted hardening only. No redesign, no content changes, no new features, no provider activation, no deployment.

---

## 1. Method

1. Read all project docs and every page/component/stylesheet/script before changing anything.
2. Recorded a **baseline** by inspecting the live preview (`npx astro preview --port 4321`) with Playwright MCP: horizontal-overflow measurement across **7 viewports × 9 page states**, keyboard/ARIA/heading checks, and a programmatic contrast-ratio calculation of every text-on-background pair actually used.

## 2. Issues found (baseline) and fixes

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | **High** | Header and footer anchor links (`#brands`, `#industries`, `#about`, `#top`) were dead on every page except the homepage. | Header/footer nav now uses route-absolute targets (`/`, `/#brands`, `/#industries`, `/#about`); footer gained a `Contact` link. |
| 2 | **High** | `--ink-tertiary` `#8a8586` measured **3.28:1 on paper / 3.63:1 on white** — fails WCAG AA for the 11–13px meta text it is used for. | Darkened to `#6d6869` (**4.94:1 paper, 5.48:1 card**). All other pairs pass (see §5). Design-sampling origin noted in tokens.css. |
| 3 | **Medium** | Search-bar row overflowed horizontally at 320–390px on `/products/`, all category pages, and `/search` (input + Search + Clear in one non-wrapping flex row). | `.row { flex-wrap: wrap }` + `input { flex: 1 1 160px; min-width: 0 }` in all three pages. |
| 4 | **Medium** | Mobile menu had no Escape handling and no focus return. | Escape closes the drawer and returns focus to the Menu button (verified). |
| 5 | **Medium** | Error summary was not programmatically focusable (`summary.focus()` was a no-op). | Added `tabindex="-1"` to `#qf-summary`; focus verified on submit. |
| 6 | **Medium** | `aria-describedby` was **overwritten** by field errors, so fields with hints (email, product, message) lost their hint association while errored. | Error ids are now appended to a preserved `data-descbase`; cleared errors restore the original hint association (verified: `qf-email-hint qf-email-err` → `qf-email-hint`). |
| 7 | **Medium** | All 190 "Request a Quote" links had identical accessible names. | Each now has `aria-label="Request a quote for <PRODUCT NAME>"` (verified). |
| 8 | **Low** | Product card headings were `h3` directly under the page `h1` (skipped level). | ProductCard headings are now `h2` (category pages: h1 → h2 cards → h2 Other Categories). |
| 9 | **Low** | Skip link landed focus nowhere (`#main` was not focusable). | All `<main>` elements got `tabindex="-1"` (focus outline suppressed for this programmatic target only); focus verified to land on `main`. |
| 10 | **Low** | Anchored sections could hide behind the sticky header when jumped to from another page. | Global `[id] { scroll-margin-top: 80px }` (product cards keep their 96px). |
| 11 | **Low** | "Request a Quote" card links were small touch targets (≈30px tall). | Padding increased to 8px 12px (≈33px tall). Still under the 44px ideal — noted as a limitation. |
| 12 | **Low** | Brand logo `<img alt="Oriental Equipments Trading Est. logo">` duplicated the adjacent text and the link's `aria-label`. | Header logo image is now `alt=""` (decorative; the link has an accessible name). |
| 13 | **Low** | Dead CSS rule in `index.astro` (`.contact .intro, .positioning ~ * { }`) left from an earlier milestone. | Removed. |

Also already compliant, confirmed: `prefers-reduced-motion` global override, `:focus-visible` outline on all interactive elements (never removed), explicit persistent form labels, `role="alert"` summary, `role="status"` live regions for search results and form status, breadcrumbs with `aria-current="page"`, `lang="en"`, per-page titles/descriptions, `loading="lazy"` + intrinsic `width`/`height` on catalogue images, hero `fetchpriority="high"`.

## 3. Viewport coverage

Viewports: **320×800, 360×800, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080**.
Page states: `/`, `/products/`, `/products/gouging-rod-torches/`, `/products/welding-electrodes/`, `/products/safety/`, `/search` (empty), `/search?q=zzzz` (no results), `/search?q=gloves` (results), `/contact/`.

- **Before fixes:** 9 of 63 combinations had real horizontal overflow (search-bar rows; 22–117px).
- **After fixes:** **0 of 63** overflow. Screenshots at 320px (search, contact, category) and 1440px (home) visually verified: header/menu, grids single/double-column stacking, form fields full-width, footer stacking all correct.
- No component uses horizontal scrolling as a workaround.

## 4. Accessibility checks performed (and how)

- **Landmarks & semantics:** header/nav/main/footer present on all pages; one `h1` per page; heading order verified (homepage h1→h2s; category h1→h2 cards→h2 nav; contact h1→h2s→h3s). Duplicate-ID scan across pages: none. Navigation uses links, actions use buttons.
- **Keyboard:** skip link → `main` (focus verified); menu toggle via keyboard with `aria-expanded`, Escape + focus return (verified); full tab pass on a category page follows visual order; no traps found; focus outlines present (computed `outline: 2px solid ink` on links/buttons/inputs).
- **Forms:** all checks in §6 passed.
- **Contrast:** computed WCAG ratios for every text/background pair in use — ink 14.7, ink-secondary 6.5, green-brand 4.9–5.4, red-brand 5.8–6.4, red-deep 9.1, footer text 6.5–10.6, all ≥ 4.5:1; tertiary ink fixed (#2 above).
- **Zoom/reflow:** the 320–390px passes double as 400%-zoom reflow checks for 1280–1440px widths; no overflow, no clipped text.
- **Reduced motion:** global media-query override present in `base.css`; the only transitions are 120ms border-color hovers.
- **Errors not colour-only:** field errors carry a `⚠` glyph, text, and `aria-invalid`.

**Not tested / limitations (explicit):**
- **No screen-reader testing** — no screen reader was used; ARIA semantics were verified by DOM/computed-attribute inspection only.
- **No formal WCAG conformance claim** — automated/manual checks listed here are not an audit.
- No automated accessibility scanner (axe/Lighthouse) was run — none was configured in the project; this is listed per instruction rather than assumed.
- "Request a Quote" card links remain ≈33px tall (below the 44px touch-target ideal) — accepted to preserve card density.
- `hero-meta` text sits over a photo scrim; its worst-case contrast depends on the photo and was not measured pixel-by-pixel (scrim is 55–82% opaque dark).
- Real `mailto:` handoff to a desktop email client cannot be exercised in the headless browser; encoding was verified via the generated URL/copy payload, not an actual mail app.

## 5. Contact form checks (all passed, no real enquiry sent)

| Check | Result |
|---|---|
| Valid ID prefill (`?product=mig-welding-torch-24kd`) | Product + category filled; status announces it |
| Invalid ID | Graceful status message, form untouched |
| Empty submit | Summary visible, **focus moves to summary**, 3 field errors, 3 `aria-invalid` |
| Malformed email / bad phone / whitespace-only name | Correct per-field messages |
| Values preserved after errors | Yes |
| Error clearing on correction | Error hidden, `aria-invalid` removed, hint association restored |
| Special characters & line breaks | `& < > " é 中` and CRLF preserved in payload |
| >1,800-char mailto | Copy-to-clipboard fallback shown with full 2,044-char text; no truncation; no silent send |
| Delivery messaging | Status/note explicitly state the site cannot confirm sending or receipt |
| Keyboard submission | Form submits via Enter and button |

## 6. Images, performance, consistency

- Zero broken images, zero failed requests (4xx/5xx) across all checked pages; lazy-loaded below-fold images confirmed to load on scroll.
- All images carry intrinsic `width`/`height`; aspect ratios reserved (`.pc-noimg` uses `aspect-ratio`); no layout shift observed.
- Client JS remains: header menu toggle, search page, quote form — all small, no new dependencies added.
- Removed dead CSS; duplicated search-bar rules across three pages predate this milestone and were left as-is (consolidation would touch three scoped styles for zero user-visible gain — noted for Milestone 8/9).

## 7. Build & validator results

- `node scripts/validate-catalog.mjs` → **VALIDATION OK — 20 categories, 190 products, 30 brands, 6 industries**.
- `npm run build` → **24 pages, complete**, no warnings.
- Browser console: **0 errors**; network: **0 failed requests**.
- All routes and product-specific quote links verified working (header/footer/anchor navigation tested from subpages).

## 8. Changed files

- `src/styles/tokens.css` — `--ink-tertiary` darkened for AA contrast.
- `src/styles/base.css` — `scroll-margin-top` for anchored ids; `main[tabindex="-1"]:focus` outline suppression.
- `src/components/SiteHeader.astro` — route-absolute nav, decorative logo alt, Escape + focus return for mobile menu.
- `src/components/SiteFooter.astro` — route-absolute links, Contact link.
- `src/components/ProductCard.astro` — `h2` card heading, labelled quote link, larger touch target.
- `src/components/CategoryIndex.astro` — `aria-labelledby` now points at the real `h2`.
- `src/components/QuoteForm.astro` — `tabindex="-1"` on error summary.
- `src/scripts/quote.ts` — focusable summary focus; hint-preserving `aria-describedby`.
- `src/pages/index.astro` — `main` focusable; dead CSS removed.
- `src/pages/contact.astro`, `src/pages/search.astro`, `src/pages/products/index.astro`, `src/pages/products/[slug].astro` — `main` focusable; search-bar wrap fix.

## 9. Recommendations for Milestone 8

1. Add the above checks as `@playwright/test` regression specs (overflow sweep, form validation matrix, menu Escape behaviour).
2. Consider an automated axe-core scan in the test suite to keep accessibility regressions visible.
3. Optional polish: 44px touch targets for card quote links, and consolidating the three duplicated search-bar styles into a shared class.
