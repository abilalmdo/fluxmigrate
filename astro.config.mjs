import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import config from "./src/config/config.json";
import theme from "./src/config/theme.json";

// Helper to parse font string format: "FontName:wght@400;500;600;700"
function parseFontString(fontStr) {
  const [name, weightPart] = fontStr.split(":");
  let weights = [400];
  if (weightPart) {
    const weightMatch = weightPart.match(/wght@?([\d;]+)/);
    if (weightMatch) weights = weightMatch[1].split(";").map((w) => parseInt(w, 10));
  }
  return { name: name.replace(/\+/g, " "), weights };
}

// Build the fonts configuration from theme.json. Astro downloads these at build
// time and serves them from our own origin — nothing is fetched from Google at runtime.
const fontsConfig = Object.entries(theme.fonts.font_family)
  .filter(([key]) => !key.includes("_type"))
  .map(([key, fontStr]) => {
    const { name, weights } = parseFontString(fontStr);
    const fallback = theme.fonts.font_family[`${key}_type`] || "sans-serif";
    return {
      name,
      cssVariable: `--font-${key}`,
      provider: fontProviders.google(),
      weights,
      display: "swap",
      fallbacks: [fallback],
    };
  });

// The site is served as plain static files from shared hosting over FTP, so:
//  - output is fully static (no adapter, no server routes)
//  - build.format "file" keeps every existing indexed URL (/about.html, /sre-reliability-engineering.html, ...)
// https://astro.build/config
export default defineConfig({
  site: config.site.base_url,
  base: "/",
  output: "static",
  trailingSlash: "never",
  build: { format: "file" },
  image: { dangerouslyProcessSVG: true },
  vite: { plugins: [tailwindcss()] },
  fonts: fontsConfig,
  integrations: [
    sitemap({
      // canonical URLs carry the .html suffix (see build.format)
      serialize(item) {
        const u = new URL(item.url);
        if (u.pathname !== "/" && !u.pathname.endsWith(".html")) u.pathname += ".html";
        item.url = u.toString(); // the home page becomes ".../" to match its canonical
        return item;
      },
      filter: (page) => !page.includes("/404"),
    }),
  ],
});
