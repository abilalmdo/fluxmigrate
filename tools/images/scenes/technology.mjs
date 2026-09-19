import { C, badge, circle, end, line, panel, pill, rect, scene, t } from "../lib.mjs";

/** Technology: the infrastructure stack as seven layers, tools as chips (text only — no vendor logos). */
export default function technology() {
  const p = [];

  const layers = [
    ["Observability", "pulse", ["Grafana", "Prometheus", "CloudWatch", "Azure Monitor"]],
    ["Linux", "terminal", ["RHEL", "Oracle Linux", "SUSE", "Ubuntu"]],
    ["CI/CD", "branch", ["Jenkins", "Azure DevOps", "Git"]],
    ["Automation", "gear", ["Terraform", "Ansible", "Python", "Bash"]],
    ["Private Cloud", "server", ["OpenStack", "VMware", "KVM", "OLVM"]],
    ["Containers", "cube", ["Kubernetes", "EKS", "OpenShift", "Docker"]],
    ["Cloud", "cloud", ["AWS", "Azure", "GCP"]],
  ];

  const x0 = 130, w = 1340, h = 92, gap = 14, y0 = 56;
  // spine
  p.push(line(x0 + 84, y0 + 40, x0 + 84, y0 + 7 * (h + gap) - gap - 40, { stroke: "#937AFF", sw: 1.6, dash: "2 8", op: 0.5 }));

  layers.forEach(([name, g, tools], i) => {
    const y = y0 + i * (h + gap);
    const hot = i === 6;
    const inset = (6 - i) * 0; // straight stack
    p.push(panel(x0 + inset, y, w, h, { r: 26, glow: hot }));
    p.push(badge(30, 22, 48, g, { bg: hot ? "#937AFF33" : "#937AFF1f", stroke: hot ? "#937AFF" : "#937AFF55" }));
    p.push(t(102, 44, name, { size: 24, fill: C.white, weight: 600 }));
    p.push(t(102, 68, `Layer ${7 - i}`, { size: 12, fill: C.dim, ls: 1 }));
    let x = 440;
    tools.forEach((tool) => {
      const cw = tool.length * 10.2 + 44;
      p.push(pill(x, 28, cw, 38, tool, { tone: hot ? "primary" : "dim", size: 15 }));
      x += cw + 14;
    });
    p.push(end());
  });

  return scene(p.join("\n"));
}
