---
name: error-logging
description: Use when logging errors - which level, which fields, how to attach the Error object (err key / serializeError), avoiding double logging, and never logging bodies or secrets on the error path.
---

# Error Logging

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `error-logging` |
| Category | 04 — Error & Exception Management |
| Scope | Error log content and level. |
| Applicability | Services using `@inextlabs/logger`. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | MANDATED logger (OBS-01) + VERIFIED content rules |
| Governing standards | `OBS-01`, `OBS-02`, `OBS-03`, `ERR-06`, `ERR-07` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `structured-logging`, `global-exception-handling`, `sensitive-data-masking-in-logs`, `log-level-standards`, `correlation-id-management` |

## Purpose
Errors are searchable, correlated and safe.

## When to use
- Writing catch blocks or the error middleware.

## Organizational standards
- **MANDATORY:** Use `@inextlabs/logger` (via the service wrapper) - `logger.error(err, "message")` or `logger.error({ ...context, err: serializeError(err) }, "message")` (Pino order: object first).
- **MANDATORY:** Level by impact: `error` for 5xx/unexpected, `warn` for 4xx/degraded/best-effort failures, `fatal` for process-ending.
- **MANDATORY:** Log once per failure (middleware logs; lower layers add context only when they swallow).
- **MANDATORY:** Context fields: `correlationId` (automatic), route/method, dependency name, ids; no request body/params/query; no tokens/keys/connection strings (use masked helpers).
- **MANDATORY:** Include a short `hint` for operational failures when known (reference practice: "Check REDIS_ACCESS_KEY...").

_Source of truth: `OBS-01`, `OBS-02`, `OBS-03`, `ERR-06`, `ERR-07`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Replace `console.error` with the logger; replace `(msg, meta)` with `(meta, msg)` in new code.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Good error logs**

```ts
logger.error({ dependency: "redis", op: "SET", key: maskedKey, err: serializeError(err) }, "Redis operation failed");
logger.warn({ subscriptionId, status, err: serializeError(err) }, "Downstream notification failed - will be retried by outbox");
```

## Error and failure handling
- Logging must not throw; the logger wrapper guards serialization.
- Catch only where you can add context or translate; otherwise let the error propagate to the global handler (ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- `AppError.details` is public; internal causes live only on `Error.cause` and in logs (ERR-07).

## Testing guidelines
- Mock the logger (`mocking-test-doubles`) and assert level and `err`.
- Assert code, numericCode, HTTP status and envelope for each catalog entry touched; assert that unknown errors become `UNHANDLED_ERROR` with no leaked detail.

## Anti-patterns
- Logging then rethrowing at every layer.
- Logging full payloads.
- `console.*`.

## Implementation checklist
- [ ] Pino order; level; no leakage; single log.

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
- Use `@inextlabs/logger` (via the service wrapper) - `logger.error(err, "message")` or `logger.error({ ...context, err: serializeError(err) }, "message")` (Pino order: object first).
- Level by impact: `error` for 5xx/unexpected, `warn` for 4xx/degraded/best-effort failures, `fatal` for process-ending.
- Log once per failure (middleware logs; lower layers add context only when they swallow).
- Context fields: `correlationId` (automatic), route/method, dependency name, ids; no request body/params/query; no tokens/keys/connection strings (use masked helpers).
- Include a short `hint` for operational failures when known (reference practice: "Check REDIS_ACCESS_KEY...").

## Related skills
- `structured-logging` — Structured Logging
- `global-exception-handling` — Global Exception Handling
- `sensitive-data-masking-in-logs` — Sensitive Data Masking in Logs
- `log-level-standards` — Log Level Standards
- `correlation-id-management` — Correlation ID Management
