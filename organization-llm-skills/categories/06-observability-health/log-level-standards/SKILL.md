---
name: log-level-standards
description: Use when choosing a log level or configuring LOG_LEVEL per environment - what belongs in trace/debug/info/warn/error/fatal, request-lifecycle levels by status class and probe logging.
---

# Log Level Standards

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `log-level-standards` |
| Category | 06 — Observability & Health Management |
| Scope | Level selection. |
| Applicability | `@inextlabs/logger` levels. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (OBS-02) + GENERIC fills |
| Governing standards | `OBS-01`, `OBS-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `structured-logging`, `error-logging`, `logger-initialization`, `application-monitoring` |

## Purpose
Consistent levels so alerts and searches mean the same thing everywhere.

## When to use
- Writing a log call.
- Tuning noise.

## Organizational standards
- **MANDATORY:** `fatal` - process will exit (`crashOnFatal`, unrecoverable startup); `error` - unexpected failure / 5xx / dependency failure impacting correctness; `warn` - expected-but-notable (4xx, validation failure, degraded/fail-open, retries, deprecated route hit, legacy access); `info` - lifecycle and request completion (2xx/3xx), worker start/stop, successful notable business events; `debug` - diagnostic detail (cache hit/miss, connection events, health checks); `trace` - most verbose.
- **MANDATORY:** Request completion level by status: `>=500 error`, `>=400 warn`, else `info`.
- **Verified convention:** Default `LOG_LEVEL=info`; non-prod may use `debug`.
- **Generic baseline (provisional):** Log probe requests (`/health*`) at `debug` (reference logs them at info/mixed).
- **MANDATORY:** Business-expected failures (quota exceeded, not found) are `warn`, not `error`.

_Source of truth: `OBS-01`, `OBS-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Choose by "who must act": nobody (info/debug), someone later (warn), someone now (error/fatal).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Examples**

```text
info  : "Request completed" {statusCode:200,durationMs:12}
warn  : "Request validation failed" {segment:"body"}
error : "Redis operation failed" {err}
fatal : "Fatal uncaughtException - exiting"
```

## Error and failure handling
- N/A.
- Observability code must never throw into the request path; failures degrade to no-op with a warning (OBS-05).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask sensitive fields with the shared mask configuration before logging or exporting telemetry (OBS-03); never log request bodies on the error path.

## Testing guidelines
- Assert level for 200/404/500 request completions.
- Mock `@inextlabs/logger` per the shared test-double pattern (TEST-02) and assert level, message and structured fields; assert no secret/PII values are emitted.

## Anti-patterns
- Errors logged at `info`.
- Everything at `error`.

## Implementation checklist
- [ ] Level matches mapping.

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
- `fatal` - process will exit (`crashOnFatal`, unrecoverable startup); `error` - unexpected failure / 5xx / dependency failure impacting correctness; `warn` - expected-but-notable (4xx, validation failure, degraded/fail-open, retries, deprecated route hit, legacy access); `info` - lifecycle and request completion (2xx/3xx), worker start/stop, successful notable business events; `debug` - diagnostic detail (cache hit/miss, connection events, health checks); `trace` - most verbose.
- Request completion level by status: `>=500 error`, `>=400 warn`, else `info`.
- Business-expected failures (quota exceeded, not found) are `warn`, not `error`.

## Related skills
- `structured-logging` — Structured Logging
- `error-logging` — Error Logging
- `logger-initialization` — Logger Initialization
- `application-monitoring` — Application Monitoring
