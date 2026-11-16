---
name: application-monitoring
description: Use when deciding what to monitor in a service - request logs, error rates from logs/telemetry, dependency health, legacy-route usage, worker activity, queue backlogs - using the logging and telemetry stack that exists.
---

# Application Monitoring

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `application-monitoring` |
| Category | 06 — Observability & Health Management |
| Scope | Monitoring signals available from the organization's stack. |
| Applicability | Services on Azure with App Insights/Event Hub/OTEL. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (OBS-02, OBS-05) partial |
| Governing standards | `OBS-02`, `OBS-05`, `OBS-04`, `API-08` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `structured-logging`, `distributed-tracing`, `alerting-standards`, `metrics-collection`, `health-endpoint-implementation` |

## Purpose
Operators can answer "is it healthy and who is using what".

## When to use
- Defining dashboards/queries.
- Adding signals for cutover decisions.

## Organizational standards
- **Verified convention signals:** request completion logs (status/duration), error logs with code/numericCode, readiness results, legacy-access traces (`legacy_route_accessed`), deprecated-route logs (`deprecatedRoute`, `useInstead`), worker start/stop and batch error logs, outbox attempts/lastError rows, `enforcementStatus:"skipped"` + `failOpenReason` on events, audit records.
- **MANDATORY:** Every alertable condition has a stable log message/field (`code`, `numericCode`) - never match on free text.
- **Generic baseline (provisional):** Dashboards/alerts are not in the repos; define them as code in the platform repo when approved.

_Source of truth: `OBS-02`, `OBS-05`, `OBS-04`, `API-08`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. List the signals for a feature in the PR description; ensure each exists as a structured field.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Queryable fields**

```text
level, msg, correlationId, statusCode, durationMs, code, numericCode, deprecatedRoute, failOpenReason
```

## Error and failure handling
- N/A.
- Observability code must never throw into the request path; failures degrade to no-op with a warning (OBS-05).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask sensitive fields with the shared mask configuration before logging or exporting telemetry (OBS-03); never log request bodies on the error path.

## Testing guidelines
- Assert structured fields exist.
- Mock `@inextlabs/logger` per the shared test-double pattern (TEST-02) and assert level, message and structured fields; assert no secret/PII values are emitted.

## Anti-patterns
- Log-message-text alerts.

## Implementation checklist
- [ ] Stable fields.

## Organizational Compliance Rules
1. Inspect the target repository first: language, framework, structure, dependencies, existing implementation of this concern.
2. Identify the applicable organizational standards (IDs above) from this skill ecosystem before writing code.
3. Reuse approved internal packages and existing shared components (PKG-01); read their declarations, do not guess their API.
4. Follow the organization's established implementation patterns exactly as described under *Organizational standards*.
5. Do not introduce alternative libraries, architectural patterns or implementations that conflict with approved standards.
6. Do not silently replace an internal package with a public package.
7. Do not create a second implementation when an approved shared component already exists in the target repository.
8. Do not invent organizational conventions; label anything not evidenced as GENERIC / provisional.
9. Do not silently ignore a mandatory rule because the target repository currently does otherwise.
10. If existing target code conflicts with the standard, report the deviation and follow the standard for **new or modified code only**; keep backward compatibility and avoid unrelated rewrites.
11. If a required internal package is unavailable, report the missing dependency; never substitute silently.
12. If the target technology cannot support the pattern directly, propose a compatible adapter that preserves the Layer A contract and request approval before adopting it.
13. If standards are contradictory or ambiguous, report the conflict (see `governance/conflicts-and-open-decisions.md`) instead of inventing a resolution.
14. When the task spans several engineering areas, apply every relevant skill together (see *Related skills*).
15. Validate the finished implementation against this skill's checklist and the applicable standards before declaring completion.

**Skill-specific mandatory rules (violating any of these is a defect):**
- Every alertable condition has a stable log message/field (`code`, `numericCode`) - never match on free text.

## Related skills
- `structured-logging` — Structured Logging
- `distributed-tracing` — Distributed Tracing
- `alerting-standards` — Alerting Standards
- `metrics-collection` — Metrics Collection
- `health-endpoint-implementation` — Health Endpoint Implementation
