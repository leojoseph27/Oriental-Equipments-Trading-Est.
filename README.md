# Oriental Equipments Trading Est. — Product Catalogue Website

Static catalogue and product-enquiry website for Oriental Equipments Trading Est.,
an industrial welding equipment and consumables supplier in Dammam, Saudi Arabia.
All content is transcribed from the company's official PDF catalogue (29 pages),
which is the single source of truth.

**This is a catalogue, not a shop** — no cart, checkout, payment, accounts, prices
or stock features, and none of the source contains them.

## Prerequisites

- Node.js >= 22 (developed on v24)
- npm >= 10
- Python 3 (only needed to re-run the extraction/generation scripts; the site
  itself is pure Astro)

## Install & run

```bash
npm install
npm run dev        # local dev server
npm run build      # production build to dist/
npm run preview    # serve the production build
npm run test:e2e   # build, then run the Playwright suite (119 tests)
```

The Playwright suite (`playwright.config.ts`, `tests/e2e/`) tests the production
build served by `astro preview` on 127.0.0.1:4172 — the server starts and stops
with the run. Chromium is required once: `npx playwright install chromium`.

## Data & asset pipeline

The catalogue data and images are generated from the source PDF by reproducible
scripts (run in this order; Python deps: `pdfplumber pypdf pypdfium2 pillow`):

```bash
# caption pass: associates PDF text lines to image placements
# (produces source-assets/captions.json — see scripts in git history / content-guide.md)
python scripts/extract-assets.py     # cards, brands, industries, logo, hero -> source-assets/
python scripts/generate-catalog.py   # -> src/data/catalog.ts + source-assets/product-map.json
node scripts/optimize-images.mjs     # sharp: PNG -> WebP in public/images/
node scripts/validate-catalog.mjs    # hard checks (counts, ids, image paths, refs)
```

`npm run build` does not require Python — `catalog.ts` and `public/images/` are
committed artifacts.

## Project structure

- `src/data/catalog.ts` — typed catalogue data (generated): categories, products, brands, industries
- `src/layouts/`, `src/components/` — layout and shared components
- `src/pages/` — routes (home, /products/[slug], /brands, /industries, /about, /contact)
- `src/styles/` — design tokens and base styles (see design.md)
- `public/images/` — optimized WebP assets (generated)
- `scripts/` — extraction, generation, optimization and validation scripts
- `source-assets/` — extracted originals + manifests (traceability; not deployed)
- `design.md`, `architecture.md`, `content-inventory.md`, `asset-inventory.md`,
  `tooling-report.md`, `design-reference.md` — approved planning documents

## Content editing

See [content-guide.md](content-guide.md).

## Documentation set

`design.md` (design system) · `architecture.md` (technical plan) ·
`content-inventory.md` (PDF-derived inventory) · `asset-inventory.md` /
`asset-extraction-report.md` (assets) · `tooling-report.md` (environment) ·
`implementation-checklist.md` (milestones).
