---
name: query-optimization
description: Use when a query is slow or hot - projection, indexes, aggregation with $facet, bounded concurrency, caching tiers - while preserving correctness.
---

# Query Optimization

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `query-optimization` |
| Category | 07 — Database & Caching Management |
| Scope | Query performance. |
| Applicability | MongoDB/Redis. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED patterns + GENERIC |
| Governing standards | `DB-04`, `DB-05`, `API-06` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `database-indexing`, `api-pagination`, `caching-strategy`, `performance-review`, `mongodb-client` |

## Purpose
Predictable latency.

## When to use
- Performance review or slow endpoint.

## Organizational standards
- **Verified convention:** Single aggregation with `$facet` for page + count; stable sort with `_id`; Redis HASH counters and TTL keys for hot counters; L1/L2 pricing caches; bounded fan-out (`mapWithConcurrency`).
- **MANDATORY:** Measure before changing (explain/plan, timing logs); add the index first, then cache.
- **MANDATORY:** Select only needed fields; avoid per-item queries in loops (batch).
- **Generic baseline (provisional):** Prefer `lean()` in mongoose reads.

_Source of truth: `DB-04`, `DB-05`, `API-06`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Capture current plan; add index/projection; compare; add test or benchmark note.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Bounded fan-out**

```ts
const results = await mapWithConcurrency(items, 5, async (i) => fetchOne(i));
```

## Error and failure handling
- Optimization must not change error semantics.
- Optional dependencies (cache) fail open to the source of truth; correctness-critical stores surface errors (DB-02, INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask connection URIs in logs (`maskConnectionUri`); credentials from environment only; scope every query by tenant identity where data is multi-tenant.

## Testing guidelines
- Result equality before/after.
- Use the repository's in-memory/test-double pattern (TEST-02); cover connection failure, timeout, duplicate-key and empty-result paths.

## Anti-patterns
- Caching before indexing.
- N+1.

## Implementation checklist
- [ ] Evidence; index; projection.

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
- Measure before changing (explain/plan, timing logs); add the index first, then cache.
- Select only needed fields; avoid per-item queries in loops (batch).

## Related skills
- `database-indexing` — Database Indexing
- `api-pagination` — API Pagination
- `caching-strategy` — Caching Strategy
- `performance-review` — Performance Review
- `mongodb-client` — MongoDB Client
