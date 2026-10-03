import { C, badge, brandMark, circle, end, glyphAt, line, panel, path, pill, rect, scene, t } from "../lib.mjs";

/**
 * AIOps services: one overview scene plus one scene per AIOps track.
 * Every scene ends with the same closed loop (signal to evidence) so the eight read as one family.
 * No client names, no numeric metrics: shapes and labels only.
 */

const AMBER = "#FFC66B";
const STAGES = ["Signal", "Decision", "Policy", "Action", "Verify", "Evidence"];

/** the closed-loop strip along the bottom of every scene */
function strip(active = 0) {
  const o = [panel(90, 730, 1420, 100, { r: 20 })];
  STAGES.forEach((s, i) => {
    const x = 40 + i * 238;
    o.push(pill(x, 32, 150, 36, s, { tone: i === active ? "solid" : "dim", size: 13 }));
    if (i < STAGES.length - 1) {
      o.push(line(x + 160, 50, x + 226, 50, { stroke: "#937AFF66", sw: 1.5 }));
      o.push(path(`M${x + 220} 44 L${x + 228} 50 L${x + 220} 56`, { stroke: "#937AFF99", sw: 1.5 }));
    }
  });
  o.push(end());
  return o.join("\n");
}

const arrow = (x, y, len = 40, c = "#937AFF99") =>
  line(x, y, x + len, y, { stroke: c, sw: 1.6 }) + path(`M${x + len - 8} ${y - 6} L${x + len} ${y} L${x + len - 8} ${y + 6}`, { stroke: c, sw: 1.6 });

const tick = (x, y, c = C.ok) => path(`M${x - 6} ${y} L${x - 1.5} ${y + 5} L${x + 7} ${y - 5}`, { stroke: c, sw: 2.2 });
const cross = (x, y, c = C.red) => path(`M${x - 5} ${y - 5} L${x + 5} ${y + 5} M${x + 5} ${y - 5} L${x - 5} ${y + 5}`, { stroke: c, sw: 2.2 });

/** a labelled row card: glyph badge, title, sub line */
function rowCard(x, y, w, h, glyph, title, sub, { tone = "dim" } = {}) {
  const hot = tone === "red";
  return [
    rect(x, y, w, h, { r: 14, fill: hot ? "#FF535312" : "#ffffff08", stroke: hot ? "#FF535366" : "#ffffff14" }),
    badge(x + 12, y + (h - 44) / 2, 44, glyph, hot ? { bg: "#FF535326", stroke: "#FF535380", accent: C.red } : {}),
    t(x + 70, y + h / 2 - 2, title, { size: 17, fill: C.white, weight: 600 }),
    sub ? t(x + 70, y + h / 2 + 18, sub, { size: 12, fill: C.dim }) : "",
  ].join("");
}

/* ------------------------------------------------------------------ overview */

export function aiopsOverview() {
  const p = [];
  const cx = 800, cy = 380;
  const tracks = [
    ["SRE", "pulse"], ["Cybersecurity", "shield-lock"], ["GRC", "checklist"], ["Network", "signal"],
    ["CloudOps", "cloud"], ["FinOps", "bars"], ["DevSecOps", "code"], ["MLOps / LLMOps", "cpu"],
  ];
  const rx = 520, ry = 270;
  const pos = tracks.map((_, i) => {
    const a = (-90 + i * 45) * (Math.PI / 180);
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });
  p.push(circle(cx, cy, 170, { stroke: "#937AFF33", sw: 1.4 }));
  p.push(circle(cx, cy, 235, { stroke: "#937AFF1f", sw: 1.2 }));
  pos.forEach(([x, y]) => p.push(line(cx, cy, x, y, { stroke: "#937AFF55", sw: 1.4, dash: "4 7" })));
  p.push(circle(cx, cy, 120, { fill: "url(#glowD)" }));
  p.push(circle(cx, cy, 92, { fill: "#0B0C17", stroke: "#937AFF99", sw: 1.6 }));
  p.push(brandMark(cx, cy - 6, 70));
  p.push(t(cx, cy + 70, "AIOps platform", { size: 14, fill: C.text, weight: 600, anchor: "middle" }));
  tracks.forEach(([name, g], i) => {
    const [x, y] = pos[i];
    p.push(panel(x - 118, y - 34, 236, 68, { r: 18, glow: i === 0 }));
    p.push(badge(14, 12, 44, g));
    p.push(t(70, 41, name, { size: 17, fill: C.white, weight: 600 }));
    p.push(end());
  });
  p.push(strip(1));
  return scene(p.join("\n"));
}

/* ----------------------------------------------------------------------- SRE */

export function aiopsSre() {
  const p = [];
  p.push(panel(90, 70, 560, 630, { title: "Signals", sub: "Symptoms from many systems at once" }));
  [
    ["pulse", "Latency rising", "Checkout service", "red"],
    ["bars", "Error rate up", "API gateway", "red"],
    ["cube", "Pods restarting", "Orders workload", "amber"],
    ["database", "Queue backlog", "Messaging tier", "amber"],
    ["branch", "Deploy event", "Release pipeline", "dim"],
  ].forEach(([g, a, b, tone], i) => {
    const y = 90 + i * 88;
    p.push(rowCard(30, y, 500, 66, g, a, b, { tone: tone === "red" ? "red" : "dim" }));
    p.push(circle(500, y + 33, 7, { fill: tone === "red" ? C.red : tone === "amber" ? AMBER : C.primary }));
  });
  p.push(pill(30, 548, 230, 32, "Alert noise deduplicated", { tone: "primary", size: 12 }));
  p.push(pill(274, 548, 150, 32, "Topology mapped", { tone: "dim", size: 12 }));
  p.push(end());

  p.push(arrow(654, 385, 32));

  p.push(panel(690, 70, 400, 630, { title: "One incident", sub: "Correlated, explained, owned", glow: true }));
  p.push(rect(26, 90, 348, 140, { r: 16, fill: "#FF53530f", stroke: "#FF535355" }));
  p.push(t(46, 124, "Probable cause", { size: 12, fill: "#FF9C9C", weight: 600, caps: true, ls: 1 }));
  p.push(t(46, 156, "Faulty release", { size: 24, fill: C.white, weight: 600 }));
  p.push(t(46, 184, "Changed shortly before the first symptom", { size: 13, fill: C.dim }));
  p.push(rect(46, 200, 260, 8, { r: 4, fill: "#ffffff14" }));
  p.push(rect(46, 200, 190, 8, { r: 4, fill: "url(#pri)" }));
  [[70, 290], [200, 262], [330, 290]].forEach(([x, y], i, a) => {
    if (i) p.push(line(a[i - 1][0], a[i - 1][1], x, y, { stroke: "#937AFF66", sw: 1.6 }));
  });
  [[70, 290, "Edge"], [200, 262, "Service"], [330, 290, "Data"]].forEach(([x, y, l], i) => {
    p.push(circle(x, y, 22, { fill: "#0B0C17", stroke: i === 1 ? C.red : "#937AFF99", sw: 2 }));
    p.push(t(x, y + 42, l, { size: 12, fill: C.dim, anchor: "middle" }));
  });
  p.push(t(26, 380, "Runbook", { size: 12, fill: C.dim, weight: 600, caps: true, ls: 1 }));
  p.push(rowCard(26, 394, 348, 64, "refresh", "Roll back release", "Allowlisted action", { tone: "dim" }));
  p.push(pill(26, 480, 150, 34, "Policy: allowed", { tone: "ok", size: 13 }));
  p.push(pill(188, 480, 186, 34, "Approve rollback", { tone: "solid", size: 13 }));
  p.push(t(26, 560, "AI recommends. A person approves.", { size: 14, fill: C.text }));
  p.push(t(26, 582, "Nothing runs outside the runbook list.", { size: 14, fill: C.dim }));
  p.push(end());

  p.push(arrow(1094, 385, 32));

  p.push(panel(1130, 70, 380, 630, { title: "Verified recovery", sub: "Service level back inside target" }));
  p.push(rect(26, 90, 328, 200, { r: 14, fill: "#ffffff06", stroke: "#ffffff10" }));
  p.push(rect(26, 150, 328, 80, { r: 4, fill: "#937AFF12" }));
  p.push(path("M36 150 L80 144 L120 156 L160 270 L200 120 L250 130 L300 112 L346 118 L346 290 L36 290Z", { stroke: "none", fill: "url(#areaG)", op: 0.7 }));
  p.push(path("M36 150 L80 144 L120 156 L160 270 L200 120 L250 130 L300 112 L346 118", { stroke: "url(#pri)", sw: 3 }));
  p.push(circle(160, 270, 7, { fill: C.red }));
  p.push(circle(200, 120, 7, { fill: "#fff", stroke: C.primary, sw: 3 }));
  p.push(pill(26, 312, 140, 32, "SLO recovered", { tone: "ok", size: 12 }));
  p.push(t(26, 392, "Evidence kept", { size: 12, fill: C.dim, weight: 600, caps: true, ls: 1 }));
  ["Incident timeline", "Decision and confidence", "Approval record", "Post-action check"].forEach((s, i) => {
    p.push(rect(26, 408 + i * 56, 328, 44, { r: 12, fill: "#ffffff08", stroke: "#ffffff12" }));
    p.push(glyphAt("file", 38, 418 + i * 56, 24, { main: "#E9E4FF", accent: C.primary, w: 1.6 }));
    p.push(t(74, 436 + i * 56, s, { size: 14, fill: C.text }));
    p.push(tick(332, 430 + i * 56));
  });
  p.push(end());

  p.push(strip(4));
  return scene(p.join("\n"));
}

/* -------------------------------------------------------------- Cybersecurity */

export function aiopsSecurity() {
  const p = [];
  p.push(panel(90, 70, 470, 630, { title: "Raw events", sub: "Many sources, one story" }));
  [["eye", "SIEM"], ["cpu", "Endpoint"], ["cloud", "Cloud audit"], ["shield", "Firewall"], ["user", "Identity"]].forEach(([g, n], i) => {
    const y = 90 + i * 100;
    p.push(rect(26, y, 418, 80, { r: 14, fill: "#ffffff08", stroke: "#ffffff14" }));
    p.push(badge(38, y + 18, 44, g));
    p.push(t(96, y + 36, n, { size: 17, fill: C.white, weight: 600 }));
    [0, 1, 2, 3, 4, 5, 6, 7].forEach((k) => {
      const h = [10, 18, 8, 22, 12, 16, 9, 20][(k + i * 3) % 8];
      p.push(rect(96 + k * 26, y + 66 - h, 16, h, { r: 4, fill: (k + i) % 5 === 0 ? C.red : C.primary, op: (k + i) % 5 === 0 ? 0.9 : 0.5 }));
    });
  });
  p.push(end());

  p.push(arrow(564, 385, 32));

  p.push(panel(600, 70, 520, 630, { title: "One incident", sub: "Events collapsed into a prioritised case", glow: true }));
  p.push(pill(26, 84, 130, 30, "Prioritised", { tone: "red", size: 12 }));
  p.push(pill(166, 84, 140, 30, "Case opened", { tone: "primary", size: 12 }));
  p.push(pill(316, 84, 176, 30, "Technique mapped", { tone: "dim", size: 12 }));
  const steps = [["Credential abuse", "Unusual sign-ins"], ["Lateral movement", "New hosts reached"], ["Privilege escalation", "Role changed"], ["Data staging", "Large internal copy"]];
  steps.forEach(([a, b], i) => {
    const y = 170 + i * 118;
    if (i < steps.length - 1) p.push(line(46, y + 24, 46, y + 118, { stroke: "#937AFF55", sw: 2, dash: "3 6" }));
    p.push(circle(46, y, 22, { fill: "#0B0C17", stroke: i === 3 ? C.red : C.primary, sw: 2.2 }));
    p.push(circle(46, y, 7, { fill: i === 3 ? C.red : C.primary }));
    p.push(rect(88, y - 34, 404, 72, { r: 14, fill: "#ffffff08", stroke: "#ffffff14" }));
    p.push(t(106, y - 5, a, { size: 18, fill: C.white, weight: 600 }));
    p.push(t(106, y + 19, b, { size: 13, fill: C.dim }));
  });
  p.push(end());

  p.push(arrow(1124, 385, 32));

  p.push(panel(1160, 70, 350, 630, { title: "Guided response", sub: "Scoped, approved, reversible" }));
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
    const hot = (r === 1 && c === 2) || (r === 2 && c === 3) || (r === 0 && c === 1) || (r === 3 && c === 4);
    p.push(rect(26 + c * 52, 84 + r * 36, 44, 28, { r: 6, fill: hot ? C.primary : "#ffffff0d", op: hot ? 0.85 : 1 }));
  }
  [["Enrich with context", "ok"], ["Contain the workload", "primary"], ["Preserve evidence", "ok"], ["Verify and close", "dim"]].forEach(([s, tone], i) => {
    const y = 262 + i * 76;
    p.push(rect(26, y, 298, 60, { r: 14, fill: "#ffffff08", stroke: tone === "primary" ? "#937AFF80" : "#ffffff14" }));
    p.push(circle(56, y + 30, 14, { fill: tone === "ok" ? "#7BE0B01f" : "#937AFF26", stroke: tone === "ok" ? "#7BE0B066" : "#937AFF80" }));
    if (tone === "ok") p.push(tick(56, y + 30));
    p.push(t(82, y + 36, s, { size: 15, fill: C.white, weight: 600 }));
  });
  p.push(pill(26, 584, 180, 32, "Approval required", { tone: "primary", size: 12 }));
  p.push(end());

  p.push(strip(1));
  return scene(p.join("\n"));
}

/* ----------------------------------------------------------------------- GRC */

export function aiopsGrc() {
  const p = [];
  p.push(panel(90, 70, 660, 630, { title: "Control coverage", sub: "Tested continuously, not once a year" }));
  const cols = ["Cloud", "Kubernetes", "Linux", "IaC"];
  const rows = ["CIS", "NIST", "ISO 27001"];
  cols.forEach((c, i) => p.push(t(180 + i * 116, 104, c, { size: 13, fill: C.dim, weight: 600, anchor: "middle" })));
  const state = [["ok", "ok", "ok", "ok"], ["ok", "bad", "ok", "ok"], ["ok", "ok", "fix", "ok"]];
  rows.forEach((r, ri) => {
    const y = 124 + ri * 76;
    p.push(rect(26, y, 608, 60, { r: 14, fill: "#ffffff08", stroke: "#ffffff12" }));
    p.push(t(44, y + 36, r, { size: 16, fill: C.white, weight: 600 }));
    state[ri].forEach((s, ci) => {
      const cx = 180 + ci * 116, cy = y + 30;
      const col = s === "ok" ? C.ok : s === "bad" ? C.red : C.primary;
      p.push(circle(cx, cy, 17, { fill: col + "22", stroke: col, sw: 1.8 }));
      if (s === "ok") p.push(tick(cx, cy, col));
      else if (s === "bad") p.push(cross(cx, cy, col));
      else p.push(glyphAt("refresh", cx - 9, cy - 9, 18, { main: "#E9E4FF", accent: C.primary, w: 2 }));
    });
  });
  p.push(t(26, 392, "A violation, end to end", { size: 12, fill: C.dim, weight: 600, caps: true, ls: 1 }));
  p.push(rect(26, 408, 190, 120, { r: 16, fill: "#FF53530f", stroke: "#FF535355" }));
  p.push(pill(40, 422, 100, 28, "Before", { tone: "red", size: 12 }));
  p.push(t(40, 482, "Public storage", { size: 15, fill: C.white, weight: 600 }));
  p.push(t(40, 504, "Mapped to controls", { size: 12, fill: C.dim }));
  p.push(arrow(224, 468, 48));
  p.push(rect(280, 408, 190, 120, { r: 16, fill: "#7BE0B00f", stroke: "#7BE0B055" }));
  p.push(pill(294, 422, 110, 28, "After", { tone: "ok", size: 12 }));
  p.push(t(294, 482, "Access restricted", { size: 15, fill: C.white, weight: 600 }));
  p.push(t(294, 504, "Approved fix applied", { size: 12, fill: C.dim }));
  p.push(arrow(478, 468, 36));
  p.push(rect(522, 408, 112, 120, { r: 16, fill: "#937AFF14", stroke: "#937AFF55" }));
  p.push(glyphAt("file", 556, 424, 44, { main: "#E9E4FF", accent: C.primary, w: 1.6 }));
  p.push(t(578, 500, "Evidence", { size: 14, fill: "#CFC3FF", weight: 600, anchor: "middle" }));
  p.push(pill(26, 560, 210, 32, "Exceptions expire on time", { tone: "primary", size: 12 }));
  p.push(pill(248, 560, 170, 32, "Policy as code", { tone: "dim", size: 12 }));
  p.push(end());

  p.push(panel(790, 70, 360, 630, { title: "Risk heatmap", sub: "Updated as the estate changes" }));
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    const v = (r + c) / 8;
    const col = v > 0.7 ? C.red : v > 0.45 ? AMBER : C.primary;
    p.push(rect(26 + c * 62, 96 + r * 62, 54, 54, { r: 10, fill: col, op: 0.18 + v * 0.55 }));
  }
  p.push(circle(26 + 3 * 62 + 27, 96 + 1 * 62 + 27, 14, { fill: "#fff", stroke: C.primary, sw: 4 }));
  p.push(t(26, 440, "New exposure plus a failed control", { size: 14, fill: C.text }));
  p.push(t(26, 462, "raises residual risk automatically.", { size: 14, fill: C.dim }));
  p.push(pill(26, 490, 150, 32, "Treatment tracked", { tone: "primary", size: 12 }));
  p.push(pill(26, 532, 150, 32, "Vendor risk linked", { tone: "dim", size: 12 }));
  p.push(end());

  p.push(panel(1190, 70, 320, 630, { title: "Audit package", sub: "Collected on a schedule" }));
  [0, 1, 2, 3].forEach((i) => {
    const y = 96 + i * 112;
    p.push(rect(26, y, 268, 94, { r: 14, fill: "#ffffff08", stroke: "#ffffff14" }));
    p.push(glyphAt("file", 40, y + 14, 30, { main: "#E9E4FF", accent: C.primary, w: 1.6 }));
    p.push(rect(82, y + 22, 150 - i * 12, 8, { r: 4, fill: "#ffffff30" }));
    p.push(rect(82, y + 42, 110, 8, { r: 4, fill: "#ffffff18" }));
    p.push(pill(40, y + 62, 110, 22, "Integrity set", { tone: "ok", size: 11 }));
    p.push(tick(268, y + 28));
  });
  p.push(pill(26, 560, 170, 34, "Auditor view", { tone: "solid", size: 13 }));
  p.push(end());

  p.push(strip(2));
  return scene(p.join("\n"));
}

/* ------------------------------------------------------------------- Network */

export function aiopsNetwork() {
  const p = [];
  p.push(panel(90, 70, 900, 630, { title: "Topology-aware diagnosis", sub: "Alerts follow the graph, not the dashboard" }));
  const N = { core: [450, 330], hq: [140, 200], dc: [140, 470], cloud: [450, 120], k8s: [450, 505], a: [760, 200], b: [760, 470] };
  const lab = { core: "WAN core", hq: "Head office", dc: "Data center", cloud: "Public cloud", k8s: "Kubernetes", a: "Branch A", b: "Branch B" };
  const glyph = { core: "signal", hq: "building", dc: "server", cloud: "cloud", k8s: "hexagon", a: "building", b: "building" };
  const links = [["core", "hq"], ["core", "dc"], ["core", "cloud"], ["core", "k8s"], ["core", "a"], ["core", "b"]];
  links.forEach(([a, b]) => {
    const bad = b === "b";
    p.push(line(...N[a], ...N[b], { stroke: bad ? C.red : "#937AFF66", sw: bad ? 3 : 2, dash: bad ? "8 7" : "" }));
  });
  Object.entries(N).forEach(([k, [x, y]]) => {
    const root = k === "b", hit = k === "a";
    if (root) p.push(circle(x, y, 52, { stroke: C.red, sw: 1.6, op: 0.45 }));
    p.push(circle(x, y, 36, { fill: "#0B0C17", stroke: root ? C.red : hit ? AMBER : "#937AFF99", sw: 2.2 }));
    p.push(glyphAt(glyph[k], x - 15, y - 15, 30, root ? { main: "#FFD6D6", accent: C.red, w: 1.8 } : { main: "#E9E4FF", accent: C.primary, w: 1.8 }));
    p.push(t(x, y + 62, lab[k], { size: 14, fill: root ? "#FF9C9C" : C.text, weight: 600, anchor: "middle" }));
  });
  p.push(pill(26, 588, 200, 32, "Root cause ranked", { tone: "red", size: 12 }));
  p.push(pill(238, 588, 190, 32, "Symptoms suppressed", { tone: "primary", size: 12 }));
  p.push(pill(440, 588, 200, 32, "Diagnostics run first", { tone: "dim", size: 12 }));
  p.push(end());

  p.push(panel(1030, 70, 480, 300, { title: "Path health forecast", sub: "Act before users notice" }));
  p.push(line(26, 150, 454, 150, { stroke: "#937AFF88", sw: 1.2, dash: "6 6" }));
  p.push(t(34, 142, "Quality threshold", { size: 11, fill: "#B8A8FF", weight: 600 }));
  p.push(path("M26 112 L90 104 L150 118 L210 108 L270 130 L320 170", { stroke: "url(#pri)", sw: 3 }));
  p.push(path("M320 170 L380 214 L454 250", { stroke: C.red, sw: 3, dash: "7 7" }));
  p.push(circle(320, 170, 7, { fill: "#fff", stroke: C.primary, sw: 3 }));
  p.push(pill(26, 252, 230, 30, "Safer path recommended", { tone: "ok", size: 12 }));
  p.push(end());

  p.push(panel(1030, 400, 480, 300, { title: "Alert noise", sub: "Many symptoms, one cause" }));
  for (let i = 0; i < 18; i++) p.push(circle(44 + (i % 6) * 34, 112 + Math.floor(i / 6) * 34, 10, { fill: AMBER, op: 0.55 + (i % 3) * 0.12 }));
  p.push(arrow(252, 146, 60));
  p.push(circle(380, 146, 44, { fill: "#FF535326", stroke: C.red, sw: 2.4 }));
  p.push(glyphAt("target", 362, 128, 36, { main: "#FFD6D6", accent: C.red, w: 1.8 }));
  p.push(pill(26, 232, 120, 30, "Self-heal flow", { tone: "primary", size: 12 }));
  p.push(pill(158, 232, 150, 30, "Approval gated", { tone: "dim", size: 12 }));
  p.push(end());

  p.push(strip(1));
  return scene(p.join("\n"));
}

/* ------------------------------------------------------------------- CloudOps */

export function aiopsCloud() {
  const p = [];
  p.push(panel(90, 70, 1420, 250, { title: "One operations layer", sub: "Inventory, health, change and automation across every estate" }));
  ["AWS", "Azure", "Google Cloud", "Private cloud"].forEach((n, i) => {
    const x = 26 + i * 345;
    p.push(rect(x, 84, 320, 100, { r: 16, fill: "#ffffff08", stroke: "#ffffff14" }));
    p.push(badge(x + 14, 100, 44, i === 3 ? "server" : "cloud"));
    p.push(t(x + 72, 128, n, { size: 18, fill: C.white, weight: 600 }));
    [0, 1, 2, 3, 4].forEach((k) => p.push(rect(x + 72 + k * 34, 148, 26, 10, { r: 5, fill: i === 1 && k === 3 ? AMBER : C.primary, op: 0.7 })));
    p.push(line(x + 160, 184, x + 160, 206, { stroke: "#937AFF66", sw: 1.6 }));
  });
  p.push(rect(26, 206, 1368, 8, { r: 4, fill: "url(#priFade)", op: 0.8 }));
  ["Inventory", "Health", "Changes", "Automation"].forEach((s, i) => p.push(pill(480 + i * 120, 220, 108, 22, s, { tone: i === 1 ? "primary" : "dim", size: 11 })));
  p.push(end());

  p.push(panel(90, 350, 690, 350, { title: "Desired vs actual", sub: "Drift found, reconciled through Git" }));
  const lines = [["instance_type = standard", false], ["public_access = false", false], ["tags = owner, service", false], ["port 22 open to all", true]];
  p.push(t(26, 96, "Desired (code)", { size: 12, fill: C.dim, weight: 600, caps: true, ls: 1 }));
  p.push(t(370, 96, "Actual (cloud)", { size: 12, fill: C.dim, weight: 600, caps: true, ls: 1 }));
  lines.forEach(([s, bad], i) => {
    const y = 108 + i * 44;
    p.push(rect(26, y, 310, 34, { r: 8, fill: "#ffffff08" }));
    p.push(t(40, y + 22, i === 3 ? "port 22 limited to bastion" : s, { size: 13, fill: C.text, weight: 500 }));
    p.push(rect(370, y, 294, 34, { r: 8, fill: bad ? "#FF535320" : "#ffffff08", stroke: bad ? "#FF535366" : "none" }));
    p.push(t(384, y + 22, s, { size: 13, fill: bad ? "#FF9C9C" : C.text, weight: 500 }));
  });
  p.push(pill(26, 300, 180, 32, "Reconcile through IaC", { tone: "solid", size: 12 }));
  p.push(pill(218, 300, 160, 32, "Exception expires", { tone: "dim", size: 12 }));
  p.push(end());

  p.push(panel(800, 350, 350, 350, { title: "Workload placement", sub: "Options compared, with reasons" }));
  [["Public cloud", 0.7, false], ["Private cloud", 0.9, true], ["Second region", 0.55, false]].forEach(([n, v, best], i) => {
    const y = 90 + i * 76;
    p.push(rect(26, y, 298, 62, { r: 14, fill: best ? "#937AFF1f" : "#ffffff08", stroke: best ? "#937AFF99" : "#ffffff12" }));
    p.push(t(42, y + 26, n, { size: 15, fill: C.white, weight: 600 }));
    p.push(rect(42, y + 38, 170, 8, { r: 4, fill: "#ffffff14" }));
    p.push(rect(42, y + 38, 170 * v, 8, { r: 4, fill: "url(#pri)" }));
    if (best) p.push(pill(222, y + 16, 90, 26, "Fits best", { tone: "ok", size: 11 }));
  });
  p.push(end());

  p.push(panel(1170, 350, 340, 350, { title: "Outage blast radius", sub: "Who is affected" }));
  const c = [170, 205];
  [[60, 120], [280, 120], [50, 280], [290, 280], [170, 300]].forEach(([x, y]) => p.push(line(c[0], c[1], x, y, { stroke: "#FF535366", sw: 1.6, dash: "4 6" })));
  [[60, 120], [280, 120], [50, 280], [290, 280], [170, 300]].forEach(([x, y]) => p.push(circle(x, y, 20, { fill: "#0B0C17", stroke: AMBER, sw: 2 })));
  p.push(circle(c[0], c[1], 40, { fill: "#FF535326", stroke: C.red, sw: 2.4 }));
  p.push(circle(c[0], c[1], 58, { stroke: C.red, sw: 1.2, op: 0.4 }));
  p.push(glyphAt("cloud", c[0] - 15, c[1] - 15, 30, { main: "#FFD6D6", accent: C.red, w: 1.8 }));
  p.push(end());

  p.push(strip(3));
  return scene(p.join("\n"));
}

/* -------------------------------------------------------------------- FinOps */

export function aiopsFinops() {
  const p = [];
  p.push(panel(90, 70, 640, 310, { title: "Spend anomaly", sub: "Caught early, attributed, guarded" }));
  p.push(rect(26, 90, 588, 130, { r: 6, fill: "#937AFF12" }));
  p.push(path("M26 190 L90 184 L150 192 L210 180 L270 186 L320 80 L360 188 L430 178 L500 184 L588 176 L588 230 L26 230Z", { stroke: "none", fill: "url(#areaG)", op: 0.6 }));
  p.push(path("M26 190 L90 184 L150 192 L210 180 L270 186 L320 80 L360 188 L430 178 L500 184 L588 176", { stroke: "url(#pri)", sw: 3 }));
  p.push(circle(320, 80, 8, { fill: C.red }));
  p.push(circle(320, 80, 18, { stroke: C.red, sw: 1.6, op: 0.4 }));
  p.push(pill(26, 250, 130, 30, "Attributed", { tone: "primary", size: 12 }));
  p.push(pill(168, 250, 190, 30, "Low-risk guardrail", { tone: "ok", size: 12 }));
  p.push(end());

  p.push(panel(770, 70, 740, 310, { title: "Kubernetes rightsizing", sub: "Requested vs used, SLO protected" }));
  [0.9, 0.75, 0.95, 0.6, 0.85, 0.7].forEach((req, i) => {
    const x = 36 + i * 112, base = 262, used = [0.45, 0.3, 0.55, 0.28, 0.4, 0.36][i];
    p.push(rect(x, base - 150 * req, 40, 150 * req, { r: 8, fill: "#ffffff1c" }));
    p.push(rect(x + 46, base - 150 * used, 40, 150 * used, { r: 8, fill: C.primary, op: 0.85 }));
  });
  p.push(rect(690, 100, 10, 10, { r: 3, fill: "#ffffff30" }));
  p.push(t(642, 110, "Requested", { size: 11, fill: C.dim, anchor: "end" }));
  p.push(rect(690, 124, 10, 10, { r: 3, fill: C.primary }));
  p.push(t(642, 134, "Used", { size: 11, fill: C.dim, anchor: "end" }));
  p.push(end());

  p.push(panel(90, 410, 490, 290, { title: "Showback and unit cost", sub: "Shared cost allocated fairly" }));
  [["Platform", [200, 90, 60]], ["Product", [140, 150, 110]], ["Data", [90, 60, 190]]].forEach(([n, segs], i) => {
    const y = 96 + i * 52;
    p.push(t(26, y + 20, n, { size: 13, fill: C.text, weight: 600 }));
    let x = 110;
    segs.forEach((w, k) => { p.push(rect(x, y, w * 0.8, 28, { r: 6, fill: k === 2 ? AMBER : C.primary, op: k === 0 ? 0.9 : k === 1 ? 0.55 : 0.5 })); x += w * 0.8 + 4; });
  });
  p.push(pill(26, 250 - 4, 170, 28, "Unallocated flagged", { tone: "primary", size: 11 }));
  p.push(end());

  p.push(panel(610, 410, 490, 290, { title: "Commitment scenarios", sub: "Savings with a risk buffer" }));
  p.push(path("M26 220 C120 200 200 150 300 120 S420 100 454 96", { stroke: "#ffffff30", sw: 2.4, dash: "6 6" }));
  p.push(path("M26 230 C120 214 200 180 300 156 S420 140 454 138", { stroke: "#ffffff30", sw: 2.4, dash: "6 6" }));
  p.push(path("M26 224 C120 206 200 164 300 138 S420 120 454 116", { stroke: "url(#pri)", sw: 3.4 }));
  p.push(path("M26 224 C120 206 200 164 300 138 S420 120 454 116 L454 150 C420 156 300 176 200 196 S120 226 26 240Z", { stroke: "none", fill: "url(#areaG)", op: 0.5 }));
  p.push(pill(26, 250 - 4, 150, 28, "Buffer kept", { tone: "ok", size: 11 }));
  p.push(end());

  p.push(panel(1130, 410, 380, 290, { title: "GreenOps", sub: "Cost, performance, carbon" }));
  p.push(line(36, 230, 340, 230, { stroke: "#ffffff22", sw: 1.4 }));
  p.push(line(36, 230, 36, 90, { stroke: "#ffffff22", sw: 1.4 }));
  [[90, 190, 10], [150, 150, 12], [210, 170, 9], [270, 120, 14], [310, 190, 8]].forEach(([x, y, r], i) => p.push(circle(x, y, r, { fill: i === 3 ? C.ok : C.primary, op: i === 3 ? 0.9 : 0.5 })));
  p.push(t(340, 250, "Cost", { size: 11, fill: C.dim, anchor: "end" }));
  p.push(t(26, 84, "Performance", { size: 11, fill: C.dim }));
  p.push(end());

  p.push(strip(2));
  return scene(p.join("\n"));
}

/* ----------------------------------------------------------------- DevSecOps */

export function aiopsDevsecops() {
  const p = [];
  p.push(panel(90, 70, 1420, 270, { title: "Secure release gate", sub: "One governed decision from commit to production" }));
  const stages = ["Commit", "Build", "Test", "Scan", "Sign", "Policy", "Canary", "Release"];
  stages.forEach((s, i) => {
    const x = 26 + i * 172, bad = s === "Sign", off = i > 4;
    p.push(rect(x, 100, 140, 110, { r: 16, fill: bad ? "#FF535314" : "#ffffff08", stroke: bad ? "#FF535388" : "#ffffff14", op: off ? 0.5 : 1 }));
    p.push(circle(x + 70, 140, 20, { fill: bad ? "#FF535326" : off ? "#ffffff0d" : "#7BE0B01f", stroke: bad ? C.red : off ? "#ffffff30" : "#7BE0B066", sw: 1.8 }));
    if (bad) p.push(cross(x + 70, 140));
    else if (!off) p.push(tick(x + 70, 140));
    p.push(t(x + 70, 192, s, { size: 15, fill: off ? C.dim : C.white, weight: 600, anchor: "middle" }));
    if (i < stages.length - 1) p.push(line(x + 142, 155, x + 170, 155, { stroke: "#937AFF66", sw: 1.6 }));
  });
  p.push(pill(26, 230, 170, 28, "Release held", { tone: "red", size: 12 }));
  p.push(pill(208, 230, 230, 28, "Reason shown to the developer", { tone: "dim", size: 12 }));
  p.push(end());

  p.push(panel(90, 350, 460, 350, { title: "Findings to backlog", sub: "Scanner noise ranked by real risk" }));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 14; c++) p.push(circle(36 + c * 29, 100 + r * 26, 8, { fill: C.primary, op: 0.25 + ((r + c) % 4) * 0.1 }));
  p.push(path("M26 186 L434 186 L330 226 L130 226Z", { stroke: "#937AFF55", sw: 1.4, fill: "#937AFF10" }));
  [0, 1, 2].forEach((i) => {
    p.push(rect(130, 240 + i * 28, 200 - i * 36, 20, { r: 10, fill: i === 0 ? C.red : i === 1 ? AMBER : C.primary, op: 0.85 }));
  });
  p.push(end());

  p.push(panel(570, 350, 460, 350, { title: "Supply chain", sub: "Provenance, SBOM, signatures" }));
  p.push(circle(230, 110, 26, { fill: "#0B0C17", stroke: C.primary, sw: 2.2 }));
  p.push(glyphAt("cube", 216, 96, 28, { main: "#E9E4FF", accent: C.primary, w: 1.8 }));
  [[80, 230], [180, 230], [280, 230], [380, 230]].forEach(([x, y], i) => {
    p.push(line(230, 136, x, y - 24, { stroke: i === 2 ? C.red : "#937AFF66", sw: 1.8, dash: i === 2 ? "6 6" : "" }));
    p.push(circle(x, y, 24, { fill: "#0B0C17", stroke: i === 2 ? C.red : "#937AFF99", sw: 2 }));
    p.push(glyphAt(i === 2 ? "lock" : "link", x - 11, y - 11, 22, i === 2 ? { main: "#FFD6D6", accent: C.red, w: 1.8 } : { main: "#E9E4FF", accent: C.primary, w: 1.8 }));
  });
  p.push(pill(26, 300 - 6, 160, 28, "Unsigned blocked", { tone: "red", size: 11 }));
  p.push(end());

  p.push(panel(1050, 350, 460, 350, { title: "Secrets and access", sub: "Found early, fixed safely" }));
  [["Secret in a commit", "Rotated", "ok"], ["Over-broad role", "Scoped down", "ok"], ["Excess permission", "Exception set", "primary"]].forEach(([a, b, tone], i) => {
    const y = 96 + i * 76;
    p.push(rect(26, y, 408, 62, { r: 14, fill: "#ffffff08", stroke: "#ffffff12" }));
    p.push(circle(54, y + 31, 8, { fill: C.red }));
    p.push(t(76, y + 37, a, { size: 15, fill: C.white, weight: 600 }));
    p.push(pill(308, y + 17, 112, 28, b, { tone, size: 11 }));
  });
  p.push(end());

  p.push(strip(2));
  return scene(p.join("\n"));
}

/* ----------------------------------------------------------- MLOps / LLMOps */

export function aiopsMlops() {
  const p = [];
  p.push(panel(90, 70, 700, 630, { title: "Agent trace and guardrails", sub: "Every step recorded, every action checked", glow: true }));
  const steps = [["Prompt received", "pencil", "ok"], ["Plan drafted", "map", "ok"], ["Tool call: read data", "database", "ok"], ["Tool call: change production", "terminal", "bad"], ["Response returned", "arrow", "ok"]];
  steps.forEach(([s, g, st], i) => {
    const y = 92 + i * 100;
    if (i < steps.length - 1) p.push(line(46, y + 56, 46, y + 100, { stroke: "#937AFF55", sw: 2, dash: "3 6" }));
    const bad = st === "bad";
    p.push(circle(46, y + 30, 20, { fill: "#0B0C17", stroke: bad ? C.red : C.primary, sw: 2.2 }));
    p.push(rect(88, y, 586, 62, { r: 14, fill: bad ? "#FF535312" : "#ffffff08", stroke: bad ? "#FF535377" : "#ffffff14" }));
    p.push(glyphAt(g, 102, y + 16, 30, bad ? { main: "#FFD6D6", accent: C.red, w: 1.8 } : { main: "#E9E4FF", accent: C.primary, w: 1.8 }));
    p.push(t(148, y + 38, s, { size: 17, fill: C.white, weight: 600 }));
    if (bad) p.push(pill(500, y + 16, 160, 30, "Policy: denied", { tone: "red", size: 12 }));
    else p.push(rect(540, y + 26, 100 - i * 8, 8, { r: 4, fill: "#937AFF", op: 0.6 }));
  });
  p.push(pill(26, 588, 170, 32, "Trace retained", { tone: "primary", size: 12 }));
  p.push(pill(208, 588, 150, 32, "Cost tracked", { tone: "dim", size: 12 }));
  p.push(pill(370, 588, 200, 32, "Human override logged", { tone: "dim", size: 12 }));
  p.push(end());

  p.push(panel(830, 70, 680, 300, { title: "Model health and drift", sub: "Detect, validate, promote or roll back" }));
  p.push(rect(380, 90, 250, 120, { r: 8, fill: "#FF53530f" }));
  p.push(path("M26 160 L90 150 L150 158 L210 146 L270 152 L330 140 L380 120 L450 90 L520 80 L630 74", { stroke: "url(#pri)", sw: 3 }));
  p.push(path("M26 190 L630 186", { stroke: "#937AFF77", sw: 1.2, dash: "6 6" }));
  p.push(circle(380, 120, 7, { fill: "#fff", stroke: C.red, sw: 3 }));
  p.push(t(392, 108, "Drift", { size: 12, fill: "#FF9C9C", weight: 600 }));
  ["Validate", "Retrain", "Promotion gate"].forEach((s, i) => p.push(pill(26 + i * 150, 232, i === 2 ? 170 : 130, 30, s, { tone: i === 2 ? "solid" : "dim", size: 12 })));
  p.push(end());

  p.push(panel(830, 400, 680, 300, { title: "Inference capacity", sub: "Scale ahead of demand, protect latency" }));
  [60, 78, 66, 96, 124, 150, 176, 160].forEach((h, i) => p.push(rect(30 + i * 76, 232 - h, 52, h, { r: 8, fill: C.primary, op: 0.35 + i * 0.07 })));
  p.push(path("M30 190 C150 180 250 150 360 120 S520 76 640 70", { stroke: C.ok, sw: 3, dash: "7 7" }));
  p.push(t(640, 60, "Forecast demand", { size: 12, fill: "#A8F0CC", weight: 600, anchor: "end" }));
  p.push(end());

  p.push(strip(2));
  return scene(p.join("\n"));
}
