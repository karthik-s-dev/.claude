---
name: logger-initialization
description: Use when configuring @inextlabs/logger at service start - configureLogger() once before any module imports the logger, level/service/environment/version/serviceCode/mask options, extra createLogger instances, Event Hub sink, close() on shutdown.
---

# Logger Initialization

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `logger-initialization` |
| Category | 06 — Observability & Health Management |
| Scope | One-time logger configuration and lifecycle. |
| Applicability | Node/TypeScript with `@inextlabs/logger`. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | MANDATED (package) + VERIFIED bootstrap; C-02 |
| Governing standards | `OBS-01`, `ARCH-03`, `CFG-05`, `ERR-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `structured-logging`, `service-registration-lifecycle`, `sensitive-data-masking-in-logs`, `log-level-standards`, `application-monitoring` |

## Purpose
The singleton proxy only reflects configuration applied before other modules grab it.

## When to use
- Creating `server.ts`/bootstrap.
- Logs show default service name or missing mask.

## Organizational standards
- **MANDATORY:** Call `configureLogger({ level, service, version?, environment, serviceCode, mask })` **once**, in a dedicated bootstrap module (`logger.bootstrap.ts#initLogger`), **before** importing `app` or any module that logs (package README; reference `server.ts`).
- **MANDATORY:** `level` from `LOG_LEVEL` (default `info`); `service` from `SERVICE_NAME`; `environment` from `APP_ENV`/`DEPLOYMENT_ENV`; `serviceCode` uses the same constant as the error catalog (reference mismatch `"02"` vs `"102"` is a defect, ERR-03); `mask` = the service `MASK_CONFIG` (`sensitive-data-masking-in-logs`).
- **MANDATORY:** Validate `LOG_LEVEL` against the allowed set rather than casting blindly (reference weakness).
- **MANDATORY:** Call `close()` (via `closeLogger()`) during graceful shutdown **after** draining HTTP so the Event Hub sink flushes (`AZURE_EVENTHUB_NAMESPACE`, `AZURE_EVENTHUB_NAME` optional; stdout otherwise).
- **Verified convention:** Isolated loggers (for example audit) use `createLogger({ service, level, mask })`; the other reference service builds its single logger with `createLogger({ service, level, eventHub? })` - acceptable when the package default singleton is not used (C-02) but never mix both for the same service.
- **Generic baseline (provisional):** Pass `version` from `SERVICE_VERSION`.

_Source of truth: `OBS-01`, `ARCH-03`, `CFG-05`, `ERR-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Create `initLogger()`; call it right after env validation and before importing the app.
2. Export a wrapper (see `structured-logging`).
3. In tests, mock the package (no real configuration).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Bootstrap module (reference)**

```ts
import { configureLogger, type LogLevel } from "@inextlabs/logger";
import { MASK_CONFIG } from "@general/service/logger";
export function initLogger(): void {
  configureLogger({
    level: (process.env.LOG_LEVEL as LogLevel) ?? "info",
    service: process.env.SERVICE_NAME ?? "<service-name>",
    serviceCode: SERVICE_CODE,                  // same constant as the error catalog
    environment: process.env.APP_ENV ?? "development",
    mask: MASK_CONFIG,
  });
}
```

## Error and failure handling
- If `configureLogger` throws, the process exits with a stderr line (logger not yet available).
- Observability code must never throw into the request path; failures degrade to no-op with a warning (OBS-05).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask sensitive fields with the shared mask configuration before logging or exporting telemetry (OBS-03); never log request bodies on the error path.

## Testing guidelines
- Bootstrap order test (logger configured before app import); mask applied to a sample.
- Mock `@inextlabs/logger` per the shared test-double pattern (TEST-02) and assert level, message and structured fields; assert no secret/PII values are emitted.

## Anti-patterns
- Calling `configureLogger` after importing modules that logged.
- Two configurations.
- Unvalidated casts.

## Implementation checklist
- [ ] Single call before imports; level validated; service constant shared; close on shutdown.

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
- Call `configureLogger({ level, service, version?, environment, serviceCode, mask })` **once**, in a dedicated bootstrap module (`logger.bootstrap.ts#initLogger`), **before** importing `app` or any module that logs (package README; reference `server.ts`).
- `level` from `LOG_LEVEL` (default `info`); `service` from `SERVICE_NAME`; `environment` from `APP_ENV`/`DEPLOYMENT_ENV`; `serviceCode` uses the same constant as the error catalog (reference mismatch `"02"` vs `"102"` is a defect, ERR-03); `mask` = the service `MASK_CONFIG` (`sensitive-data-masking-in-logs`).
- Validate `LOG_LEVEL` against the allowed set rather than casting blindly (reference weakness).
- Call `close()` (via `closeLogger()`) during graceful shutdown **after** draining HTTP so the Event Hub sink flushes (`AZURE_EVENTHUB_NAMESPACE`, `AZURE_EVENTHUB_NAME` optional; stdout otherwise).

## Related skills
- `structured-logging` — Structured Logging
- `service-registration-lifecycle` — Service Registration & Lifecycle
- `sensitive-data-masking-in-logs` — Sensitive Data Masking in Logs
- `log-level-standards` — Log Level Standards
- `application-monitoring` — Application Monitoring
