# asset-inventory.md — Available and extractable assets

Source images live inside the PDF's embedded resources. Extraction method (Step 3):
`pypdfium2` renders pages; embedded raster objects extracted with pypdf page resources,
then cropped/deduplicated and converted to WebP with `sharp`. Statuses below are based
on rendered-page inspection done in Steps 1–2; per-file resolution is confirmed at
extraction time.

## Company identity

| Asset | Source | Status / notes |
|---|---|---|
| Company logo (green/red ring) | cover, file p.1 | Reusable. Small on the cover (~170px) — rebuild as clean SVG from the two sampled brand colours if extraction yields < 400px; flagged for review either way. |
| Vision 2030 badge | cover | Extractable raster; official emblem — display once, as in catalogue. |

## Brand logos — 30 (file p.4, "BRANDS WE SERVE")

ESAB · Kiswel · Lincoln Electric · Böhler Welding · Kobelco · Ador · Abicor Binzel ·
Arcair · Callington · Chosun Welding · D&H Sécheron · Elga · Harris · Hilco ·
Hypertherm · Hyundai · Kemppi · Koike · Maks Weld · Miller · Oerlikon · Special Metals ·
Tweco · Tyrolit · Unitec · Vaultex · Victor · W.A. Alloy Co. · Yawata · Zulfi Welding
Electrodes

All 30 appear as discrete boxed logos in a 4-column grid — cleanly croppable per cell.
Status: all accounted for; per-logo resolution to be confirmed at extraction (grid is
4-wide on an A4 page, so each logo is expected ~400–500px wide — adequate for uniform
tiles). No product-to-brand mapping exists in the source; none will be implied.

## Industry images — 6 (file p.3)

Oil & Gas · Heavy Equipment & Machinery · Construction & Infrastructure · Industrial
Maintenance & Repair · Petro Chemical & Chemical · Steel & Metal Fabrication — each a
square photo (~460px rendered). Status: all accounted for; adequate for card tiles,
not for large heroes. Note: several have an AI-generated look; they are used as-is
from the source per instructions.

## Hero / cover imagery

- Cover welding photo (welder, sparks, red/green frame) — file p.1. Full-page image;
  extractable at good resolution; suitable for the home hero with overlay.

## Product photos — ~187 embedded card photos (cat. p.1–23 / file p.6–28)

- Electrodes & wires (cat. p.1–5): white-background photos per AWS class — distinct per
  item; expect good quality (3-per-row grid).
- Accessories, torches, cylinders, cutting, safety, gear (cat. p.6–23): one photo per
  card; quality varies by source.
- **Review flags to resolve at extraction:**
  1. Cutting nozzles (cat. p.14): model codes without clearly individuated card photos —
     photo-to-code association must be verified visually before publishing; items without
     a reliable photo will be listed without an image rather than given a wrong one.
  2. Any extracted image < ~500px in its longest side → flagged `low-res-image` in
     `catalog.ts` and listed here after extraction.
  3. Duplicate-looking electrode photos (mild-steel series are visually similar) —
     association follows card position, verified per page render.

## Not available in source (do not fabricate)

- Separate high-resolution product photography
- Company team/facility photos
- Certificates, brochures, client logos
- Any imagery beyond what is embedded in the 29-page PDF
