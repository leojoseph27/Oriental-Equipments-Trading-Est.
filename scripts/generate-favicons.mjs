// Generates favicon assets from the company logo (public/images/logo/oriental-logo.png).
// The logo is centred on a square canvas without distortion; transparency is
// preserved except for apple-touch-icon.png, which iOS composites on white.
// Run: node scripts/generate-favicons.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/images/logo/oriental-logo.png";
const OUT = "public";

await mkdir(OUT, { recursive: true });

// Square side lengths: canvas + inner logo size (a little padding so the
// mark isn't edge-to-edge at 16-32px).
async function square(size, inner, background) {
  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: "inside" }) // preserves aspect ratio
    .toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toBuffer();
}

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const white = { r: 255, g: 255, b: 255, alpha: 1 };

const png32 = await square(32, 28, transparent);
const png16 = await square(16, 14, transparent);
const apple = await square(180, 160, white); // iOS fills transparency with black
await sharp(png32).toFile(`${OUT}/favicon-32x32.png`);
await sharp(png16).toFile(`${OUT}/favicon-16x16.png`);
await sharp(apple).toFile(`${OUT}/apple-touch-icon.png`);

// Multi-size ICO built from the 16/32/48px renders.
const png48 = await square(48, 42, transparent);
await sharp(png48).toFile(`${OUT}/favicon-48x48.png`);
const { default: pngToIco } = await import("png-to-ico").catch(() => ({ default: null }));

if (pngToIco) {
  const ico = await pngToIco([png16, png32, png48]);
  const { writeFile } = await import("node:fs/promises");
  await writeFile(`${OUT}/favicon.ico`, ico);
  console.log("favicon.ico written (16/32/48)");
} else {
  // Fallback: write the 32px PNG into an ICO container (browsers accept it).
  const { writeFile } = await import("node:fs/promises");
  await writeFile(`${OUT}/favicon.ico`, await sharp(png32).png().toBuffer());
  console.log("favicon.ico written as 32px PNG-in-ICO");
}
console.log("favicons generated");
