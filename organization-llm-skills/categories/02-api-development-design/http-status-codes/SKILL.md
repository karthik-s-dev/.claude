---
name: http-status-codes
description: Use when choosing or reviewing HTTP status codes for responses and catalog entries (400/401/403/404/409/412/429/502/503/504/207/410). Encodes the organization's mapping, including quota-exceeded 429, idempotency 409s and partial-success 207.
---

# HTTP Status Codes

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `http-status-codes` |
| Category | 02 — API Development & Design |
| Scope | Status code selection and error-category mapping. |
| Applicability | HTTP APIs. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (API-10) |
| Governing standards | `API-10`, `ERR-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `api-error-response`, `error-catalog-management`, `api-response-structure`, `exception-to-error-mapping` |

## Purpose
Consistent status semantics across services and between catalog entries and responses.

## When to use
- Adding catalog entries.
- Mapping a dependency failure or business rule to a status.

## Organizational standards
- **MANDATORY:** 400 validation/malformed; 401 unauthenticated; 403 authenticated but not allowed (incl. CORS rejection, client-claim mismatch); 404 confirmed absence; 409 idempotency key reuse with different payload or duplicate in progress; 412 optimistic-concurrency conflict; 429 rate limit or **quota exceeded** (with `Retry-After` where known); 502 upstream returned an error; 503 dependency unavailable (cache, broker, auth misconfigured); 504 request budget exceeded; 410 retired route.
- **MANDATORY:** **207** when the primary operation succeeded but audit/event publication failed.
- **MANDATORY:** Business-rule violations map to 4xx; do not map them to 500 (reference defect: `BOT_INFO_NOT_FOUND`, `RUNTIME_FIELD_MISSING`).
- **Verified convention:** Catalog grouping follows these classes; sequence banding is described in `error-code-standards`.

_Source of truth: `API-10`, `ERR-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Choose the status by who can fix it: caller (4xx), service/dependency (5xx).
2. Store the status in the catalog entry; controllers never choose statuses for errors.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Mapping table**

```text
validation 400 | unauthenticated 401 | forbidden 403 | not found 404 | idempotency conflict/in-progress 409
version conflict 412 | quota exceeded/rate limited 429 | upstream error 502 | dependency unavailable 503 | timeout 504 | partial success 207 | retired 410
```

## Error and failure handling
- Unknown failure -> 500 `UNHANDLED_ERROR`.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- Parameterized test: each catalog key -> expected status.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- 200 with an error body.
- 500 for caller mistakes.
- 404 for authorization failures that should be 403 (unless deliberately hiding existence, then document).

## Implementation checklist
- [ ] Each new catalog entry has a justified status.

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
- 400 validation/malformed; 401 unauthenticated; 403 authenticated but not allowed (incl. CORS rejection, client-claim mismatch); 404 confirmed absence; 409 idempotency key reuse with different payload or duplicate in progress; 412 optimistic-concurrency conflict; 429 rate limit or **quota exceeded** (with `Retry-After` where known); 502 upstream returned an error; 503 dependency unavailable (cache, broker, auth misconfigured); 504 request budget exceeded; 410 retired route.
- **207** when the primary operation succeeded but audit/event publication failed.
- Business-rule violations map to 4xx; do not map them to 500 (reference defect: `BOT_INFO_NOT_FOUND`, `RUNTIME_FIELD_MISSING`).

## Related skills
- `api-error-response` — API Error Response
- `error-catalog-management` — Error Catalog Management
- `api-response-structure` — API Response Structure
- `exception-to-error-mapping` — Exception-to-Error Mapping
