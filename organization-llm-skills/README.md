# Organization LLM Skills

An organization-wide engineering rulebook for AI coding assistants, reverse-engineered from two reference services and the internal `@inextlabs/*` packages. It makes the organization's conventions — not a model's generic preferences — the default when code is written, changed or reviewed in **any** repository.

| | |
|---|---|
| Reference repositories | `inflow-config-service-repo` (A), `inflow-usage-enforcement-service` (B) — read-only evidence |
| Stack of the evidence | Node.js / TypeScript / Express, Azure (Service Bus, Queue Storage, Redis, Mongo, Entra ID) |
| Skills | see `inventory/skills-inventory.md` (15 categories; predefined + additional) |
| Status / counts | `validation/completeness-report.md` |
| Owner decisions | 2026-11-16: conflict recommendations approved (`governance/conflicts-and-open-decisions.md` §E); `@inextlabs/inflow-usage-utils` excluded (helpers are local) |

## How it is organized
```
standards/organization-engineering-standards.md   <- single source of truth (IDs: PKG, ARCH, API, CTX, ERR, CFG, OBS, DB, MSG, INT, SEC, RES, LLM, TEST, DOC, OPS)
standards/*.md                                    <- domain views (architecture, coding, integration, security, observability, configuration)
categories/NN-<category>/<skill>/SKILL.md         <- one skill per folder (frontmatter name + description)
inventory/                                        <- skills inventory, category mapping, additional skills, coverage matrix
governance/                                       <- repository analysis, evidence matrix, cross-repo comparison, conflicts & open decisions, assumptions, skill dependencies
validation/                                       <- skill validation, organizational compliance, completeness reports
tools/                                            <- skill sources (data/catNN.txt), build.js, report.js, predefined.js, evidence.js, install-skills.ps1
```

## Using the skills
1. **Project-level (recommended):** copy the skills you need into the target repo's `.claude/skills/<name>/SKILL.md`:
   `powershell -File tools/install-skills.ps1 -Target "<repo>\.claude\skills" [-Only error-catalog-management,structured-logging]`
   (everything is ~195 skills; install by category for focus).
2. **Always give assistants the catalog:** point instructions (CLAUDE.md / Copilot instructions) at `standards/organization-engineering-standards.md` and the conflicts file.
3. **Entry skills by task:** new service → `microservice-architecture-standards`; endpoint → `api-design-standards`; error → `error-catalog-management`; logging → `structured-logging`; outbound call → `external-api-client`; review → `code-review`.

## What every skill guarantees
- Frontmatter `name` + activation `description`; metadata (category, scope, applicability, evidence, classification, governing standard IDs, related skills).
- **Organizational standards** tagged `MANDATORY / Verified / Technology-specific / Configurable / Generic baseline / UNRESOLVED`.
- Implementation steps, Layer A/B/C technology guidance, examples, failure handling, security, tests, anti-patterns, checklist.
- **Organizational Compliance Rules**: the 15 rules (inspect target → reuse approved internal packages → no substitutes → report conflicts/deviations → adapters need approval → validate).

## Reading the evidence labels
`E1` both repos · `E2` one repo, repeated/tested · `E3` partial/defective · `E0` none (**GENERIC baseline — not an organizational standard**). `UNRESOLVED` items (`C-01…C-22`) are never enforced as rules; see `governance/conflicts-and-open-decisions.md`.

## Rebuilding
```
node tools/build.js     # regenerates categories/**/SKILL.md from tools/data/*.txt
node tools/report.js    # regenerates inventory/, dependency graph, evidence matrix, validation reports
```
Edit `tools/data/catNN.txt` (or `standards/…`), never the generated `SKILL.md` files.

## Key organizational rules at a glance
- Logging: `@inextlabs/logger` only; Pino argument order; configure once before imports; mask PII; correlation automatic.
- Errors: `AppError` + service catalog; numeric code `PLATFORM_CODE + SERVICE_CODE + MODULE_NUM + SEQ` (8 digits, e.g. `10300001`); single global error middleware; `details` public, cause private.
- Context: `x-correlation-id` through ALS to logs, envelopes, outbound calls and messages; `Idempotency-Key` header for retryable writes.
- Outbound calls: bounded client, Managed-Identity bearer (fail closed), `null` = absent, typed error = unavailable.
- Security: authenticate every route, constant-time secret checks, fail closed, SSRF/CORS/HMAC controls.
- Resilience: explicit timeouts, fail-open caches with breaker, outbox for must-deliver effects, graceful shutdown.
