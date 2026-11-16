---
name: api-pagination
description: Use when returning lists that can grow - choosing paging parameters, response pagination block, total counts, sort stability and limits. Follows the target service's pagination shape and flags the estate's three competing shapes.
---

# API Pagination

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `api-pagination` |
| Category | 02 — API Development & Design |
| Scope | List paging contract and implementation. |
| Applicability | HTTP APIs backed by Mongo. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | UNRESOLVED (C-09) |
| Governing standards | `API-06` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `api-filtering-sorting`, `query-parameter-management`, `query-optimization`, `api-response-structure`, `database-indexing` |

## Purpose
Bounded, deterministic list responses.

## When to use
- Any endpoint returning a collection.
- Reviewing unbounded list endpoints.

## Organizational standards
- **MANDATORY:** Lists are bounded (server maximum) and deterministically ordered with a unique tiebreaker (`{ lastEventAt: -1, _id: 1 }`).
- **DECIDED (C-09, approved 2026-11-16):** Approved: one pagination shape per estate; adopted shape is data.pagination { page, limit, totalItems, totalPages, hasNextPage } (chosen to match C-06 - confirm). _Earlier note (superseded where it conflicts):_ Three shapes exist - `pagination:{ page, limit, totalItems, totalPages, hasNextPage }` in `data` (reference service A, inconsistently applied), `pagination:{ page, pageSize, totalItems, totalPages }` (reference service B), (C-09; decided - see below). Use the shape already used by the target service; do not add a fourth; do not mix shapes within a service.
- **Verified convention:** Mongo implementation uses a single aggregation with `$facet` (`items` with `$sort/$skip/$limit`, `total` count) and `Math.ceil(total/pageSize)`.

_Source of truth: `API-06`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add `page`/`limit` (or `pageSize`) to the query schema with max.
2. Sort including `_id`; create a supporting index (`database-indexing`).
3. Return the service's pagination block.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**$facet pagination (pattern)**

```ts
const [res] = await coll.aggregate([
  { $match: filter },
  { $facet: { items: [{ $sort: { lastEventAt: -1, _id: 1 } }, { $skip: (page - 1) * pageSize }, { $limit: pageSize }], total: [{ $count: "n" }] } },
]).toArray();
const totalItems = res.total[0]?.n ?? 0;
return { items: res.items, pagination: { page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) } };
```

## Error and failure handling
- Page beyond range returns an empty list with correct totals, not an error.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- First/last/out-of-range page; stable ordering with ties; max limit enforced.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- Unbounded `find()`.
- Skip-based paging on huge collections without noting the cost.
- Sort without a tiebreaker.

## Implementation checklist
- [ ] Bounded, ordered, indexed, one shape.

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
- Lists are bounded (server maximum) and deterministically ordered with a unique tiebreaker (`{ lastEventAt: -1, _id: 1 }`).

## Related skills
- `api-filtering-sorting` — API Filtering & Sorting
- `query-parameter-management` — Query Parameter Management
- `query-optimization` — Query Optimization
- `api-response-structure` — API Response Structure
- `database-indexing` — Database Indexing
