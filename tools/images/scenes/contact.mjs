import { C, badge, circle, end, glyphAt, line, panel, path, pill, rect, scene, t, token } from "../lib.mjs";

/** Contact: a request describing an environment reaches an engineering team. */
export default function contact() {
  const p = [];

  // request card
  p.push(panel(120, 170, 520, 560, { title: "Your request", sub: "Environment, requirements, timeline" }));
  ["Name", "Company", "Business email"].forEach((label, i) => {
    const y = 96 + i * 78;
    p.push(t(28, y, label, { size: 12, fill: C.dim }));
    p.push(rect(28, y + 10, 464, 40, { r: 14, fill: "#ffffff07", stroke: "#ffffff16" }));
    p.push(rect(44, y + 26, 130 + i * 40, 8, { r: 4, fill: "#ffffff26" }));
  });
  p.push(t(28, 342, "Technology environment", { size: 12, fill: C.dim }));
  ["AWS", "Kubernetes", "VMware"].forEach((c, i) => p.push(pill(28 + i * 118, 354, 106, 32, c, { tone: i === 1 ? "primary" : "dim", size: 12 })));
  p.push(rect(28, 404, 464, 84, { r: 14, fill: "#ffffff07", stroke: "#ffffff16" }));
  [0, 1, 2].forEach((n) => p.push(rect(44, 422 + n * 20, 400 - n * 90, 8, { r: 4, fill: "#ffffff22" })));
  p.push(pill(28, 504, 160, 40, "Submit", { tone: "solid", size: 15 }));
  p.push(end());

  // flow
  p.push(path("M642 450 C 760 450, 820 450, 940 450", { stroke: "#937AFF", sw: 2, dash: "2 9", op: 0.85 }));
  p.push(token(740, 445, 1));
  p.push(circle(800, 450, 46, { fill: "#0B0C17", stroke: "#937AFF", sw: 1.6 }));
  p.push(circle(800, 450, 46, { fill: "url(#glowP)", op: 0.5 }));
  p.push(glyphAt("arrow", 776, 426, 48, { main: "#E9E4FF", accent: "#937AFF", w: 1.8 }));

  // team
  p.push(panel(960, 170, 520, 560, { glow: true, title: "Engineering team", sub: "We follow up with the right specialists" }));
  [["DevOps", "terminal"], ["Cloud", "cloud"], ["SRE", "pulse"], ["Platform", "hexagon"]].forEach(([n, g], i) => {
    const x = 28 + (i % 2) * 236, y = 96 + Math.floor(i / 2) * 150;
    p.push(rect(x, y, 220, 130, { r: 22, fill: "#ffffff06", stroke: "#ffffff14" }));
    p.push(badge(x + 20, y + 20, 48, g, { bg: "#937AFF26", stroke: "#937AFF88" }));
    p.push(t(x + 20, y + 100, n, { size: 18, fill: C.white, weight: 600 }));
    [0, 1, 2].forEach((a) => p.push(circle(x + 150 + a * 18, y + 44, 14, { fill: ["#4D36D0", "#937AFF", "#2A2160"][a], stroke: "#0B0C17", sw: 3 })));
  });
  p.push(pill(28, 420, 220, 40, "Follow-up scheduled", { tone: "primary", size: 14 }));
  p.push(pill(260, 420, 200, 40, "Discovery call", { tone: "dim", size: 14 }));
  p.push(rect(28, 490, 464, 8, { r: 4, fill: "#ffffff14" }));
  p.push(rect(28, 490, 300, 8, { r: 4, fill: "url(#pri)" }));
  p.push(end());

  return scene(p.join("\n"));
}
