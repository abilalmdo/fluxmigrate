import { C, circle, end, glyphAt, line, panel, path, pill, rect, scene, t, token } from "../lib.mjs";

/** Cloud & Migration: source estate -> migration corridor -> target clouds, with the eight-step method underneath. */
export default function cloud() {
  const p = [];

  // scenario chips
  ["Data Center → Cloud", "Cloud → Cloud", "VMware → Alternatives", "Legacy → Modern Platform"].forEach((s, i) => {
    p.push(pill(360 + i * 220, 70, 204, 36, s, { tone: i === 0 ? "primary" : "dim", size: 13 }));
  });

  // source estate
  p.push(panel(90, 150, 400, 520, { title: "Source estate", sub: "Existing data center" }));
  for (let c = 0; c < 4; c++) {
    const x = 28 + c * 90;
    p.push(rect(x, 92, 76, 400, { r: 14, fill: "#ffffff06", stroke: "#ffffff16" }));
    for (let r = 0; r < 8; r++) {
      const y = 108 + r * 47;
      p.push(rect(x + 8, y, 60, 36, { r: 8, fill: "#ffffff08", stroke: "#ffffff12" }));
      p.push(circle(x + 20, y + 18, 3.5, { fill: (r + c) % 3 === 0 ? "#937AFF" : "#ffffff30" }));
      p.push(rect(x + 30, y + 15, 28, 5, { r: 2.5, fill: "#ffffff22" }));
    }
  }
  p.push(end());

  // target clouds
  const clouds = [["AWS", 176], ["Azure", 356], ["Google Cloud", 536]];
  clouds.forEach(([name, y], i) => {
    p.push(panel(1110, y - 26, 400, 160, { glow: i === 1 }));
    p.push(glyphAt("cloud", 26, 26, 44, { main: "#E9E4FF", accent: "#937AFF", w: 1.6 }));
    p.push(t(86, 56, name, { size: 22, fill: C.white, weight: 600 }));
    p.push(t(86, 80, "Target platform", { size: 13, fill: C.dim }));
    for (let n = 0; n < 6; n++) {
      p.push(circle(214 + n * 28, 110, 5, { fill: n % 4 === 3 ? "#ffffff26" : "#937AFF", op: n % 4 === 3 ? 1 : 0.85 }));
    }
    p.push(line(214, 110, 214 + 5 * 28, 110, { stroke: "#937AFF55", sw: 1.4 }));
    p.push(end());
  });

  // corridor
  const rows = [200, 268, 336, 404, 472, 540, 608];
  const dest = [236, 236, 416, 416, 416, 596, 596];
  rows.forEach((y, i) => {
    const d = `M492 ${y} C 700 ${y}, 880 ${dest[i]}, 1108 ${dest[i]}`;
    p.push(path(d, { stroke: "#937AFF", sw: 1.6, dash: "2 9", op: 0.6 }));
    const k = [0.3, 0.62, 0.45, 0.8, 0.2, 0.55, 0.85][i];
    const x = 492 + (1108 - 492) * k;
    const yy = y + (dest[i] - y) * (k * k * (3 - 2 * k));
    p.push(token(x - 20, yy - 5, 0.9));
  });

  // method ribbon
  const steps = ["Discover", "Assess", "Design", "Build", "Migrate", "Validate", "Optimize", "Operate"];
  p.push(line(150, 786, 1450, 786, { stroke: "#ffffff1c", sw: 2 }));
  steps.forEach((s, i) => {
    const x = 150 + i * (1300 / 7);
    const active = i === 4;
    p.push(circle(x, 786, active ? 12 : 8, { fill: active ? "#937AFF" : "#0B0C17", stroke: active ? "#CFC3FF" : "#937AFF", sw: 2 }));
    if (active) p.push(circle(x, 786, 20, { stroke: "#937AFF", sw: 1.4, op: 0.4 }));
    p.push(t(x, 826, s, { size: 15, fill: active ? C.white : C.dim, weight: 600, anchor: "middle" }));
  });

  return scene(p.join("\n"));
}
