---
name: structured-logging
description: Use whenever you add, change or review log statements or logging setup in a service. All logging MUST use the approved internal package @inextlabs/logger (Pino-based): object-first calls, structured fields, automatic correlation ID, masked PII, Error under the err key. Never console.log, pino, winston or bunyan.
---

# Structured Logging

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `structured-logging` |
| Category | 06 — Observability & Health Management |
| Scope | Writing log statements and the service logger wrapper. |
| Applicability | Node/TypeScript services (`@inextlabs/logger` 1.0.4). |
| Evidence | E1 — consistent across both reference repositories |
| Classification | MANDATED (`@inextlabs/logger`) + VERIFIED content rules; deviations C-02 |
| Governing standards | `OBS-01`, `OBS-02`, `OBS-03`, `CTX-01`, `ERR-06`, `PKG-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `logger-initialization`, `log-level-standards`, `correlation-id-management`, `error-logging`, `sensitive-data-masking-in-logs`, `mocking-test-doubles` |

## Purpose
Uniform, searchable, safe JSON logs correlated across services.

## When to use
- Writing any log line.
- Replacing `console.*` or another logger.
- Creating the service logger module.
- Reviewing logs for noise, PII or missing correlation.

## Organizational standards
- **MANDATORY:** Import the logger from the service's single logger module, which wraps `@inextlabs/logger`. No other logging library (`console`, `pino`, `winston`, `bunyan`, usage-utils' winston `createLogger`) may be added (PKG-01, C-02). `winston` appearing in a manifest is an unused dependency to report, not a pattern.
- **MANDATORY:** Use **Pino argument order**: `logger.info({ field: value }, "message")`; errors as `logger.error(err, "message")` or `{ err: serializeError(err) }`. The legacy `(message, meta)` order (Winston style) must not appear in new code.
- **MANDATORY:** Levels `trace | debug | info | warn | error | fatal` (see `log-level-standards`); output is JSON with `service`, `environment`, `version`, `level`, `time`, `pid`, `hostname`, `msg` (guaranteed by the package).
- **MANDATORY:** `correlationId` is added automatically by the service wrapper from async context (do not pass it manually in every call).
- **MANDATORY:** Request lifecycle logging: "Incoming request" and a completion log with `method`, `path`, `statusCode`, `durationMs`; level by status (5xx `error`, 4xx `warn`, else `info`).
- **MANDATORY:** Log structured fields, never string-concatenated payloads; never log request bodies, tokens, keys, connection strings or PII (mask via `sensitive-data-masking-in-logs`).
- **MANDATORY:** The error middleware logs once per error with route metadata only (`error-logging`).
- **Verified convention:** Wrapper keeps the package's call shape `(obj | Error | msg, msg?)` and adds `correlationId` from AsyncLocalStorage; `closeLogger()` calls the package `close()` during shutdown to flush the optional Event Hub sink.
- **UNRESOLVED — do not enforce; report (C-02):** One reference service uses a `FlexibleLogger` accepting legacy `(msg, meta)` and passes `correlationId` manually. Do not copy; in that repo new code uses `(meta, msg)`.

_Source of truth: `OBS-01`, `OBS-02`, `OBS-03`, `CTX-01`, `ERR-06`, `PKG-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Locate the logger module; reuse it. If missing, create it per `logger-initialization`.
2. Write logs as `logger.<level>({ ids and facts }, "Short past-tense or imperative message")`.
3. Add `child()` loggers only for long-lived components with stable bindings.
4. Add tests with the logger mocked.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Service logger wrapper (reference)**

```ts
import inextLogger, { serializeError } from "@inextlabs/logger";
import { getCorrelationId } from "@general/utils/correlationContext";
function log(level: "debug" | "info" | "warn" | "error", objOrMsg: object | string, msg?: string) {
  const correlationId = getCorrelationId();
  if (typeof objOrMsg === "string") return correlationId ? inextLogger[level]({ correlationId }, objOrMsg) : inextLogger[level](objOrMsg);
  if (objOrMsg instanceof Error) return inextLogger[level]({ ...(correlationId && { correlationId }), err: serializeError(objOrMsg) }, msg);
  return inextLogger[level]({ ...(correlationId && { correlationId }), ...objOrMsg }, msg);
}
export const logger = { debug: (o: object | string, m?: string) => log("debug", o, m), info: (o: object | string, m?: string) => log("info", o, m),
  warn: (o: object | string, m?: string) => log("warn", o, m), error: (o: object | Error | string, m?: string) => log("error", o, m) };
export const closeLogger = () => inextLogger.close();
export { serializeError };
```

**Typical statements**

```ts
logger.info({ method: req.method, path: req.originalUrl }, "Incoming request");
logger.warn({ subscriptionId, status }, "Downstream notification failed");
logger.error(err, "Startup error");
```

## Error and failure handling
- Logging must never throw or block the request path; the wrapper must tolerate circular objects (package is circular-safe).
- Observability code must never throw into the request path; failures degrade to no-op with a warning (OBS-05).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Never log `authorization`, cookies, tokens, `x-internal-api-key`, connection strings, request bodies.
- Mask sensitive fields with the shared mask configuration before logging or exporting telemetry (OBS-03); never log request bodies on the error path.

## Testing guidelines
- Mock `@inextlabs/logger` as `{ default: mockLogger, serializeError, createMasker }` and assert level/message/fields; assert correlation ID appears when ALS is bound.
- Mock `@inextlabs/logger` per the shared test-double pattern (TEST-02) and assert level, message and structured fields; assert no secret/PII values are emitted.

## Anti-patterns
- `console.log`.
- `logger.info("msg", obj)` order.
- Logging whole error payloads/events (log ids and types).
- A second logger module (stale `v1/utils/logger.ts` duplicates are defects).

## Implementation checklist
- [ ] Approved package only; Pino order; level by impact; no PII; correlation automatic; tests.

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
- Import the logger from the service's single logger module, which wraps `@inextlabs/logger`. No other logging library (`console`, `pino`, `winston`, `bunyan`, usage-utils' winston `createLogger`) may be added (PKG-01, C-02). `winston` appearing in a manifest is an unused dependency to report, not a pattern.
- Use **Pino argument order**: `logger.info({ field: value }, "message")`; errors as `logger.error(err, "message")` or `{ err: serializeError(err) }`. The legacy `(message, meta)` order (Winston style) must not appear in new code.
- Levels `trace | debug | info | warn | error | fatal` (see `log-level-standards`); output is JSON with `service`, `environment`, `version`, `level`, `time`, `pid`, `hostname`, `msg` (guaranteed by the package).
- `correlationId` is added automatically by the service wrapper from async context (do not pass it manually in every call).
- Request lifecycle logging: "Incoming request" and a completion log with `method`, `path`, `statusCode`, `durationMs`; level by status (5xx `error`, 4xx `warn`, else `info`).
- Log structured fields, never string-concatenated payloads; never log request bodies, tokens, keys, connection strings or PII (mask via `sensitive-data-masking-in-logs`).
- The error middleware logs once per error with route metadata only (`error-logging`).

## Related skills
- `logger-initialization` — Logger Initialization
- `log-level-standards` — Log Level Standards
- `correlation-id-management` — Correlation ID Management
- `error-logging` — Error Logging
- `sensitive-data-masking-in-logs` — Sensitive Data Masking in Logs
- `mocking-test-doubles` — Mocking & Test Doubles
