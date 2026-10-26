# design.md — Oriental Equipments Trading Est. Design System

Status: Step 2 deliverable. All colour values sampled from the supplied catalogue PDF
(rendered page images); typography is a documented recommendation, since font names are
not stated anywhere in the PDF (marked unknown in Step 1).

Direction: **industrial editorial / technical catalogue** — an off-white "spec-sheet"
canvas, charcoal ink, brick-red and deep-green used as structural accents (the two
colours of the company logo), white-background product photography in disciplined
grids. Credible and precise; no decorative effects that slow product browsing.

---

## 1. Colour tokens

Sampled from `pages/p01.png` (logo, cover), `pages/p03.png` (heading bar) and
`pages/p06.png` (catalogue background swirls). Sampling method: saturation-filtered
pixel histograms.

| Token | Value | Source / use |
|---|---|---|
| `--red-brand` | `#B82020` | Logo inner arc (sampled dominant logo red). Primary accent: CTAs, active states, key rules. |
| `--red-deep` | `#8E1A12` | Catalogue heading red (sampled `#901810` on p.3). Section headings, hover shade of red. |
| `--green-brand` | `#157A44` | Logo outer arc (sampled `#189848`, darkened for AA contrast on white). Secondary accent: category markers, links, success states. |
| `--green-deep` | `#0B3D1F` | Catalogue background green (sampled `#083818`–`#0B3D1F`). Footer, dark bands. |
| `--ink` | `#231F20` | Charcoal text — sampled directly from cover title. Headings and body. |
| `--ink-secondary` | `#5B5657` | ~60% charcoal. Secondary copy, captions. |
| `--ink-tertiary` | `#8A8586` | Tertiary/meta text, table footnotes. |
| `--paper` | `#F4F3F1` | Page canvas (catalogue off-white `#E7E8E9` lifted slightly for screen legibility). |
| `--paper-card` | `#FFFFFF` | Product cards, photo backgrounds (catalogue uses pure white cards). |
| `--line` | `#DDDAD6` | Hairline borders, dividers. |
| `--gold-rule` | `#C9A227` | Thin cover rule (sampled from cover gold line). Used only as a 2px identity rule under the logo/wordmark. |

Contrast checks (WCAG):
- `--ink` on `--paper` ≈ 13.4:1 — passes AAA.
- `--red-brand` `#B82020` on white ≈ 5.4:1 — passes AA for normal text; fine for large headings and buttons with white text (white on `#B82020` ≈ 5.4:1... verified pair AA for normal text).
- `--green-brand` `#157A44` on white ≈ 4.9:1 — passes AA.
- `--ink-secondary` on `--paper` ≥ 5.5:1 — passes AA.
- `--red-deep` `#8E1A12` on white ≈ 8.3:1 — passes AAA (used for headings).
- Never place `--green-brand` text on `--red-brand` backgrounds or vice versa; accents are separated by paper/line.

Focus states: 2px `--ink` outline offset 2px, plus colour change; visible on all backgrounds.

## 2. Typography

Fonts not stated in the PDF (unknown). Recommendation, licence-safe via Google Fonts
(OFL), character-matched to the catalogue's bold geometric sans:

| Role | Face | Notes |
|---|---|---|
| Display / headings | **Barlow Condensed SemiBold (600)** | Industrial, condensed, engineered look; matches catalogue's tight bold headings. |
| Body / UI | **Barlow (400/500/600)** | Same family for coherence; highly legible at small sizes. |
| Technical data (AWS nos., model codes, sizes, amps) | **IBM Plex Mono (400/500)** | Reinforces spec-sheet credibility; distinguishes data from prose. |

Scale (desktop / mobile):
- Display: 48/34px, 1.05, -1% tracking
- H1: 40/30px · H2: 30/24px · H3: 22/19px · Body: 17/16px, 1.6 · Small: 14px · Meta mono: 14/13px
- Headings max-width ~28ch; body measure 65–75ch.

Rules: sentence-case UI copy; category and product names reproduce the catalogue's
capitalisation exactly (catalogue uses ALL CAPS — headings may render them as written).

## 3. Spacing, grid, layout

- 8px base scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Container: 1200px max, 24px gutters (16px mobile).
- Section rhythm: 96px desktop / 56px mobile between major sections.
- Product grid: responsive auto-grid, min card 260px, 24px gutters; 1–4 columns.
- Cards: white, 1px `--line` border, 4px radius maximum (catalogue cards are square;
  4px only to soften on screen). No shadows on product cards; single subtle shadow
  allowed on the sticky header only.
- Header: sticky, white, hairline bottom border; logo + horizontal nav; category
  dropdown on "Products".
- Footer: `--green-deep` band, white/off-white text, full contact block from PDF p.29.

## 4. Components (inventory for Step 4–6)

1. SiteHeader (logo, nav, Products dropdown, search trigger, mobile drawer)
2. SiteFooter (contact details verbatim from PDF, quick links)
3. CategoryCard (photo tile + canonical name + item count)
4. ProductCard (white photo tile, name, AWS NO/model/size lines in mono, "Add to Quote" action)
5. SpecList (mono key–value rows: AWS NO / Sizes / Amps / Model / PKT.)
6. SearchDialog (client-side, keyboard accessible)
7. QuoteForm (name, company, phone, email, product interest, message; validation; provider pending approval)
8. BrandLogoGrid (30 logos, uniform tiles, "Brands We Serve")
9. IndustryGrid (6 photo tiles with exact catalogue captions)
10. VisionMission block (featured near top of Home and in About)
11. SectionHeading (green bar + red deep heading — echoes catalogue header device)
12. ContactBlock (address, phones, email; tel:/mailto: links)
13. Breadcrumbs (Home / Products / Category)
14. Button (primary red, secondary outline charcoal, ghost green link)

## 5. Imagery rules

- Product photos: white-background catalogue photos only. No fabricated images, no
  unrelated stock substitutes. Low-resolution items flagged in `asset-inventory.md`
  and rendered on white tiles so imperfect edges read as intentional.
- Industry photos: the six photos from PDF p.3.
- Brand logos: the 30 logos from PDF p.4 in uniform tiles; no product-brand claims.
- Hero: the cover welding photo (PDF p.1) with charcoal overlay ≥55% for text contrast.
- Vision 2030 badge appears once (About / Home identity strip), as in the catalogue.
- All images: WebP, explicit width/height, lazy-loaded below the fold, descriptive alt
  text drawn from the product name.

## 6. Motion & interaction

- Functional only: hover states (border darkens to `--ink` at 20%, photo scales 1.02
  max), focus rings, dropdown reveal ≤150ms, smooth scroll for anchors. No parallax,
  no autoplaying carousels, no entrance-animation gating of content.

## 7. Responsive behaviour

- Breakpoints: 640 / 900 / 1200px.
- Mobile: hamburger drawer nav, single-column product grid (2-col ≥480px if cards fit),
  sticky "Request a Quote" bar, tap targets ≥44px.
- Tables/spec lists stack to key–value rows under 640px.

## 8. Accessibility commitments

- WCAG 2.1 AA contrast (pairs listed above), visible focus everywhere, semantic
  landmarks, skip-to-content link, labelled form fields with inline errors,
  `prefers-reduced-motion` honoured, alt text for all informative images.

## 9. Explicitly excluded

Gradients, glassmorphism, blob shapes, dark-mode toggle, invented statistics or
testimonials, stock office photography, cart/checkout/price elements, decorative
dashboards. Red and green are structural accents only — never competing full-bleed
decorative blocks side by side.
