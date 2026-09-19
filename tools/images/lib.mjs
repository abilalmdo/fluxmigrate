/**
 * SVG scene toolkit for the site's illustrations.
 * Colours follow the Automark theme tokens in src/config/theme.json.
 */
import { glyphAt } from "./icons.mjs";

export const C = {
  bg: "#03010E",
  panel: "#0B0C17",
  border: "#202128",
  primary: "#937AFF",
  primaryLight: "#4D36D0",
  red: "#FF5353",
  text: "#DAD4DE",
  dim: "#817E84",
  white: "#FFFFFF",
  ok: "#7BE0B0",
};

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const DEFS = `<defs>
  <linearGradient id="bgG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B0724"/><stop offset="1" stop-color="#03010E"/></linearGradient>
  <linearGradient id="pri" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#4D36D0"/><stop offset="1" stop-color="#937AFF"/></linearGradient>
  <linearGradient id="priV" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#4D36D0"/><stop offset="1" stop-color="#937AFF"/></linearGradient>
  <linearGradient id="priFade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#937AFF" stop-opacity="0"/><stop offset=".5" stop-color="#937AFF"/><stop offset="1" stop-color="#937AFF" stop-opacity="0"/></linearGradient>
  <linearGradient id="panelG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15142A" stop-opacity=".96"/><stop offset="1" stop-color="#0B0C17" stop-opacity=".96"/></linearGradient>
  <linearGradient id="strokeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></linearGradient>
  <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#937AFF" stop-opacity=".35"/><stop offset="1" stop-color="#937AFF" stop-opacity="0"/></linearGradient>
  <radialGradient id="glowP"><stop offset="0" stop-color="#937AFF" stop-opacity=".55"/><stop offset="1" stop-color="#937AFF" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowD"><stop offset="0" stop-color="#4D36D0" stop-opacity=".6"/><stop offset="1" stop-color="#4D36D0" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#fff" stroke-opacity=".04"/></pattern>
  <radialGradient id="fadeR" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <mask id="fade"><rect width="1600" height="900" fill="url(#fadeR)"/></mask>
  <filter id="blur40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
  <filter id="blur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity=".55"/></filter>
</defs>`;

/** full 1600x900 scene wrapper */
export function scene(children, { w = 1600, h = 900, caption = "Illustrative view" } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" font-family="Inter">
${DEFS}
<rect width="${w}" height="${h}" fill="url(#bgG)"/>
<rect width="${w}" height="${h}" fill="url(#grid)" mask="url(#fade)"/>
<circle cx="${w * 0.5}" cy="${h * 0.46}" r="470" fill="url(#glowD)" opacity=".75"/>
<circle cx="${w * 0.2}" cy="${h * 0.12}" r="300" fill="url(#glowP)" opacity=".35"/>
<circle cx="${w * 0.84}" cy="${h * 0.9}" r="330" fill="url(#glowP)" opacity=".3"/>
${children}
${caption ? t(w - 34, h - 22, caption, { size: 12, fill: C.dim, anchor: "end", ls: 0.6 }) : ""}
</svg>`;
}

/** text */
export function t(x, y, str, { size = 14, fill = C.text, weight = 500, anchor = "start", ls = 0, op = 1, caps = false } = {}) {
  const s = caps ? String(str).toUpperCase() : str;
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${op}">${esc(s)}</text>`;
}

/** glass panel; returns opening group so children can be drawn in local coords via g() */
export function panel(x, y, w, h, { r = 22, title, sub, glow = false, fill = "url(#panelG)" } = {}) {
  return `<g transform="translate(${x} ${y})">
  ${glow ? `<rect x="-2" y="-2" width="${w + 4}" height="${h + 4}" rx="${r + 2}" fill="#937AFF" opacity=".28" filter="url(#blur6)"/>` : ""}
  <rect width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="url(#strokeG)" stroke-width="1.2"/>
  ${title ? t(24, 36, title, { size: 16, fill: C.white, weight: 600 }) : ""}
  ${sub ? t(24, 58, sub, { size: 12, fill: C.dim }) : ""}`;
}
export const end = () => `</g>`;

export function pill(x, y, w, h, label, { tone = "dim", size = 12 } = {}) {
  const tones = {
    dim: { f: "#ffffff0d", s: "#ffffff1f", c: C.text },
    primary: { f: "#937AFF26", s: "#937AFF80", c: "#CFC3FF" },
    ok: { f: "#7BE0B01f", s: "#7BE0B066", c: "#A8F0CC" },
    red: { f: "#FF535326", s: "#FF535380", c: "#FF9C9C" },
    solid: { f: "url(#pri)", s: "none", c: "#fff" },
  }[tone];
  return `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" rx="${h / 2}" fill="${tones.f}" stroke="${tones.s}"/>${t(w / 2, h / 2 + size * 0.36, label, { size, fill: tones.c, weight: 600, anchor: "middle" })}</g>`;
}

export const circle = (cx, cy, r, { fill = "none", stroke = "none", sw = 1.5, op = 1 } = {}) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`;

export const rect = (x, y, w, h, { r = 8, fill = "none", stroke = "none", sw = 1.2, op = 1 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`;

export const line = (x1, y1, x2, y2, { stroke = "#ffffff26", sw = 1.5, dash = "", cap = "round", op = 1 } = {}) =>
  `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="${cap}" ${dash ? `stroke-dasharray="${dash}"` : ""} opacity="${op}"/>`;

export const path = (d, { stroke = "#ffffff26", sw = 1.5, fill = "none", dash = "", op = 1, cap = "round" } = {}) =>
  `<path d="${d}" stroke="${stroke}" stroke-width="${sw}" fill="${fill}" stroke-linecap="${cap}" stroke-linejoin="round" ${dash ? `stroke-dasharray="${dash}"` : ""} opacity="${op}"/>`;

/** the brand's slanted-bar workload token */
export function token(x, y, s = 1, fill = "url(#pri)") {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}"><path d="M8 0h22l-6 9H2z"/><path d="M33 0h8l-6 9h-8z"/></g>`;
}

/** small glyph on a rounded badge */
export function badge(x, y, size, name, { bg = "#937AFF26", stroke = "#937AFF66", main = "#E9E4FF", accent = "#937AFF" } = {}) {
  return `<g><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.3}" fill="${bg}" stroke="${stroke}"/>${glyphAt(name, x + size * 0.2, y + size * 0.2, size * 0.6, { main, accent, w: 1.7 })}</g>`;
}

export { glyphAt };
