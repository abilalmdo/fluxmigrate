import { C, badge, circle, end, glyphAt, line, panel, path, pill, rect, scene, t, token } from "../lib.mjs";

/** Home hero: an illustrative "control plane" view — migration corridor, delivery pipeline,
 *  service-level monitoring, clusters, environments and runbooks. No client data, no metrics. */
export default function overview() {
  const parts = [];

  // ---- application window --------------------------------------------------
  parts.push(`<g filter="url(#shadow)"><rect x="56" y="44" width="1488" height="812" rx="30" fill="#0A0A17" stroke="url(#strokeG)" stroke-width="1.4"/></g>`);
  // top bar
  parts.push(rect(56, 44, 1488, 68, { r: 30, fill: "#ffffff06" }));
  parts.push(line(56, 112, 1544, 112, { stroke: "#ffffff14", sw: 1 }));
  [0, 1, 2].forEach((i) => parts.push(circle(92 + i * 22, 78, 6, { fill: ["#ffffff26", "#ffffff1a", "#ffffff12"][i] })));
  ["Estate", "Pipelines", "Reliability"].forEach((label, i) => {
    const x = 300 + i * 132;
    if (i === 0) parts.push(pill(x, 60, 116, 36, label, { tone: "primary", size: 14 }));
    else parts.push(t(x + 58, 84, label, { size: 14, fill: C.dim, anchor: "middle" }));
  });
  // search + avatars
  parts.push(rect(1090, 60, 250, 36, { r: 18, fill: "#ffffff08", stroke: "#ffffff14" }));
  parts.push(glyphAt("search", 1106, 68, 20, { main: "#817E84", accent: "#817E84", w: 1.8 }));
  parts.push(t(1136, 83, "Search environments", { size: 13, fill: C.dim }));
  [0, 1, 2].forEach((i) => {
    parts.push(circle(1430 + i * 28, 78, 15, { fill: ["#4D36D0", "#937AFF", "#2A2160"][i], stroke: "#0A0A17", sw: 3 }));
  });
  parts.push(circle(1518, 78, 15, { fill: "#ffffff10", stroke: "#ffffff22" }));
  parts.push(t(1518, 83, "+", { size: 16, fill: C.text, anchor: "middle", weight: 600 }));

  // ---- sidebar -------------------------------------------------------------
  parts.push(rect(56, 112, 216, 744, { r: 0, fill: "#ffffff04" }));
  parts.push(line(272, 112, 272, 856, { stroke: "#ffffff10", sw: 1 }));
  parts.push(`<g transform="translate(86 140) scale(.9)">${token(0, 0, 1)}${token(0, 15, 1)}${token(0, 30, 1)}</g>`);
  parts.push(t(146, 164, "FluxMigrate", { size: 17, fill: C.white, weight: 600 }));
  const nav = [
    ["compass", "Overview", true],
    ["swap", "Migrations"],
    ["branch", "Pipelines"],
    ["hexagon", "Clusters"],
    ["pulse", "Reliability"],
    ["checklist", "Runbooks"],
    ["users", "Team"],
    ["file", "Documentation"],
    ["gear", "Settings"],
  ];
  nav.forEach(([g, label, active], i) => {
    const y = 214 + i * 54;
    if (active) parts.push(rect(76, y - 6, 176, 42, { r: 12, fill: "#937AFF22", stroke: "#937AFF55" }));
    parts.push(glyphAt(g, 92, y + 2, 22, { main: active ? "#E9E4FF" : "#817E84", accent: active ? "#937AFF" : "#817E84", w: 1.7 }));
    parts.push(t(126, y + 20, label, { size: 15, fill: active ? C.white : C.dim, weight: active ? 600 : 500 }));
  });

  // ---- migration corridor (large panel) ------------------------------------
  parts.push(panel(300, 140, 760, 410, { title: "Migration corridor", sub: "Workloads moving from the source estate to the target platform" }));
  parts.push(t(30, 100, "SOURCE ESTATE", { size: 11, fill: C.dim, weight: 600, ls: 1.4 }));
  parts.push(t(730, 100, "MODERN PLATFORM", { size: 11, fill: "#B8A8FF", weight: 600, ls: 1.4, anchor: "end" }));
  // source racks
  for (let i = 0; i < 5; i++) {
    const y = 118 + i * 46;
    const live = [1, 0, 1, 1, 0][i];
    parts.push(rect(28, y, 204, 36, { r: 12, fill: "#ffffff07", stroke: "#ffffff16" }));
    parts.push(circle(48, y + 18, 5, { fill: live ? "#937AFF" : "#ffffff30" }));
    parts.push(rect(64, y + 12, 96 - (i % 3) * 14, 6, { r: 3, fill: "#ffffff28" }));
    parts.push(rect(64, y + 22, 54, 4, { r: 2, fill: "#ffffff16" }));
    parts.push(rect(196, y + 12, 22, 12, { r: 6, fill: live ? "#937AFF33" : "#ffffff10" }));
  }
  // target platform
  parts.push(`<g><rect x="516" y="112" width="218" height="272" rx="20" fill="#937AFF12" stroke="#937AFF88" stroke-width="1.4"/><rect x="516" y="112" width="218" height="272" rx="20" fill="url(#glowD)" opacity=".5"/></g>`);
  const nodes = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) nodes.push([556 + c * 64, 158 + r * 64, (r * 3 + c) % 5 !== 3]);
  nodes.forEach(([x, y], i) => {
    if (i % 3 < 2) parts.push(line(x, y, x + 64, y, { stroke: "#937AFF44", sw: 1.2 }));
    if (i < 9) parts.push(line(x, y, x, y + 64, { stroke: "#937AFF44", sw: 1.2 }));
  });
  nodes.forEach(([x, y, on]) => {
    if (on) parts.push(circle(x, y, 13, { fill: "#937AFF", op: 0.16 }));
    parts.push(circle(x, y, on ? 6.5 : 5, { fill: on ? "#B9A8FF" : "#ffffff26" }));
  });
  // corridors + tokens
  const flows = [
    [0, 118, 0, 176, 0.34],
    [0, 210, 0, 236, 0.58],
    [0, 256, 0, 290, 0.8],
    [0, 302, 0, 342, 0.22],
  ];
  flows.forEach(([x1, y1, , y2, k], i) => {
    const d = `M232 ${y1 + 18} C 340 ${y1 + 18}, 400 ${y2}, 512 ${y2}`;
    parts.push(path(d, { stroke: "#937AFF", sw: 1.6, dash: "2 9", op: 0.75 }));
    const px = 232 + (512 - 232) * k;
    const py = (y1 + 18) + (y2 - (y1 + 18)) * (k * k * (3 - 2 * k));
    parts.push(`<g opacity="${0.95 - i * 0.08}">${token(px - 20, py - 5, 0.9)}</g>`);
  });
  // phase ribbon
  ["Discover", "Assess", "Migrate", "Validate"].forEach((p, i) => {
    parts.push(pill(28 + i * 118, 370, 106, 30, p, { tone: i === 2 ? "primary" : "dim", size: 12 }));
  });
  parts.push(end());

  // ---- delivery pipeline (top right) ---------------------------------------
  parts.push(panel(1084, 140, 436, 194, { title: "Delivery pipeline" }));
  const stages = [["Commit", "branch"], ["Build", "cube"], ["Verify", "shield-check"], ["Release", "rocket"]];
  stages.forEach(([label, g], i) => {
    const x = 56 + i * 108;
    if (i < 3) parts.push(line(x + 24, 106, x + 84, 106, { stroke: i < 2 ? "#937AFF" : "#ffffff30", sw: 2, dash: i === 2 ? "3 6" : "" }));
    parts.push(circle(x, 106, 28, { fill: i < 3 ? "#937AFF1f" : "#ffffff08", stroke: i < 3 ? "#937AFF" : "#ffffff30", sw: 1.6 }));
    parts.push(glyphAt(g, x - 12, 94, 24, { main: i < 3 ? "#E9E4FF" : "#817E84", accent: i < 3 ? "#937AFF" : "#817E84", w: 1.7 }));
    parts.push(t(x, 160, label, { size: 13, fill: i < 3 ? C.white : C.dim, anchor: "middle", weight: 600 }));
  });
  parts.push(end());

  // ---- service level (bottom right) ----------------------------------------
  parts.push(panel(1084, 350, 436, 200, { title: "Service level", sub: "Held through an incident and recovery" }));
  parts.push(rect(24, 84, 388, 60, { r: 6, fill: "#937AFF12" }));
  parts.push(line(24, 84, 412, 84, { stroke: "#937AFF66", sw: 1, dash: "4 5" }));
  parts.push(line(24, 144, 412, 144, { stroke: "#937AFF66", sw: 1, dash: "4 5" }));
  const sl = "M28 112 L66 106 L104 118 L142 100 L180 110 L206 170 L232 96 L270 104 L308 92 L346 98 L384 88 L408 94";
  parts.push(path(sl, { stroke: "url(#pri)", sw: 2.6 }));
  parts.push(path(sl + " L408 176 L28 176 Z", { stroke: "none", fill: "url(#areaG)", op: 0.5 }));
  parts.push(circle(206, 170, 6, { fill: C.red }));
  parts.push(circle(206, 170, 12, { stroke: C.red, sw: 1.4, op: 0.4 }));
  parts.push(circle(232, 96, 5.5, { fill: "#fff", stroke: "#937AFF", sw: 2.5 }));
  parts.push(t(206, 190, "Incident", { size: 11, fill: "#FF9C9C", anchor: "middle", weight: 600 }));
  parts.push(t(250, 86, "Recovery", { size: 11, fill: "#CFC3FF", weight: 600 }));
  parts.push(end());

  // ---- bottom row -----------------------------------------------------------
  // clusters
  parts.push(panel(300, 566, 396, 262, { title: "Clusters", sub: "Kubernetes · OpenShift" }));
  const hex = (cx, cy, r) =>
    [0, 1, 2, 3, 4, 5].map((k) => `${(cx + r * Math.cos(((-90 + 60 * k) * Math.PI) / 180)).toFixed(1)},${(cy + r * Math.sin(((-90 + 60 * k) * Math.PI) / 180)).toFixed(1)}`).join(" ");
  for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
    const x = 50 + c * 49 + (r % 2 ? 24 : 0), y = 110 + r * 42;
    if (x > 342) continue;
    const lvl = [0.9, 0.55, 0.3, 0.75, 0.15, 0.6, 0.4][(r * 7 + c) % 7];
    parts.push(`<polygon points="${hex(x, y, 21)}" fill="#937AFF" fill-opacity="${(lvl * 0.42).toFixed(2)}" stroke="#937AFF" stroke-opacity="${(0.25 + lvl * 0.6).toFixed(2)}" stroke-width="1.3"/>`);
  }
  parts.push(end());

  // environments
  parts.push(panel(712, 566, 396, 262, { title: "Environments", sub: "Provisioned from code" }));
  [["Development", "Provisioned", "primary"], ["Staging", "Validated", "primary"], ["Production", "Live", "ok"]].forEach(([n, s, tone], i) => {
    const y = 84 + i * 56;
    parts.push(rect(24, y, 348, 44, { r: 14, fill: "#ffffff06", stroke: "#ffffff12" }));
    parts.push(glyphAt("server", 40, y + 10, 24, { main: "#B8A8FF", accent: "#937AFF", w: 1.7 }));
    parts.push(t(76, y + 27, n, { size: 15, fill: C.white, weight: 600 }));
    parts.push(pill(262, y + 9, 96, 26, s, { tone, size: 12 }));
  });
  parts.push(end());

  // runbooks
  parts.push(panel(1124, 566, 396, 262, { title: "Runbooks", sub: "Knowledge that stays with you" }));
  [["Failover procedure", true], ["Capacity review", true], ["Restore from backup", true], ["Certificate rotation", false], ["Post-incident review", false]].forEach(([n, done], i) => {
    const y = 82 + i * 34;
    parts.push(circle(36, y + 10, 9, { fill: done ? "#937AFF33" : "none", stroke: done ? "#937AFF" : "#ffffff30", sw: 1.5 }));
    if (done) parts.push(path(`M31.5 ${y + 10.2} l3 3 l5.5 -6`, { stroke: "#CFC3FF", sw: 1.8 }));
    parts.push(t(58, y + 15, n, { size: 14, fill: done ? C.text : C.dim, weight: 500 }));
  });
  parts.push(end());

  return scene(parts.join("\n"));
}
