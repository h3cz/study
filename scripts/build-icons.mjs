/**
 * build-icons.mjs
 * Generates PWA icon set from logo-G-serif-vsplit-tick.png using sharp.
 * Run: node scripts/build-icons.mjs
 */

import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "../public/brand/candidates/logo-G-serif-vsplit-tick.png");
const OUT = path.resolve(__dirname, "../public/brand");

const sizes = [
  { name: "icon-192.png",         size: 192 },
  { name: "icon-512.png",         size: 512 },
  { name: "icon-1024.png",        size: 1024 },
  { name: "icon-maskable-192.png", size: 192 },
  { name: "icon-maskable-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "favicon-32.png",       size: 32 },
  { name: "favicon-16.png",       size: 16 },
];

for (const { name, size } of sizes) {
  const dest = path.join(OUT, name);
  await sharp(SRC)
    .resize(size, size, { fit: "contain", background: { r: 250, g: 248, b: 245, alpha: 1 } })
    .png()
    .toFile(dest);
  console.log(`  wrote ${name} (${size}x${size})`);
}

console.log("done.");
