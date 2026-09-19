import { C, badge, circle, end, glyphAt, line, panel, path, pill, rect, scene, t, token } from "../lib.mjs";

/** VMware Modernization: a virtualization estate fanning out to KVM, OLVM, OpenStack and cloud targets. */
export default function vmware() {
  const p = [];

  ["Assess", "Plan", "Migrate", "Optimize"].forEach((s, i) => {
    p.push(pill(110 + i * 190, 64, 172, 40, `${i + 1}  ${s}`, { tone: i === 2 ? "primary" : "dim", size: 14 }));
  });

  // source estate: VMs on a virtualization slab
  p.push(panel(90, 150, 520, 660, { title: "Current estate", sub: "Virtual machines on the existing hypervisor" }));
  const vms = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) vms.push([28 + c * 160, 96 + r * 108]);
  // dependency lines
  [[0, 4], [1, 5], [4, 8], [5, 9], [2, 6], [3, 4], [7, 11]].forEach(([a, b]) => {
    const [x1, y1] = vms[a], [x2, y2] = vms[b];
    p.push(line(x1 + 66, y1 + 40, x2 + 66, y2 + 40, { stroke: "#937AFF44", sw: 1.4, dash: "3 5" }));
  });
  vms.forEach(([x, y], i) => {
    p.push(rect(x, y, 132, 80, { r: 16, fill: "#12112a", stroke: "#ffffff1a" }));
    p.push(glyphAt("server", x + 14, y + 14, 26, { main: "#B8A8FF", accent: "#937AFF", w: 1.7 }));
    p.push(rect(x + 50, y + 22, 66 - (i % 3) * 12, 7, { r: 3.5, fill: "#ffffff30" }));
    p.push(rect(x + 50, y + 38, 44, 5, { r: 2.5, fill: "#ffffff18" }));
    p.push(rect(x + 14, y + 58, 104, 6, { r: 3, fill: "#937AFF", op: 0.25 + (i % 4) * 0.15 }));
  });
  p.push(rect(20, 538, 480, 44, { r: 12, fill: "#937AFF1a", stroke: "#937AFF66" }));
  p.push(t(260, 566, "VIRTUALIZATION LAYER", { size: 13, fill: "#CFC3FF", weight: 600, anchor: "middle", ls: 1.6 }));
  p.push(rect(20, 592, 480, 44, { r: 12, fill: "#ffffff06", stroke: "#ffffff14" }));
  p.push(t(260, 620, "SHARED STORAGE · NETWORK", { size: 12, fill: C.dim, weight: 600, anchor: "middle", ls: 1.4 }));
  p.push(end());

  // target platforms
  const targets = [["KVM", "Open virtualization", "server"], ["OLVM", "Oracle Linux Virtualization Manager", "layers"], ["OpenStack", "Private cloud", "cloud"], ["Cloud", "AWS · Azure · GCP", "globe"]];
  targets.forEach(([name, sub, g], i) => {
    const y = 150 + i * 168;
    p.push(panel(1010, y, 500, 140, { glow: i === 2 }));
    p.push(badge(24, 34, 72, g, { bg: "#937AFF26", stroke: "#937AFF88" }));
    p.push(t(118, 64, name, { size: 26, fill: C.white, weight: 600 }));
    p.push(t(118, 92, sub, { size: 14, fill: C.dim }));
    p.push(pill(118, 100, 96, 26, "Target", { tone: "primary", size: 11 }));
    p.push(end());
    const d = `M612 ${300 + (i - 1.5) * 34} C 760 ${300 + (i - 1.5) * 34}, 860 ${y + 70}, 1008 ${y + 70}`;
    p.push(path(d, { stroke: "#937AFF", sw: 1.8, dash: "2 9", op: 0.75 }));
    const k = [0.55, 0.3, 0.7, 0.42][i];
    const px = 612 + (1008 - 612) * k;
    const sy = 300 + (i - 1.5) * 34;
    const py = sy + (y + 70 - sy) * (k * k * (3 - 2 * k));
    p.push(token(px - 20, py - 5, 0.95));
  });

  return scene(p.join("\n"));
}
