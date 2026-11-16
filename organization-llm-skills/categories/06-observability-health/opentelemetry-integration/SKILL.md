---
name: opentelemetry-integration
description: Use when a service integrates OpenTelemetry - a single service-local init at startup, OTEL_* environment variables, OTLP and Application Insights export targets. Records the spike status so wiring is not assumed complete.
---

# OpenTelemetry Integration

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `opentelemetry-integration` |
| Category | 06 — Observability & Health Management |
| Scope | OTEL setup per service. |
| Applicability | Node services (one reference service used an OTEL spike). |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | TECH (single repo, spike) / UNRESOLVED (C-10) |
| Governing standards | `CTX-05`, `OBS-05`, `PKG-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `distributed-tracing`, `trace-context-propagation`, `structured-logging`, `application-monitoring` |

## Purpose
Standard, vendor-neutral telemetry export.

## When to use
- Bootstrapping a usage-platform service.

## Organizational standards
- **MANDATORY:** Initialise OTEL once at process start **before** any logger usage, in a service-local module (the reference calls an `initOtelLogging`-style function at the top of the entry file).
- **Verified convention:** The reference init reads `OTEL_SERVICE_NAME`, `OTEL_SDK_DISABLED`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`, `OTEL_EXPORTER_OTLP_PROTOCOL`, `OTEL_LOGS_CONSOLE`, `APPLICATIONINSIGHTS_CONNECTION_STRING` and documents export targets; **it was a spike**: full SDK wiring (LoggerProvider/OTLP exporters, `@opentelemetry/sdk-node`) must live in the service. Exporters are configured in the service or an OTEL Collector.
- **MANDATORY:** Do not claim traces/metrics are exported until the SDK wiring exists in the target; verify.
- **Generic baseline (provisional):** Prefer OTLP to a collector; keep `OTEL_SDK_DISABLED=true` available for tests.

_Source of truth: `CTX-05`, `OBS-05`, `PKG-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add the init call; document env vars in `.env.example`; add SDK packages only with approval.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Init**

```ts
const otel = initTelemetry({ serviceName: "<service-name>", environment: process.env.NODE_ENV ?? "production" });
```

## Error and failure handling
- Misconfigured exporter must not stop the service.
- Observability code must never throw into the request path; failures degrade to no-op with a warning (OBS-05).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask sensitive fields with the shared mask configuration before logging or exporting telemetry (OBS-03); never log request bodies on the error path.

## Testing guidelines
- `OTEL_SDK_DISABLED=true` in tests.
- Mock `@inextlabs/logger` per the shared test-double pattern (TEST-02) and assert level, message and structured fields; assert no secret/PII values are emitted.

## Anti-patterns
- Assuming spans exist.
- Adding vendor SDKs alongside OTEL.

## Implementation checklist
- [ ] Init first; env documented; actual export verified.

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
- Initialise OTEL once at process start **before** any logger usage, in a service-local module (the reference calls an `initOtelLogging`-style function at the top of the entry file).
- Do not claim traces/metrics are exported until the SDK wiring exists in the target; verify.

## Related skills
- `distributed-tracing` — Distributed Tracing
- `trace-context-propagation` — Trace Context Propagation
- `structured-logging` — Structured Logging
- `application-monitoring` — Application Monitoring
