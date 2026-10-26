# Milestone 8.5 — Motion & Visual Polish Report

**Date:** 2026-10-22 · **Direction:** premium/subtle · 3D intensity: balanced · Scope: whole site.
**Milestone 8 dependency:** complete (119 tests green, approved checklist entry) before work started.

---

## 1. Motion design principles implemented

1. **Content first, motion second.** The headline and primary CTA are available immediately; entrance animations are short (≤600 ms) and use `from`-keyframes, so content is visible even if animations never run.
2. **Never hide content behind JavaScript.** Scroll-reveal initial hiding is gated on an `html.js` class that a guarded inline script adds only when `IntersectionObserver` exists and reduced motion is off. No JS / failed JS / reduced motion ⇒ everything visible.
3. **Transform & opacity only.** No width/height/top/left animation; no layout shift (image aspect ratios untouched; the tilt applies to an absolutely-positioned layer).
4. **Hierarchy.** Brief hero entrance → gentle section reveals → subtle card interactions → restrained control transitions. The 190 product cards animate only as their per-category grid group entering the viewport, never in a long sequence.
5. **Reduced motion and coarse pointers disable everything nonessential** (global media query + per-effect guards).
6. **No new animation library.** Native CSS + one small `IntersectionObserver` script + one rAF-throttled pointer handler. No dependency added.

## 2. Motion tokens added (`src/styles/tokens.css`)

`--dur-fast: 140ms`, `--dur-med: 220ms`, `--dur-reveal: 600ms`, `--ease-out`, `--ease-standard`, `--dist-1/2` (8/16 px), `--shadow-1/2` (restrained elevation levels). All effects use these values only.

## 3. Effects added, by target

| Target | Effect | Purpose | Fallbacks |
|---|---|---|---|
| Hero headline/support/CTAs/meta (home) | CSS `hero-rise` fade-up, 100–300 ms stagger | refined entrance | `from`-keyframes: visible if animations unsupported; killed by reduced-motion global rule |
| Hero image (`hero-media` layer) | one-time 2.4 s scale settle 1.035→1; bounded **pointer tilt ≤2°** (perspective 1200px, rAF-throttled, resets on leave) | layered depth, the site's one "balanced 3D" moment | tilt registered only for `(pointer: fine)` + `(prefers-reduced-motion: no-preference)`; image layer absolute → no layout shift; no text blur (text is a separate layer) |
| Homepage sections (positioning, Vision & Mission, categories, industries, brands, contact) | `data-reveal` fade-up via IntersectionObserver | gentle scroll reveals | reveal-once, then permanent; `js`-gated; 4 s post-load failsafe reveals anything left; reduced-motion skips hiding entirely |
| Category tiles / industry tiles / brand tiles / product-card grids | `data-reveal-group` with capped 60 ms stagger (max 11 steps) | group entrance without per-element sequencing | same as above |
| Product cards | hover: 2 px lift + `--shadow-2` + border tint; image scales 1.03 inside `overflow: hidden` card | consistent interaction language, product emphasis | hover only, `no-preference`-guarded; aspect ratio stable; touch/keyboard unaffected (info never hover-gated) |
| Category tiles (home + catalogue) | lift 2 px + shadow-1 | same | same |
| Desktop nav links, buttons, CTAs, search inputs | 140 ms colour/border transitions; 1 px press state (`:active`) | responsive feel | reduced-motion kills press transform & transitions |
| Mobile menu panel | 220 ms fade/slide-down on open | smoother drawer | reduced-motion disables; Escape/focus-return logic untouched |
| Search results, form status + long-message fallback panel | 220 ms fade-in | feedback feel | `no-preference`-guarded; error messages appear **instantly** (no animation on error visibility, announcements unchanged) |

Untouched by design: search logic, URL behaviour, product IDs, quote prefill, validation rules, mailto encoding, palette, fonts, content.

## 4. Files changed

`tokens.css`, `base.css` (tokens + reveal system + press states), `BaseLayout.astro` (gating script + observer with failsafe), `index.astro` (hero entrance/settle/tilt, section attrs), `SiteHeader.astro`, `ProductCard.astro`, `CategoryIndex.astro`, `IndustryGrid.astro`, `BrandGrid.astro`, `VisionMission.astro`, `products/[slug].astro`, `products/index.astro`, `search.astro`, `contact.astro`, `QuoteForm.astro`, plus new `tests/e2e/motion.spec.ts`.

## 5. Reduced-motion behaviour (verified by tests)

With `reducedMotion: "reduce"`: the `js` gating class is never added; hero headline/sections/tiles have computed opacity 1 on load without scrolling; no tilt transform is applied on pointer movement; form validation still focuses the error summary instantly. The pre-existing global reduced-motion rule also nulls all transitions/animations.

No-JS: with all plain inline scripts disabled (renamed tags via request routing), zero elements remain hidden — verified.

## 6. Test results

- New `motion.spec.ts` — **10 tests, all passing**: hero CTA availability; homepage + category-page reveals complete after real (wheel-event) scrolling; 4 reduced-motion checks; no-JS visibility; tilt bounded ≤2.5° and resets on pointer leave; no overflow at 320/390/768/1440/1920.
- **Full suite: 129 passed (36 s)** — includes all 119 pre-existing tests unchanged.
- `node scripts/validate-catalog.mjs` → OK (190/20/30/6). `npm run build` → 24 pages, clean.
- Browser console: 0 errors during hero, reveals, hover, and mobile checks. No orphaned servers.
- Viewports inspected manually via screenshots at 1440×900 and 390×844 (hero, categories, card hover) — no clipping, overflow, or interaction changes.

## 7. Regressions found and resolved

- **Test-only:** the first reveal tests scrolled via `window.scrollTo` inside `evaluate`, which starves render frames and prevents IntersectionObserver callbacks in headless Chromium. Real user scrolling (and Playwright wheel events / `scrollIntoViewIfNeeded`) works. Tests now scroll with `mouse.wheel`, matching the real interaction. No site change was needed.
- No site regressions: all Milestone 5–8 suites pass unmodified.

## 8. Performance note (no unmeasured claims)

No performance measurements were taken (no profiling tool configured in the project — documented limitation). By construction the effects animate only `transform`/`opacity`, add two small inline scripts (~1 KB), no continuous loops (the only repeated work is the rAF-throttled hero tilt on fine pointers), and no new dependencies or assets.

## 9. Intentionally not implemented

- WebGL/Three.js scenes, spinning "3D products" — prohibited; the catalogue images are static photos.
- Tilt on product cards — rejected to keep 190 cards stable and cheap; the hero carries the single 3D moment.
- Page-transition animations between routes — rejected: they delay access to content on a plain static site.
- Parallax scrolling — rejected as unnecessary motion for an industrial catalogue.
- Sound, autoplay, flashing — prohibited.

## 10. Known limitations

- No screen reader was used; accessibility impact was verified through DOM/computed-style assertions and the existing keyboard suites only.
- No before/after performance measurements (no tool available; see §8).
- The hero tilt is only active for fine pointers on devices that also report `no-preference` reduced motion; touch devices get the static hero (by design).
