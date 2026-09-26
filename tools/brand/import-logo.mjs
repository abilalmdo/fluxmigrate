// Imports a delivered logo folder into the brand sources in docs/brand/svg/.
//   node tools/brand/import-logo.mjs "../Logo-Design/FluxMigrate-Website-Logo-Refinements/A-purple-red"
//   node tools/brand/export.mjs          (then rasterise and refresh the site's copies)
//
// Understands two delivery layouts. For each of horizontal, stacked and icon it looks for
//   *-<kind>-bold-dark.svg  |  *-<kind>-dark.svg  |  *-<kind>.svg      -> the version for dark backgrounds (required)
//   *-<kind>-bold-light.svg |  *-<kind>-light.svg                       -> the version for light backgrounds (optional)
// The SVGs contain outlined paths, so no fonts are needed. Sources are copied with a clean <title>. Two
// square sources are derived from the icon: a rounded favicon tile and a full-bleed app tile, both on the
// site's ground colour so the off-white F stays visible on a light browser tab.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

if (!process.argv[2]) {
  console.error('usage: node tools/brand/import-logo.mjs "<delivered-logo-folder>"');
  process.exit(1);
}
const dir = resolve(process.argv[2]);
const out = join(import.meta.dirname, "..", "..", "docs", "brand", "svg");
mkdirSync(out, { recursive: true });

const TILE = "#03010E"; // the site's ground colour (theme.json body)
const files = readdirSync(dir);
const find = (kind, tone) => {
  const tries =
    tone === "dark"
      ? [`-${kind}-bold-dark.svg`, `-${kind}-dark.svg`, `-${kind}.svg`]
      : [`-${kind}-bold-light.svg`, `-${kind}-light.svg`];
  for (const suffix of tries) {
    const f = files.find((n) => n.endsWith(suffix));
    if (f) return readFileSync(join(dir, f), "utf8");
  }
  return null;
};
const clean = (svg, label) => svg.replace(/<title>[\s\S]*?<\/title>/, `<title>FluxMigrate${label ? ` — ${label}` : ""}</title>`);

const labels = { horizontal: "logo", stacked: "logo, stacked", icon: "mark" };
let icon;
for (const kind of ["horizontal", "stacked", "icon"]) {
  const dark = find(kind, "dark");
  if (!dark) throw new Error(`no ${kind} SVG for dark backgrounds in ${dir}`);
  writeFileSync(join(out, `fluxmigrate-${kind}.svg`), clean(dark, labels[kind]) + "\n");
  if (kind === "icon") icon = dark;
  const light = find(kind, "light");
  if (light) writeFileSync(join(out, `fluxmigrate-${kind}-light.svg`), clean(light, `${labels[kind]}, for light backgrounds`) + "\n");
}

// the mark's own paths, without the icon's padding wrapper (its translate differs between deliveries)
const inner = icon.match(/<g transform="translate\([^)]*\)">([\s\S]*?)<\/g>/)?.[1];
if (!inner) throw new Error("icon SVG does not have the expected <g transform=translate(...)> wrapper");
// mark bounds in its own units: x 10..138, y 5..130 -> centre (74, 67.5); scale it to ~82% of the tile
const tile = (rx, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 164 164" role="img"><title>FluxMigrate — ${label}</title><rect width="164" height="164" rx="${rx}" fill="${TILE}"/><g transform="translate(82 82) scale(1.06) translate(-74 -67.5)">${inner}</g></svg>\n`;
writeFileSync(join(out, "fluxmigrate-favicon.svg"), tile(34, "favicon"));
writeFileSync(join(out, "fluxmigrate-app-tile.svg"), tile(0, "app icon"));

console.log(`imported ${basename(dir)} -> docs/brand/svg/: ${readdirSync(out).join(", ")}`);
