import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

import about from "./scenes/about.mjs";
import cloud from "./scenes/cloud.mjs";
import contact from "./scenes/contact.mjs";
import devops from "./scenes/devops.mjs";
import industries from "./scenes/industries.mjs";
import og from "./scenes/og.mjs";
import overview from "./scenes/overview.mjs";
import sre from "./scenes/sre.mjs";
import staff from "./scenes/staff.mjs";
import technology from "./scenes/technology.mjs";
import vmware from "./scenes/vmware.mjs";

const fonts = ["Inter-Regular.otf", "Inter-Medium.otf", "Inter-SemiBold.otf"].map((f) =>
  join(import.meta.dirname, "fonts", f),
);

/** name -> svg. Hero scenes are 1600x900 and become WebP; `og` is a 1200x630 PNG. */
export const HEROES = {
  "platform-overview": overview,
  "cloud-migration": cloud,
  "devops-platform": devops,
  "sre-reliability": sre,
  "vmware-modernization": vmware,
  "staff-augmentation": staff,
  technology,
  industries,
  about,
  contact,
};

function raster(svg, width) {
  return new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: "Inter" },
  })
    .render()
    .asPng();
}

export async function buildScenes(root, target = "all", only = process.argv[3]) {
  const srcDir = join(import.meta.dirname, "_out");
  const heroDir = join(root, "public", "images", "heroes");
  mkdirSync(srcDir, { recursive: true });
  mkdirSync(heroDir, { recursive: true });

  if (target === "heroes" || target === "all") {
    for (const [name, make] of Object.entries(HEROES)) {
      if (only && only !== name) continue;
      const svg = make();
      writeFileSync(join(srcDir, `${name}.svg`), svg);
      const png = raster(svg, 2400);
      const webp = await sharp(png).webp({ quality: 88, effort: 5 }).toBuffer();
      writeFileSync(join(heroDir, `${name}.webp`), webp);
      console.log(`hero ${name}: ${(webp.length / 1024).toFixed(0)} KB`);
    }
  }

  if (target === "og" || target === "all") {
    const svg = og();
    writeFileSync(join(srcDir, "og-image.svg"), svg);
    const png = await sharp(raster(svg, 1200)).flatten({ background: "#03010E" }).png({ compressionLevel: 9 }).toBuffer();
    writeFileSync(join(root, "public", "images", "og-image.png"), png);
    console.log(`og-image: ${(png.length / 1024).toFixed(0)} KB`);
  }
}
