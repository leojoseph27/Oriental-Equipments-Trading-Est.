# Milestone 9 — Content Audit Log (190 products)

Audit date: 2026-10-22. Sources: `PRE-FINAL_1_ORIENTAL EQUIPMENTS TRADING EST.pdf` (29 pages, verified byte-identical source used in M1–M3 extractions), `pdf_text.txt`, `source-assets/{captions,product-map,asset-manifest,low-res-images}.json`.

Evidence method: every record's name/model/AWS no./sizes/amps/packet fields were string-matched against the extracted text of its PDF file page (script output: source-assets/audit-field-check.json — **190/190 evidenced**); token-reverse-check of every catalogue page against the records (one omission found → corrected, see nitrogen-cylinder); card images spot-checked visually against the original PDF for every position-sensitive page (file p.11, 12, 13, 14, 16, 17, 18, 19, 22, 23, 27, 28 samples). Image status "verified (extraction map)" = geometry-based caption↔image pairing from captions.json, consistent with the PDF page render; "verified (visual)" = this audit visually confirmed the depicted item.

| Product ID | Name / code | Category | Page ref (cat./file) | Text evidence | Card image | Content | Image | Action |
|---|---|---|---|---|---|---|---|---|
| mild-steel-welding-electrode-e6010 | MILD STEEL WELDING ELECTRODE / E6010 | WELDING ELECTRODES | cat. p.1-2 / file p.6 | all fields matched PDF page text | fp06-00.png | verified | verified (extraction map) | — |
| mild-steel-welding-electrode-e6013 | MILD STEEL WELDING ELECTRODE / E6013 | WELDING ELECTRODES | cat. p.1-2 / file p.6 | all fields matched PDF page text | fp06-01.png | verified | verified (extraction map) | — |
| mild-steel-welding-electrode-e7010 | MILD STEEL WELDING ELECTRODE / E7010 | WELDING ELECTRODES | cat. p.1-2 / file p.6 | all fields matched PDF page text | fp06-02.png | verified | verified (extraction map) | — |
| mild-steel-welding-electrode-e7018 | MILD STEEL WELDING ELECTRODE / E7018 | WELDING ELECTRODES | cat. p.1-2 / file p.6 | all fields matched PDF page text | fp06-03.png | verified | verified (extraction map) | — |
| mild-steel-welding-electrode-e7018-1 | MILD STEEL WELDING ELECTRODE / E7018-1 | WELDING ELECTRODES | cat. p.1-2 / file p.6 | all fields matched PDF page text | fp06-04.png | verified | verified (extraction map) | — |
| mild-steel-welding-electrode-e8018 | MILD STEEL WELDING ELECTRODE / E8018 | WELDING ELECTRODES | cat. p.1-2 / file p.6 | all fields matched PDF page text | fp06-05.png | verified | verified (extraction map) | — |
| mild-steel-welding-electrode-e9018 | MILD STEEL WELDING ELECTRODE / E9018 | WELDING ELECTRODES | cat. p.1-2 / file p.6 | all fields matched PDF page text | fp06-06.png | verified | verified (extraction map) | — |
| mild-steel-welding-electrode-e10018 | MILD STEEL WELDING ELECTRODE / E10018 | WELDING ELECTRODES | cat. p.1-2 / file p.6 | all fields matched PDF page text | fp06-07.png | verified | verified (extraction map) | — |
| mild-steel-welding-electrode-e11018 | MILD STEEL WELDING ELECTRODE / E11018 | WELDING ELECTRODES | cat. p.1-2 / file p.6 | all fields matched PDF page text | fp06-08.png | verified | verified (extraction map) | — |
| stainless-steel-welding-electrode-e308l-15-16-17 | STAINLESS STEEL WELDING ELECTRODE / E308L-15/16/17 | WELDING ELECTRODES | cat. p.1-2 / file p.7 | all fields matched PDF page text | fp07-00.png | verified | verified (extraction map) | — |
| stainless-steel-welding-electrode-e309l-15-16-17 | STAINLESS STEEL WELDING ELECTRODE / E309L-15/16/17 | WELDING ELECTRODES | cat. p.1-2 / file p.7 | all fields matched PDF page text | fp07-01.png | verified | verified (extraction map) | — |
| stainless-steel-welding-electrode-e310l-15-16-17 | STAINLESS STEEL WELDING ELECTRODE / E310L-15/16/17 | WELDING ELECTRODES | cat. p.1-2 / file p.7 | all fields matched PDF page text | fp07-02.png | verified | verified (extraction map) | — |
| stainless-steel-welding-electrode-e316l-15-16-17 | STAINLESS STEEL WELDING ELECTRODE / E316L-15/16/17 | WELDING ELECTRODES | cat. p.1-2 / file p.7 | all fields matched PDF page text | fp07-03.png | verified | verified (extraction map) | — |
| nickel-welding-electrode-eni | NICKEL WELDING ELECTRODE / ENi | WELDING ELECTRODES | cat. p.1-2 / file p.7 | all fields matched PDF page text | fp07-04.png | verified | verified (extraction map) | — |
| cast-iron-welding-electrode-enife-ci | CAST IRON WELDING ELECTRODE / ENiFe-Ci | WELDING ELECTRODES | cat. p.1-2 / file p.7 | all fields matched PDF page text | fp07-05.png | verified | verified (extraction map) | — |
| aluminium-welding-electrode-e4043 | ALUMINIUM WELDING ELECTRODE / E4043 | WELDING ELECTRODES | cat. p.1-2 / file p.7 | all fields matched PDF page text | fp07-06.png | verified | verified (extraction map) | — |
| fluxcored-wire-er70s6 | FLUXCORED WIRE / ER70S6 | MIG WELDING WIRE | cat. p.3 / file p.8 | all fields matched PDF page text | fp08-00.png | verified | verified (extraction map) | — |
| fluxcored-wire-er71t | FLUXCORED WIRE / ER71T | MIG WELDING WIRE | cat. p.3 / file p.8 | all fields matched PDF page text | fp08-01.png | verified | verified (extraction map) | — |
| fluxcored-wire-er81 | FLUXCORED WIRE / ER81 | MIG WELDING WIRE | cat. p.3 / file p.8 | all fields matched PDF page text | fp08-02.png | verified | verified (extraction map) | — |
| solid-wire-er308 | SOLID WIRE / ER308 | MIG WELDING WIRE | cat. p.3 / file p.8 | all fields matched PDF page text | fp08-03.png | verified | verified (extraction map) | — |
| solid-wire-er309 | SOLID WIRE / ER309 | MIG WELDING WIRE | cat. p.3 / file p.8 | all fields matched PDF page text | fp08-04.png | verified | verified (extraction map) | — |
| solid-wire-er316 | SOLID WIRE / ER316 | MIG WELDING WIRE | cat. p.3 / file p.8 | all fields matched PDF page text | fp08-05.png | verified | verified (extraction map) | — |
| tig-welding-wire-er347 | TIG WELDING WIRE / ER347 | MIG WELDING WIRE | cat. p.3 / file p.8 | all fields matched PDF page text | fp08-06.png | verified | verified (extraction map) | — |
| tig-welding-wire-er4043 | TIG WELDING WIRE / ER4043 | MIG WELDING WIRE | cat. p.3 / file p.8 | all fields matched PDF page text | fp08-07.png | verified | verified (extraction map) | — |
| solid-wire-er5356 | SOLID WIRE / ER5356 | MIG WELDING WIRE | cat. p.3 / file p.8 | all fields matched PDF page text | fp08-08.png | verified | verified (extraction map) | — |
| tig-welding-wire-er70s-2 | TIG WELDING WIRE / ER70S-2 | TIG WELDING WIRES | cat. p.4-5 / file p.9 | all fields matched PDF page text | fp09-00.png | verified | verified (extraction map) | — |
| tig-welding-wire-er70s-3 | TIG WELDING WIRE / ER70S-3 | TIG WELDING WIRES | cat. p.4-5 / file p.9 | all fields matched PDF page text | fp09-01.png | verified | verified (extraction map) | — |
| tig-welding-wire-er70s-6 | TIG WELDING WIRE / ER70S-6 | TIG WELDING WIRES | cat. p.4-5 / file p.9 | all fields matched PDF page text | fp09-02.png | verified | verified (extraction map) | — |
| tig-welding-wire-er80s-ni | TIG WELDING WIRE / ER80S-Ni | TIG WELDING WIRES | cat. p.4-5 / file p.9 | all fields matched PDF page text | fp09-03.png | verified | verified (extraction map) | — |
| tig-welding-wire-er80s-b2 | TIG WELDING WIRE / ER80S-B2 | TIG WELDING WIRES | cat. p.4-5 / file p.9 | all fields matched PDF page text | fp09-04.png | verified | verified (extraction map) | — |
| tig-welding-wire-er80s-d2 | TIG WELDING WIRE / ER80S-D2 | TIG WELDING WIRES | cat. p.4-5 / file p.9 | all fields matched PDF page text | fp09-05.png | verified | verified (extraction map) | — |
| brass-welding-electrode | BRASS WELDING ELECTRODE | TIG WELDING WIRES | cat. p.4-5 / file p.9 | all fields matched PDF page text | fp09-06.png | verified | verified (extraction map) | Flags preserved: caption-type-heading-preserved |
| copper-silver-welding-electrode | COPPER SILVER WELDING ELECTRODE | TIG WELDING WIRES | cat. p.4-5 / file p.9 | all fields matched PDF page text | fp09-07.png | verified | verified (extraction map) | Flags preserved: caption-type-heading-preserved |
| copper-silver-flux-welding-electrode | COPPER SILVER FLUX WELDING ELECTRODE | TIG WELDING WIRES | cat. p.4-5 / file p.9 | all fields matched PDF page text | fp09-08.png | verified | verified (extraction map) | Flags preserved: caption-type-heading-preserved |
| tig-welding-wire-er308l | TIG WELDING WIRE / ER308L | TIG WELDING WIRES | cat. p.4-5 / file p.10 | all fields matched PDF page text | fp10-01.png | verified | verified (extraction map) | — |
| tig-welding-wire-er309l | TIG WELDING WIRE / ER309L | TIG WELDING WIRES | cat. p.4-5 / file p.10 | all fields matched PDF page text | fp10-02.png | verified | verified (extraction map) | — |
| tig-welding-wire-er310l | TIG WELDING WIRE / ER310L | TIG WELDING WIRES | cat. p.4-5 / file p.10 | all fields matched PDF page text | fp10-03.png | verified | verified (extraction map) | — |
| tig-welding-wire-er316l | TIG WELDING WIRE / ER316L | TIG WELDING WIRES | cat. p.4-5 / file p.10 | all fields matched PDF page text | fp10-04.png | verified | verified (extraction map) | — |
| tig-welding-wire-er347l | TIG WELDING WIRE / ER347L | TIG WELDING WIRES | cat. p.4-5 / file p.10 | all fields matched PDF page text | fp10-05.png | verified | verified (extraction map) | — |
| tig-welding-wire-ernicr-3 | TIG WELDING WIRE / ERNiCr-3 | TIG WELDING WIRES | cat. p.4-5 / file p.10 | all fields matched PDF page text | fp10-06.png | verified | verified (extraction map) | — |
| tig-welding-wire-ernicrmo-3 | TIG WELDING WIRE / ERNiCrMo-3 | TIG WELDING WIRES | cat. p.4-5 / file p.10 | all fields matched PDF page text | fp10-07.png | verified | verified (extraction map) | — |
| tig-welding-wire-er4043-2 | TIG WELDING WIRE / ER4043 | TIG WELDING WIRES | cat. p.4-5 / file p.10 | all fields matched PDF page text | fp10-08.png | verified | verified (extraction map) | — |
| tig-welding-wire-er5356 | TIG WELDING WIRE / ER5356 | TIG WELDING WIRES | cat. p.4-5 / file p.10 | all fields matched PDF page text | fp10-09.png | verified | verified (extraction map) | — |
| welding-electrode-holder-american-type | WELDING ELECTRODE HOLDER AMERICAN TYPE | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.11 | all fields matched PDF page text | fp11-00.png | verified | verified (extraction map) | — |
| welding-electrode-holder-japan-type | WELDING ELECTRODE HOLDER JAPAN TYPE | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.11 | all fields matched PDF page text | fp11-01.png | verified | verified (extraction map) | — |
| welding-electrode-holder-india-type | WELDING ELECTRODE HOLDER INDIA TYPE | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.11 | all fields matched PDF page text | fp11-02.png | verified | verified (extraction map) | — |
| welding-electrode-holder-china-type | WELDING ELECTRODE HOLDER CHINA TYPE | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.11 | all fields matched PDF page text | fp11-03.png | verified | verified (extraction map) | — |
| welding-earth-clamp | WELDING EARTH CLAMP | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.11 | all fields matched PDF page text | fp11-04.png | verified | verified (extraction map) | — |
| cable-connector | CABLE CONNECTOR | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.11 | all fields matched PDF page text | fp11-05.png | verified | verified (extraction map) | — |
| welding-earth-clamp-crocodile-type-brass | WELDING EARTH CLAMP CROCODILE TYPE BRASS | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.11 | all fields matched PDF page text | fp11-06.png | verified | verified (extraction map) | — |
| welding-earth-clamp-screw-type-brass | WELDING EARTH CLAMP SCREW TYPE BRASS | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.11 | all fields matched PDF page text | fp11-07.png | verified | verified (extraction map) | — |
| panel-socket | PANEL SOCKET | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.11 | all fields matched PDF page text | fp11-08.png | verified | low-resolution | Low-res source image is the best available; recommend re-photographing for print quality (do not substitute) |
| portable-welding-electrode-dryer | PORTABLE WELDING ELECTRODE DRYER | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.12 | all fields matched PDF page text | fp12-01.png | verified | verified (extraction map) | Flags preserved: caption-clipped |
| welding-electrode-bench-oven | WELDING ELECTRODE BENCH OVEN | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.12 | all fields matched PDF page text | fp12-02.png | verified | verified (extraction map) | — |
| chipping-hammer | CHIPPING HAMMER | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.12 | all fields matched PDF page text | fp12-03.png | verified | verified (extraction map) | — |
| welding-chalk | WELDING CHALK | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.12 | all fields matched PDF page text | fp12-04.png | verified | verified (extraction map) | — |
| welding-copper-lugs | WELDING COPPER LUGS | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.12 | all fields matched PDF page text | fp12-05.png | verified | verified (extraction map) | — |
| welding-cable-made-in-china | WELDING CABLE MADE IN CHINA | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.12 | all fields matched PDF page text | fp12-06.png | verified | verified (extraction map) | — |
| welding-cable-made-in-india | WELDING CABLE MADE IN INDIA | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.12 | all fields matched PDF page text | fp12-07.png | verified | verified (extraction map) | — |
| welding-cable-made-in-taiwan | WELDING CABLE MADE IN TAIWAN | ARC WELDING ACCESSORIES | cat. p.6-7 / file p.12 | all fields matched PDF page text | fp12-08.png | verified | verified (extraction map) | — |
| mig-welding-torch-24kd | MIG WELDING TORCH / 24KD | MIG WELDING TORCHES & ACCESSORIES | cat. p.8 / file p.13 | all fields matched PDF page text | fp13-01.png | verified | verified (extraction map) | — |
| mig-welding-torch-25kd | MIG WELDING TORCH / 25KD | MIG WELDING TORCHES & ACCESSORIES | cat. p.8 / file p.13 | all fields matched PDF page text | fp13-02.png | verified | verified (extraction map) | — |
| mig-welding-torch-36kd | MIG WELDING TORCH / 36KD | MIG WELDING TORCHES & ACCESSORIES | cat. p.8 / file p.13 | all fields matched PDF page text | fp13-03.png | verified | verified (extraction map) | — |
| contact-tip | CONTACT TIP | MIG WELDING TORCHES & ACCESSORIES | cat. p.8 / file p.13 | all fields matched PDF page text | fp13-04.png | verified | verified (extraction map) | — |
| gas-nozzle | GAS NOZZLE | MIG WELDING TORCHES & ACCESSORIES | cat. p.8 / file p.13 | all fields matched PDF page text | fp13-05.png | verified | verified (extraction map) | — |
| gas-diffuser | GAS DIFFUSER | MIG WELDING TORCHES & ACCESSORIES | cat. p.8 / file p.13 | all fields matched PDF page text | fp13-06.png | verified | verified (extraction map) | — |
| contact-tip-holder | CONTACT TIP HOLDER | MIG WELDING TORCHES & ACCESSORIES | cat. p.8 / file p.13 | all fields matched PDF page text | fp13-07.png | verified | verified (extraction map) | — |
| insulator | INSULATOR | MIG WELDING TORCHES & ACCESSORIES | cat. p.8 / file p.13 | all fields matched PDF page text | fp13-08.png | verified | verified (extraction map) | — |
| swan-neck | SWAN NECK | MIG WELDING TORCHES & ACCESSORIES | cat. p.8 / file p.13 | all fields matched PDF page text | fp13-09.png | verified | verified (extraction map) | — |
| tig-welding-torch-9fv | TIG WELDING TORCH / 9FV | TIG WELDING TORCHES & CONSUMABLES | cat. p.9 / file p.14 | all fields matched PDF page text | fp14-00.png | verified | verified (visual) | — |
| tig-welding-torch-17fv | TIG WELDING TORCH / 17FV | TIG WELDING TORCHES & CONSUMABLES | cat. p.9 / file p.14 | all fields matched PDF page text | fp14-01.png | verified | verified (visual) | — |
| tig-welding-torch-26fv | TIG WELDING TORCH / 26FV | TIG WELDING TORCHES & CONSUMABLES | cat. p.9 / file p.14 | all fields matched PDF page text | fp14-02.png | verified | verified (extraction map) | — |
| tungsten-electrode-red-color | TUNGSTEN ELECTRODE RED COLOR | TIG WELDING TORCHES & CONSUMABLES | cat. p.9 / file p.14 | all fields matched PDF page text | fp14-03.png | verified | verified (visual) | — |
| tungsten-electrode-green-color | TUNGSTEN ELECTRODE GREEN COLOR | TIG WELDING TORCHES & CONSUMABLES | cat. p.9 / file p.14 | all fields matched PDF page text | fp14-04.png | verified | verified (visual) | — |
| tungsten-electrode-grey-color | TUNGSTEN ELECTRODE GREY COLOR | TIG WELDING TORCHES & CONSUMABLES | cat. p.9 / file p.14 | all fields matched PDF page text | fp14-05.png | verified | verified (extraction map) | — |
| ceramic-cup | CERAMIC CUP | TIG WELDING TORCHES & CONSUMABLES | cat. p.9 / file p.14 | all fields matched PDF page text | fp14-06.png | verified | verified (extraction map) | — |
| collet-body-pin | COLLET BODY & PIN | TIG WELDING TORCHES & CONSUMABLES | cat. p.9 / file p.14 | all fields matched PDF page text | fp14-07.png | verified | verified (extraction map) | — |
| back-cap | BACK CAP | TIG WELDING TORCHES & CONSUMABLES | cat. p.9 / file p.14 | all fields matched PDF page text | fp14-08.png | verified | verified (extraction map) | — |
| body-valve | BODY VALVE | TIG WELDING TORCH ACCESSORIES | cat. p.10 / file p.15 | all fields matched PDF page text | fp15-00.png | verified | verified (extraction map) | — |
| body | BODY | TIG WELDING TORCH ACCESSORIES | cat. p.10 / file p.15 | all fields matched PDF page text | fp15-01.png | verified | verified (extraction map) | — |
| argon-hose-black-clear | ARGON HOSE (BLACK / CLEAR) | TIG WELDING TORCH ACCESSORIES | cat. p.10 / file p.15 | all fields matched PDF page text | fp15-02.png | verified | verified (extraction map) | — |
| insulator-ring | INSULATOR RING | TIG WELDING TORCH ACCESSORIES | cat. p.10 / file p.15 | all fields matched PDF page text | fp15-03.png | verified | verified (extraction map) | — |
| gas-lens | GAS LENS | TIG WELDING TORCH ACCESSORIES | cat. p.10 / file p.15 | all fields matched PDF page text | fp15-04.png | verified | verified (extraction map) | — |
| argon-nut | ARGON NUT | TIG WELDING TORCH ACCESSORIES | cat. p.10 / file p.15 | all fields matched PDF page text | fp15-05.png | verified | verified (extraction map) | — |
| argon-nipple | ARGON NIPPLE | TIG WELDING TORCH ACCESSORIES | cat. p.10 / file p.15 | all fields matched PDF page text | fp15-06.png | verified | verified (extraction map) | — |
| 2-ear-clip | 2 EAR CLIP | TIG WELDING TORCH ACCESSORIES | cat. p.10 / file p.15 | all fields matched PDF page text | fp15-07.png | verified | verified (extraction map) | — |
| argon-hose-adaptor | ARGON HOSE ADAPTOR | TIG WELDING TORCH ACCESSORIES | cat. p.10 / file p.15 | all fields matched PDF page text | fp15-08.png | verified | verified (extraction map) | — |
| k4000 | K4000 / K4000 | GOUGING ROD & TORCHES | cat. p.11 / file p.16 | all fields matched PDF page text | fp16-01.png | verified | verified (visual) | — |
| k3000 | K3000 / K3000 | GOUGING ROD & TORCHES | cat. p.11 / file p.16 | all fields matched PDF page text | fp16-02.png | verified | verified (visual) | — |
| gouging-rod | GOUGING ROD | GOUGING ROD & TORCHES | cat. p.11 / file p.16 | all fields matched PDF page text | fp16-03.png | verified | verified (extraction map) | — |
| gouging-rod-2 | GOUGING ROD | GOUGING ROD & TORCHES | cat. p.11 / file p.16 | all fields matched PDF page text | fp16-04.png | verified | verified (extraction map) | — |
| gouging-rod-3 | GOUGING ROD | GOUGING ROD & TORCHES | cat. p.11 / file p.16 | all fields matched PDF page text | fp16-05.png | verified | verified (extraction map) | — |
| gouging-rod-4 | GOUGING ROD | GOUGING ROD & TORCHES | cat. p.11 / file p.16 | all fields matched PDF page text | fp16-06.png | verified | verified (extraction map) | — |
| gouging-rod-5 | GOUGING ROD | GOUGING ROD & TORCHES | cat. p.11 / file p.16 | all fields matched PDF page text | fp16-07.png | verified | verified (extraction map) | — |
| oxygen-cylinder | OXYGEN CYLINDER | INDUSTRIAL GAS CYLINDERS & GAS TROLLEY | cat. p.12 / file p.17 | all fields matched PDF page text | fp17-01.png | verified | verified (extraction map) | — |
| acetylene-cylinder | ACETYLENE CYLINDER | INDUSTRIAL GAS CYLINDERS & GAS TROLLEY | cat. p.12 / file p.17 | all fields matched PDF page text | fp17-02.png | verified | verified (extraction map) | — |
| argon-cylinder | ARGON CYLINDER | INDUSTRIAL GAS CYLINDERS & GAS TROLLEY | cat. p.12 / file p.17 | all fields matched PDF page text | fp17-03.png | verified | verified (extraction map) | — |
| nitrogen-cylinder | NITROGEN CYLINDER | INDUSTRIAL GAS CYLINDERS & GAS TROLLEY | cat. p.12 / file p.17 | all fields matched PDF page text | fp17-04.png | CORRECTED (M9) | verified (visual) | M9: was "CO2 CYLINDER" showing nitrogen bottle; renamed + image realigned |
| co2-cylinder | CO2 CYLINDER | INDUSTRIAL GAS CYLINDERS & GAS TROLLEY | cat. p.12 / file p.17 | all fields matched PDF page text | fp17-05.png | CORRECTED (M9) | verified (visual) | M9: was "LPG CYLINDER" showing CO2 bottle; renamed + image realigned |
| lpg-cylinder | LPG CYLINDER | INDUSTRIAL GAS CYLINDERS & GAS TROLLEY | cat. p.12 / file p.17 | all fields matched PDF page text | fp17-06.png | CORRECTED (M9) | verified (visual) | M9: was bare "CYLINDER" showing propane bottle; named LPG CYLINDER per PDF caption; image realigned |
| cylinder-trolley-single | CYLINDER TROLLEY SINGLE | INDUSTRIAL GAS CYLINDERS & GAS TROLLEY | cat. p.12 / file p.17 | all fields matched PDF page text | fp17-07.png | verified | verified (extraction map) | — |
| cylinder-trolley-double | CYLINDER TROLLEY DOUBLE | INDUSTRIAL GAS CYLINDERS & GAS TROLLEY | cat. p.12 / file p.17 | all fields matched PDF page text | fp17-08.png | verified | verified (extraction map) | — |
| gas-cylinder-storage-rack | GAS CYLINDER STORAGE RACK | INDUSTRIAL GAS CYLINDERS & GAS TROLLEY | cat. p.12 / file p.17 | all fields matched PDF page text | fp17-09.png | verified | verified (extraction map) | — |
| cutting-attachment-ca2460 | CUTTING ATTACHMENT / CA2460 | GAS CUTTING, HEATING EQUIPMENTS & GAS HOSES | cat. p.13 / file p.18 | all fields matched PDF page text | fp18-00.png | verified | verified (extraction map) | — |
| cutting-torch-315fc | CUTTING TORCH / 315FC | GAS CUTTING, HEATING EQUIPMENTS & GAS HOSES | cat. p.13 / file p.18 | all fields matched PDF page text | fp18-01.png | verified | verified (visual) | — |
| heating-torch | HEATING TORCH | GAS CUTTING, HEATING EQUIPMENTS & GAS HOSES | cat. p.13 / file p.18 | all fields matched PDF page text | fp18-02.png | verified | verified (extraction map) | — |
| welding-nozzle | WELDING NOZZLE | GAS CUTTING, HEATING EQUIPMENTS & GAS HOSES | cat. p.13 / file p.18 | all fields matched PDF page text | fp18-03.png | verified | verified (extraction map) | — |
| heating-nozzle | HEATING NOZZLE | GAS CUTTING, HEATING EQUIPMENTS & GAS HOSES | cat. p.13 / file p.18 | all fields matched PDF page text | fp18-04.png | verified | verified (extraction map) | — |
| check-valve | CHECK VALVE | GAS CUTTING, HEATING EQUIPMENTS & GAS HOSES | cat. p.13 / file p.18 | all fields matched PDF page text | fp18-05.png | verified | verified (extraction map) | — |
| flashback-arrestor-regulator-mount | FLASHBACK ARRESTOR REGULATOR MOUNT | GAS CUTTING, HEATING EQUIPMENTS & GAS HOSES | cat. p.13 / file p.18 | all fields matched PDF page text | fp18-06.png | verified | verified (extraction map) | — |
| flashback-arrestor-torch-mount | FLASHBACK ARRESTOR TORCH MOUNT | GAS CUTTING, HEATING EQUIPMENTS & GAS HOSES | cat. p.13 / file p.18 | all fields matched PDF page text | fp18-07.png | verified | verified (extraction map) | — |
| twin-welding-hose | TWIN WELDING HOSE | GAS CUTTING, HEATING EQUIPMENTS & GAS HOSES | cat. p.13 / file p.18 | all fields matched PDF page text | fp18-08.png | verified | verified (extraction map) | — |
| acetylene | ACETYLENE | CUTTING NOZZLES | cat. p.14 / file p.19 | all fields matched PDF page text | fp19-00.png | verified | verified (extraction map) | Flags preserved: code-only-name |
| gpn | GPN | CUTTING NOZZLES | cat. p.14 / file p.19 | all fields matched PDF page text | fp19-01.png | verified | verified (extraction map) | Flags preserved: code-only-name |
| 102hc | 102HC | CUTTING NOZZLES | cat. p.14 / file p.19 | all fields matched PDF page text | fp19-02.png | verified | verified (extraction map) | Flags preserved: code-only-name |
| 106hc | 106HC | CUTTING NOZZLES | cat. p.14 / file p.19 | all fields matched PDF page text | fp19-03.png | verified | verified (extraction map) | Flags preserved: code-only-name |
| pnme | PNME | CUTTING NOZZLES | cat. p.14 / file p.19 | all fields matched PDF page text | fp19-04.png | verified | verified (extraction map) | Flags preserved: code-only-name |
| anme | ANME | CUTTING NOZZLES | cat. p.14 / file p.19 | all fields matched PDF page text | fp19-05.png | verified | verified (extraction map) | Flags preserved: code-only-name |
| 164 | 164 | CUTTING NOZZLES | cat. p.14 / file p.19 | all fields matched PDF page text | fp19-06.png | verified | verified (extraction map) | Flags preserved: code-only-name |
| oxygen-nut-nipple | OXYGEN NUT & NIPPLE | WELDING REGULATOR FITTINGS & GAS HOSE FITTINGS | cat. p.15 / file p.20 | all fields matched PDF page text | fp20-00.png | verified | verified (extraction map) | — |
| acetylene-nut-nipple | ACETYLENE NUT & NIPPLE | WELDING REGULATOR FITTINGS & GAS HOSE FITTINGS | cat. p.15 / file p.20 | all fields matched PDF page text | fp20-01.png | verified | low-resolution | Low-res source image is the best available; recommend re-photographing for print quality (do not substitute) |
| ferrules | FERRULES | WELDING REGULATOR FITTINGS & GAS HOSE FITTINGS | cat. p.15 / file p.20 | all fields matched PDF page text | fp20-02.png | verified | verified (extraction map) | — |
| barbed-hose-splicer | BARBED HOSE SPLICER | WELDING REGULATOR FITTINGS & GAS HOSE FITTINGS | cat. p.15 / file p.20 | all fields matched PDF page text | fp20-03.png | verified | verified (extraction map) | — |
| oxygen-acetylene-hose-coupler | OXYGEN / ACETYLENE HOSE COUPLER | WELDING REGULATOR FITTINGS & GAS HOSE FITTINGS | cat. p.15 / file p.20 | all fields matched PDF page text | fp20-04.png | verified | verified (extraction map) | — |
| argon-hose-adaptor-2 | ARGON HOSE ADAPTOR | WELDING REGULATOR FITTINGS & GAS HOSE FITTINGS | cat. p.15 / file p.20 | all fields matched PDF page text | fp20-05.png | verified | verified (extraction map) | — |
| argon-hose-coupler | ARGON HOSE COUPLER | WELDING REGULATOR FITTINGS & GAS HOSE FITTINGS | cat. p.15 / file p.20 | all fields matched PDF page text | fp20-06.png | verified | verified (extraction map) | — |
| two-way-barbed-hose-splicer | TWO WAY BARBED HOSE SPLICER | WELDING REGULATOR FITTINGS & GAS HOSE FITTINGS | cat. p.15 / file p.20 | all fields matched PDF page text | fp20-07.png | verified | low-resolution | Low-res source image is the best available; recommend re-photographing for print quality (do not substitute) |
| spark-lighter-single-flint | SPARK LIGHTER SINGLE FLINT | WELDING & CUTTING GAS ACCESSORIES | cat. p.16 / file p.21 | all fields matched PDF page text | fp21-00.png | verified | verified (extraction map) | — |
| spark-lighter-triple-flint | SPARK LIGHTER TRIPLE FLINT | WELDING & CUTTING GAS ACCESSORIES | cat. p.16 / file p.21 | all fields matched PDF page text | fp21-01.png | verified | low-resolution | Low-res source image is the best available; recommend re-photographing for print quality (do not substitute) |
| tip-cleaner | TIP CLEANER | WELDING & CUTTING GAS ACCESSORIES | cat. p.16 / file p.21 | all fields matched PDF page text | fp21-02.png | verified | verified (extraction map) | Flags preserved: caption-clipped |
| replacement-flint-5pcs-packet | REPLACEMENT FLINT 5PCS PACKET | WELDING & CUTTING GAS ACCESSORIES | cat. p.16 / file p.21 | all fields matched PDF page text | fp21-03.png | verified | low-resolution | Low-res source image is the best available; recommend re-photographing for print quality (do not substitute) |
| 9-mouth-oxygen-acetylene-wrench | 9 MOUTH OXYGEN / ACETYLENE WRENCH | WELDING & CUTTING GAS ACCESSORIES | cat. p.16 / file p.21 | all fields matched PDF page text | fp21-04.png | verified | low-resolution | Low-res source image is the best available; recommend re-photographing for print quality (do not substitute) |
| triple-flint-stone-for-triangle-welding-spark-lighter | TRIPLE FLINT STONE FOR TRIANGLE WELDING SPARK LIGHTER | WELDING & CUTTING GAS ACCESSORIES | cat. p.16 / file p.21 | all fields matched PDF page text | fp21-05.png | verified | verified (extraction map) | — |
| spark-lighter-gun | SPARK LIGHTER GUN | WELDING & CUTTING GAS ACCESSORIES | cat. p.16 / file p.21 | all fields matched PDF page text | fp21-06.png | verified | verified (extraction map) | — |
| gas-cylinder-key | GAS CYLINDER KEY | WELDING & CUTTING GAS ACCESSORIES | cat. p.16 / file p.21 | all fields matched PDF page text | fp21-07.png | verified | low-resolution | Low-res source image is the best available; recommend re-photographing for print quality (do not substitute) |
| cylinder-cap | CYLINDER CAP | WELDING & CUTTING GAS ACCESSORIES | cat. p.16 / file p.21 | all fields matched PDF page text | fp21-08.png | verified | verified (extraction map) | — |
| welding-leather-hood | WELDING LEATHER HOOD | WELDING HELMET & ACCESSORIES | cat. p.17 / file p.22 | all fields matched PDF page text | fp22-01.png | verified | verified (visual) | — |
| auto-darkening-welding-helmet | AUTO DARKENING WELDING HELMET | WELDING HELMET & ACCESSORIES | cat. p.17 / file p.22 | all fields matched PDF page text | fp22-02.png | verified | verified (visual) | — |
| welding-helmet | WELDING HELMET | WELDING HELMET & ACCESSORIES | cat. p.17 / file p.22 | all fields matched PDF page text | fp22-03.png | verified | verified (extraction map) | — |
| welding-helmet-with-safety-helmet | WELDING HELMET WITH SAFETY HELMET | WELDING HELMET & ACCESSORIES | cat. p.17 / file p.22 | all fields matched PDF page text | fp22-04.png | verified | verified (extraction map) | — |
| welding-safety-googles | WELDING SAFETY GOOGLES | WELDING HELMET & ACCESSORIES | cat. p.17 / file p.22 | all fields matched PDF page text | fp22-05.png | verified | verified (extraction map) | — |
| welding-helmet-glass-clear | WELDING HELMET GLASS CLEAR | WELDING HELMET & ACCESSORIES | cat. p.17 / file p.22 | all fields matched PDF page text | fp22-06.png | verified | verified (extraction map) | — |
| welding-helmet-glass-dark | WELDING HELMET GLASS DARK | WELDING HELMET & ACCESSORIES | cat. p.17 / file p.22 | all fields matched PDF page text | fp22-07.png | verified | verified (extraction map) | — |
| welding-helmet-polycarbonate-glass | WELDING HELMET POLYCARBONATE GLASS | WELDING HELMET & ACCESSORIES | cat. p.17 / file p.22 | all fields matched PDF page text | fp22-08.png | verified | verified (extraction map) | — |
| hand-shield | HAND SHIELD | WELDING HELMET & ACCESSORIES | cat. p.17 / file p.22 | all fields matched PDF page text | fp22-09.png | verified | verified (extraction map) | — |
| 250a-edon | 250A EDON | WELDING MACHINES | cat. p.18 / file p.23 | all fields matched PDF page text | fp23-00.png | verified | verified (visual) | — |
| 300a-edon | 300A EDON | WELDING MACHINES | cat. p.18 / file p.23 | all fields matched PDF page text | fp23-01.png | verified | verified (extraction map) | — |
| 400a-edon | 400A EDON | WELDING MACHINES | cat. p.18 / file p.23 | all fields matched PDF page text | fp23-02.png | verified | verified (extraction map) | — |
| es201ip-pro-esab | ES201iP PRO ESAB | WELDING MACHINES | cat. p.18 / file p.23 | all fields matched PDF page text | fp23-03.png | verified | verified (visual) | — |
| es410-esab | ES410 ESAB | WELDING MACHINES | cat. p.18 / file p.23 | all fields matched PDF page text | fp23-04.png | verified | verified (extraction map) | — |
| handyarc-esab | HANDYARC ESAB | WELDING MACHINES | cat. p.18 / file p.23 | all fields matched PDF page text | fp23-05.png | verified | verified (extraction map) | — |
| 200-acdc-edon | 200 ACDC EDON | WELDING MACHINES | cat. p.18 / file p.23 | all fields matched PDF page text | fp23-06.png | verified | verified (extraction map) | Flags preserved: caption-clipped |
| cutting-disc | CUTTING DISC | ABRASIVES | cat. p.19 / file p.24 | all fields matched PDF page text | fp24-01.png | verified | verified (extraction map) | — |
| grinding-disc | GRINDING DISC | ABRASIVES | cat. p.19 / file p.24 | all fields matched PDF page text | fp24-02.png | verified | verified (extraction map) | — |
| flap-disc | FLAP DISC | ABRASIVES | cat. p.19 / file p.24 | all fields matched PDF page text | fp24-03.png | verified | verified (extraction map) | — |
| sandpaper-disc | SANDPAPER DISC | ABRASIVES | cat. p.19 / file p.24 | all fields matched PDF page text | fp24-04.png | verified | verified (extraction map) | — |
| sand-cloth-roll | SAND CLOTH ROLL | ABRASIVES | cat. p.19 / file p.24 | all fields matched PDF page text | fp24-05.png | verified | verified (extraction map) | — |
| diamond-cutting-disc | DIAMOND CUTTING DISC | ABRASIVES | cat. p.19 / file p.24 | all fields matched PDF page text | fp24-06.png | verified | low-resolution | Low-res source image is the best available; recommend re-photographing for print quality (do not substitute) |
| mounting-stone | MOUNTING STONE | ABRASIVES | cat. p.19 / file p.24 | all fields matched PDF page text | fp24-07.png | verified | verified (extraction map) | — |
| sanding-belt | SANDING BELT | ABRASIVES | cat. p.19 / file p.24 | all fields matched PDF page text | fp24-08.png | verified | verified (extraction map) | — |
| zinc-spray | ZINC SPRAY | INDUSTRIAL CHEMICALS | cat. p.20 / file p.25 | all fields matched PDF page text | fp25-01.png | verified | low-resolution | Low-res source image is the best available; recommend re-photographing for print quality (do not substitute) |
| pickling-gel | PICKLING GEL | INDUSTRIAL CHEMICALS | cat. p.20 / file p.25 | all fields matched PDF page text | fp25-02.png | verified | low-resolution | Low-res source image is the best available; recommend re-photographing for print quality (do not substitute) |
| passivator | PASSIVATOR | INDUSTRIAL CHEMICALS | cat. p.20 / file p.25 | all fields matched PDF page text | fp25-03.png | verified | verified (extraction map) | — |
| brittle-wash | BRITTLE WASH | INDUSTRIAL CHEMICALS | cat. p.20 / file p.25 | all fields matched PDF page text | fp25-04.png | verified | verified (extraction map) | — |
| antispatter-spray | ANTISPATTER SPRAY | INDUSTRIAL CHEMICALS | cat. p.20 / file p.25 | all fields matched PDF page text | fp25-05.png | verified | verified (extraction map) | — |
| antispatter-gel | ANTISPATTER GEL | INDUSTRIAL CHEMICALS | cat. p.20 / file p.25 | all fields matched PDF page text | fp25-06.png | verified | verified (extraction map) | — |
| hypertherm-coolant | HYPERTHERM COOLANT | INDUSTRIAL CHEMICALS | cat. p.20 / file p.25 | all fields matched PDF page text | fp25-07.png | verified | verified (extraction map) | — |
| welding-scanner | WELDING SCANNER | INDUSTRIAL CHEMICALS | cat. p.20 / file p.25 | all fields matched PDF page text | fp25-08.png | verified | verified (extraction map) | — |
| face-shield-visor-clear | FACE SHIELD VISOR CLEAR | SAFETY | cat. p.21 / file p.26 | all fields matched PDF page text | fp26-00.png | verified | low-resolution | Low-res source image is the best available; recommend re-photographing for print quality (do not substitute) |
| face-shield-visor-bracket | FACE SHIELD VISOR BRACKET | SAFETY | cat. p.21 / file p.26 | all fields matched PDF page text | fp26-01.png | verified | verified (extraction map) | — |
| face-shield-visor-head-gear | FACE SHIELD VISOR HEAD GEAR | SAFETY | cat. p.21 / file p.26 | all fields matched PDF page text | fp26-02.png | verified | verified (extraction map) | — |
| safety-goggles-dark-clear | SAFETY GOGGLES DARK & CLEAR | SAFETY | cat. p.21 / file p.26 | all fields matched PDF page text | fp26-03.png | verified | verified (extraction map) | — |
| safety-glass-with-anti-fog-lens | SAFETY GLASS WITH ANTI FOG LENS | SAFETY | cat. p.21 / file p.26 | all fields matched PDF page text | fp26-04.png | verified | verified (extraction map) | — |
| welding-goggles | WELDING GOGGLES | SAFETY | cat. p.21 / file p.26 | all fields matched PDF page text | fp26-05.png | verified | verified (extraction map) | — |
| face-shield-visor-black | FACE SHIELD VISOR BLACK | SAFETY | cat. p.21 / file p.26 | all fields matched PDF page text | fp26-06.png | verified | low-resolution | Low-res source image is the best available; recommend re-photographing for print quality (do not substitute) |
| ear-plug | EAR PLUG | SAFETY | cat. p.21 / file p.26 | all fields matched PDF page text | fp26-07.png | verified | verified (extraction map) | — |
| flip-goggles | FLIP GOGGLES | SAFETY | cat. p.21 / file p.26 | all fields matched PDF page text | fp26-08.png | verified | verified (extraction map) | — |
| cotton-gloves | COTTON GLOVES | HAND PROTECTIONS | cat. p.22 / file p.27 | all fields matched PDF page text | fp27-00.png | verified | verified (extraction map) | — |
| crinkled-gloves | CRINKLED GLOVES | HAND PROTECTIONS | cat. p.22 / file p.27 | all fields matched PDF page text | fp27-01.png | verified | verified (extraction map) | — |
| rubber-gloves | RUBBER GLOVES | HAND PROTECTIONS | cat. p.22 / file p.27 | all fields matched PDF page text | fp27-02.png | verified | verified (extraction map) | — |
| welding-gloves | WELDING GLOVES | HAND PROTECTIONS | cat. p.22 / file p.27 | all fields matched PDF page text | fp27-03.png | verified | verified (extraction map) | — |
| blue-dotted-gloves | BLUE DOTTED GLOVES | HAND PROTECTIONS | cat. p.22 / file p.27 | all fields matched PDF page text | fp27-04.png | verified | verified (extraction map) | — |
| white-dotted-gloves | WHITE DOTTED GLOVES | HAND PROTECTIONS | cat. p.22 / file p.27 | all fields matched PDF page text | fp27-05.png | verified | verified (extraction map) | — |
| tig-gloves-short | TIG GLOVES SHORT | HAND PROTECTIONS | cat. p.22 / file p.27 | all fields matched PDF page text | fp27-06.png | verified | verified (extraction map) | Flags preserved: caption-clipped |
| tig-gloves-long | TIG GLOVES LONG | HAND PROTECTIONS | cat. p.22 / file p.27 | all fields matched PDF page text | fp27-07.png | verified | verified (extraction map) | Flags preserved: caption-clipped |
| welding-jacket-grey | WELDING JACKET GREY | WELDING PROTECTIVE GEAR | cat. p.23 / file p.28 | all fields matched PDF page text | fp28-00.png | verified | verified (extraction map) | — |
| welding-jacket-yellow | WELDING JACKET YELLOW | WELDING PROTECTIVE GEAR | cat. p.23 / file p.28 | all fields matched PDF page text | fp28-01.png | verified | verified (extraction map) | — |
| welding-apron | WELDING APRON | WELDING PROTECTIVE GEAR | cat. p.23 / file p.28 | all fields matched PDF page text | fp28-02.png | verified | verified (extraction map) | — |
| hand-sleeve | HAND SLEEVE | WELDING PROTECTIVE GEAR | cat. p.23 / file p.28 | all fields matched PDF page text | fp28-03.png | verified | verified (extraction map) | — |
| leg-sleeve | LEG SLEEVE | WELDING PROTECTIVE GEAR | cat. p.23 / file p.28 | all fields matched PDF page text | fp28-04.png | verified | verified (extraction map) | — |
