---
name: api-filtering-sorting
description: Use when adding filter and sort options to list endpoints. Whitelists fields and operators, maps them to indexed queries, and keeps ordering deterministic.
---

# API Filtering & Sorting

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `api-filtering-sorting` |
| Category | 02 — API Development & Design |
| Scope | Filter/sort parameters and their query translation. |
| Applicability | HTTP APIs backed by Mongo. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | GENERIC with VERIFIED sort stability |
| Governing standards | `API-06`, `API-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `api-pagination`, `query-parameter-management`, `query-optimization`, `database-indexing` |

## Purpose
Safe, performant filtering without operator injection or unindexed scans.

## When to use
- Adding `status`, date range, text or metric filters.
- Adding `sort` parameters.

## Organizational standards
- **MANDATORY:** Filter keys and sort fields are whitelisted by schema; queries are constructed from validated values, never raw query objects.
- **Verified convention:** Metric/dimension filters are normalized by dedicated helpers (`usage-alert-metric-filter`, `usage-alert-matching`) and unit-tested.
- **Generic baseline (provisional):** Sort syntax `sort=field` / `sort=-field` limited to indexed fields; date ranges `from`/`to` in ISO-8601 UTC.

_Source of truth: `API-06`, `API-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Define an enum of filterable/sortable fields mapped to document paths.
2. Build the filter object from validated values.
3. Ensure an index supports the default sort + common filters.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Whitelisted sort map**

```ts
const SORTABLE = { createdAt: "createdAt", status: "status" } as const;
const field = SORTABLE[q.sort as keyof typeof SORTABLE] ?? "createdAt";
const sort = { [field]: q.order === "asc" ? 1 : -1, _id: 1 } as const;
```

## Error and failure handling
- Unknown sort/filter -> 400 validation error with the allowed values in `details`.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- Each filter; combination; injection attempt (`{"$ne": null}`) rejected.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- `find(req.query)`.
- Sorting on unindexed fields for large collections.

## Implementation checklist
- [ ] Whitelists; indexes; tests for injection.

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
- Filter keys and sort fields are whitelisted by schema; queries are constructed from validated values, never raw query objects.

## Related skills
- `api-pagination` — API Pagination
- `query-parameter-management` — Query Parameter Management
- `query-optimization` — Query Optimization
- `database-indexing` — Database Indexing
