import { C, badge, circle, end, glyphAt, line, panel, path, pill, rect, scene, t, token } from "../lib.mjs";

/** About: design, build, migrate and operate as one continuous loop around the mark. */
export default function about() {
  const p = [];
  const cx = 800, cy = 450, R = 290;

  // ring
  p.push(circle(cx, cy, R, { stroke: "#937AFF", sw: 2, op: 0.35, fill: "none" }));
  p.push(circle(cx, cy, R + 46, { stroke: "#ffffff", sw: 1, op: 0.06, fill: "none" }));
  p.push(circle(cx, cy, R - 60, { stroke: "#ffffff", sw: 1, op: 0.08, fill: "none" }));

  // arrowheads along the ring
  [45, 135, 225, 315].forEach((deg) => {
    const a = (deg * Math.PI) / 180;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    p.push(`<g transform="translate(${x} ${y}) rotate(${deg + 180})"><path d="M-9 8 0 -8 9 8" stroke="#937AFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`);
  });

  // nodes
  const nodes = [
    ["Design", "pencil", -90],
    ["Build", "cube", 0],
    ["Migrate", "swap", 90],
    ["Operate", "pulse", 180],
  ];
  nodes.forEach(([name, g, deg], i) => {
    const a = (deg * Math.PI) / 180;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    p.push(circle(x, y, 74, { fill: "url(#glowP)", op: 0.35 }));
    p.push(panel(x - 92, y - 58, 184, 116, { r: 30, glow: i === 0 }));
    p.push(badge(70, 14, 44, g, { bg: "#937AFF26", stroke: "#937AFF88" }));
    p.push(t(92, 92, name, { size: 20, fill: C.white, weight: 600, anchor: "middle" }));
    p.push(end());
  });

  // centre
  p.push(circle(cx, cy, 128, { fill: "#0B0C17", stroke: "#937AFF", sw: 1.6 }));
  p.push(circle(cx, cy, 128, { fill: "url(#glowP)", op: 0.55 }));
  p.push(`<g transform="translate(${cx - 62} ${cy - 56}) scale(2.7)">${token(0, 0, 1)}${token(0, 15, 1)}${token(0, 30, 1)}</g>`);
  p.push(t(cx, cy + 92, "BUILD · OPERATE", { size: 12, fill: "#CFC3FF", weight: 600, anchor: "middle", ls: 2 }));

  // flanking notes
  [
    ["Projects", "Defined transformations", 90, 130],
    ["Capacity", "Engineers in your team", 90, 700],
    ["Tools", "Your repositories and processes", 1150, 130],
    ["Platforms", "Cloud, virtualization, Kubernetes", 1150, 700],
  ].forEach(([h, s, x, y], i) => {
    p.push(panel(x, y, 360, 96, { r: 24 }));
    p.push(t(28, 42, h, { size: 20, fill: C.white, weight: 600 }));
    p.push(t(28, 68, s, { size: 14, fill: C.dim }));
    p.push(end());
    const sx = x < cx ? x + 360 : x, sy = y + 48;
    p.push(path(`M${sx} ${sy} L${x < cx ? sx + 110 : sx - 110} ${sy < cy ? sy + 90 : sy - 90}`, { stroke: "#937AFF", sw: 1.4, dash: "2 8", op: 0.5 }));
  });

  return scene(p.join("\n"));
}
