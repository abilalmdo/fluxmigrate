// Builds every original illustration and icon used by the site.
//   node tools/images/build.mjs [icons|heroes|og|all]
// Output goes to public/images/{icons,heroes} and public/images/og-image.png.
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildIcons } from "./icons.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const target = process.argv[2] || "all";

if (target === "icons" || target === "all") {
  const n = buildIcons(join(root, "public", "images", "icons"));
  console.log(`icons: ${n} written`);
}
if (target === "heroes" || target === "og" || target === "all") {
  const { buildScenes } = await import("./scenes.mjs");
  await buildScenes(root, target);
}
