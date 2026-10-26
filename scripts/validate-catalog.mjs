// validate-catalog.mjs — hard checks over src/data/catalog.ts + public/images.
// Exits non-zero with actionable errors; run: node scripts/validate-catalog.mjs
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = readFileSync(path.join(root, 'src/data/catalog.ts'), 'utf8');
const errors = [];

// evaluate the data by stripping types and imports
const js = src.replace(/^\/\/.*$/gm, '').replace(/export interface[\s\S]*?\}/g, '').replace(/export const/g, 'const')
  .replace(/: (Category|Product|Brand|Industry)\[\]/g, '');
const ctx = {};
new Function('ctx', js + '; ctx.categories=categories; ctx.products=products; ctx.brands=brands; ctx.industries=industries;')(ctx);
const { categories, products, brands, industries } = ctx;

// 1. canonical categories
if (categories.length !== 20) errors.push(`Expected 20 categories, found ${categories.length}`);
const indexNos = new Set(categories.map((c) => c.indexNo));
for (let i = 1; i <= 20; i++) if (!indexNos.has(i)) errors.push(`Missing category indexNo ${i}`);

// 2. count reconciliation
if (products.length !== 190) errors.push(`Expected 190 products (caption-verified), found ${products.length}`);

// 3. unique ids
const seen = new Set();
for (const p of products) {
  if (seen.has(p.id)) errors.push(`Duplicate product id: ${p.id}`);
  seen.add(p.id);
}

// 4. valid category references
const catIds = new Set(categories.map((c) => c.indexNo));
for (const p of products) if (!catIds.has(p.categoryId)) errors.push(`Product ${p.id} references unknown categoryId ${p.categoryId}`);

// 5. images exist
let missingImages = 0;
for (const p of products) {
  if (p.image && !existsSync(path.join(root, 'public', p.image))) {
    errors.push(`Product ${p.id}: image not found: ${p.image}`); missingImages++;
  }
}
for (const b of [...brands, ...industries]) {
  if (b.image && !existsSync(path.join(root, 'public', b.image))) errors.push(`${b.name}: image not found: ${b.image}`);
}

// 6. source references present
for (const p of products) {
  if (!p.printedPage || !p.pdfPage) errors.push(`Product ${p.id} missing page reference`);
}

// 7. no commercial fields
const forbidden = /price|stock|cart|buy|checkout|inventory/i;
for (const p of products) {
  for (const [k, v] of Object.entries(p)) if (typeof v === 'string' && forbidden.test(k)) errors.push(`Product ${p.id} has forbidden field ${k}`);
}

// 8. per-category counts (expected from the caption-verified extraction)
const expected = { 1: 16, 2: 9, 3: 18, 4: 17, 5: 9, 6: 9, 7: 9, 8: 7, 9: 9, 10: 9, 11: 7, 12: 8, 13: 9, 14: 9, 15: 7, 16: 8, 17: 8, 18: 9, 19: 8, 20: 5 };
const counts = {};
for (const p of products) counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
for (const [cid, n] of Object.entries(expected))
  if (counts[cid] !== n) errors.push(`Category ${cid}: expected ${n} items, found ${counts[cid] || 0}`);

if (brands.length !== 30) errors.push(`Expected 30 brands, found ${brands.length}`);
if (industries.length !== 6) errors.push(`Expected 6 industries, found ${industries.length}`);

if (errors.length) {
  console.error(`VALIDATION FAILED — ${errors.length} error(s):`);
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}
console.log(`VALIDATION OK — 20 categories, ${products.length} products, ${brands.length} brands, ${industries.length} industries; ${missingImages === 0 ? 'all image paths resolve' : missingImages + ' missing'}`);
