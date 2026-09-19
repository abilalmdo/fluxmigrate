import { C, badge, circle, end, glyphAt, line, panel, path, pill, rect, scene, t, token } from "../lib.mjs";

/** Industries: four sectors around one engineering approach. */
export default function industries() {
  const p = [];
  const cx = 800, cy = 450;

  const quads = [
    ["Financial Services", "bank", ["Security", "High availability", "Disaster recovery"], 90, 90],
    ["Telecom", "signal", ["Large-scale infrastructure", "OpenStack · NFV", "24/7 operations"], 850, 90],
    ["SaaS & Technology", "layers", ["Kubernetes", "CI/CD", "Platform engineering"], 90, 500],
    ["Enterprise IT", "building", ["Data-center modernization", "Cloud migration", "Hybrid cloud"], 850, 500],
  ];
  const qw = 660, qh = 310;

  // spokes
  quads.forEach(([, , , x, y]) => {
    const tx = x < cx ? x + qw : x, ty = y < cy ? y + qh : y;
    p.push(path(`M${cx} ${cy} L${tx} ${ty}`, { stroke: "#937AFF", sw: 1.6, dash: "2 8", op: 0.6 }));
  });

  quads.forEach(([name, g, items, x, y], i) => {
    p.push(panel(x, y, qw, qh, { glow: i === 0 }));
    p.push(badge(32, 32, 68, g, { bg: "#937AFF26", stroke: "#937AFF88" }));
    p.push(t(122, 68, name, { size: 28, fill: C.white, weight: 600 }));
    p.push(t(122, 96, "Priorities that shape the work", { size: 14, fill: C.dim }));
    items.forEach((it, n) => {
      const cw = it.length * 10.6 + 46;
      const row = n < 2 ? 0 : 1;
      const px = n < 2 ? 32 + (n === 1 ? items[0].length * 10.6 + 46 + 12 : 0) : 32;
      p.push(pill(px, 144 + row * 52, cw, 40, it, { tone: n === 0 ? "primary" : "dim", size: 15 }));
    });
    // mini graph
    const gy = 262;
    const seed = [[0, 30], [50, 18], [100, 34], [150, 12], [200, 26], [250, 8], [300, 22]];
    p.push(path("M" + seed.map(([dx, dy]) => `${360 + dx} ${gy - dy}`).join(" L"), { stroke: "url(#pri)", sw: 2.4, op: 0.9 }));
    p.push(path("M" + seed.map(([dx, dy]) => `${360 + dx} ${gy - dy}`).join(" L") + ` L660 ${gy + 14} L360 ${gy + 14} Z`.replace("660", "660"), { stroke: "none", fill: "url(#areaG)", op: 0.4 }));
    p.push(end());
  });

  // hub
  p.push(circle(cx, cy, 108, { fill: "#0B0C17", stroke: "#937AFF", sw: 1.6 }));
  p.push(circle(cx, cy, 108, { fill: "url(#glowP)", op: 0.5 }));
  p.push(circle(cx, cy, 134, { stroke: "#937AFF", sw: 1, op: 0.3 }));
  p.push(`<g transform="translate(${cx - 40} ${cy - 62}) scale(1.75)">${token(0, 0, 1)}${token(0, 15, 1)}${token(0, 30, 1)}</g>`);
  p.push(t(cx, cy + 74, "ONE APPROACH", { size: 13, fill: "#CFC3FF", weight: 600, anchor: "middle", ls: 2 }));

  return scene(p.join("\n"));
}
