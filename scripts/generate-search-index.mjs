// generate-search-index.mjs — writes public/search-index.json from catalog.ts.
// Runs before `astro build` (see package.json). Fields limited to what search
// needs; no image URLs so searching never loads product photos.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = readFileSync(path.join(root, 'src/data/catalog.ts'), 'utf8');
const js = src.replace(/^\/\/.*$/gm, '')
  .replace(/export interface[\s\S]*?\}/g, '')
  .replace(/export const/g, 'const')
  .replace(/: (Category|Product|Brand|Industry)\[\]/g, '');
const ctx = {};
new Function('ctx', js + '; ctx.categories=categories; ctx.products=products;')(ctx);
const { categories, products } = ctx;

const catById = new Map(categories.map((c) => [c.indexNo, c]));
const index = products.map((p) => {
  const c = catById.get(p.categoryId);
  const fields = [p.name, c.name, c.pageHeading || '', p.awsNo || '', p.model || '',
    p.sizes || '', p.amps || '', p.packet || '', p.notes || ''];
  return {
    id: p.id,
    name: p.name,
    cat: c.name,
    catSlug: c.slug,
    text: fields.join(' ').toLowerCase().replace(/\s+/g, ' ').trim(),
  };
});
writeFileSync(path.join(root, 'public/search-index.json'), JSON.stringify(index));
console.log(`search-index.json: ${index.length} entries`);
