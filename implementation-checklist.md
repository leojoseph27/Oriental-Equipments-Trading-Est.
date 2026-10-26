# implementation-checklist.md — Ten-milestone checklist

Aligned to the approved Step 1 plan. ✅ = done and verified; ☐ = pending.

1. ✅ **PDF audit & content inventory** — `pdf_text.txt`, `content-inventory.md`
   (187 items, 20 categories, dual page refs), `asset-inventory.md`.
2. ✅ **Design system & architecture** — `design.md` (tokens sampled from PDF),
   `design-reference.md` (DJI, MIT), `architecture.md`, `tooling-report.md`;
   TasteSkill + Impeccable installed & initialized.
3. ✅ **Project setup & asset preparation** — Astro 7 + TypeScript scaffold in workspace
   root; 228 assets extracted from the PDF and converted to WebP via sharp;
   `src/data/catalog.ts` populated with 190 caption-verified items; validator script,
   README and content-guide written. Count reconciliation: 190 vs Step 2's 187
   documented in `asset-extraction-report.md`.
   *Verified: `node scripts/validate-catalog.mjs` OK; `npm run build` passes;
   brand-logo mapping visually verified.*
4. ✅ **Homepage** — sticky header with logo + anchor nav + accessible mobile drawer;
   hero (re-cropped cover photo, badge removed), positioning copy, Vision & Mission
   (verbatim), 20-category typographic index, industries grid, "Brands We Serve"
   (30 logos), contact/enquiry section (mailto/tel), deep-green footer.
   *Verified: validate-catalog OK; npm run build passes; Playwright checks at
   1440/768/390 — no overflow, no broken images, no bad anchors, menu ARIA + close
   behaviour tested, console clean; Impeccable detect: 0 findings.*
5. ✅ **Catalogue & categories** — `/products/` index + 20 generated category pages
   (`src/pages/products/[slug].astro`, single template from `catalog.ts`);
   `ProductCard` + `Breadcrumbs` components; `/search?q=` URL-based client-side
   search over a build-time index (`search-index.json`, generated pre-build);
   header/footer/homepage links rewired to real routes (About/Brands/Industries
   remain anchors until their milestones).
   *Verified: validate-catalog OK (190/20/30/6); npm run build = 23 static pages;
   all 20 category routes + /products/ + /search direct-GET 200; search tested for
   E7018 (2 exact), 24KD (1), K4000 → anchor #k4000 on category page, ER70S-6 via
   form submit (1 exact), "gouging" (7), "gloves" (8), no-results + clear; mobile
   390px: no overflow, 0 broken images, console clean; homepage link audit: all
   internal links resolve.*
6. ✅ **Contact & quote enquiry** — dedicated `/contact/` page with verified contact
   block + QuoteForm (`src/components/QuoteForm.astro` + `src/scripts/quote.ts`);
   required fields: name, email, message; optional: company, phone, category (from
   the 20 catalog categories), product/model, quantity, extra requirements;
   client-side validation (trim, email/phone regex, length limits, per-field errors,
   focusable error summary `role=alert`, values preserved, not colour-only);
   product pre-fill via `?product=<stable-id>` against the search index with
   graceful invalid-id message; submission via isolated `submitEnquiry()` adapter —
   **live transport is mailto only** (≤1,800 encoded chars, copy-to-clipboard
   fallback for longer), never implies delivery; "Request a Quote" links added to
   all ProductCards; header/homepage CTAs rewired to `/contact/`;
   `form-provider-evaluation.md` written (Formspree/Web3Forms/Netlify/mailto,
   unverified items marked) — **no provider activated**.
   *Verified: empty-submit summary, malformed email/phone errors, maxlength attrs,
   valid submit mailto encoding, prefill (valid + invalid id), 390px layout,
   0 console errors; npm run build = 24 pages; validate-catalog OK.*
7. ✅ **Responsive & accessibility** — baseline audit (7 viewports × 9 page states,
   contrast computation, keyboard/ARIA inspection), then 13 targeted fixes:
   route-absolute header/footer anchors (were dead on subpages), `--ink-tertiary`
   darkened to AA (4.9:1), search-bar wrap fix (320–390px overflow, 9→0 of 63
   combos), mobile-menu Escape + focus return, focusable error summary,
   hint-preserving `aria-describedby`, per-product quote-link labels, card
   headings h3→h2, focusable `main` skip-link target, `scroll-margin-top`,
   larger card touch targets, decorative logo alt, dead CSS removed.
   Full detail: `milestone-7-responsive-accessibility-report.md`.
   *Verified: 0/63 overflow after fixes; 0 console errors; 0 failed requests;
   0 broken images; form matrix incl. long-message fallback passed; skip-link,
   menu Escape, contrast, heading order checked. NOT tested: screen readers,
   axe/Lighthouse (not configured), real mail-client handoff.*
   *Known limitations: card quote links ≈33px (below 44px ideal); hero-meta
   contrast depends on photo scrim; duplicated search-bar CSS in 3 pages.*
8. ✅ **Playwright testing & bug fixes** — `@playwright/test` + `@axe-core/playwright`
   (Chromium only) added; `playwright.config.ts` serves the fresh production build
   via `astro preview` on 127.0.0.1:4172 (auto start/stop, no orphans);
   `npm run test:e2e` = build + full suite. 6 suites / **119 tests, all passing**:
   routes (all 20 categories + link/anchor/breadcrumb/404 checks), catalogue
   integrity vs canonical `catalog.ts` (190/20/30/6, unique IDs, image checks),
   search (11 scenarios incl. K4000 anchor navigation, no console errors),
   responsive (7 viewports × 5 pages, ≤2px overflow tolerance), keyboard/a11y
   (skip link, menu Escape, focus styles, contrast math) and the full quote-form
   matrix. axe scans (serious/critical only) on 4 pages.
   **Real bug found & fixed:** homepage "Request a Quote Online" button was
   ink-on-red (2.53:1) — `.card a` colour rule overrode the button text; fixed
   with `.card a:not(.btn)` in `index.astro`.
   Full detail: `milestone-8-playwright-test-suite-report.md`.
   *Not covered: real screen-reader behaviour, real mail-client handoff;
   hero text contrast over photo scrim remains a known limitation.*
8.5 ✅ **Motion & visual polish (inserted milestone)** — motion tokens
   (`--dur-fast/med/reveal`, easings, distances, shadows); JS-gated
   IntersectionObserver scroll reveals with stagger groups (content visible
   without JS, 4s failsafe, reveal-once); CSS-only hero entrance + one-time
   image settle; bounded ≤2° pointer tilt on the hero image only (fine pointer,
   no reduced motion, rAF-throttled); hover lift/shadow/image-zoom on cards and
   tiles; nav/button/input transitions and press states; menu and results
   fade-ins. No animation library added. New `motion.spec.ts` (10 tests:
   reveals complete, reduced-motion visibility, no-JS visibility, tilt bounds,
   overflow). **Full suite: 129 passed.** Build + validator OK, 0 console
   errors. Detail: `milestone-8-5-motion-visual-polish-report.md`.
   *Not measured: performance (no profiling tool); no screen reader used.*
9. ✅ **Final content verification against PDF** — original PDF located and
   verified; all 190 records' fields evidenced against their PDF pages
   (automated, `source-assets/audit-field-check.json`); reverse-coverage check
   of every catalogue page; visual card-image verification of all
   position-sensitive pages; categories/brands/industries/Vision-Mission
   verified verbatim. **One correction:** PDF file p.17 caption↔image pairing
   was off by one — `nitrogen-cylinder` (was "CO2 CYLINDER" showing a nitrogen
   bottle), `co2-cylinder` (was LPG/CO₂), `lpg-cylinder` (was bare "CYLINDER");
   fixed in catalog.ts, images, product-map, and the generator's OVERRIDES.
   Unresolved (logged): cutting-nozzle code order (source-ambiguous), 12
   low-res images, "GOOGLES" source typo preserved.
   **⚠ Flagged for user decision:** an unapproved "digital catalogue reader"
   feature (`/catalogue/`, homepage band, published PDF copy, 8 tests) appeared
   in the workspace during this milestone — left untouched, reported in
   `milestone-9-final-content-audit-report.md` §8.
   *Verified: validator OK (190/20/30/6); build 25 pages; e2e 137 passed.*
   Detail: `milestone-9-content-audit-log.md` + `milestone-9-final-content-audit-report.md`.
10. ☐ **Deployment & handover** — build/deploy instructions (Netlify or Cloudflare
    Pages, terms verified), README + content guide finalised.
    *Verify: deployed preview reachable; handover docs complete.*

## Standing constraints
- Catalogue, not e-commerce: no cart, checkout, payments, accounts, prices.
- PDF is sole content source; unknowns stay unknown; ⚠ flags never silently "fixed".
- Form provider: no sign-up or credentials without user approval.
