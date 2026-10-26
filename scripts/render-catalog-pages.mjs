/*
 * Pre-render the catalogue PDF pages to WebP images + thumbnails for the
 * digital catalogue reader, so the browser never downloads the 24 MB source
 * PDF just to flip pages. The original PDF remains available for download.
 * Run as part of `npm run build` (see package.json).
 */
import mupdf from "mupdf";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "public/pdfs/oriental-catalogue.pdf";
const OUT_DIR = "public/catalogue-pages";
const PAGE_WIDTH = 1600;   // reader render width (~2x the displayed half-page)
const THUMB_WIDTH = 320;   // thumbnail panel width

fs.mkdirSync(OUT_DIR, { recursive: true });
const buf = fs.readFileSync(SRC);
const doc = mupdf.PDFDocument.openDocument(buf, "application/pdf");
const count = doc.countPages();

const manifest = { pages: count, width: PAGE_WIDTH, heights: [] };
for (let i = 0; i < count; i++) {
  const page = doc.loadPage(i);
  // this mupdf build has no getSize(); measure with a 1x pixmap
  const probe = page.toPixmap(mupdf.Matrix.scale(1, 1), mupdf.ColorSpace.DeviceRGB);
  const scale = PAGE_WIDTH / probe.getWidth();
  const pix = scale === 1 ? probe : page.toPixmap(mupdf.Matrix.scale(scale, scale), mupdf.ColorSpace.DeviceRGB);
  const png = pix.asPNG();
  manifest.heights.push(Math.round(PAGE_WIDTH * pix.getHeight() / pix.getWidth()));
  const img = sharp(png);
  await img.clone().webp({ quality: 78 }).toFile(path.join(OUT_DIR, `page-${String(i + 1).padStart(2, "0")}.webp`));
  await img.clone().resize(THUMB_WIDTH).webp({ quality: 70 }).toFile(path.join(OUT_DIR, `thumb-${String(i + 1).padStart(2, "0")}.webp`));
  if ((i + 1) % 10 === 0 || i === count - 1) console.log(`rendered ${i + 1}/${count}`);
}
fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest));
const total = fs.readdirSync(OUT_DIR).reduce((a, f) => a + fs.statSync(path.join(OUT_DIR, f)).size, 0);
console.log(`catalogue pages: ${count}, total ${(total / 1048576).toFixed(1)} MB (~${(total / count / 1024).toFixed(0)} KB/image avg)`);
