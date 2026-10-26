# architecture.md — Site architecture and technical plan

Framework decision (carried from Step 1, no incompatibility found): **Astro with static
output + TypeScript**. Rationale: 100% static catalogue, per-category prerendered HTML
for SEO, near-zero shipped JS, free-tier static hosting friendly, content-in-repo data
model. No e-commerce features anywhere in the architecture.

## Page map

| Route | Page | Template | Notes |
|---|---|---|---|
| `/` | Home | `src/pages/index.astro` | Identity + positioning, Vision & Mission near top, category grid, industries, brands strip, contact CTA |
| `/products/` | Product index | `src/pages/products/index.astro` | All 20 canonical categories |
| `/products/[slug]/` | Category pages ×20 | `src/pages/products/[slug].astro` via `getStaticPaths` | Generated from `catalog.ts`; product card grid; breadcrumb |
| `/brands/` | Brands We Serve | `src/pages/brands.astro` | 30 logos, no product-brand claims |
| `/industries/` | Industries | `src/pages/industries.astro` | 6 entries, exact captions |
| `/about/` | About | `src/pages/about.astro` | Corporate profile, Vision, Mission (verbatim PDF text) |
| `/contact/` | Contact & Request a Quote | `src/pages/contact.astro` | Contact details verbatim + QuoteForm |
| `404` | Not found | `src/pages/404.astro` | Links back to catalogue |

No cart, checkout, payment, accounts, prices, stock or review features. No individually
handcrafted product pages; product detail is the card + SpecList pattern, with optional
expandable spec panel on category pages.

## Component structure

```
src/
  components/
    SiteHeader.astro        sticky nav + Products dropdown + search trigger + mobile drawer
    SiteFooter.astro        contact block (PDF p.29 verbatim), links
    SectionHeading.astro    green bar + heading device from catalogue
    CategoryCard.astro
    ProductCard.astro       photo, name, mono spec lines, "Add to Quote"
    SpecList.astro
    BrandLogoGrid.astro
    IndustryGrid.astro
    VisionMission.astro
    ContactBlock.astro
    QuoteForm.astro         client-side validation; submission adapter behind one interface
    SearchDialog.astro      + src/scripts/search.ts
    Breadcrumbs.astro
    Button.astro
  data/
    catalog.ts              single typed source of truth (see model below)
  pages/                    routes above
  styles/
    tokens.css              design tokens from design.md
    base.css                reset, typography, focus states
    layout.css              container, grid, section rhythm
  scripts/
    search.ts               loads build-time search index
tests/                      Playwright specs (added in milestone 8)
public/images/
  products/ brands/ industries/ logo/ hero/
```

## Product data model (`src/data/catalog.ts`)

```ts
interface Category {
  slug: string;            // kebab-case, e.g. "welding-electrodes"
  indexNo: number;         // 01–20 from PDF p.5
  name: string;            // CANONICAL: index name from PDF p.5
  pageHeading?: string;    // on-page heading when it differs (recorded, not rewritten)
  printedPages: string;    // e.g. "1–2"
  pdfPages: string;        // e.g. "6–7" (file page = printed + 5)
  intro?: string;          // only if supported by the PDF; otherwise omitted
}
interface Product {
  id: string;              // slug
  categoryId: string;
  name: string;            // exactly as printed
  awsNo?: string;          // as printed, e.g. "E7018-1", "ER70S-6"
  model?: string;          // as printed, e.g. "24KD", "CA2460", "K4000"
  sizes?: string;          // as printed incl. units, e.g. "2.6mm, 3.2mm, 4mm"
  amps?: string;           // e.g. "300, 500, 600 AMPS"
  packet?: string;         // e.g. "5KG PKT.", "10KG PKT."
  notes?: string;          // as-printed extras: "MADE IN CHINA", "RED COLOR", "SINGLE FLINT"
  image?: string;          // path under /images/products/; undefined until extracted
  sourceRef: string;       // "catalogue p.1 (PDF file p.6)"
  flags?: string[];        // review flags, e.g. "no-aws-printed", "low-res-image"
}
interface Brand { name: string; image: string; sourceRef: string; }
interface Industry { name: string; image: string; sourceRef: string; }
```

Unknown values are simply absent (never invented). `notes` carries catalogue captions
verbatim, which preserves "MADE IN …" labels and colour codes without inventing fields.

## Search strategy

- Build step generates `/search-index.json` (name, awsNo, model, sizes, category).
- Client-side scoring search in `search.ts` (substring + token match on name/AWS/model);
  dialog UI, keyboard navigable, results link to category pages with the item
  anchor-highlighted. No backend, no paid search service.

## Category filtering

Category navigation is structural (20 canonical categories); within a category page,
optional client-side filter chips derived from data (e.g. by `notes`/type prefixes)
only where a category has >9 items. No facet system beyond this — the data does not
support more.

## Quote enquiry strategy

Fields: Full name, Company, Phone, Email, Product interest (pre-filled when "Add to
Quote" is used, multiple items supported), Message. Honeypot + basic rate-friendly
validation. Submission is behind a single adapter interface with two implementations:

1. `mailtoAdapter` (default fallback): opens a pre-addressed email to
   orientaltradest@gmail.com — zero dependency.
2. `formServiceProvider` (Formspree / Web3Forms / Netlify Forms) — **pending user
   approval**; free tiers to be re-verified at implementation time before selection.
   No credentials or sign-ups occur without approval.

## Testing strategy

- Session Playwright MCP tools (verified working in Step 2) for interactive visual
  checks during development — no second browser stack installed for this.
- Milestone 8 adds project-level `@playwright/test` (`npx playwright install` browser
  download required) for repeatable E2E: routes render, search works, form validation,
  mobile viewports. This is additive, not a replacement.

## Images

- Extraction: Python `pypdfium2`/`pypdf` (already installed at user level) to pull
  embedded images; mapping to products via page position.
- Optimisation: `sharp` (dev-only) → WebP, per-usage sizes, explicit dimensions,
  lazy loading. `asset-inventory.md` flags low-res items.

## Deployment

Static build (`dist/`) → Netlify or Cloudflare Pages free tier. Terms to be re-verified
before promising specifics; the custom domain is the likely only cost. No server
runtime required; form provider account only if approved.

## Content editing

`README.md` documents: editing `catalog.ts` (structured, commented, source-referenced),
adding images to `public/images/products/`, regenerating search index, running
`npm run build`. No CMS — the data file is the editing surface.
