import { C, badge, circle, end, glyphAt, line, panel, path, pill, rect, scene, t, token } from "../lib.mjs";

/** Staff Augmentation: specialist engineers joining an existing team and its tools. */
export default function staff() {
  const p = [];
  const cx = 800, cy = 440;

  // specialists (incoming)
  const spec = [
    ["DevOps", "terminal", 250, 190],
    ["Cloud", "cloud", 250, 690],
    ["SRE", "pulse", 1350, 190],
    ["Platform", "hexagon", 1350, 690],
  ];
  spec.forEach(([name, g, x, y], i) => {
    const sx = x < cx ? x + 100 : x - 100;
    p.push(path(`M${sx} ${y} C ${(sx + cx) / 2} ${y}, ${(sx + cx) / 2} ${cy}, ${x < cx ? cx - 190 : cx + 190} ${cy + (y < cy ? -50 : 50)}`, { stroke: "#937AFF", sw: 1.8, dash: "2 9", op: 0.8 }));
    const k = [0.45, 0.25, 0.5, 0.4][i];
    const mx = sx + ((x < cx ? cx - 190 : cx + 190) - sx) * k;
    const my = y + (cy + (y < cy ? -50 : 50) - y) * (k * k * (3 - 2 * k));
    p.push(token(mx - 20, my - 5, 0.9));
    p.push(panel(x - 100, y - 70, 200, 140, { glow: false }));
    p.push(badge(78, 22, 44, g, { bg: "#937AFF26", stroke: "#937AFF88" }));
    p.push(t(100, 96, name, { size: 20, fill: C.white, weight: 600, anchor: "middle" }));
    p.push(t(100, 118, "Specialist", { size: 12, fill: C.dim, anchor: "middle" }));
    p.push(end());
  });

  // your team hub
  p.push(`<ellipse cx="${cx}" cy="${cy}" rx="360" ry="262" stroke="#937AFF" stroke-width="1.2" opacity=".24"/>`);
  p.push(`<ellipse cx="${cx}" cy="${cy}" rx="300" ry="212" stroke="#fff" stroke-width="1.2" opacity=".08"/>`);
  p.push(panel(cx - 190, cy - 130, 380, 260, { glow: true, r: 36 }));
  p.push(t(190, 62, "YOUR ENGINEERING TEAM", { size: 12, fill: "#CFC3FF", weight: 600, anchor: "middle", ls: 1.6 }));
  const av = ["#4D36D0", "#937AFF", "#2A2160", "#6D57E6", "#3A2C9A"];
  av.forEach((f, i) => {
    const x = 90 + i * 50;
    p.push(circle(x, 116, 24, { fill: f, stroke: "#0B0C17", sw: 4 }));
    p.push(glyphAt("user", x - 11, 105, 22, { main: "#E9E4FF", accent: "#E9E4FF", w: 1.8 }));
  });
  p.push(t(190, 176, "Existing people, tools", { size: 15, fill: C.white, weight: 600, anchor: "middle" }));
  p.push(t(190, 198, "repositories and processes", { size: 15, fill: C.white, weight: 600, anchor: "middle" }));
  p.push(pill(112, 214, 156, 28, "One team", { tone: "primary", size: 12 }));
  p.push(end());

  // integration chips
  const chips = ["Git", "CI/CD", "Jira", "Slack / Teams", "Kubernetes", "Monitoring"];
  chips.forEach((c, i) => {
    const a = (-90 + i * 60) * (Math.PI / 180);
    const x = cx + Math.cos(a) * 360, y = cy + Math.sin(a) * 262;
    const w = c.length * 9 + 40;
    p.push(pill(x - w / 2, y - 16, w, 32, c, { tone: "dim", size: 13 }));
  });

  // engagement models
  ["Dedicated Engineer", "Engineering Pod", "Project-Based", "Long-Term Support"].forEach((m, i) => {
    p.push(pill(316 + i * 240, 828, 224, 36, m, { tone: i === 1 ? "primary" : "dim", size: 13 }));
  });

  return scene(p.join("\n"));
}
