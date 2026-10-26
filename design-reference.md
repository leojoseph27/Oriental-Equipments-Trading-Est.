# design-reference.md — Selected reference from awesome-design-md

## Source

Repository: https://github.com/VoltAgent/awesome-design-md (MIT License, verified in
repo root `LICENSE` and confirmed in the README description — the files document
"publicly visible CSS values" and claim no ownership of brand identities).

## Selected reference (exactly one)

**`design-md/dji/DESIGN.md`** — DJI's design language: "a product-photography showroom
… full-bleed studio renders sit in square, gutter-separated tiles on a white canvas …
type in near-black ink at stepped opacities … the same restrained system" closing on a
charcoal footer. Downloaded to `dji-design.md` in this workspace for reference
(882 lines, reviewed).

## Why this one and not the others

Oriental's site is a hardware product catalogue; DJI's system is the closest match:
white canvas, square product tiles with generous gutters, stepped ink opacities for
hierarchy, restrained single-accent actions, technical captions. IBM was the runner-up
(strong for data density) but is a UI *platform* system (Carbon) whose blue enterprise
look would fight the catalogue's red/green identity. Oracle/Vercel lean SaaS; Nike/
Starbucks are consumer-brand showrooms. Only DJI is fundamentally a *product catalogue*
language.

## Principles adapted (structure only — not DJI's identity)

1. **Square, gutter-separated white product tiles on a light canvas** → our product
   card grid (with the catalogue's own 1px hairline treatment instead of DJI's shadowless
   floats, and 4px max radius).
2. **Stepped ink opacities** for title → meta → caption hierarchy → our
   `--ink / --ink-secondary / --ink-tertiary` ladder.
3. **One disciplined accent for every action** → our `--red-brand` as the single CTA
   colour; green reserved for category/section markers (mirroring the logo's two colours).
4. **Technical captions in small, muted type** → mono spec lines (AWS NO, sizes, amps).
5. **Restrained footer on a dark band** → `--green-deep` footer.

## What is deliberately NOT taken

DJI's engineering-blue palette, Open Sans type system, orange tier labels, purchase
bars, "Buy Now"/cart affordances, and any DJI-specific componentry. The palette and
type come from the Oriental catalogue itself (`design.md`); DJI supplies only
layout/hierarchy discipline. No other reference from the collection is combined.
