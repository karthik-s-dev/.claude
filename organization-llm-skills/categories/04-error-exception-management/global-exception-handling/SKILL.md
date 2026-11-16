---
name: global-exception-handling
description: Use when creating or changing the Express error middleware, the unhandled-error path, or when an error response bypasses the standard envelope. Defines the single global handler per API surface.
---

# Global Exception Handling

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `global-exception-handling` |
| Category | 04 — Error & Exception Management |
| Scope | The one place that converts errors into HTTP responses and log lines. |
| Applicability | Express with `@inextlabs/platform-errors` and `@inextlabs/logger`. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | MANDATED envelope (ARCH-LLD-003) + VERIFIED middleware |
| Governing standards | `ERR-05`, `ERR-06`, `ERR-07`, `API-03`, `ARCH-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `error-catalog-management`, `exception-to-error-mapping`, `error-logging`, `api-error-response`, `middleware-request-pipeline` |

## Purpose
No error reaches a client except through one formatter; every error is logged once with correlation.

## When to use
- New API surface or version.
- CORS/auth/rate-limit rejections returning custom bodies.

## Organizational standards
- **MANDATORY:** Exactly one error middleware per API surface, mounted **after** all routes (and after the correlation middleware's scope).
- **MANDATORY:** Derive `correlationId = req.correlationId ?? getCorrelationId() ?? "unknown"`; map to `AppError` (`toAppError`; typed errors such as `CorsRejectedError` are mapped **by type**, not by message); log once; respond `res.status(appError.statusCode).json({ success: false, ...formatError(appError, correlationId) })`.
- **MANDATORY:** Log `warn` for status < 500 and `error` for >= 500 with route metadata (`correlationId`, `method`, `route`), `statusCode`, `code`, `details`, and `err: serializeError(original)`; never body, params or query.
- **MANDATORY:** Response never contains stack, driver messages or connection strings; `details` public-safe only.
- **MANDATORY:** Include `asyncHandler` or equivalent so async route rejections reach the middleware (Express 4 does not).

_Source of truth: `ERR-05`, `ERR-06`, `ERR-07`, `API-03`, `ARCH-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Create/locate the middleware; make it the last `app.use` for its path prefix.
2. Add type-based branches for framework/typed errors.
3. Test it with thrown AppError, thrown Error, thrown string.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Error middleware (reference, condensed)**

```ts
export function errorMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const correlationId = req.correlationId ?? getCorrelationId() ?? "unknown";
  const appError = err instanceof CorsRejectedError ? corsAppError() : toAppError(err);
  const meta = { correlationId, method: req.method, route: req.route?.path ?? req.originalUrl.split("?")[0],
                 statusCode: appError.statusCode, code: appError.code, details: appError.details, err: serializeError(err instanceof Error ? err : new Error(String(err))) };
  appError.statusCode >= 500 ? logger.error(meta, "Unhandled error: " + appError.message) : logger.warn(meta, "AppError: " + appError.message);
  return res.status(appError.statusCode).json({ success: false, ...formatError(appError, correlationId) });
}
```

## Error and failure handling
- The middleware must never throw; guard serialization failures and fall back to a minimal catalog 500.
- Catch only where you can add context or translate; otherwise let the error propagate to the global handler (ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Never reveal whether a resource exists to unauthorized callers (use consistent 404/403 policy per service).
- `AppError.details` is public; internal causes live only on `Error.cause` and in logs (ERR-07).

## Testing guidelines
- AppError, generic Error (-> `UNHANDLED_ERROR`, no details), string throw, CORS error, async handler rejection.
- Assert code, numericCode, HTTP status and envelope for each catalog entry touched; assert that unknown errors become `UNHANDLED_ERROR` with no leaked detail.

## Anti-patterns
- Multiple formatters.
- `res.send(err.message)`.
- Calling `formatError(err)` on a raw error (yields `UNKNOWN_ERROR`/`"0"`).

## Implementation checklist
- [ ] One middleware, last; wraps strays; logs once; envelope exact.

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
- Exactly one error middleware per API surface, mounted **after** all routes (and after the correlation middleware's scope).
- Derive `correlationId = req.correlationId ?? getCorrelationId() ?? "unknown"`; map to `AppError` (`toAppError`; typed errors such as `CorsRejectedError` are mapped **by type**, not by message); log once; respond `res.status(appError.statusCode).json({ success: false, ...formatError(appError, correlationId) })`.
- Log `warn` for status < 500 and `error` for >= 500 with route metadata (`correlationId`, `method`, `route`), `statusCode`, `code`, `details`, and `err: serializeError(original)`; never body, params or query.
- Response never contains stack, driver messages or connection strings; `details` public-safe only.
- Include `asyncHandler` or equivalent so async route rejections reach the middleware (Express 4 does not).

## Related skills
- `error-catalog-management` — Error Catalog Management
- `exception-to-error-mapping` — Exception-to-Error Mapping
- `error-logging` — Error Logging
- `api-error-response` — API Error Response
- `middleware-request-pipeline` — Middleware & Request Pipeline
