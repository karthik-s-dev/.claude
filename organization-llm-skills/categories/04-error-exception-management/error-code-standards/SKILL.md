---
name: error-code-standards
description: Use when constructing, validating or reviewing numeric error codes - PLATFORM_CODE + SERVICE_CODE + MODULE_NUM + sequence (001...) - choosing module numbers and sequences, registering a service number, or detecting duplicates and legacy code schemes.
---

# Error Code Standards

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `error-code-standards` |
| Category | 04 — Error & Exception Management |
| Scope | Error-code composition, registry and uniqueness rules. |
| Applicability | All services; helper `makeErrorCode` in `@inextlabs/inflow-usage-utils`. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | MANDATED (task + ADR-004); MM policy UNRESOLVED (C-01) |
| Governing standards | `ERR-03`, `ERR-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `error-catalog-management`, `exception-to-error-mapping`, `api-error-response`, `breaking-change-review`, `api-compatibility-review` |

## Purpose
Greppable, stable, service-encoded codes that never collide across the platform.

## When to use
- Creating the first catalog of a new service.
- Adding a module/area to a catalog.
- Reviewing code that builds codes by hand or uses `50xxx` / `INXT50xxx`.

## Organizational standards
- **MANDATORY:** `numericCode = PLATFORM_CODE + SERVICE_CODE + MODULE_NUM + SEQ` as an **8-character string**: `PLATFORM_CODE` = `1` (always, 1 digit); `SERVICE_CODE` = 2 digits, zero-padded, registered per service (config 02, enforcement 03, ingestion 04, rollup 05, portal 06); `MODULE_NUM` = 2 digits, zero-padded; `SEQ` = 3 digits starting `001`, zero-padded. Example `makeErrorCode(3, 0, 1) -> "10300001"`.
- **MANDATORY:** Human-readable service prefix (when needed in a code string) is `"INXT1" + SS` (`makeServicePrefix(3) -> "INXT103"`).
- **MANDATORY:** New services register a **new** `SERVICE_CODE` in the shared registry; never reuse another service's.
- **MANDATORY:** Uniqueness is per `(SERVICE_CODE, MODULE_NUM, SEQ)`; a number is never reused or changed once released; duplicates are prevented by a catalog test and code review.
- **MANDATORY:** `SERVICE_CODE` is a single constant imported by the catalog and the logger configuration (reference defect: `"02"` in the catalog vs `"102"` in logger bootstrap); do not read it from env with literal fallbacks.
- **Verified convention:** Sequence banding (shared registry doc + config catalog): 001-010 validation(400) · 011 authentication(401) · 012 authorization(403) · 013-022 not found(404) · 023-034 infrastructure(500) · 035-048 business logic · 049-050 external dependency(502/503) · 051-052 catch-all(500).
- **UNRESOLVED — do not enforce; report (C-01):** `MODULE_NUM` policy - reference service A fixes `00` and uses banding; reference service B uses `MM` = source file/area (01..07) with per-file sequences and no banding. Follow the target repo's policy; do not change codes already shipped; propose (do not decide) a functional-module policy.
- **MANDATORY (prohibition) extend legacy schemes:** `error-codes.ts` (`50` + HTTP status, e.g. `50404`) and vendored `HttpError` (`INXT50` + HTTP status) - they are legacy (C-01).

_Source of truth: `ERR-03`, `ERR-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Read the target catalog header for its MM/banding rules and the service registry for `SERVICE_CODE`.
2. Compute the code with `makeErrorCode(ss, mm, seq)` (or the exact padded concatenation if the package is absent - then report the missing dependency).
3. Add a test that asserts format `^1\d{2}\d{2}\d{3}$` and uniqueness.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Construction and validation**

```ts
const code = makeErrorCode(3, 4, 2);                 // "10304002" -> platform 1, service 03, module 04, seq 002
const prefix = makeServicePrefix(3);                  // "INXT103"
it("codes are unique and well-formed", () => {
  const nums = Object.values(EC).map((e) => e.num);
  expect(new Set(nums).size).toBe(nums.length);
  nums.forEach((n) => expect(n).toMatch(/^1\d{2}\d{2}\d{3}$/));
});
```

## Error and failure handling
- A duplicate code is a build failure (test), not a runtime concern.
- Catch only where you can add context or translate; otherwise let the error propagate to the global handler (ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- `AppError.details` is public; internal causes live only on `Error.cause` and in logs (ERR-07).

## Testing guidelines
- Format, uniqueness, banding (if used), status/category consistency.
- Assert code, numericCode, HTTP status and envelope for each catalog entry touched; assert that unknown errors become `UNHANDLED_ERROR` with no leaked detail.

## Anti-patterns
- Hand-concatenating with `||` fallbacks.
- Different `SERVICE_CODE` in logger vs catalog.
- Reusing a retired number.
- Inventing a new code format.

## Implementation checklist
- [ ] 8 digits; unique; constant `SERVICE_CODE`; test; no legacy scheme used.

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
- `numericCode = PLATFORM_CODE + SERVICE_CODE + MODULE_NUM + SEQ` as an **8-character string**: `PLATFORM_CODE` = `1` (always, 1 digit); `SERVICE_CODE` = 2 digits, zero-padded, registered per service (config 02, enforcement 03, ingestion 04, rollup 05, portal 06); `MODULE_NUM` = 2 digits, zero-padded; `SEQ` = 3 digits starting `001`, zero-padded. Example `makeErrorCode(3, 0, 1) -> "10300001"`.
- Human-readable service prefix (when needed in a code string) is `"INXT1" + SS` (`makeServicePrefix(3) -> "INXT103"`).
- New services register a **new** `SERVICE_CODE` in the shared registry; never reuse another service's.
- Uniqueness is per `(SERVICE_CODE, MODULE_NUM, SEQ)`; a number is never reused or changed once released; duplicates are prevented by a catalog test and code review.
- `SERVICE_CODE` is a single constant imported by the catalog and the logger configuration (reference defect: `"02"` in the catalog vs `"102"` in logger bootstrap); do not read it from env with literal fallbacks.
- MUST NOT: `error-codes.ts` (`50` + HTTP status, e.g. `50404`) and vendored `HttpError` (`INXT50` + HTTP status) - they are legacy (C-01).

## Related skills
- `error-catalog-management` — Error Catalog Management
- `exception-to-error-mapping` — Exception-to-Error Mapping
- `api-error-response` — API Error Response
- `breaking-change-review` — Breaking Change Review
- `api-compatibility-review` — API Compatibility Review
