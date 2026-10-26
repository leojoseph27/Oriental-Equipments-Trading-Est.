# asset-extraction-report.md — Milestone 3 extraction results

Source: `PRE-FINAL_1_ORIENTAL EQUIPMENTS TRADING EST.pdf` (29 pages).
Method: PDF text lines were associated geometrically to embedded image placements
(pdfplumber bboxes); each captioned card placement was extracted from its **embedded
raster** (not the page render), CMYK→RGB converted, white-border autocropped, then
converted to WebP with sharp (products max-width 640 q82; brands 480 q88;
industries 600 q82; logo 480 q92; hero 1600 q78).

## Naming convention

- Products: `public/images/products/<category-slug>/<product-id>.webp`
- Brands: `public/images/brands/<nn>-<brand-slug>.webp` (nn = grid order on PDF file p.4)
- Industries: `public/images/industries/<nn>-<nn>.webp` (order = PDF file p.3 reading order)
- Logo/hero: `public/images/logo/logo.webp`, `public/images/hero/hero.webp`
- Traceability: `source-assets/asset-manifest.json` (source page per asset) and
  `source-assets/product-map.json` (extracted PNG → shipped WebP per product).
  Originals stay in `source-assets/` (git-tracked, not deployed).

## Counts (verified)

| Asset | Extracted | Shipped (WebP) | Mapped |
|---|---|---|---|
| Product card images | 190 caption-verified cards | 190 | 190/190 (1:1 with catalog records) |
| Brand logos | 30 | 30 | 30/30 (visually verified against p.4) |
| Industry images | 6 | 6 | 6/6 |
| Company logo | 1 (cover crop) | 1 | quality flagged (see below) |
| Hero image | 1 (cover top) | 1 | approximate crop, flagged |
| **Total** | **228** | **228** | |

## Discrepancy vs Step 2 inventory (187 expected)

The caption pass found **190** caption-verified cards. The Step 2 text-only count of
187 under-counted category 01 (16, not 15 — the CAST IRON WELDING ELECTRODE card
carries its own AWS NO: ENiFe-Ci, resolving the Step 2 association flag) and category
04 (17, not 15 — the p.7 card count was 8, not 6). Every one of the 190 items is
caption-backed; per-category counts are pinned in `scripts/validate-catalog.mjs`.
`content-inventory.md` is superseded on these two counts.

## Unresolved / excluded assets

8 embedded image placements had **no associated caption** and were excluded from the
catalogue after visual inspection confirmed they are duplicates or decorative
fragments (e.g. fp10-01 electrode rods, fp12-01 cable coil, fp17-01 rack photo
duplicating a captioned card). Raw dumps: `source-assets/extracted/`; log:
`source-assets/asset-manifest.json → unresolved`. None were invented into products.

## Flags in catalog data

- `caption-clipped` (8 items): caption text partially clipped by the geometry pass,
  restored verbatim from the PDF raw text layer (e.g. "200 ACDC EDON", "TIP CLEANER",
  "TIG GLOVES SHORT/LONG", CO2/LPG CYLINDER, dryer sizes).
- `code-only-name` (6 items): cutting-nozzle cards printed with model codes only
  (GPN, 102HC, 106HC, PNME, ANME, 164) plus one card printed "ACETYLENE".
- `caption-type-heading-preserved`: wire cards whose printed name is the wire-type
  heading (FLUXCORED/SOLID/TIG WELDING WIRE).

## Low-resolution review list

Card resolutions: min 276px, median 492px, max 622px (longest side).
**12 images below 400px** (list: `source-assets/low-res-images.json`) — mostly
slender items cropped tight (cylinders ~220×319, cylinder trolleys, Hypertherm
coolant, dryer, torch bodies). Acceptable for card tiles (they render at ≤300px);
flagged for possible re-shoot. No upscaling was applied to any image.

## Review flags pending

- Company logo is a small cover crop (~230px tall) — quality flagged; SVG rebuild
  remains **on hold pending user approval**.
- Hero crop is approximate (cover top area) — refine in milestone 4 during homepage
  work.
- Cutting-nozzle card photos (PDF cat. p.14) — codes are listed as printed; the
  per-code photo association follows card order and should get a final visual check
  in milestone 9.
