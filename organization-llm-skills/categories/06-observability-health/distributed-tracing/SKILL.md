---
name: distributed-tracing
description: Use when enabling or extending distributed tracing - request/dependency spans, exception tracking, trace context, masking before export, no-op when unconfigured - with the target repo's APM (Application Insights SDK or OTEL).
---

# Distributed Tracing

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `distributed-tracing` |
| Category | 06 — Observability & Health Management |
| Scope | Spans, exceptions and telemetry export. |
| Applicability | Node services (Application Insights / OTEL). |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | TECH / UNRESOLVED (C-10) |
| Governing standards | `CTX-05`, `OBS-05`, `CTX-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `trace-context-propagation`, `opentelemetry-integration`, `application-monitoring`, `correlation-id-management`, `distributed-request-tracking` |

## Purpose
End-to-end latency and failure visibility across services.

## When to use
- Adding telemetry calls.
- Investigating cross-service latency.

## Organizational standards
- **MANDATORY:** Telemetry initialization is isolated in a service module (`initTelemetry`), enabled only when `APPLICATIONINSIGHTS_CONNECTION_STRING` is set (graceful no-op otherwise), executed at startup before traffic.
- **MANDATORY:** Mask payloads before export with the shared mask (`createMasker(MASK_CONFIG)`), truncate large values (4096 chars), serialize circular-safe.
- **MANDATORY:** Telemetry never throws into the request path.
- **Verified convention:** API: `trackTrace(level, name, props)`, `trackException`, `trackRequest`; request telemetry context kept in its own `AsyncLocalStorage`; service name constant set in properties.
- **UNRESOLVED — do not enforce; report (C-10):** SDK choice per repo; do not add a second APM.

_Source of truth: `CTX-05`, `OBS-05`, `CTX-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Use existing helpers; add custom events for business-critical or legacy-access signals.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Safe event**

```ts
trackTrace("warn", "legacy_route_accessed", { path: req.originalUrl, method: req.method });
```

## Error and failure handling
- Telemetry failure -> warn log; continue.
- Observability code must never throw into the request path; failures degrade to no-op with a warning (OBS-05).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask sensitive fields with the shared mask configuration before logging or exporting telemetry (OBS-03); never log request bodies on the error path.

## Testing guidelines
- No-op when connection string unset; masked properties.
- Mock `@inextlabs/logger` per the shared test-double pattern (TEST-02) and assert level, message and structured fields; assert no secret/PII values are emitted.

## Anti-patterns
- Exporting raw bodies.
- Custom trace headers.

## Implementation checklist
- [ ] Guarded; masked; no-op safe.

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
- Telemetry initialization is isolated in a service module (`initTelemetry`), enabled only when `APPLICATIONINSIGHTS_CONNECTION_STRING` is set (graceful no-op otherwise), executed at startup before traffic.
- Mask payloads before export with the shared mask (`createMasker(MASK_CONFIG)`), truncate large values (4096 chars), serialize circular-safe.
- Telemetry never throws into the request path.

## Related skills
- `trace-context-propagation` — Trace Context Propagation
- `opentelemetry-integration` — OpenTelemetry Integration
- `application-monitoring` — Application Monitoring
- `correlation-id-management` — Correlation ID Management
- `distributed-request-tracking` — Distributed Request Tracking
