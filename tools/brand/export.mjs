// Rasterises the brand SVG sources (docs/brand/svg) to PNG exports in docs/brand/png, refreshes the
// files the site serves (public/brand/*, favicons, favicon.ico), and builds the multi-size .ico.
//   node tools/brand/export.mjs
// Sources come from `node tools/brand/import-logo.mjs <delivered folder>`.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const root = join(import.meta.dirname, "..", "..");
const src = join(root, "docs", "brand", "svg");
const out = join(root, "docs", "brand", "png");
const pub = join(root, "public");
mkdirSync(out, { recursive: true });
mkdirSync(join(pub, "brand"), { recursive: true });

const render = async (file, width) =>
  sharp(new Resvg(readFileSync(join(src, file), "utf8"), { fitTo: { mode: "width", value: width }, background: "rgba(0,0,0,0)" }).render().asPng())
    .png({ compressionLevel: 9 })
    .toBuffer();

const jobs = [
  ["fluxmigrate-horizontal.svg", "logo-horizontal.png", 2400],
  ["fluxmigrate-horizontal.svg", "logo-horizontal@4800.png", 4800],
  ["fluxmigrate-stacked.svg", "logo-stacked.png", 1600],
  ["fluxmigrate-icon.svg", "logo-icon.png", 1024],
  ["fluxmigrate-horizontal-light.svg", "logo-horizontal-light.png", 2400],
  ["fluxmigrate-stacked-light.svg", "logo-stacked-light.png", 1600],
  ["fluxmigrate-icon-light.svg", "logo-icon-light.png", 1024],
  ["fluxmigrate-app-tile.svg", "app-tile-1024.png", 1024],
  ["fluxmigrate-app-tile.svg", "apple-touch-icon.png", 180],
  ["fluxmigrate-favicon.svg", "favicon-16.png", 16],
  ["fluxmigrate-favicon.svg", "favicon-32.png", 32],
  ["fluxmigrate-favicon.svg", "favicon-48.png", 48],
  ["fluxmigrate-favicon.svg", "favicon-192.png", 192],
  ["fluxmigrate-favicon.svg", "favicon-512.png", 512],
];
for (const [s, d, w] of jobs) {
  const buf = await render(s, w);
  writeFileSync(join(out, d), buf);
  console.log(d.padEnd(26), `${w}px`, `${(buf.length / 1024).toFixed(1)} KB`);
}

// favicon.ico: PNG images inside an ICO container (every current browser reads these)
const sizes = [16, 24, 32, 48, 64, 128, 256];
const pngs = await Promise.all(sizes.map((w) => render("fluxmigrate-favicon.svg", w)));
const head = Buffer.alloc(6);
head.writeUInt16LE(1, 2); // type: icon
head.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const dir = pngs.map((png, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], 0);
  e.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], 1);
  e.writeUInt16LE(1, 4); // planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});
const ico = Buffer.concat([head, ...dir, ...pngs]);
writeFileSync(join(out, "favicon.ico"), ico);
console.log("favicon.ico".padEnd(26), `${sizes.join("/")}`, `${(ico.length / 1024).toFixed(1)} KB`);

// what the site serves
for (const f of ["favicon-32.png", "favicon-192.png", "favicon-512.png", "apple-touch-icon.png", "favicon.ico"]) copyFileSync(join(out, f), join(pub, f));
copyFileSync(join(src, "fluxmigrate-favicon.svg"), join(pub, "favicon.svg"));
copyFileSync(join(src, "fluxmigrate-horizontal.svg"), join(pub, "brand", "fluxmigrate-lockup-horizontal.svg"));
copyFileSync(join(src, "fluxmigrate-icon.svg"), join(pub, "brand", "fluxmigrate-mark.svg"));
console.log("public/ refreshed: favicon.svg/.ico/.png, apple-touch-icon.png, brand/fluxmigrate-lockup-horizontal.svg, brand/fluxmigrate-mark.svg");
