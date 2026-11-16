---
name: metrics-collection
description: Use when a service needs operational metrics (request rate, latency, errors, queue depth, cache hit rate). No Prometheus/OTEL-metrics implementation exists in the reference repositories; this skill is a generic baseline and must not be presented as an organizational standard.
---

# Metrics Collection

> ⚠ **GENERIC BASELINE (evidence E0).** No organizational implementation of this concern exists in the reference repositories. Everything marked GENERIC is a provisional recommendation pending architectural approval and is **not** an organizational standard. The skill still inherits the standards listed in *Related skills* (logging, errors, configuration, security).

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `metrics-collection` |
| Category | 06 — Observability & Health Management |
| Scope | Operational metrics baseline. |
| Applicability | Node services. |
| Evidence | E0 — no organizational evidence (generic baseline) |
| Classification | GENERIC (no organizational evidence) |
| Governing standards | `OBS-06` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `application-monitoring`, `alerting-standards`, `opentelemetry-integration`, `performance-review` |

## Purpose
Give a safe starting point until an organizational decision exists.

## When to use
- Asked to "add metrics".

## Organizational standards
- **Generic baseline (provisional):** Prefer OTEL metrics through the existing OTEL/App Insights stack (C-10) over a new metrics library; expose no unauthenticated metrics endpoint.
- **Generic baseline (provisional):** Use RED metrics for APIs (rate, errors, duration) and queue depth/age for workers; low-cardinality labels only (never tenant/user IDs).
- **Generic baseline (provisional):** Business usage metrics (usage counters in Redis/Mongo) are product data, not operational metrics - do not conflate.
- **MANDATORY:** Request architectural approval before adding a metrics endpoint or library.

_Source of truth: `OBS-06`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Check the target's APM; propose names/labels in an ADR first.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Proposed naming (GENERIC)**

```text
http_server_duration_ms{route,method,status_class}  | worker_batch_duration_ms{worker}  | outbox_pending_count
```

## Error and failure handling
- Metrics code must never throw.
- Observability code must never throw into the request path; failures degrade to no-op with a warning (OBS-05).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask sensitive fields with the shared mask configuration before logging or exporting telemetry (OBS-03); never log request bodies on the error path.

## Testing guidelines
- Unit test the instrumentation wrapper with a fake meter.
- Mock `@inextlabs/logger` per the shared test-double pattern (TEST-02) and assert level, message and structured fields; assert no secret/PII values are emitted.

## Anti-patterns
- High-cardinality labels.
- Unauthenticated `/metrics`.

## Implementation checklist
- [ ] Approval recorded; labels bounded.

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
- Request architectural approval before adding a metrics endpoint or library.

## Related skills
- `application-monitoring` — Application Monitoring
- `alerting-standards` — Alerting Standards
- `opentelemetry-integration` — OpenTelemetry Integration
- `performance-review` — Performance Review
