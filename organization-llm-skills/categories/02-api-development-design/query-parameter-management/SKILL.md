---
name: query-parameter-management
description: Use when defining, parsing or validating query parameters for lists, filters, sorting, paging and flags. Enforces schema validation with coercion, bounded values and tenant-identity consistency.
---

# Query Parameter Management

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `query-parameter-management` |
| Category | 02 — API Development & Design |
| Scope | Query-string contract. |
| Applicability | HTTP APIs. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (API-05, API-06) |
| Governing standards | `API-05`, `API-06` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `request-validation`, `api-pagination`, `api-filtering-sorting`, `api-design-standards` |

## Purpose
Predictable, bounded, validated query inputs.

## When to use
- Adding list/filter endpoints.
- Accepting booleans/numbers/dates in query.

## Organizational standards
- **MANDATORY:** Validate with the `query` segment schema; coerce types (`z.coerce.number()`), set defaults and server-side maximums.
- **MANDATORY:** Tenant identifiers in query (`clientId`, `tenantId`) must match the authenticated claim (see `api-request-structure`).
- **Verified convention:** Paging params are `page` and `limit` (reference service A) or `page` and `pageSize` (reference service B) - follow the target service (C-09).
- **Generic baseline (provisional):** Names `camelCase`; booleans accept `true|false` only.

_Source of truth: `API-05`, `API-06`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Schema with defaults and bounds; document in OpenAPI.
2. Reject unknown filter keys for sensitive collections.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Query schema**

```ts
export const ListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  status: z.enum(["active", "inactive"]).optional(),
});
```

## Error and failure handling
- Invalid query -> 400 validation error.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Never build Mongo filters directly from raw query objects (operator injection).
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- Bounds, defaults, coercion failures.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- `parseInt(req.query.limit)` without bounds.
- Passing `req.query` into `find()`.

## Implementation checklist
- [ ] Schema, bounds, whitelisting, docs.

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
- Validate with the `query` segment schema; coerce types (`z.coerce.number()`), set defaults and server-side maximums.
- Tenant identifiers in query (`clientId`, `tenantId`) must match the authenticated claim (see `api-request-structure`).

## Related skills
- `request-validation` — Request Validation
- `api-pagination` — API Pagination
- `api-filtering-sorting` — API Filtering & Sorting
- `api-design-standards` — API Design Standards
