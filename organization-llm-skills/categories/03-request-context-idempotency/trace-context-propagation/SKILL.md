---
name: trace-context-propagation
description: Use when propagating W3C trace context (traceparent/tracestate) across services and async hops and when choosing the APM stack. Documents both reference approaches (Application Insights SDK with W3C vs OpenTelemetry init) and keeps correlation ID and trace ID separate.
---

# Trace Context Propagation

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `trace-context-propagation` |
| Category | 03 — Request Context & Idempotency |
| Scope | Distributed trace context. |
| Applicability | Node services with Application Insights or OpenTelemetry. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | TECH / UNRESOLVED (C-10) |
| Governing standards | `CTX-05`, `OBS-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `distributed-tracing`, `opentelemetry-integration`, `correlation-id-management`, `application-monitoring` |

## Purpose
Trace IDs flow through standard instrumentation, not hand-rolled headers.

## When to use
- Enabling tracing.
- Adding a new outbound protocol.

## Organizational standards
- **MANDATORY:** Trace ID is separate from the correlation ID; propagate trace context via the standard instrumentation (W3C `traceparent`), not hand-rolled.
- **Technology-specific (reference service A):** `applicationinsights` SDK, W3C mode (`AI_AND_W3C`), `trackTrace/Exception/Request`, mask-before-export, no-op when `APPLICATIONINSIGHTS_CONNECTION_STRING` is unset.
- **Technology-specific (reference service B):** OpenTelemetry through `initOtelLogging({ serviceName, environment })` from the shared package (validates `OTEL_*`/App Insights env; SDK wiring is per-service) before any logging.
- **UNRESOLVED — do not enforce; report (C-10):** Estate APM choice not decided; follow the target repo; do not add a second APM.

_Source of truth: `CTX-05`, `OBS-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Initialize tracing first in bootstrap (before logger usage in OTEL case).
2. Log the active trace ID alongside `correlationId` when the logger supports it.
3. Do not mask-bypass: telemetry export must use the shared mask.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**OTEL init (reference)**

```ts
initOtelLogging({ serviceName: "my-service", environment: process.env.NODE_ENV ?? "production" }); // before any logger usage
```

## Error and failure handling
- Tracing must be a no-op when unconfigured; never throw into requests.
- Context helpers never throw when context is missing; they return a documented fallback (`unknown`) and the request continues (CTX-01).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Treat inbound identifiers as untrusted input: validate charset/length; never let body or query override context (CTX-01).

## Testing guidelines
- Disabled-config test: no exceptions.
- Test with and without inbound identifiers, with malformed values, across async boundaries (ALS), and on outbound calls/messages.

## Anti-patterns
- Custom trace header formats.
- Two APM SDKs.

## Implementation checklist
- [ ] Init order; no-op safe; masked; trace/correlation separate.

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
- Trace ID is separate from the correlation ID; propagate trace context via the standard instrumentation (W3C `traceparent`), not hand-rolled.

## Related skills
- `distributed-tracing` — Distributed Tracing
- `opentelemetry-integration` — OpenTelemetry Integration
- `correlation-id-management` — Correlation ID Management
- `application-monitoring` — Application Monitoring
