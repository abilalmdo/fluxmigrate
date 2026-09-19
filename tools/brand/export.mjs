// Rasterises the brand SVG sources (docs/brand/svg) to PNG/ICO exports in docs/brand/png,
// and refreshes the favicon set the site serves from public/.   node tools/brand/export.mjs
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const root = join(import.meta.dirname, "..", "..");
const src = join(root, "docs", "brand", "svg");
const out = join(root, "docs", "brand", "png");
mkdirSync(out, { recursive: true });

const png = (f, w) =>
  new Resvg(readFileSync(join(src, f), "utf8"), {
    fitTo: { mode: "width", value: w },
    background: "rgba(0,0,0,0)",
    font: { fontDirs: [join(root, "tools", "images", "fonts")], loadSystemFonts: false, defaultFontFamily: "Inter" },
  }).render().asPng();

const jobs = [
  ["fluxmigrate-mark.svg", "logo-icon.png", 1024],
  ["fluxmigrate-mark.svg", "logo-icon@2048.png", 2048],
  ["fluxmigrate-mark-white.svg", "logo-icon-white.png", 1024],
  ["fluxmigrate-lockup-horizontal.svg", "logo-lockup.png", 2400],
  ["fluxmigrate-lockup-horizontal.svg", "logo-lockup@4800.png", 4800],
  ["fluxmigrate-lockup-horizontal-white.svg", "logo-lockup-white.png", 2400],
  ["fluxmigrate-lockup-horizontal-ink.svg", "logo-lockup-ink.png", 2400],
  ["fluxmigrate-lockup-vertical.svg", "logo-vertical.png", 1600],
  ["fluxmigrate-app-tile.svg", "app-tile-1024.png", 1024],
  ["fluxmigrate-app-tile.svg", "apple-touch-icon.png", 180],
  ["fluxmigrate-favicon.svg", "favicon-16.png", 16],
  ["fluxmigrate-favicon.svg", "favicon-32.png", 32],
  ["fluxmigrate-favicon.svg", "favicon-48.png", 48],
  ["fluxmigrate-favicon.svg", "favicon-192.png", 192],
  ["fluxmigrate-favicon.svg", "favicon-512.png", 512],
];

for (const [s, d, w] of jobs) {
  const buf = await sharp(png(s, w)).png({ compressionLevel: 9, palette: false }).toBuffer();
  writeFileSync(join(out, d), buf);
  console.log(d.padEnd(26), `${w}px`, `${(buf.length / 1024).toFixed(1)} KB`);
}

// favicons the site serves
for (const f of ["favicon-32.png", "favicon-192.png", "favicon-512.png", "apple-touch-icon.png"]) copyFileSync(join(out, f), join(root, "public", f));
copyFileSync(join(src, "fluxmigrate-favicon.svg"), join(root, "public", "favicon.svg"));
console.log("public favicons refreshed (favicon.ico is built separately with Pillow; see README)");
