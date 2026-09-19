import { readFileSync } from "node:fs";
import { join } from "node:path";
import { C, DEFS, t, token } from "../lib.mjs";
import overview from "./overview.mjs";

/** 1200x630 social card: wordmark, tagline and a tilted preview of the platform view. */
export default function og() {
  const lockup = readFileSync(join(import.meta.dirname, "..", "..", "..", "public", "brand", "fluxmigrate-lockup-horizontal.svg"), "utf8");
  const inner = lockup.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<title[\s\S]*?<\/title>|<desc[\s\S]*?<\/desc>/g, "");
  // pull the overview scene in as a nested svg (drop its own defs to avoid duplicate ids)
  const prev = overview().replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<defs>[\s\S]*?<\/defs>/, "");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none" font-family="Inter">
${DEFS}
<rect width="1200" height="630" fill="url(#bgG)"/>
<rect width="1200" height="630" fill="url(#grid)" opacity=".8"/>
<circle cx="900" cy="330" r="420" fill="url(#glowD)" opacity=".9"/>
<circle cx="120" cy="60" r="280" fill="url(#glowP)" opacity=".35"/>
<g transform="translate(70 72) scale(1.15)">${inner}</g>
<text x="70" y="232" font-size="58" font-weight="600" fill="#fff" letter-spacing="-1.4">Modern infrastructure,</text>
<text x="70" y="298" font-size="58" font-weight="600" fill="url(#pri)" letter-spacing="-1.4">engineered for change.</text>
<text x="70" y="358" font-size="24" font-weight="500" fill="${C.text}" opacity=".85">Cloud · DevOps · SRE · Engineering</text>
<g transform="translate(70 420)">
  <rect width="248" height="56" rx="28" fill="url(#pri)"/>
  <text x="124" y="35" font-size="19" font-weight="600" fill="#fff" text-anchor="middle">fluxmigrate.com</text>
</g>
<g transform="translate(690 300) rotate(-7 300 180)" opacity=".98">
  <svg x="0" y="0" width="640" height="360" viewBox="0 0 1600 900">${prev}</svg>
</g>
<rect width="1200" height="630" fill="url(#bgG)" opacity="0"/>
</svg>`;
}
