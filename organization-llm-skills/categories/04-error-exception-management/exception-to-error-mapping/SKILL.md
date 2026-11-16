---
name: exception-to-error-mapping
description: Use when translating third-party, driver, SDK, HTTP-client or framework exceptions into catalogued AppErrors - including keeping the original on Error.cause for logs only and mapping confirmed-absent vs unavailable.
---

# Exception-to-Error Mapping

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `exception-to-error-mapping` |
| Category | 04 — Error & Exception Management |
| Scope | Boundary translation of foreign exceptions. |
| Applicability | TypeScript/Node. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (ERR-05, ERR-09) |
| Governing standards | `ERR-05`, `ERR-09`, `ERR-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `error-catalog-management`, `integration-error-handling`, `technical-exception-handling`, `global-exception-handling`, `api-error-response` |

## Purpose
Foreign errors never reach clients directly and are always classifiable.

## When to use
- Calling Mongo, Redis, HTTP, Service Bus, SDKs.
- Writing a repository or integration module.

## Organizational standards
- **MANDATORY:** Provide `toAppError(err)`: `AppError` passes through; anything else becomes `UNHANDLED_ERROR` with `details` **undefined** and the original assigned to `Error.cause` (and its stack preserved) for the logger only.
- **MANDATORY:** Integration modules translate known statuses explicitly (404 -> `null` or `*_NOT_FOUND`; 4xx -> specific catalog entry; 5xx/timeout/network -> `*_UNAVAILABLE` / upstream error).
- **MANDATORY:** Typed error classes for dependency failures (`ConfigServiceUnavailableError(message, status)`, `UsageReadError(message, context)`) carry structured context and are mapped to catalog entries at the edge.
- **Verified convention:** Use `serializeError` from `@inextlabs/logger` for log lines; it walks `cause`.

_Source of truth: `ERR-05`, `ERR-09`, `ERR-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. In each integration, wrap SDK calls; map by status/type, not message.
2. Keep one `toAppError` per service.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**toAppError (reference)**

```ts
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  const e = ErrorCatalog.UNHANDLED_ERROR;
  const appError = new AppError(e.httpStatus, "UNHANDLED_ERROR", e.numericCode, e.message, undefined);
  (appError as unknown as { cause: unknown }).cause = err;       // logs only
  if (err instanceof Error && err.stack) appError.stack = err.stack;
  return appError;
}
```

## Error and failure handling
- Mapping must never throw; default to `UNHANDLED_ERROR`.
- Catch only where you can add context or translate; otherwise let the error propagate to the global handler (ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- `cause` and stack must not be serialized into responses.
- `AppError.details` is public; internal causes live only on `Error.cause` and in logs (ERR-07).

## Testing guidelines
- Mongo/axios/SDK errors -> expected catalog key; `details` undefined; cause preserved.
- Assert code, numericCode, HTTP status and envelope for each catalog entry touched; assert that unknown errors become `UNHANDLED_ERROR` with no leaked detail.

## Anti-patterns
- `details: err.message`.
- Message-substring matching.

## Implementation checklist
- [ ] Typed mapping; cause kept; no leakage.

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
- Provide `toAppError(err)`: `AppError` passes through; anything else becomes `UNHANDLED_ERROR` with `details` **undefined** and the original assigned to `Error.cause` (and its stack preserved) for the logger only.
- Integration modules translate known statuses explicitly (404 -> `null` or `*_NOT_FOUND`; 4xx -> specific catalog entry; 5xx/timeout/network -> `*_UNAVAILABLE` / upstream error).
- Typed error classes for dependency failures (`ConfigServiceUnavailableError(message, status)`, `UsageReadError(message, context)`) carry structured context and are mapped to catalog entries at the edge.

## Related skills
- `error-catalog-management` — Error Catalog Management
- `integration-error-handling` — Integration Error Handling
- `technical-exception-handling` — Technical Exception Handling
- `global-exception-handling` — Global Exception Handling
- `api-error-response` — API Error Response
