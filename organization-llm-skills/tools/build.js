#!/usr/bin/env node
/* Build organization-llm-skills from tools/data/catNN.txt.  Usage: node tools/build.js */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(__dirname, "data");

const CATS = {
  "01": { folder: "01-microservice-architecture-foundations", title: "Microservice Architecture & Foundations",
    purpose: "Common architectural and structural standards.",
    sec: ["Never place secrets, tokens or connection strings in source, logs, examples or fixtures (CFG-07, OBS-03)."],
    test: ["Where import-boundary/lint tooling exists, enforce layer rules in CI; otherwise add an architecture test or review-checklist item for each rule."],
    fail: ["Bootstrap failures must stop the process with a non-zero exit and a secret-free log (ARCH-03)."] },
  "02": { folder: "02-api-development-design", title: "API Development & Design",
    purpose: "Standardized API implementation and design practices.",
    sec: ["Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07)."],
    test: ["Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response."],
    fail: ["Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06)."] },
  "03": { folder: "03-request-context-idempotency", title: "Request Context & Idempotency",
    purpose: "Request identification and safe request processing.",
    sec: ["Treat inbound identifiers as untrusted input: validate charset/length; never let body or query override context (CTX-01)."],
    test: ["Test with and without inbound identifiers, with malformed values, across async boundaries (ALS), and on outbound calls/messages."],
    fail: ["Context helpers never throw when context is missing; they return a documented fallback (`unknown`) and the request continues (CTX-01)."] },
  "04": { folder: "04-error-exception-management", title: "Error & Exception Management",
    purpose: "Error definitions, exceptions and failure propagation.",
    sec: ["`AppError.details` is public; internal causes live only on `Error.cause` and in logs (ERR-07)."],
    test: ["Assert code, numericCode, HTTP status and envelope for each catalog entry touched; assert that unknown errors become `UNHANDLED_ERROR` with no leaked detail."],
    fail: ["Catch only where you can add context or translate; otherwise let the error propagate to the global handler (ERR-06)."] },
  "05": { folder: "05-configuration-environment", title: "Configuration & Environment Management",
    purpose: "Configuration across development, testing, staging and production.",
    sec: ["Secrets only from environment/secret store; never log values; fail closed when a required secret is missing outside local/dev (CFG-04)."],
    test: ["Test valid, missing, malformed and environment-specific configurations; reset any memoized config between tests."],
    fail: ["Invalid required configuration stops startup with an aggregated, secret-free message (CFG-02)."] },
  "06": { folder: "06-observability-health", title: "Observability & Health Management",
    purpose: "Logging, monitoring, tracing and health standards.",
    sec: ["Mask sensitive fields with the shared mask configuration before logging or exporting telemetry (OBS-03); never log request bodies on the error path."],
    test: ["Mock `@inextlabs/logger` per the shared test-double pattern (TEST-02) and assert level, message and structured fields; assert no secret/PII values are emitted."],
    fail: ["Observability code must never throw into the request path; failures degrade to no-op with a warning (OBS-05)."] },
  "07": { folder: "07-database-caching", title: "Database & Caching Management",
    purpose: "Database connectivity, data access and caching.",
    sec: ["Mask connection URIs in logs (`maskConnectionUri`); credentials from environment only; scope every query by tenant identity where data is multi-tenant."],
    test: ["Use the repository's in-memory/test-double pattern (TEST-02); cover connection failure, timeout, duplicate-key and empty-result paths."],
    fail: ["Optional dependencies (cache) fail open to the source of truth; correctness-critical stores surface errors (DB-02, INT-02)."] },
  "08": { folder: "08-messaging-event-driven", title: "Messaging & Event-Driven Architecture",
    purpose: "Asynchronous communication and event processing.",
    sec: ["Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing."],
    test: ["Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths."],
    fail: ["A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03)."] },
  "09": { folder: "09-cloud-storage-integrations", title: "Cloud Storage & External Integrations",
    purpose: "External system communication and cloud storage integration.",
    sec: ["Outbound calls carry only the identity and correlation headers defined in CTX-02; validate any client-supplied URL with the SSRF guard (INT-03)."],
    test: ["Mock the HTTP/SDK client; cover 2xx, confirmed-absent (404), 4xx, 5xx, timeout and token-acquisition failure."],
    fail: ["Distinguish confirmed absence from unavailability; never treat an unavailable dependency as empty data (ERR-09)."] },
  "10": { folder: "10-security-identity", title: "Security & Identity Management",
    purpose: "Secure service communication and identity management.",
    sec: ["Fail closed: a missing or invalid credential rejects the request or stops startup, never opens the endpoint (CFG-04). Use constant-time comparison for secrets."],
    test: ["Test valid, missing, malformed, expired and wrong-audience/role credentials; test fail-closed behaviour when configuration is absent outside local/dev."],
    fail: ["Authentication failures return 401, authorization failures 403, both in the standard error envelope; log the reason, not the credential."] },
  "11": { folder: "11-resilience-reliability", title: "Resilience & Reliability",
    purpose: "Failure recovery and resilient service behaviour.",
    sec: ["Resilience mechanisms must not bypass authentication or leak internal detail when degrading."],
    test: ["Use fake timers/forced failures to test timeout, retry exhaustion, breaker open/half-open, fallback and shutdown ordering."],
    fail: ["Decide fail-open vs fail-closed explicitly per dependency and document it (INT-02)."] },
  "12": { folder: "12-llm-ai-integration", title: "LLM & AI Integration",
    purpose: "Integration of large language models into applications.",
    sec: ["Model keys and endpoints are secrets (mask `key`, `endpoint`); never log prompts or completions containing PII; treat model output as untrusted input."],
    test: ["Mock the model client; cover malformed output, refusal, timeout, rate-limit and token-limit paths."],
    fail: ["LLM failures map to catalogued errors (ERR-02) and follow the resilience standards (RES-02, RES-03)."] },
  "13": { folder: "13-testing-quality", title: "Testing & Quality Engineering",
    purpose: "Automated testing and quality assurance.",
    sec: ["Test fixtures contain no real secrets or personal data; stub environment variables in setup files (TEST-01)."],
    test: ["Follow the target repository's runner and layout (TEST-01); do not introduce a second test framework."],
    fail: ["Tests must fail loudly: no swallowed assertions, no `--passWithNoTests` as a quality gate."] },
  "14": { folder: "14-code-review-governance", title: "Code Review & Engineering Governance",
    purpose: "Consistent engineering review and quality standards.",
    sec: ["Review findings must not quote secrets; reference location and rule ID instead."],
    test: ["A review is complete only when each applicable standard ID has been checked and the result (pass / deviation / not applicable) recorded."],
    fail: ["When standards conflict or are ambiguous, report the conflict (see `conflicts-and-open-decisions`) rather than inventing a ruling."] },
  "15": { folder: "15-documentation-devops", title: "Documentation & DevOps",
    purpose: "Technical documentation, deployment and delivery practices.",
    sec: ["Documentation and pipelines never contain secrets; registry tokens come from `AuthToken`/variable groups and are removed from image layers."],
    test: ["Validate pipelines and Dockerfiles in CI (build, scan, test stages gate the push)."],
    fail: ["A failed stage stops the pipeline; no image is pushed unless tests and scans pass (OPS-02)."] },
};

const COMPLIANCE = [
  "Inspect the target repository first: language, framework, structure, dependencies, existing implementation of this concern.",
  "Identify the applicable organizational standards (IDs above) from this skill ecosystem before writing code.",
  "Reuse approved internal packages and existing shared components (PKG-01); read their declarations, do not guess their API.",
  "Follow the organization's established implementation patterns exactly as described under *Organizational standards*.",
  "Do not introduce alternative libraries, architectural patterns or implementations that conflict with approved standards.",
  "Do not silently replace an internal package with a public package.",
  "Do not create a second implementation when an approved shared component already exists in the target repository.",
  "Do not invent organizational conventions; label anything not evidenced as GENERIC / provisional.",
  "Do not silently ignore a mandatory rule because the target repository currently does otherwise.",
  "If existing target code conflicts with the standard, report the deviation and follow the standard for **new or modified code only**; keep backward compatibility and avoid unrelated rewrites.",
  "If a required internal package is unavailable, report the missing dependency; never substitute silently.",
  "If the target technology cannot support the pattern directly, propose a compatible adapter that preserves the Layer A contract and request approval before adopting it.",
  "If standards are contradictory or ambiguous, report the conflict (see `governance/conflicts-and-open-decisions.md`) instead of inventing a resolution.",
  "When the task spans several engineering areas, apply every relevant skill together (see *Related skills*).",
  "Validate the finished implementation against this skill's checklist and the applicable standards before declaring completion.",
];

const BANNER = {
  E0: "> ⚠ **GENERIC BASELINE (evidence E0).** No organizational implementation of this concern exists in the reference repositories. Everything marked GENERIC is a provisional recommendation pending architectural approval and is **not** an organizational standard. The skill still inherits the standards listed in *Related skills* (logging, errors, configuration, security).",
  E3: "> ⚠ **PARTIAL / DEFECTIVE EVIDENCE (E3).** The reference implementation is isolated, declared-only, inert or has known defects. Use the pattern's *contract* only; do not copy the defects documented below.",
  E2: "",
  E1: "",
};

// ---------- parse ----------
const LIST_KEYS = new Set(["when", "org", "impl", "tech", "fail", "sec", "test", "anti", "check"]);
const SCALAR_KEYS = new Set(["ev", "cls", "std", "rel", "add", "d", "scope", "app", "purpose"]);

function parseFile(file, catNo) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const skills = [];
  let cur = null, listKey = null, ex = null;
  lines.forEach((raw, i) => {
    const ln = raw;
    if (ex) {
      if (ln.trim() === "/ex") { cur.ex.push(ex); ex = null; } else ex.code.push(ln);
      return;
    }
    if (ln.startsWith("@@ ")) {
      const [slug, name] = ln.slice(3).split("|").map((s) => s.trim());
      cur = { slug, name, cat: catNo, ex: [], file: path.basename(file), line: i + 1 };
      for (const k of LIST_KEYS) cur[k] = [];
      skills.push(cur); listKey = null; return;
    }
    if (!cur || ln.trim() === "" || ln.startsWith("#")) return;
    if (ln.startsWith("ex:")) {
      const [lang, title] = ln.slice(3).split("|").map((s) => s.trim());
      ex = { lang: lang || "ts", title: title || "Example", code: [] }; listKey = null; return;
    }
    const m = ln.match(/^([a-z]+):\s*(.*)$/);
    if (m && (LIST_KEYS.has(m[1]) || SCALAR_KEYS.has(m[1]))) {
      if (LIST_KEYS.has(m[1])) { listKey = m[1]; if (m[2]) cur[listKey].push(m[2]); }
      else { cur[m[1]] = m[2]; listKey = null; }
      return;
    }
    if (ln.startsWith("- ") && listKey) { cur[listKey].push(ln.slice(2)); return; }
    if (listKey && /^\s+\S/.test(ln)) { // continuation
      const arr = cur[listKey]; arr[arr.length - 1] += " " + ln.trim(); return;
    }
    throw new Error(`${file}:${i + 1}: cannot parse line: ${ln}`);
  });
  return skills;
}

// ---------- render ----------
const TAGS = { MUST: "MANDATORY", SHOULD: "Recommended", VERIFIED: "Verified convention", TECH: "Technology-specific", CONFIG: "Configurable", GENERIC: "Generic baseline (provisional)", UNRESOLVED: "UNRESOLVED — do not enforce; report" };
const TAG_BASES = ["MUST NOT", "MUST", "SHOULD", "VERIFIED", "TECH", "CONFIG", "GENERIC", "UNRESOLVED", "NOT EVIDENCED", "GAPS", "GAP"];
TAGS["MUST NOT"] = "MANDATORY (prohibition)"; TAGS["NOT EVIDENCED"] = "Not evidenced (gap)"; TAGS["GAPS"] = "Known gaps (not standards)"; TAGS["GAP"] = "Known gap (not a standard)";
function splitTag(l) {
  const m = l.match(/^([A-Z][A-Z ]*[^:]{0,70}?):\s+(.*)$/);
  if (!m) return null;
  const prefix = m[1];
  const base = TAG_BASES.find((b) => prefix === b || prefix.startsWith(b + " ") || prefix.startsWith(b + "("));
  if (!base) return null;
  return { base, qual: prefix.slice(base.length).trim(), text: m[2] };
}
function tagLine(l) {
  const t = splitTag(l);
  if (!t) return "- " + l;
  return `- **${TAGS[t.base]}${t.qual ? " " + t.qual : ""}:** ${t.text}`;
}
const bullets = (a) => a.map((x) => "- " + x).join("\n");
const nums = (a) => a.map((x, i) => `${i + 1}. ${x}`).join("\n");

function render(s, all) {
  const c = CATS[s.cat];
  const evTxt = { E1: "E1 — consistent across both reference repositories", E2: "E2 — single repository, repeated and/or tested", E3: "E3 — isolated / declared-only / defective", E0: "E0 — no organizational evidence (generic baseline)" }[s.ev];
  const rel = (s.rel || "").split(",").map((x) => x.trim()).filter(Boolean);
  const stds = (s.std || "").split(",").map((x) => x.trim()).filter(Boolean);
  const must = s.org.map(splitTag).filter((t) => t && (t.base === "MUST" || t.base === "MUST NOT")).map((t) => (t.base === "MUST NOT" ? "MUST NOT: " : "") + t.text);
  const layers = { A: [], B: [], C: [], G: [] };
  s.tech.forEach((t) => { const m = t.match(/^([ABC]):\s*(.*)$/); if (m) layers[m[1]].push(m[2]); else layers.G.push(t); });
  const techOut = [];
  techOut.push("**Layer A — organizational contract (identical in every stack)**\n" + (layers.A.length ? bullets(layers.A) : "- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework."));
  techOut.push("**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**\n" + (layers.B.length ? bullets(layers.B) : "- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01)."));
  techOut.push("**Layer C — adapting to another stack**\n" + (layers.C.length ? bullets(layers.C) : "- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation."));
  if (layers.G.length) techOut.push("**Notes**\n" + bullets(layers.G));
  const ex = s.ex.length ? s.ex.map((e) => `**${e.title}**\n\n\`\`\`${e.lang}\n${e.code.join("\n").replace(/^\n+|\n+$/g, "")}\n\`\`\``).join("\n\n")
    : `This skill is procedural; see the canonical examples in ${rel.length ? rel.slice(0, 3).map((r) => `\`${r}\``).join(", ") : "the related skills"}. Do not duplicate them here.`;
  const out = [];
  out.push(`---\nname: ${s.slug}\ndescription: ${s.d}\n---`);
  out.push(`# ${s.name}`);
  if (BANNER[s.ev]) out.push(BANNER[s.ev]);
  out.push(`## Skill metadata
| Field | Value |
|---|---|
| Skill name | \`${s.slug}\` |
| Category | ${s.cat} — ${c.title} |
| Scope | ${s.scope} |
| Applicability | ${s.app} |
| Evidence | ${evTxt} |
| Classification | ${s.cls} |
| Governing standards | ${stds.length ? stds.map((x) => `\`${x}\``).join(", ") : "—"} (defined in \`standards/organization-engineering-standards.md\`) |
| Related skills | ${rel.length ? rel.map((x) => `\`${x}\``).join(", ") : "—"} |`);
  out.push(`## Purpose\n${s.purpose}`);
  out.push(`## When to use\n${bullets(s.when)}`);
  out.push(`## Organizational standards\n${s.org.map(tagLine).join("\n")}\n\n_Source of truth: ${stds.map((x) => `\`${x}\``).join(", ") || "n/a"}. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see \`governance/repository-analysis.md\`); "C-xx" are open conflicts (see \`governance/conflicts-and-open-decisions.md\`)._`);
  out.push(`## Implementation guidelines\n${nums(s.impl)}`);
  out.push(`## Technology-specific guidance\n${techOut.join("\n\n")}`);
  out.push(`## Code examples\n${ex}`);
  out.push(`## Error and failure handling\n${bullets([...s.fail, ...c.fail])}\n- Reuse the canonical \`error-catalog-management\`, \`error-code-standards\` and \`global-exception-handling\` skills; do not redefine error handling here.`);
  out.push(`## Security considerations\n${bullets([...s.sec, ...c.sec])}`);
  out.push(`## Testing guidelines\n${bullets([...s.test, ...c.test])}`);
  out.push(`## Anti-patterns\n${bullets(s.anti)}`);
  out.push(`## Implementation checklist\n${s.check.map((x) => `- [ ] ${x}`).join("\n")}`);
  out.push(`## Organizational Compliance Rules
${nums(COMPLIANCE)}
${must.length ? "\n**Skill-specific mandatory rules (violating any of these is a defect):**\n" + bullets(must) : ""}`);
  out.push(`## Related skills\n${rel.length ? rel.map((x) => { const t = all.find((k) => k.slug === x); return `- \`${x}\`${t ? " — " + t.name : " — (missing!)"}`; }).join("\n") : "- None"}`);
  return out.join("\n\n") + "\n";
}

// ---------- main ----------
function main() {
  const files = fs.readdirSync(DATA).filter((f) => /^cat\d\d\.txt$/.test(f)).sort();
  let all = [];
  for (const f of files) all = all.concat(parseFile(path.join(DATA, f), f.slice(3, 5)));
  const bad = [];
  all.forEach((s) => {
    ["ev", "cls", "d", "scope", "app", "purpose"].forEach((k) => { if (!s[k]) bad.push(`${s.slug}: missing ${k}`); });
    ["when", "org", "impl", "fail", "test", "anti", "check"].forEach((k) => { if (!s[k] || !s[k].length) bad.push(`${s.slug}: empty ${k}`); });
    if (!["E0", "E1", "E2", "E3"].includes(s.ev)) bad.push(`${s.slug}: bad ev ${s.ev}`);
  });
  const seen = new Set();
  all.forEach((s) => { if (seen.has(s.slug)) bad.push(`duplicate slug ${s.slug}`); seen.add(s.slug); });
  if (bad.length) { console.error("DATA ERRORS:\n" + bad.join("\n")); process.exit(1); }

  // clean generated category dirs
  const catRoot = path.join(ROOT, "categories");
  fs.rmSync(catRoot, { recursive: true, force: true });
  all.forEach((s) => {
    const dir = path.join(catRoot, CATS[s.cat].folder, s.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "SKILL.md"), render(s, all), "utf8");
    s.path = path.relative(ROOT, path.join(dir, "SKILL.md")).replace(/\\/g, "/");
  });
  fs.writeFileSync(path.join(__dirname, "manifest.json"), JSON.stringify(all.map((s) => ({ slug: s.slug, name: s.name, cat: s.cat, ev: s.ev, cls: s.cls, std: s.std, rel: s.rel, add: s.add || "", path: s.path })), null, 1));
  console.log(`built ${all.length} skills in ${Object.keys(CATS).length} categories`);
}
if (require.main === module) main();
module.exports = { CATS };
