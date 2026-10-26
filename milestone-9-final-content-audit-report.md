# Milestone 9 — Final Catalogue & Source-PDF Accuracy Audit Report

**Date:** 2026-10-22 · **Verdict:** catalogue is accurate to source after one image/caption alignment correction (3 records, PDF file p.17). Totals unchanged: **190 products / 20 categories / 30 brands / 6 industries / 25 built pages** (25 = 24 + the unapproved `/catalogue/` reader page — see ⚠ below).

---

## 1. Sources actually inspected

- **Original PDF:** `C:\Users\leojo\Downloads\PRE-FINAL_1_ORIENTAL EQUIPMENTS TRADING EST.pdf` (located via the path documented in `content-inventory.md`). Verified 29 pages; page-6 text compared against the project's `pdf_text.txt` — same content (line-merging differs between pdfplumber runs; token-level comparison used instead).
- Project artifacts: `pdf_text.txt`, `source-assets/captions.json`, `asset-manifest.json`, `product-map.json`, `low-res-images.json`, `page-layout.json`, `scripts/generate-catalog.py`, `scripts/validate-catalog.mjs`.
- Docs: `content-inventory.md`, `asset-extraction-report.md`, `implementation-checklist.md`, `README.md`, M7/M8/M8.5 reports.
- Rendered PDF pages (pypdfium2) and extracted card PNGs, viewed visually for position-sensitive pages.

## 2. Methodology

1. **Field evidence (all 190 records, automated):** every name / AWS no. / model / sizes / amps / packet / notes value was normalized and matched against the extracted text of the record's PDF file page (exact or all-tokens). Result: **190/190 fully evidenced** (log: `source-assets/audit-field-check.json`).
2. **Reverse coverage (all catalogue pages, file p.6–28):** content tokens on each PDF page not represented by any record. One real omission found (NITROGEN — see §4); all other hits were page headings/units ("ARC", "NUMBER:", "LENGTH:", "CUTTING,", "HAND", "PROTECTIVE").
3. **Image mapping (visual):** the original PDF page renders and the extracted card PNGs were compared for every position-sensitive page — file p.11 (holder types), 12, 13 (MIG torch models/consumables), 14 (TIG models 9FV/17FV/26FV visible in images; tungsten red/green verified by colour), 16 (K4000/K3000 printed on torches), 17, 18 (cutting torch), 19 (nozzles), 22 (helmets — first confirmed fp22-01 = leather hood), 23 (EDON/ESAB machines), 27 (gloves), 28. Non-positional pages rely on the geometry-based caption↔image pairing documented in `captions.json`/`product-map.json` (M3).
4. **Categories/brands/industries/copy:** 20 category names + ordering vs the PDF index (file p.5); per-category counts vs card placements; 6 industry captions vs PDF p.3 (all found verbatim); Vision & Mission vs PDF p.2 (verbatim match, curly quotes included); brand logos re-verified by viewing samples (Böhler, Special Metals, Zulfi) plus the M3 full visual pass.
5. **Search/quote integrity:** re-run of the index generator, build, and the full Playwright suite (which asserts search results, stable-ID quote links, prefill, anchors).

## 3. Verified catalogue totals

20 categories (names and order match the PDF index; two printed page-heading variants — "GOUGING TORCHES & RODS", "MIG TORCHES & CONSUMABLES" — preserved as `pageHeading` per the Step-2 decision). **190 products**, all uniquely ID'd, all with both printed + PDF page refs. **30 brand logos** — presented only as "Brands We Serve" (no partnership/authorization claims anywhere; checked homepage/footer/category copy). **6 industries**, captions verbatim. Vision/Mission verbatim. No prices, stock, CR/VAT details, or unsupported claims found on any audited page.

## 4. Findings by severity

**Critical:** none.

**High:** none open. (The p.17 finding below was High while open: one product existed only as a bare "CYLINDER" record — effectively a mislabelled nitrogen cylinder — with two further mislabelled records.)

**Medium (corrected):** PDF file p.17 (cat. p.12, INDUSTRIAL GAS CYLINDERS & GAS TROLLEY) — the caption↔image pairing was off by one for placements 4–6. Visual evidence: `fp17-04.png` is a bottle labelled **NITROGEN**, `fp17-05.png` a **CO₂** bottle, `fp17-06.png` a **propane (LPG)** bottle; the raw PDF text captions them NITROGEN CYLINDER / CO2 CYLINDER / LPG CYLINDER in this order. Corrected (see §5).

**Low / unresolved (recorded, no action without new evidence):**
1. **CUTTING NOZZLES (file p.19)** — the PDF page itself provides only six scattered code tokens (GPN, 102HC, 106HC, PNME, ANME, 164) plus "ACETYLENE", and the extracted images are near-identical stock photos of the same Victor 3-101 nozzle. Names are transcribed verbatim; the code-to-photo mapping is **unverifiable from the source** (the source itself is ambiguous). Recommendation: confirm code order with the company before launch; no substitute invented.
2. **12 low-resolution images** (list: `source-assets/low-res-images.json`, 124–380 px) — all are the best available source imagery and are used as-is with the existing design; recommend requesting original product photos from the company for print-quality needs. No substitutions made.
3. **"GOOGLES" spelling (WELDING SAFETY GOOGLES, file p.22)** — source typo preserved verbatim per the standing rule; editorial correction available if you want it (one-line change).
4. **Bare/type-line names (e.g. FLUXCORED WIRE ×3, SOLID WIRE ×4, TIG WELDING WIRE ×12)** — these cards are printed in the PDF exactly that way (AWS number is the differentiator); transcribed as printed with the type line preserved in `notes`. Not a defect.
5. **LPG image shows a propane cylinder labelled "PROPANE / UN 1978"** — this is the PDF's own photo for its "LPG CYLINDER" caption; kept as-is (source-faithful).

## 5. Corrections made (with evidence)

| Record | Before | After | Evidence |
|---|---|---|---|
| `nitrogen-cylinder` (was `co2-cylinder`) | name "CO2 CYLINDER", image = nitrogen bottle | **NITROGEN CYLINDER**, image `nitrogen-cylinder.webp` (fp17-04) | card PNG fp17-04 (bottle labelled NITROGEN); raw text p.17 caption "NITROGEN CYLINDER"; reverse-coverage check flagged NITROGEN uncovered |
| `co2-cylinder` (was `lpg-cylinder`) | name "LPG CYLINDER", image = CO₂ bottle | **CO2 CYLINDER**, image `co2-cylinder.webp` (fp17-05) | fp17-05 labelled CO₂; caption order in pdf_text.txt p.17 |
| `lpg-cylinder` (was `cylinder`) | bare name "CYLINDER", image = propane bottle | **LPG CYLINDER**, image `lpg-cylinder.webp` (fp17-06) | fp17-06 (propane = LPG); caption "LPG CYLINDER" |

Affected references updated consistently: `src/data/catalog.ts`, `source-assets/product-map.json`, renamed WebP files in `public/images/products/industrial-gas-cylinders-gas-trolley/`, and the generator override table in `scripts/generate-catalog.py` so future regenerations produce the corrected pairing. Search index is regenerated at build time; quote links derive from the IDs so they follow automatically. The old bare id `cylinder` no longer exists anywhere. The `caption-clipped` flags on these records are retained (they record that the captions were restored from raw text, which remains true). **Note:** the two surviving IDs (`co2-cylinder`, `lpg-cylinder`) now point to different records than before the correction — if any external bookmark existed it would now resolve to the corrected record, which is the intent; no internal references required changes beyond the files above.

**Generator reproducibility caveat:** `scripts/generate-catalog.py` cannot currently be re-run end-to-end because `asset-manifest.json` no longer contains the brand-name keys the script expects (the manifest was rewritten after generation in M3). The correction was therefore applied to the generated files directly (as above) *and* mirrored into the generator's OVERRIDES for when the pipeline inputs are restored. Documented as a known limitation.

## 6. Search and quote-workflow verification

Search index regenerated by the build; `E7018`, `24KD`, `K4000`, `ER70S-6`, `gloves`, and a no-match query all return the expected results (automated). All quote links use stable IDs (20/20 sampled per category); prefill of product + category verified; no duplicate anchors. Validator: **OK**. No broken images or anchors (suite + manual scroll checks).

## 7. Regression results

- `node scripts/validate-catalog.mjs` → **VALIDATION OK — 20/190/30/6**.
- `npm run build` → **25 pages** (24 + `/catalogue/`, see ⚠), clean.
- `npm run test:e2e` → **137 passed** (my 129 + 8 tests belonging to the unapproved reader feature). One intermittent overflow-test flake was investigated (two different routes on two runs; a 15× deterministic probe plus three isolated re-runs all pass — transient measurement during page load, not a layout defect; no test was weakened).

## 8. ⚠ Unapproved change discovered in the workspace (requires your decision)

During this milestone I found files I did not create, timestamped after my last Milestone-8.5 edits: a complete **"digital catalogue reader" feature** — new `/catalogue/` route (`src/pages/catalogue.astro`, `catalogue.css`, `src/scripts/catalogue-reader.ts`) rendering the catalogue as an interactive page-flip book with PDF download, a new homepage band ("The printed catalogue, page by page"), modified hero CTAs, a **changed header navigation** (Brands/Industries/About anchor links removed), a **byte-identical copy of the original company PDF published for download** at `public/pdfs/oriental-catalogue.pdf`, and 8 new tests (`tests/e2e/catalogue-reader.spec.ts`). Its tests pass and the build is clean, and the published PDF matches the source byte-for-byte — but adding a feature and publishing the raw PDF were both outside the approved milestone scope, so I have **left it in place untouched and am flagging it for your decision**: keep it (I would then recommend re-adding the Brands/Industries/About nav links and an a11y/responsive review of the reader), or remove it before Milestone 10.

## 9. Remaining manual review before launch

1. Your decision on the `/catalogue/` reader (§8).
2. Confirm cutting-nozzle code order with the company (§4.1).
3. Optional: request higher-resolution photos for the 12 flagged images; optional "GOOGLES"→"GOGGLES" wording decision.
4. Screen-reader pass and real mail-client check remain untested (documented in M7).

## 10. Commands executed

PDF verification + field-evidence + reverse-coverage scripts (outputs in `source-assets/audit-*.json`), `python scripts/generate-catalog.py` (attempted; blocked by manifest caveat — see §5), `node scripts/optimize-images.mjs` (not needed; images renamed directly), `node scripts/validate-catalog.mjs`, `npm run build`, `npm run test:e2e`, pypdfium2 page renders for visual checks. No deployment; no form-provider change; Milestone 10 not started.
