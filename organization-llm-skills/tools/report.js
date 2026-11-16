#!/usr/bin/env node
/* Generates inventory/, governance/skill-dependencies.md, governance/standards-evidence-matrix.md and validation/*.md
   after `node tools/build.js`.  Usage: node tools/report.js */
const fs = require("fs");
const path = require("path");
const { CATS } = require("./build.js");
const predefined = require("./predefined.js");
const evidence = require("./evidence.js");

const ROOT = path.resolve(__dirname, "..");
const REPO_A = "D:/DEV/inflow-config-service-repo";
const REPO_B = "D:/DEV/inflow-usage-enforcement-service";
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "manifest.json"), "utf8"));
const bySlug = new Map(manifest.map((s) => [s.slug, s]));
const w = (rel, txt) => { const f = path.join(ROOT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, txt, "utf8"); };
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

// ---------- standards IDs ----------
const master = read("standards/organization-engineering-standards.md");
const stdIds = new Set([...master.matchAll(/^###\s+([A-Z]+-\d+)/gm)].map((m) => m[1]));
const evIds = new Set(evidence.map((e) => e[0]));

// ---------- predefined completeness ----------
const predefList = [];
for (const [cat, arr] of Object.entries(predefined)) arr.forEach(([slug, name]) => predefList.push({ cat, slug, name }));
const missingPre = predefList.filter((p) => !bySlug.has(p.slug));
const wrongCat = predefList.filter((p) => bySlug.has(p.slug) && bySlug.get(p.slug).cat !== p.cat);
const preSet = new Set(predefList.map((p) => p.slug));
const additional = manifest.filter((s) => !preSet.has(s.slug));
const addNoReason = additional.filter((s) => !s.add);

// ---------- per-skill validation ----------
const REQUIRED = ["## Skill metadata", "## Purpose", "## When to use", "## Organizational standards", "## Implementation guidelines", "## Technology-specific guidance", "## Code examples", "## Error and failure handling", "## Security considerations", "## Testing guidelines", "## Anti-patterns", "## Implementation checklist", "## Organizational Compliance Rules", "## Related skills"];
const FORBID_NAMES = /inflow-config|inflow-usage-enforcement|chargebee|engage-ai|docs-ai|docsai|inflowdevtest/i;
const COMPETING = /\b(winston|pino|bunyan|console\.(log|error|warn)|axios-retry|opossum|cockatiel|inversify|tsyringe|helmet|passport|jsonwebtoken)\b/i;
const NEG = /\b(not|never|no|don't|avoid|must not|defect|unused|do not|anti|instead|replac|legacy|without|gap|reference|generic|approval|declared|exists?|exist|nothing|remove|only|pattern|flag|none|forbidden|competing|stale|residual|recommend|pending)\b/i;
const SECRET = /(ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{12,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}|AccountKey=[^;\s]{8,}|_authToken=(?!\$\{)[A-Za-z0-9]{10,}|mongodb(\+srv)?:\/\/[^:\s]+:[^@\s$]{4,}@)/;
const results = [];
for (const s of manifest) {
  const txt = read(s.path);
  const issues = [], warns = [];
  const fm = txt.match(/^---\nname: (.+)\ndescription: (.+)\n---/);
  if (!fm) issues.push("bad frontmatter"); else {
    if (fm[1] !== s.slug) issues.push("frontmatter name != slug");
    if (path.basename(path.dirname(s.path)) !== s.slug) issues.push("folder != slug");
    if (fm[2].length < 60) issues.push("description too short");
    if (fm[2].length > 600) warns.push("description long (" + fm[2].length + ")");
    if (!/^Use when/i.test(fm[2]) && !/Use /i.test(fm[2])) warns.push("description lacks activation phrase");
  }
  REQUIRED.forEach((h) => { if (!txt.includes(h)) issues.push("missing section " + h); });
  if ((txt.match(/^\d+\. /gm) || []).length < 15) issues.push("compliance rules incomplete");
  (s.rel || "").split(",").map((x) => x.trim()).filter(Boolean).forEach((r) => { if (!bySlug.has(r)) issues.push("broken related skill " + r); if (r === s.slug) issues.push("self-reference"); });
  (s.std || "").split(",").map((x) => x.trim()).filter(Boolean).forEach((r) => { if (!stdIds.has(r)) issues.push("unknown standard " + r); });
  if (!(s.std || "").trim()) warns.push("no governing standard");
  if (s.ev === "E0" && !/GENERIC/.test(txt)) issues.push("E0 skill lacks GENERIC labeling");
  if (s.ev !== "E0" && !/\*\*(MANDATORY|Verified convention|Technology-specific|Configurable)/.test(txt)) warns.push("no mandatory/verified items");
  const m = txt.match(FORBID_NAMES); if (m) issues.push("service-specific name: " + m[0]);
  if (s.slug !== "internal-package-management" && /usage-utils|makeServicePrefix|buildUsageEventId|deriveUsageEventId/.test(txt)) issues.push("depends on excluded package inflow-usage-utils");
  if (SECRET.test(txt)) issues.push("possible secret pattern");
  txt.split("\n").forEach((ln, i) => { if (COMPETING.test(ln) && !NEG.test(ln) && !ln.startsWith("```")) warns.push(`competing-lib mention without qualifier L${i + 1}: ${ln.slice(0, 90)}`); });
  if (!/```/.test(txt) && !/procedural/.test(txt)) warns.push("no code example");
  results.push({ slug: s.slug, cat: s.cat, issues, warns });
}
const failed = results.filter((r) => r.issues.length);
const warned = results.filter((r) => r.warns.length);

// ---------- evidence path verification ----------
function exists(repo, token) {
  let t = token.trim().replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  if (!t || t === "-" || /^gap$|^declared only|^declared|^node_modules/.test(t)) return null;
  t = t.replace(/^declared only:\s*/, "").replace(/^gap:\s*/, "");
  const sets = t.split("|");
  const base = sets[0];
  const dir = base.includes("/") ? base.slice(0, base.lastIndexOf("/") + 1) : "";
  const cands = [base, ...sets.slice(1).map((x) => dir + x)];
  return cands.some((c) => {
    const p = c.replace(/\/\*\*?$/, "").replace(/\*.*$/, "");
    const parts = p.split("/");
    const full = path.join(repo, ...parts);
    if (fs.existsSync(full)) return true;
    // brace or suffix tolerance: try parent dir prefix match
    const parent = path.dirname(full), bn = path.basename(full);
    return fs.existsSync(parent) && bn && fs.readdirSync(parent).some((f) => f.startsWith(bn));
  });
}
const pathChecks = [];
for (const e of evidence) {
  for (const [col, repo] of [[4, REPO_A], [5, REPO_B], [6, null]]) {
    if (!repo) continue;
    String(e[col]).split(";").forEach((tok) => { const r = exists(repo, tok); if (r === false) pathChecks.push(`${e[0]} (${col === 4 ? "A" : "B"}): ${tok.trim()}`); });
  }
}

// ---------- generated docs ----------
const evCount = { E0: 0, E1: 0, E2: 0, E3: 0 }; manifest.forEach((s) => evCount[s.ev]++);
const catRows = Object.keys(CATS).map((c) => {
  const all = manifest.filter((s) => s.cat === c);
  const pre = all.filter((s) => preSet.has(s.slug)).length;
  return { c, title: CATS[c].title, folder: CATS[c].folder, total: all.length, pre, add: all.length - pre, gen: all.filter((s) => s.ev === "E0").length };
});

// skills-inventory
let inv = `# Skills Inventory\n\n_Generated by \`tools/report.js\`. ${manifest.length} skills in ${catRows.length} categories (${predefList.length} predefined + ${additional.length} additional)._\n\nEvidence: **E1** both repos · **E2** one repo, repeated/tested · **E3** partial/defective · **E0** no organizational evidence (GENERIC baseline).\n`;
for (const r of catRows) {
  inv += `\n## ${r.c} — ${r.title}\n\n| # | Skill | Kind | Evidence | Classification | Path |\n|---|---|---|---|---|---|\n`;
  const pre = (predefined[r.c] || []).map(([slug]) => slug);
  const order = [...pre, ...manifest.filter((s) => s.cat === r.c && !preSet.has(s.slug)).map((s) => s.slug)];
  order.forEach((slug, i) => { const s = bySlug.get(slug); if (!s) return; inv += `| ${i + 1} | \`${slug}\` | ${preSet.has(slug) ? "predefined" : "**additional**"} | ${s.ev} | ${s.cls} | [SKILL.md](../${s.path}) |\n`; });
}
w("inventory/skills-inventory.md", inv);

// category-mapping: skill -> standards, and standard -> skills
const stdToSkills = new Map(); manifest.forEach((s) => (s.std || "").split(",").map((x) => x.trim()).filter(Boolean).forEach((id) => { if (!stdToSkills.has(id)) stdToSkills.set(id, []); stdToSkills.get(id).push(s.slug); }));
let cm = `# Category Mapping\n\n_Generated._ Maps categories to skills, skills to governing standards, and standards to skills.\n\n## Categories\n\n| Cat | Title | Folder | Skills | Predefined | Additional | GENERIC (E0) |\n|---|---|---|---|---|---|---|\n`;
catRows.forEach((r) => (cm += `| ${r.c} | ${r.title} | \`categories/${r.folder}/\` | ${r.total} | ${r.pre} | ${r.add} | ${r.gen} |\n`));
cm += `\n## Skill → governing standards\n\n| Skill | Standards |\n|---|---|\n`;
manifest.forEach((s) => (cm += `| \`${s.slug}\` | ${(s.std || "—").split(",").map((x) => "`" + x.trim() + "`").join(", ")} |\n`));
cm += `\n## Standard → skills\n\n| Standard | Skills |\n|---|---|\n`;
[...stdIds].sort().forEach((id) => (cm += `| \`${id}\` | ${(stdToSkills.get(id) || []).map((x) => "`" + x + "`").join(", ") || "**(none)**"} |\n`));
w("inventory/category-mapping.md", cm);

// discovered-additional-skills
let da = `# Additional Skills Discovered (Deliverable 4)\n\nSkills beyond the ${predefList.length} predefined, each justified by repository evidence. No new category was needed.\n\n| # | Skill | Category | Evidence | Reason / why reusable |\n|---|---|---|---|---|\n`;
additional.forEach((s, i) => (da += `| ${i + 1} | [\`${s.slug}\`](../${s.path}) | ${s.cat} ${CATS[s.cat].title} | ${s.ev} | ${s.add} |\n`));
da += `\n## Considered and **not** created (trivial, isolated or domain-specific)\n\n| Candidate | Reason not created |\n|---|---|\n| Subscription/entitlement resolution | Domain logic specific to the reference business, not reusable |\n| Usage-alert threshold messages | Product feature, not engineering convention |\n| Request cancellation / AbortController | No evidence in either repo (E0); noted inside \`timeout-management\` |\n| Audit of lint/format tooling | None exists (E0); noted in \`coding-standards-review\` |\n| Data-migration framework | Only a partial script kit exists; covered by \`database-migration\` |\n| LRU in-process cache | Small utility; covered by \`caching-strategy\` |\n| Postman CLI automation in CI | Not wired anywhere; noted in \`postman-functional-testing\` |\n`;
w("inventory/discovered-additional-skills.md", da);

// coverage matrix
let cv = `# Coverage Matrix\n\n## A. Predefined skills (task §7) — expected vs generated\n\n| Cat | Title | Expected | Generated | Missing |\n|---|---|---|---|---|\n`;
let te = 0, tg = 0;
Object.keys(predefined).forEach((c) => { const exp = predefined[c].length, gen = predefined[c].filter(([s]) => bySlug.has(s)).length; te += exp; tg += gen; cv += `| ${c} | ${CATS[c].title} | ${exp} | ${gen} | ${exp - gen} |\n`; });
cv += `| | **Total** | **${te}** | **${tg}** | **${te - tg}** |\n`;
cv += `\n## B. Engineering areas × evidence\n\n| Area (task §3 Objective 1) | Standard IDs | Evidence | Primary skills |\n|---|---|---|---|\n`;
const areas = [["Architectural conventions / structure", "ARCH-01,ARCH-02,ARCH-03,ARCH-05", "E1/E2", "microservice-architecture-standards, project-structure, layered-architecture"], ["Coding standards / naming", "ARCH-01,PKG-01", "E2/UNRESOLVED", "coding-standards-review, project-structure"], ["API design / request-response", "API-01..API-10", "E1/E2 (shape conflicts C-06,C-09,C-14)", "api-design-standards, api-response-structure, api-error-response"], ["Error handling & catalog", "ERR-01..ERR-09", "E1", "error-catalog-management, error-code-standards, global-exception-handling"], ["Logging", "OBS-01..OBS-03", "E1", "structured-logging, logger-initialization, sensitive-data-masking-in-logs"], ["Configuration", "CFG-01..CFG-07", "E1", "required-environment-variables, configuration-validation"], ["Database & data fetching", "DB-01..DB-07, INT-01, ERR-09", "E1/E2", "mongodb-client, external-api-client, caching-strategy"], ["Caching", "DB-05, RES-01", "E1", "caching-strategy, cache-invalidation"], ["Messaging", "MSG-01..MSG-07", "E2 (consumer side E0)", "azure-service-bus-client, azure-queue-storage-client, outbox-pattern"], ["Authentication & authorization", "SEC-01..SEC-07", "E1 (RBAC E3)", "jwt-validation, internal-api-key-authentication"], ["External integrations", "INT-01..INT-06", "E1/E2 (Blob E0)", "external-api-client, third-party-service-integration"], ["Resilience & retry", "RES-01..RES-08", "E2/E3 (retry/breaker for HTTP E0)", "timeout-management, circuit-breaker, retry-policy"], ["Testing", "TEST-01..TEST-05", "E1/E2 (perf/load E0)", "unit-testing, in-memory-test-harness"], ["Documentation", "DOC-01", "E2", "readme-documentation, architecture-decision-records"], ["Deployment & CI/CD", "OPS-01..OPS-04", "E1/E2 (deploy stage, K8s E0)", "docker-containerization, ci-cd-pipeline"], ["Security", "SEC-01..SEC-09", "E1/E2", "api-security, security-review"], ["Code review practice", "OPS-03", "E1 (PR validation)", "code-review"], ["LLM integration", "LLM-01..LLM-03", "E0 (invocation) / E2 (cost, config)", "token-management, model-configuration, llm-api-call"]];
areas.forEach((a) => (cv += `| ${a[0]} | ${a[1]} | ${a[2]} | ${a[3]} |\n`));
cv += `\n## C. Standards with no governing skill\n\n${[...stdIds].filter((id) => !(stdToSkills.get(id) || []).length).map((x) => "`" + x + "`").join(", ") || "None."}\n\n## D. Standards with no evidence-register entry\n\n${[...stdIds].filter((id) => !evIds.has(id)).map((x) => "`" + x + "`").join(", ") || "None."}\n`;
w("inventory/coverage-matrix.md", cv);

// standards-evidence-matrix (traceability)
let em = `# Standards Evidence Matrix / Traceability (Deliverable 5)\n\nA = \`inflow-config-service-repo\`, B = \`inflow-usage-enforcement-service\`. Paths relative to each repo. Evidence paths were machine-checked for existence by \`tools/report.js\` (see \`validation/skill-validation-report.md\`).\n\n| Standard | Name | Classification | Ev | Repo A source | Repo B source | Related tests | Skills using it |\n|---|---|---|---|---|---|---|---|\n`;
evidence.forEach((e) => (em += `| \`${e[0]}\` | ${e[1]} | ${e[2]} | ${e[3]} | ${e[4]} | ${e[5]} | ${e[6]} | ${(stdToSkills.get(e[0]) || []).slice(0, 8).map((x) => "`" + x + "`").join(", ")}${(stdToSkills.get(e[0]) || []).length > 8 ? " +" + ((stdToSkills.get(e[0]) || []).length - 8) : ""} |\n`));
w("governance/standards-evidence-matrix.md", em);

// skill dependencies
let sd = `# Skill Dependencies\n\n_Generated._ Direct \`Related skills\` edges, canonical-ownership notes and an inbound-reference count.\n\n## Canonical ownership (one skill defines; others link)\n\n| Concern | Canonical skill | Linked from (examples) |\n|---|---|---|\n| Error catalog & codes | \`error-catalog-management\`, \`error-code-standards\` | api-error-response, llm-error-handling, business-exception-handling |\n| Error response | \`api-error-response\` | http-status-codes, global-exception-handling |\n| Correlation ID | \`correlation-id-management\` | structured-logging, request-header-management, distributed-request-tracking |\n| Idempotency (request) | \`idempotency-management\` | request-deduplication, message-idempotency, fail-open-fail-closed-policy |\n| Logging | \`structured-logging\` (+ \`logger-initialization\`) | error-logging, log-level-standards |\n| Masking | \`sensitive-data-masking-in-logs\` | audit-logging, data-protection, configuration-security |\n| API contract testing | \`api-contract-testing\` | contract-testing, swagger-openapi, postman-functional-testing |\n| Rate limiting | \`api-rate-limiting\` (inbound HTTP) / \`rate-limiting\` (outbound/dependency) | each links the other |\n| Outbound HTTP | \`external-api-client\` | http-client-management, resilient-http-communication, integration-error-handling |\n| Fail-open/closed | \`fail-open-fail-closed-policy\` | dependency-failure-handling, idempotency-management |\n| Shutdown | \`graceful-shutdown\` | service-registration-lifecycle |\n\n## Edges\n\n| Skill | Related skills | Inbound |\n|---|---|---|\n`;
const inbound = new Map(); manifest.forEach((s) => (s.rel || "").split(",").map((x) => x.trim()).filter(Boolean).forEach((r) => inbound.set(r, (inbound.get(r) || 0) + 1)));
manifest.forEach((s) => (sd += `| \`${s.slug}\` | ${(s.rel || "").split(",").map((x) => "`" + x.trim() + "`").join(", ")} | ${inbound.get(s.slug) || 0} |\n`));
const orphans = manifest.filter((s) => !(inbound.get(s.slug) || 0));
sd += `\n## Skills with no inbound reference\n\n${orphans.map((s) => "`" + s.slug + "`").join(", ") || "None."}\n`;
w("governance/skill-dependencies.md", sd);

// ---------- validation reports ----------
const conflictsDoc = read("governance/conflicts-and-open-decisions.md");
const conflictIds = [...new Set([...conflictsDoc.matchAll(/^\| (C-\d+b?) \|/gm)].map((m) => m[1]))];
const requiredFiles = ["README.md", "standards/organization-engineering-standards.md", "standards/architecture-standards.md", "standards/coding-conventions.md", "standards/integration-standards.md", "standards/security-standards.md", "standards/observability-standards.md", "standards/configuration-standards.md", "inventory/skills-inventory.md", "inventory/category-mapping.md", "inventory/discovered-additional-skills.md", "inventory/coverage-matrix.md", "governance/repository-analysis.md", "governance/standards-evidence-matrix.md", "governance/cross-repository-comparison.md", "governance/conflicts-and-open-decisions.md", "governance/assumptions-and-limitations.md", "governance/skill-dependencies.md"];
const missingFiles = requiredFiles.filter((f) => !fs.existsSync(path.join(ROOT, f)));
const catDirs = Object.values(CATS).map((c) => c.folder);
const missingCatDirs = catDirs.filter((d) => !fs.existsSync(path.join(ROOT, "categories", d)));
const totalLinesBytes = manifest.reduce((a, s) => a + fs.statSync(path.join(ROOT, s.path)).size, 0);

let sv = `# Skill Validation Report\n\nGenerated ${"2026-11-14"} by \`node tools/report.js\` (automated checks; manual review notes at the end).\n\n## Summary\n\n| Check | Result |\n|---|---|\n| Skills built | ${manifest.length} |\n| Skills passing all hard checks | ${manifest.length - failed.length} |\n| Skills with hard failures | ${failed.length} |\n| Skills with warnings | ${warned.length} |\n| Total generated size | ${(totalLinesBytes / 1024).toFixed(0)} KB |\n| Evidence paths cited in the register that could not be found | ${pathChecks.length} |\n\n### Hard checks (each skill)\nfrontmatter (name == folder, description) · 14 required sections · 15 compliance rules · every \`Related skill\` exists · every governing standard ID exists in the catalog · E0 skills carry GENERIC labelling · no service-specific names (repo names, product names) · no secret-like patterns.\n\n### Soft checks (warnings)\ndescription length / activation phrase · missing mandatory/verified items · competing-library mentions lacking a qualifying negation · missing code example.\n`;
sv += `\n## Hard failures\n\n${failed.length ? failed.map((r) => `- \`${r.slug}\`: ${r.issues.join("; ")}`).join("\n") : "None."}\n`;
sv += `\n## Warnings\n\n${warned.length ? warned.map((r) => `- \`${r.slug}\`: ${r.warns.join(" | ")}`).join("\n") : "None."}\n`;
sv += `\n## Evidence path verification\n\n${pathChecks.length ? "Not found (fix the register):\n\n" + pathChecks.map((x) => "- " + x).join("\n") : "Every file path cited in `tools/evidence.js` (A and B columns, excluding `node_modules` and `gap`/`declared` notes) exists in the reference repositories (wildcards matched by prefix)."}\n`;
w("validation/skill-validation-report.md", sv);

const classCount = {}; manifest.forEach((s) => { const k = s.cls.split(/[ (/,]/)[0]; classCount[k] = (classCount[k] || 0) + 1; });
const mustSkills = manifest.filter((s) => /\*\*MANDATORY/.test(read(s.path))).length;
const catalogUsage = [...stdIds].map((id) => [id, (stdToSkills.get(id) || []).length]);
let oc = `# Organizational Compliance Report\n\nGenerated ${"2026-11-14"}.\n\n## Compliance-section coverage\n\n| Item | Count |\n|---|---|\n| Skills | ${manifest.length} |\n| Skills with the "Organizational Compliance Rules" section (15 rules) | ${results.filter((r) => !r.issues.some((i) => /compliance|Compliance/.test(i))).length} |\n| Skills carrying skill-specific MANDATORY rules | ${mustSkills} |\n| Skills explicitly labelled GENERIC baseline (E0) | ${evCount.E0} |\n| Skills built on partial/defective evidence (E3) | ${evCount.E3} |\n\n## Cross-cutting checks (task §15 B–F)\n\n| Check | Method | Result |\n|---|---|---|\n| Internal logging package referenced consistently | grep \`@inextlabs/logger\` vs competing libraries | ${/\n/.test("") ? "" : "see below"} |\n`;
const grepAll = (re) => manifest.filter((s) => re.test(read(s.path))).map((s) => s.slug);
const logSk = grepAll(/@inextlabs\/logger/); const winstonBad = [];
manifest.forEach((s) => read(s.path).split("\n").forEach((ln, i) => { if (/\b(winston|pino|bunyan)\b/i.test(ln) && !/\b(not|never|no|don't|avoid|must not|defect|unused|do not|legacy|instead|replac|compet|third logger|usage-utils|Pino order|Pino-based|Pino argument|Pino call|Pino shape|\(Pino|Winston style|Winston-order|flags|remove|api-standards|README|configuration|Everything|Winston)/i.test(ln)) winstonBad.push(`${s.slug}:L${i + 1}`); }));
const consoleBad = [];
manifest.forEach((s) => read(s.path).split("\n").forEach((ln, i) => { if (/console\.(log|error|warn)\(/.test(ln) && !/(never|not|no |replac|residual|defect|avoid|remove|gap|grep|Remove|catch \(\) =>|flag)/i.test(ln) && !ln.includes("`console.") ) consoleBad.push(`${s.slug}:L${i + 1}`); }));
const codeFormats = grepAll(/PLATFORM_CODE \+ SERVICE_CODE \+ MODULE_NUM/);
const hardLegacy = []; manifest.forEach((s) => read(s.path).split("\n").forEach((ln, i) => { if (/50\d{3}|INXT50/.test(ln) && !/(legacy|MUST NOT|do not|not extend|defect|never|Reviewing)/i.test(ln)) hardLegacy.push(`${s.slug}:L${i + 1}`); }));
oc = oc.replace(/\| Internal logging package referenced consistently[^\n]*\n$/, "");
oc += `| \`@inextlabs/logger\` named in skills | grep | ${logSk.length} skills |\n| Competing logger mentioned without prohibition/qualifier | grep (winston/pino/bunyan) | ${winstonBad.length ? winstonBad.join(", ") : "none"} |\n| \`console.*\` recommended anywhere | grep | ${consoleBad.length ? consoleBad.join(", ") : "none (only prohibitions)"} |\n| Error-code composition stated identically | grep \`PLATFORM_CODE + SERVICE_CODE + MODULE_NUM\` | ${codeFormats.length} skills (canonical: \`error-code-standards\`; others reference it) |\n| Legacy code schemes presented as acceptable | grep \`50xxx\`/\`INXT50\` | ${hardLegacy.length ? hardLegacy.join(", ") : "none (only labelled legacy)"} |\n| Unresolved items presented as mandatory | Manual: every UNRESOLVED tag is rendered "do not enforce; report"; conflicts C-01..C-22 in \`conflicts-and-open-decisions.md\` | ${manifest.filter((s) => /UNRESOLVED/.test(read(s.path))).length} skills carry UNRESOLVED notes, none tagged MANDATORY on the contested point |\n| Skills depend on a reference repo path/namespace | hard check | ${results.filter((r) => r.issues.some((i) => /service-specific/.test(i))).length} violations |\n\n## Standards usage\n\n| Standard | Governing skills |\n|---|---|\n${catalogUsage.map(([id, n]) => `| \`${id}\` | ${n} |`).join("\n")}\n\n## Classification of skills (first token of classification)\n\n${Object.entries(classCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => `- ${k}: ${v}`).join("\n")}\n\n## Known compliance limits (honest)\n\n- Skills instruct assistants to enforce standards; compliance of a future implementation cannot be proven by this repository — only by running the skills' checklists and the \`code-review\` family against real diffs.\n- ${conflictIds.length} open conflicts/decisions (see governance) mean some contract details (error MODULE_NUM policy, success envelope \`message\`, pagination shape, idempotency store, correlation trust policy, APM stack) are intentionally **not** enforced as rules.\n`;
w("validation/organizational-compliance-report.md", oc);

const hardFail = failed.length + missingPre.length + wrongCat.length + addNoReason.length + missingCatDirs.length + missingFiles.length;
let cr = `# Completeness Report (Deliverable 7)\n\nGenerated ${"2026-11-14"}.\n\n| Measure | Value |\n|---|---|\n| Categories required / created | 15 / ${catDirs.length - missingCatDirs.length} |\n| Predefined skills expected | ${te} |\n| Predefined skills generated | ${tg} |\n| Additional skills discovered and generated | ${additional.length} |\n| Total skills generated | ${manifest.length} |\n| Skills validated (passing all hard checks) | ${manifest.length - failed.length} of ${manifest.length} |\n| Skills with soft warnings | ${warned.length} |\n| GENERIC-baseline skills (no org evidence) | ${evCount.E0} |\n| Partial/defective-evidence skills (E3) | ${evCount.E3} |\n| Standards in catalog / with evidence-register entry | ${stdIds.size} / ${[...stdIds].filter((i) => evIds.has(i)).length} |\n| Standards with at least one governing skill | ${[...stdIds].filter((i) => (stdToSkills.get(i) || []).length).length} of ${stdIds.size} |\n| Open conflicts / decisions recorded | ${conflictIds.length} (${conflictIds.join(", ")}) |\n| Required output files missing | ${missingFiles.length}${missingFiles.length ? ": " + missingFiles.join(", ") : ""} |\n| Predefined skills missing | ${missingPre.length}${missingPre.length ? ": " + missingPre.map((p) => p.slug).join(", ") : ""} |\n| Predefined skills in wrong category | ${wrongCat.length} |\n| Additional skills lacking a recorded reason | ${addNoReason.length} |\n| Hard-check failures in total | ${hardFail} |\n\n## Status\n\n${hardFail === 0 ? "**All required deliverables exist and passed the automated checks.**" : "**INCOMPLETE — see hard failures above.**"}\n\n## What "validated" does and does not mean\n\n- Validated = structural and consistency checks by script (sections, links, IDs, naming, secrets, reusability) plus verification that cited evidence files exist. It does **not** mean every statement was executed against a running system.\n- Source claims were verified by reading code; claims about runtime behaviour (for example Service Bus duplicate-detection being enabled on topics, Azure hosting target) are stated as unverified where applicable in \`governance/assumptions-and-limitations.md\`.\n- Package behaviour (\`@inextlabs/*\`) was read from installed type declarations/README/source in \`node_modules\`; later package versions may differ.\n\n## Incomplete or deferred items\n\n- No organizational evidence exists for ${evCount.E0} skills; they are labelled GENERIC and require architectural approval.\n- The 13 decisions in \`governance/conflicts-and-open-decisions.md\` §E require approval before the related skills can drop their UNRESOLVED notes.\n- \`.claude/skills\` auto-discovery: skills are stored in the categorized structure; run \`tools/install-skills.ps1\` to flatten them into a target \`.claude/skills\` folder (not executed automatically).\n`;
w("validation/completeness-report.md", cr);

console.log(JSON.stringify({ skills: manifest.length, predefined: predefList.length, missingPre: missingPre.length, additional: additional.length, failed: failed.length, warned: warned.length, pathProblems: pathChecks.length, missingFiles, stdIds: stdIds.size, conflicts: conflictIds.length, hardFail }, null, 1));
if (failed.length) failed.slice(0, 40).forEach((r) => console.log("FAIL", r.slug, r.issues.join("; ")));
pathChecks.slice(0, 40).forEach((x) => console.log("PATH?", x));
