# content-guide.md — Editing catalogue content safely

## Where content lives

`src/data/catalog.ts` is the single source of truth for everything shown on the
website. It is **generated** by `scripts/generate-catalog.py` from the PDF captions
(`source-assets/captions.json`). Two safe workflows:

### A. Small correction (typo, size, flag)

Edit the record directly in `src/data/catalog.ts`, then add a `// MANUAL:` comment
above the changed line so a future regeneration doesn't silently lose it — better:
also update the `OVERRIDES` dict in `scripts/generate-catalog.py` so the correction
survives regeneration, then re-run:

```bash
python scripts/generate-catalog.py && node scripts/optimize-images.mjs && node scripts/validate-catalog.mjs
```

### B. Bulk regeneration from the PDF

1. Place the PDF at the path configured in `scripts/extract-assets.py`.
2. Run the caption pass (see README) → `source-assets/captions.json`.
3. Run `extract-assets.py` → `generate-catalog.py` → `optimize-images.mjs`.
4. Run `node scripts/validate-catalog.mjs` — it fails loudly on count mismatches,
   duplicate ids, broken category references, missing images and missing page refs.

## Field rules (from the approved plan)

- `name`, `awsNo`, `model`, `sizes`, `amps`, `packet`, `notes` — transcribe the PDF
  **verbatim**, including unusual captions (e.g. "FLUXCORED WIRE … ER70S6",
  "WELDING SAFETY GOOGLES"). Never silently correct the source.
- Omit fields the PDF doesn't print. Never invent values.
- `notes` carries as-printed extras: origin labels ("MADE IN …"), colour words,
  type headings ("TIG WELDING WIRE") preserved from the catalogue page.
- `printedPage` = printed catalogue page number; `pdfPage` = PDF file page
  (file page = printed page + 5). Both are required.
- `flags` — data-quality markers: `caption-clipped` (text restored from the raw PDF
  text layer), `code-only-name` (cutting-nozzle codes), `caption-type-heading-preserved`
  (card's printed name was the wire-type heading).
- `image` — path under `/images/products/<category-slug>/<id>.webp`. Only point it
  at an image you have verified corresponds to the item (see asset report).

## Adding an item

Add the record in `generate-catalog.py`'s data flow (or manually in catalog.ts with
a `MANUAL` note), place its image at the expected WebP path, and run the validator —
per-category expected counts are pinned in `scripts/validate-catalog.mjs`, so update
the `expected` map there when the count legitimately changes, and record why in
`content-inventory.md`.

## Images

- Never fabricate or substitute product photography. If an image is missing or
  ambiguous, leave `image` empty and list the item in the asset review.
- Originals live in `source-assets/cards/` (traceable via
  `source-assets/asset-manifest.json` and `source-assets/product-map.json`).
  Only `public/images/` is deployed.
