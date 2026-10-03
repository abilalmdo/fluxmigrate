/**
 * Per-service detail for the eight AIOps track pages (/aiops-<track>.html), index-aligned with
 * `aiops.tracks[n].services`. Capabilities and example scenarios come from the Enterprise AIOps
 * Portfolio specifications. Scenarios are demonstrations on synthetic or lab data, not client results.
 */

export type ServiceDetail = { capabilities: string[]; scenario: string };

export const serviceDetail: Record<string, ServiceDetail[]> = {
  sre: [
    { capabilities: ["Telemetry normalization", "Alert deduplication", "Topology-aware root-cause analysis", "SLO and error budget tracking", "Incident timeline", "Runbook automation"], scenario: "Inject a faulty release, correlate several symptoms into one incident, approve a rollback and verify SLO recovery." },
    { capabilities: ["Incident classification", "Confidence and risk scoring", "Runbook registry", "Approvals", "Pre- and post-checks", "Rollback", "Audit trail"], scenario: "Force a service failure, recommend a runbook, approve it, recover the service and show the evidence." },
    { capabilities: ["Forecasting", "Anomaly detection", "Capacity runway", "Error-budget projection", "Predictive alerts", "Model evaluation"], scenario: "Simulate disk and traffic growth and alert before the real failure threshold is reached." },
    { capabilities: ["Git and pull-request analysis", "Terraform and Kubernetes diff", "Explainable risk scores", "Canary analysis", "Change-to-incident correlation"], scenario: "Release a bad version, detect the canary regression and roll back automatically." },
    { capabilities: ["DR plan registry", "Backup and restore validation", "Chaos experiments", "Failover and failback", "RTO and RPO measurement", "Evidence reporting"], scenario: "Fail a primary site, recover to the secondary, validate the data and generate DR evidence." },
  ],
  security: [
    { capabilities: ["Security event normalization", "Correlation", "MITRE ATT&CK mapping", "Case management", "Enrichment", "Response playbooks"], scenario: "Simulate credential abuse plus lateral movement and collapse the raw events into one incident." },
    { capabilities: ["Scanner ingestion", "Asset context", "CVE and EPSS interface", "Attack-path context", "SLA tracking", "Remediation workflow"], scenario: "Ingest many findings and surface the few that are most urgent in context." },
    { capabilities: ["Login analytics", "Behavioral baselines", "Impossible-travel simulation", "Privilege-change detection", "Risk scoring"], scenario: "Simulate an abnormal login and a privilege escalation, raise a UEBA incident and respond." },
    { capabilities: ["Runtime signals (Falco)", "Kubernetes audit events", "Cloud events", "Identity context", "Network-policy context", "Containment policy"], scenario: "Run a malicious-container simulation and quarantine the workload while preserving evidence." },
    { capabilities: ["IOC extraction", "Sandbox result parsing", "Reputation connectors", "Risk scoring", "Analyst queue", "Case summary"], scenario: "Submit a simulated phishing message, extract the IOCs and generate an investigation case." },
  ],
  grc: [
    { capabilities: ["Control library", "CIS, NIST and ISO mapping", "Continuous scanning", "Drift detection", "Exception workflow", "Dashboards"], scenario: "Introduce a known violation, map it to controls, remediate it and show before and after evidence." },
    { capabilities: ["Evidence catalog", "Collector jobs", "Integrity metadata", "Control tests", "Retention", "Auditor view"], scenario: "Generate an audit package with timestamped evidence and automated test results." },
    { capabilities: ["Risk model", "Asset context", "Control effectiveness", "Trend analysis", "Heatmap", "Treatment tracking"], scenario: "Add a new exposure and failed controls, and watch residual risk rise automatically." },
    { capabilities: ["OPA and Kyverno policy", "Policy lifecycle", "Waivers", "Git versioning", "Drift dashboard", "Policy tests"], scenario: "Block a privileged deployment, approve a temporary exception and show it expire automatically." },
    { capabilities: ["Vendor inventory", "Questionnaires", "Evidence tracking", "SLA metrics", "Control mapping", "Renewal dashboard"], scenario: "Let vendor evidence expire and show risk, remediation and renewal status update." },
  ],
  network: [
    { capabilities: ["Telemetry, flow and log ingestion", "Topology graph", "Path health", "Event correlation", "NOC dashboard", "Automation catalog"], scenario: "Degrade a site link and show topology-aware diagnosis and automated diagnostics." },
    { capabilities: ["Path telemetry", "Baselines", "Degradation forecast", "SLA scoring", "Route recommendation", "Capacity trends"], scenario: "Degrade the preferred path and proactively switch a simulated route." },
    { capabilities: ["Dependency graph", "Symptom suppression", "Root-cause ranking", "Diagnostics", "Change correlation", "Verification"], scenario: "Create one upstream failure that causes many alerts and identify the actual root cause." },
    { capabilities: ["Policy ingestion", "Diff", "Conflict and shadow-rule detection", "Exposure analysis", "History", "Approvals"], scenario: "Add an overly broad rule, detect it and revert it through an approved workflow." },
    { capabilities: ["CNI health", "CoreDNS", "Ingress telemetry", "Service graph", "NetworkPolicy visibility", "Mesh errors"], scenario: "Introduce a bad NetworkPolicy or DNS issue and diagnose and remediate it." },
  ],
  cloud: [
    { capabilities: ["Multi-cloud inventory", "Health normalization", "Ownership and tagging", "Service map", "Incident view", "Automation catalog"], scenario: "Show several provider environments in one control plane and run one cross-cloud workflow." },
    { capabilities: ["Resource health", "Failure classification", "Remediation catalog", "Approval policy", "Post-checks", "Audit"], scenario: "Simulate unhealthy compute or application infrastructure and demonstrate recovery." },
    { capabilities: ["Desired-versus-actual state", "Terraform drift", "Tagging", "IAM and network drift", "Exceptions", "History"], scenario: "Create console drift and restore the intended state through Git and IaC." },
    { capabilities: ["Capacity model", "Workload profile", "Constraints", "Availability scoring", "Latency", "Explainability"], scenario: "Submit a workload profile and compare placement options across private and public cloud." },
    { capabilities: ["Service catalog", "Dependency graph", "Event ingestion", "Impact analysis", "Owner routing", "Contingency view"], scenario: "Fail a shared dependency and show every affected application and the contingency actions." },
  ],
  finops: [
    { capabilities: ["Billing ingestion", "Baselines", "Anomaly detection", "Attribution", "Budget policy", "Cost incidents"], scenario: "Inject a synthetic spend spike and show detection, attribution and a low-risk guardrail." },
    { capabilities: ["Workload cost model", "Usage percentiles", "Rightsizing", "Waste dashboard", "SLO guardrails", "Savings estimate"], scenario: "Analyze an over-provisioned workload, apply a safe change and compare efficiency." },
    { capabilities: ["Usage forecast", "Coverage and utilization", "Scenarios", "Break-even", "Risk buffer", "Executive dashboard"], scenario: "Replay synthetic long-term usage and compare commitment scenarios." },
    { capabilities: ["Allocation rules", "Shared-cost distribution", "Unit cost", "Team and product dashboards", "Forecast", "Data quality"], scenario: "Allocate a synthetic bill and show unit economics plus unallocated-spend warnings." },
    { capabilities: ["Cost-performance model", "Utilization score", "Carbon input", "Scheduling", "Region comparison", "SLO guardrails"], scenario: "Evaluate a batch workload across regions and times and show the trade-offs." },
  ],
  devsecops: [
    { capabilities: ["Pipeline telemetry", "Failure taxonomy", "Log summarization", "Flaky-test detection", "Duration anomalies", "Root-cause analysis"], scenario: "Trigger different pipeline failures and show classification plus a safe retry." },
    { capabilities: ["Multi-scanner ingestion", "Deduplication", "Reachability and context", "Risk ranking", "Ownership", "SLA"], scenario: "Ingest several scanner outputs and produce one prioritized developer backlog." },
    { capabilities: ["SBOM ingestion", "Provenance verification", "Dependency graph", "Artifact policy", "Signatures", "Dashboard"], scenario: "Introduce an unapproved dependency or unsigned artifact and block the build." },
    { capabilities: ["Release scorecard", "Policy gate", "Canary", "Security gate", "Change risk", "Approvals"], scenario: "Compare a healthy release with a risky one and show different promotion outcomes." },
    { capabilities: ["Secret scanning", "IAM diff", "RBAC analysis", "Least privilege", "Exceptions", "Access-risk timeline"], scenario: "Commit a fake secret and a broad RBAC change, then detect and safely remediate both." },
  ],
  mlops: [
    { capabilities: ["Endpoint SLOs", "Latency and errors", "Feature checks", "Model versioning", "Incident correlation", "Rollback"], scenario: "Deploy a degraded model version, detect the regression and roll back." },
    { capabilities: ["Prompt metadata", "Token and cost tracking", "Tool tracing", "Agent timeline", "Policy violations", "Feedback"], scenario: "Have an agent attempt a disallowed action and show policy interception plus the trace." },
    { capabilities: ["GPU utilization", "Queue depth", "Latency and throughput", "Demand forecast", "Batching", "Capacity recommendations"], scenario: "Generate an inference spike and scale predictively while preserving latency." },
    { capabilities: ["Feature drift", "Prediction drift", "Performance metrics", "Training trigger", "Model registry", "Promotion gate"], scenario: "Shift the synthetic input distribution, detect drift, retrain and promote conditionally." },
    { capabilities: ["Model inventory", "Prompt versioning", "Policy checks", "PII tests", "Red-team harness", "Risk register"], scenario: "Run a prompt-injection or policy-violation test and show blocking plus evidence." },
  ],
};

/** what every AIOps engagement hands over (from the portfolio build contract) */
export const deliverables = [
  { icon: "observability", title: "KPI dashboards", text: "Ingestion health, processing latency, decisions, automation success and failure, overrides and false positives where measurable." },
  { icon: "operations", title: "Runbooks and policies", text: "Validated, allowlisted actions with approval rules and least-privilege identities." },
  { icon: "resilience", title: "Failure-path tests", text: "Healthy, false-positive, policy-blocked, automation-failure, rollback and telemetry-source-failure cases, all exercised." },
  { icon: "decisions", title: "Audit evidence and demo", text: "Retained evidence for every decision, a short demo script, and setup, troubleshooting and cleanup documentation." },
];

/** common technology base named in the portfolio specifications */
export const stack = [
  "OpenTelemetry", "Prometheus", "Grafana", "Loki / Tempo", "Kubernetes", "Helm", "Terraform", "Ansible",
  "Argo CD / Rollouts", "Python / FastAPI", "PostgreSQL", "Redis / NATS / Kafka", "Trivy · Semgrep · Checkov",
];
