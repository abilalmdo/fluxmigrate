import { C, badge, circle, end, glyphAt, line, panel, path, pill, rect, scene, t } from "../lib.mjs";

/** DevOps & Platform: a delivery pipeline board, infrastructure-as-code and a developer self-service platform. */
export default function devops() {
  const p = [];

  const stages = [
    ["Commit", "branch", "Source control"],
    ["Build", "cube", "Container image"],
    ["Test", "checklist", "Automated checks"],
    ["Secure", "shield-check", "Policy gates"],
    ["Release", "rocket", "Progressive rollout"],
  ];
  stages.forEach(([name, g, sub], i) => {
    const x = 90 + i * 290;
    const cur = i === 4;
    if (i < 4) {
      p.push(line(x + 260, 190, x + 290, 190, { stroke: "#937AFF", sw: 2 }));
      p.push(path(`M${x + 282} 182l8 8-8 8`, { stroke: "#937AFF", sw: 2 }));
    }
    p.push(panel(x, 80, 260, 240, { glow: cur }));
    p.push(badge(24, 24, 52, g, { bg: cur ? "#937AFF33" : "#937AFF1f", stroke: cur ? "#937AFF" : "#937AFF55" }));
    p.push(t(24, 112, name, { size: 22, fill: C.white, weight: 600 }));
    p.push(t(24, 136, sub, { size: 13, fill: C.dim }));
    [0, 1, 2].forEach((r) => {
      const y = 164 + r * 24;
      const done = i < 4 || r < 1;
      p.push(circle(30, y + 6, 6, { fill: done ? "#937AFF33" : "none", stroke: done ? "#937AFF" : "#ffffff30", sw: 1.4 }));
      if (done) p.push(path(`M27 ${y + 6.2} l2.2 2.2 l4 -4.4`, { stroke: "#CFC3FF", sw: 1.5 }));
      p.push(rect(48, y + 2, 120 - r * 18, 8, { r: 4, fill: "#ffffff20" }));
    });
    p.push(end());
  });

  // infrastructure as code
  p.push(panel(90, 360, 640, 450, { title: "Infrastructure as Code", sub: "Version-controlled, reviewed, reproducible" }));
  p.push(rect(24, 78, 592, 348, { r: 14, fill: "#05040f", stroke: "#ffffff10" }));
  const colors = ["#937AFF", "#CFC3FF", "#817E84", "#B8A8FF", "#5A4BD0"];
  const code = [
    [[0, 90, 0], [110, 70, 1]],
    [[24, 120, 2], [154, 90, 3]],
    [[24, 70, 2], [104, 150, 4], [264, 40, 3]],
    [[48, 140, 1], [200, 60, 3]],
    [[48, 90, 1], [150, 200, 0]],
    [[24, 30, 2]],
    [[0, 100, 0], [120, 100, 1]],
    [[24, 160, 2], [196, 80, 3]],
    [[24, 110, 2], [144, 130, 4]],
    [[48, 190, 1]],
    [[24, 30, 2]],
    [[0, 30, 0]],
  ];
  code.forEach((segs, i) => {
    const y = 100 + i * 26;
    p.push(t(44, y + 9, String(i + 1), { size: 11, fill: "#ffffff30", anchor: "end" }));
    segs.forEach(([dx, w, c]) => p.push(rect(64 + dx, y, w, 10, { r: 5, fill: colors[c], op: c === 2 ? 0.55 : 0.85 })));
  });
  p.push(end());

  // developer platform
  p.push(panel(750, 360, 760, 450, { title: "Developer self-service", sub: "Environments on demand, on a standard platform" }));
  p.push(pill(24, 80, 180, 40, "Create environment", { tone: "solid", size: 14 }));
  p.push(pill(216, 80, 140, 40, "Deploy service", { tone: "primary", size: 14 }));
  ["Namespaces", "Pipelines", "Secrets"].forEach((label, i) => {
    const x = 24 + i * 236;
    p.push(rect(x, 150, 220, 130, { r: 16, fill: "#ffffff06", stroke: "#ffffff14" }));
    p.push(t(x + 18, 182, label, { size: 15, fill: C.white, weight: 600 }));
    for (let n = 0; n < 4; n++) p.push(rect(x + 18 + n * 46, 204, 36, 36, { r: 10, fill: "#937AFF", op: [0.5, 0.28, 0.65, 0.18][n], stroke: "#937AFF66" }));
    p.push(rect(x + 18, 252, 130, 6, { r: 3, fill: "#ffffff1c" }));
  });
  ["Docker & Kubernetes", "OpenShift", "Terraform", "Ansible", "Jenkins", "Azure DevOps"].forEach((s, i) => {
    const x = 24 + (i % 3) * 236, y = 304 + Math.floor(i / 3) * 52;
    p.push(pill(x, y, 220, 38, s, { tone: "dim", size: 13 }));
  });
  p.push(end());

  return scene(p.join("\n"));
}
