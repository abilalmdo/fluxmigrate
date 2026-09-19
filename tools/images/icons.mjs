import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import G from "./glyphs.mjs";

/** icon key -> glyph name, or [left, right] for a "from -> to" composite */
export const ICONS = {
  // lifecycle
  design: "pencil",
  migrate: "swap",
  automate: "bolt",
  operate: "pulse",
  // evidence
  decisions: "file",
  reproducible: "repeat",
  opsready: "checklist",
  // services
  devsecops: "shield-lock",
  devops: "infinity",
  cloud: "cloud",
  staff: "users",
  sre: "clock",
  kubernetes: "hexagon",
  finops: "bars",
  wellarch: "compass",
  vmware: "layers",
  // migration scenarios
  "dc-cloud": ["server", "cloud"],
  "cloud-cloud": ["cloud", "cloud"],
  "vmware-alt": ["layers", "server"],
  "legacy-modern": ["cube", "hexagon"],
  // groups
  cicd: "branch",
  iac: "code",
  platform: "cube",
  reliability: "target",
  observability: "eye",
  operations: "headset",
  resilience: "shield-check",
  assessment: "search",
  planning: "map",
  targets: "rocket",
  // staff augmentation
  "role-devops": "terminal",
  "role-cloud": "cloud",
  "role-sre": "pulse",
  "role-platform": "hexagon",
  dedicated: "user",
  pod: "users",
  project: "flag",
  longterm: "calendar",
  "why-experience": "award",
  "why-scaling": "expand",
  "why-global": "globe",
  "why-expertise": "cpu",
  "why-security": "lock",
  // technology
  "tech-cloud": "cloud",
  "tech-containers": "cube",
  "tech-private": "server",
  "tech-automation": "gear",
  "tech-cicd": "branch",
  "tech-linux": "terminal",
  "tech-observability": "pulse",
  // industries
  "ind-finance": "bank",
  "ind-telecom": "signal",
  "ind-saas": "layers",
  "ind-enterprise": "building",
  // about
  "about-what": "gear",
  "about-how": "link",
  "about-where": "target",
};

const MAIN = "#E9E4FF";
const ACCENT = "#937AFF";

function strokeGroup(inner, stroke, w = 1.6) {
  return `<g fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;
}

export function glyph(name, { main = MAIN, accent = ACCENT, w = 1.6 } = {}) {
  const g = G[name];
  if (!g) throw new Error(`unknown glyph: ${name}`);
  return strokeGroup(g.main, main, w) + (g.accent ? strokeGroup(g.accent, accent, w) : "");
}

/** glyph placed at (x, y) with a given rendered size in px */
export function glyphAt(name, x, y, size, opts = {}) {
  const k = size / 24;
  return `<g transform="translate(${x} ${y}) scale(${k})">${glyph(name, { ...opts, w: (opts.w ?? 1.6) })}</g>`;
}

function composite(a, b) {
  // two 24-grid glyphs at ~0.46 scale with a small arrow between them
  const arrow = strokeGroup(`<path d="M10.6 12h2.8m0 0-1.2-1.2m1.2 1.2-1.2 1.2"/>`, ACCENT, 1.2);
  return (
    `<g transform="translate(-0.4 6.4) scale(0.46)">${glyph(a, { w: 2.2 })}</g>` +
    arrow +
    `<g transform="translate(13.4 6.4) scale(0.46)">${glyph(b, { w: 2.2 })}</g>`
  );
}

export function iconSvg(spec, id) {
  const inner = Array.isArray(spec) ? composite(spec[0], spec[1]) : glyph(spec);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96" fill="none">
<defs>
  <linearGradient id="t${id}" x1="8" y1="4" x2="88" y2="92" gradientUnits="userSpaceOnUse">
    <stop stop-color="#2A2160"/><stop offset="1" stop-color="#0B0C17"/>
  </linearGradient>
  <linearGradient id="b${id}" x1="6" y1="4" x2="90" y2="92" gradientUnits="userSpaceOnUse">
    <stop stop-color="#937AFF" stop-opacity=".85"/><stop offset=".55" stop-color="#937AFF" stop-opacity=".12"/><stop offset="1" stop-color="#937AFF" stop-opacity=".3"/>
  </linearGradient>
  <radialGradient id="g${id}" cx="30" cy="24" r="52" gradientUnits="userSpaceOnUse">
    <stop stop-color="#937AFF" stop-opacity=".45"/><stop offset="1" stop-color="#937AFF" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect x="1.5" y="1.5" width="93" height="93" rx="28" fill="url(#t${id})"/>
<rect x="1.5" y="1.5" width="93" height="93" rx="28" fill="url(#g${id})"/>
<rect x="1.5" y="1.5" width="93" height="93" rx="28" stroke="url(#b${id})" stroke-width="1.5"/>
<path d="M22 3.4h52" stroke="#fff" stroke-opacity=".22" stroke-width="1.2" stroke-linecap="round"/>
<g transform="translate(26 26) scale(1.8333)">${inner}</g>
</svg>
`;
}

export function buildIcons(outDir) {
  mkdirSync(outDir, { recursive: true });
  let n = 0;
  for (const [key, spec] of Object.entries(ICONS)) {
    writeFileSync(join(outDir, `${key}.svg`), iconSvg(spec, n));
    n++;
  }
  return n;
}
