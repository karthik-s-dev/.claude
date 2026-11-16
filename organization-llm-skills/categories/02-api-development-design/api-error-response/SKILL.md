---
name: api-error-response
description: Use whenever an API returns or must return an error: building the error envelope, choosing the catalog entry and HTTP status, handling unknown errors, validation failures, CORS/rate-limit rejections. Always reuses the canonical error catalog and the single error middleware.
---

# API Error Response

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `api-error-response` |
| Category | 02 — API Development & Design |
| Scope | Error response contract and how it is produced. |
| Applicability | JSON/HTTP APIs using `@inextlabs/platform-errors`. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | MANDATED (ARCH-LLD-003 envelope, API-03) |
| Governing standards | `API-03`, `ERR-01`, `ERR-02`, `ERR-05`, `ERR-06`, `ERR-07`, `API-10` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `error-catalog-management`, `error-code-standards`, `exception-to-error-mapping`, `http-status-codes`, `global-exception-handling` |

## Purpose
Clients branch on stable codes and never see internals; every error carries the correlation ID.

## When to use
- Adding an error path to an endpoint.
- Handling a new failure type (CORS, rate limit, timeout, dependency).
- Reviewing hand-written error bodies.

## Organizational standards
- **MANDATORY:** Body is exactly `{ success:false, error:{ code, numericCode, message, details? }, metadata:{ correlationId, timestamp } }`, built by `{ success:false, ...formatError(appError, correlationId) }` (ARCH-LLD-003).
- **MANDATORY:** `code` and `numericCode` come from the service's error catalog (`error-catalog-management`, `error-code-standards`); no ad-hoc codes (`RATE_LIMITED`, `TENANT_ID_INVALID` outside the catalog are defects).
- **MANDATORY:** Only the global error middleware writes error bodies; handlers `throw`/`next(err)`.
- **MANDATORY:** `details` contains caller-supplied, public-safe context only (ERR-07).
- **MANDATORY:** Wrap non-`AppError` into `UNHANDLED_ERROR` before formatting; `formatError` alone yields `UNKNOWN_ERROR`/`"0"` (ERR-05).
- **Verified convention:** Status mapping per `http-status-codes`; 5xx logged at `error`, 4xx at `warn` with route metadata only (ERR-06).

_Source of truth: `API-03`, `ERR-01`, `ERR-02`, `ERR-05`, `ERR-06`, `ERR-07`, `API-10`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Find the catalog entry (or add one via `error-catalog-management`).
2. Throw it with safe `details`.
3. Confirm the route chain ends in the surface's error middleware.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Throw and respond**

```ts
if (!client) throwConfigError("CLIENT_CONFIG_NOT_FOUND", { clientId });   // catalog entry -> AppError(404, ...)
// error middleware (single place)
return res.status(appError.statusCode).json({ success: false, ...formatError(appError, correlationId) });
```

## Error and failure handling
- A 429 from a rate limiter, a CORS rejection and an auth failure must use the same envelope with catalogued codes.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Never include stack, driver messages, connection strings or SQL/Mongo operators in `details` or `message`.
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- Snapshot of the envelope; test that an unknown thrown value becomes `UNHANDLED_ERROR` with no `details`.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- `res.status(400).json({ error: "bad" })`.
- Branching client logic on `message`.
- Returning `err.message` to clients.

## Implementation checklist
- [ ] Envelope exact; catalogued; correlation present; no leaks.

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
- Body is exactly `{ success:false, error:{ code, numericCode, message, details? }, metadata:{ correlationId, timestamp } }`, built by `{ success:false, ...formatError(appError, correlationId) }` (ARCH-LLD-003).
- `code` and `numericCode` come from the service's error catalog (`error-catalog-management`, `error-code-standards`); no ad-hoc codes (`RATE_LIMITED`, `TENANT_ID_INVALID` outside the catalog are defects).
- Only the global error middleware writes error bodies; handlers `throw`/`next(err)`.
- `details` contains caller-supplied, public-safe context only (ERR-07).
- Wrap non-`AppError` into `UNHANDLED_ERROR` before formatting; `formatError` alone yields `UNKNOWN_ERROR`/`"0"` (ERR-05).

## Related skills
- `error-catalog-management` — Error Catalog Management
- `error-code-standards` — Error Code Standards
- `exception-to-error-mapping` — Exception-to-Error Mapping
- `http-status-codes` — HTTP Status Codes
- `global-exception-handling` — Global Exception Handling
