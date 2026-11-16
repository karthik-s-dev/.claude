---
name: error-catalog-management
description: Use when adding, changing, deprecating or referencing an error in a service - the single typed error catalog, numeric/semantic codes, HTTP mapping, throw helpers and catch-all. This is the canonical error-catalog skill; always reuse it from API, integration, messaging and security work and never create a second error mechanism.
---

# Error Catalog Management

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `error-catalog-management` |
| Category | 04 — Error & Exception Management |
| Scope | Definition and use of the service error catalog. |
| Applicability | Services using `@inextlabs/platform-errors` (Node/TypeScript reference). |
| Evidence | E1 — consistent across both reference repositories |
| Classification | MANDATED (task + ARCH-LLD-003 / ADR-004) + VERIFIED |
| Governing standards | `ERR-01`, `ERR-02`, `ERR-03`, `ERR-04`, `ERR-05`, `ERR-09`, `PKG-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `error-code-standards`, `exception-to-error-mapping`, `global-exception-handling`, `api-error-response`, `business-exception-handling`, `technical-exception-handling` |

## Purpose
Every failure has a stable identity (code + numericCode + HTTP status + safe message) defined in one place and thrown through one helper.

## When to use
- Any new failure path in application code.
- Adding or changing an error code.
- Reviewing code that throws `new Error(...)`, returns ad-hoc bodies or matches on message text.

## Organizational standards
- **MANDATORY:** One catalog per service as a `const` map; entries `{ numericCode | num, httpStatus | http, code, message }`; the service also defines `UNHANDLED_ERROR` (catch-all) - ERR-02.
- **MANDATORY:** Errors are thrown as `AppError(statusCode, code, numericCode, message, details?)` from `@inextlabs/platform-errors`, via a catalog helper (`throwXError(key, details?)` or `appErr(entry, details?)`); never `throw new Error()` for expected failures.
- **MANDATORY:** `numericCode` follows `PLATFORM_CODE + SERVICE_CODE + MODULE_NUM + SEQ` (8 digits; see `error-code-standards`); build it with the service's single local `makeErrorCode(ss, mm, seq)` helper (see `error-code-standards`).
- **MANDATORY:** Codes are append-only: never reuse, renumber or rename; deprecate by comment, keep the entry.
- **MANDATORY:** Messages are generic, safe, human-readable and **never** parsed by clients or code.
- **MANDATORY:** Group entries and comment the scheme/ranges at the top; document reserved ranges in comments.
- **Verified convention:** Reference service A groups by HTTP category with reserved ranges; reference service B groups by `MM` source-file with a header table (C-01). Follow the target's grouping.
- **MANDATORY:** Add a catalog test (see Testing) that fails on duplicate numeric codes, malformed codes, and status/category mismatches (GENERIC addition; present partially in `error-catalog.test.ts` of the enforcement repo).

_Source of truth: `ERR-01`, `ERR-02`, `ERR-03`, `ERR-04`, `ERR-05`, `ERR-09`, `PKG-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Open the target's catalog; find the banding/MM rules in its header comment.
2. Pick the next free sequence in the right band/module; add the entry; write the test assertion.
3. Throw with safe `details` only.
4. Update OpenAPI error responses and docs.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Catalog entry and helper (reference shape)**

```ts
export const ErrorCatalog = {
  // 1xxx: Validation (400)
  VALIDATION_FAILED: { numericCode: makeErrorCode(SS, MM, 3), httpStatus: 400, message: "Request validation failed" },
  CLIENT_CONFIG_NOT_FOUND: { numericCode: makeErrorCode(SS, MM, 13), httpStatus: 404, message: "Client configuration not found" },
  UNHANDLED_ERROR: { numericCode: makeErrorCode(SS, MM, 51), httpStatus: 500, message: "An unhandled error occurred" },
} as const;
export type ErrorCodeKey = keyof typeof ErrorCatalog;
export function throwServiceError(key: ErrorCodeKey, details?: unknown): never {
  const e = ErrorCatalog[key];
  throw new AppError(e.httpStatus, key, e.numericCode, e.message, details);
}
```

## Error and failure handling
- Unknown thrown values are wrapped as `UNHANDLED_ERROR` at the boundary (`exception-to-error-mapping`).
- Catch only where you can add context or translate; otherwise let the error propagate to the global handler (ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Messages must not reveal existence of resources to unauthorized callers where that matters; no stack/driver text.
- `AppError.details` is public; internal causes live only on `Error.cause` and in logs (ERR-07).

## Testing guidelines
- Catalog test: all `numericCode` unique, match `/^1\d{7}$/`, status within allowed set; each key referenced in code exists.
- Assert code, numericCode, HTTP status and envelope for each catalog entry touched; assert that unknown errors become `UNHANDLED_ERROR` with no leaked detail.

## Anti-patterns
- Second catalog or enum for the same service.
- `code` derived from message text.
- Renumbering existing entries.
- Using error codes of another service.

## Implementation checklist
- [ ] Entry appended; unique; helper used; test updated; docs updated.

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
- One catalog per service as a `const` map; entries `{ numericCode | num, httpStatus | http, code, message }`; the service also defines `UNHANDLED_ERROR` (catch-all) - ERR-02.
- Errors are thrown as `AppError(statusCode, code, numericCode, message, details?)` from `@inextlabs/platform-errors`, via a catalog helper (`throwXError(key, details?)` or `appErr(entry, details?)`); never `throw new Error()` for expected failures.
- `numericCode` follows `PLATFORM_CODE + SERVICE_CODE + MODULE_NUM + SEQ` (8 digits; see `error-code-standards`); build it with the service's single local `makeErrorCode(ss, mm, seq)` helper (see `error-code-standards`).
- Codes are append-only: never reuse, renumber or rename; deprecate by comment, keep the entry.
- Messages are generic, safe, human-readable and **never** parsed by clients or code.
- Group entries and comment the scheme/ranges at the top; document reserved ranges in comments.
- Add a catalog test (see Testing) that fails on duplicate numeric codes, malformed codes, and status/category mismatches (GENERIC addition; present partially in `error-catalog.test.ts` of the enforcement repo).

## Related skills
- `error-code-standards` — Error Code Standards
- `exception-to-error-mapping` — Exception-to-Error Mapping
- `global-exception-handling` — Global Exception Handling
- `api-error-response` — API Error Response
- `business-exception-handling` — Business Exception Handling
- `technical-exception-handling` — Technical Exception Handling
