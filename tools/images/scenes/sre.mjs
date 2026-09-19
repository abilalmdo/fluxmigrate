import { C, badge, circle, end, glyphAt, line, panel, path, pill, rect, scene, t } from "../lib.mjs";

/** SRE & Reliability: an SLO held through an incident, error-budget gauge, on-call timeline and observability tiles. */
export default function sre() {
  const p = [];

  // main chart
  p.push(panel(90, 80, 1030, 470, { title: "Service level", sub: "A reliability target held through an incident and recovery" }));
  const gx = 30, gy = 96, gw = 970, gh = 330;
  for (let i = 0; i <= 4; i++) p.push(line(gx, gy + (gh / 4) * i, gx + gw, gy + (gh / 4) * i, { stroke: "#ffffff0d", sw: 1 }));
  p.push(rect(gx, gy + 70, gw, 150, { r: 6, fill: "#937AFF14" }));
  p.push(line(gx, gy + 70, gx + gw, gy + 70, { stroke: "#937AFF88", sw: 1.2, dash: "6 6" }));
  p.push(line(gx, gy + 220, gx + gw, gy + 220, { stroke: "#937AFF88", sw: 1.2, dash: "6 6" }));
  p.push(t(gx + 8, gy + 62, "SLO window", { size: 12, fill: "#B8A8FF", weight: 600 }));
  const pts = [[0, 150], [70, 138], [140, 158], [210, 128], [280, 146], [350, 132], [420, 152], [470, 300], [520, 112], [590, 132], [660, 108], [730, 124], [800, 102], [870, 118], [940, 98], [970, 106]];
  const d = "M" + pts.map(([x, y]) => `${gx + x} ${gy + y}`).join(" L");
  p.push(path(d + ` L${gx + 970} ${gy + gh} L${gx} ${gy + gh} Z`, { stroke: "none", fill: "url(#areaG)", op: 0.6 }));
  p.push(path(d, { stroke: "url(#pri)", sw: 3.4 }));
  p.push(circle(gx + 470, gy + 300, 8, { fill: C.red }));
  p.push(circle(gx + 470, gy + 300, 18, { stroke: C.red, sw: 1.6, op: 0.4 }));
  p.push(t(gx + 496, gy + 305, "Incident", { size: 13, fill: "#FF9C9C", weight: 600 }));
  p.push(circle(gx + 520, gy + 112, 7, { fill: "#fff", stroke: "#937AFF", sw: 3 }));
  p.push(t(gx + 540, gy + 96, "Recovery", { size: 13, fill: "#CFC3FF", weight: 600 }));
  ["Detect", "Mitigate", "Recover", "Review"].forEach((s, i) => p.push(pill(30 + i * 118, 432, 106, 30, s, { tone: i === 2 ? "primary" : "dim", size: 12 })));
  p.push(end());

  // error budget gauge
  p.push(panel(1140, 80, 370, 470, { title: "Error budget", sub: "Spent deliberately, not accidentally" }));
  const cx = 185, cy = 250, r = 96;
  p.push(circle(cx, cy, r, { stroke: "#ffffff14", sw: 18 }));
  const a0 = -210, a1 = 30;
  const arc = (from, to) => {
    const rad = (a) => (a * Math.PI) / 180;
    const [x0, y0, x1, y1] = [cx + r * Math.cos(rad(from)), cy + r * Math.sin(rad(from)), cx + r * Math.cos(rad(to)), cy + r * Math.sin(rad(to))];
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  };
  p.push(path(arc(a0, a1), { stroke: "#ffffff10", sw: 18 }));
  p.push(path(arc(a0, -40), { stroke: "url(#pri)", sw: 18 }));
  p.push(glyphAt("target", cx - 22, cy - 22, 44, { main: "#E9E4FF", accent: "#937AFF", w: 1.6 }));
  p.push(t(cx, cy + 74, "Budget remaining", { size: 13, fill: C.dim, anchor: "middle" }));
  ["SLI", "SLO", "Alert"].forEach((s, i) => p.push(pill(38 + i * 100, 392, 88, 30, s, { tone: "dim", size: 12 })));
  p.push(end());

  // observability tiles
  const tiles = [["Metrics", "pulse"], ["Logs", "file"], ["Traces", "branch"], ["Dashboards", "bars"], ["Alerting", "headset"]];
  tiles.forEach(([name, g], i) => {
    const x = 90 + i * 284;
    p.push(panel(x, 590, 262, 220));
    p.push(badge(22, 22, 44, g));
    p.push(t(22, 100, name, { size: 18, fill: C.white, weight: 600 }));
    if (name === "Metrics") p.push(path("M22 178 L62 150 L102 164 L142 128 L182 148 L222 120", { stroke: "url(#pri)", sw: 2.4 }));
    if (name === "Logs") [0, 1, 2, 3].forEach((n) => p.push(rect(22, 124 + n * 20, 216 - n * 34, 8, { r: 4, fill: n === 1 ? "#937AFF" : "#ffffff24" })));
    if (name === "Traces") [[0, 90], [20, 120], [40, 70], [70, 100]].forEach(([dx, w], n) => p.push(rect(22 + dx, 124 + n * 20, w, 10, { r: 5, fill: "#937AFF", op: 0.85 - n * 0.15 })));
    if (name === "Dashboards") [40, 70, 52, 96, 66].forEach((h, n) => p.push(rect(26 + n * 44, 190 - h, 30, h, { r: 8, fill: "#937AFF", op: 0.4 + n * 0.1 })));
    if (name === "Alerting") { p.push(pill(22, 130, 100, 30, "Incident", { tone: "red", size: 12 })); p.push(pill(22, 168, 120, 30, "Runbook", { tone: "primary", size: 12 })); }
    p.push(end());
  });

  return scene(p.join("\n"));
}
