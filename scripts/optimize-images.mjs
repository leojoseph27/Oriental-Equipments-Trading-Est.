// optimize-images.mjs — converts extracted source-assets PNGs to WebP in public/images/.
// Run: node scripts/optimize-images.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const map = JSON.parse(readFileSync(path.join(root, 'source-assets/product-map.json'), 'utf8'));

async function convert(src, dest, maxWidth, quality) {
  await mkdir(path.dirname(path.join(root, 'public', dest)), { recursive: true });
  const out = path.join(root, 'public', dest);
  const meta = await sharp(src).flatten({ background: '#ffffff' })
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toFile(out);
  return meta;
}

let n = 0, small = 0;
for (const { card_png, webp } of map) {
  const meta = await convert(path.join(root, card_png), webp, 640, 82);
  n++;
  if (meta.width < 400) small++;
  process.stdout.write(`\rproducts: ${n} (${small} narrow)   `);
}
process.stdout.write('\n');

for (const f of await readdir(path.join(root, 'source-assets/brands'))) {
  await convert(path.join(root, 'source-assets/brands', f), `images/brands/${f.replace('.png', '.webp')}`, 480, 88);
}
for (const f of await readdir(path.join(root, 'source-assets/industries'))) {
  await convert(path.join(root, 'source-assets/industries', f), `images/industries/${f.replace('.png', '.webp')}`, 600, 82);
}
await convert(path.join(root, 'source-assets/logo/logo.png'), 'images/logo/logo.webp', 480, 92);
await convert(path.join(root, 'source-assets/hero/hero.png'), 'images/hero/hero.webp', 1600, 78);
console.log('brands: 30, industries: 6, logo: 1, hero: 1 — done');
