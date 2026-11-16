---
name: database-indexing
description: Use when adding a query, sort, uniqueness rule or retention need on a collection - define indexes in the repository's ensureIndexes (unique composite identity, polling index, TTL, sparse optional), and treat creation failure explicitly.
---

# Database Indexing

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `database-indexing` |
| Category | 07 — Database & Caching Management |
| Scope | Index design and creation. |
| Applicability | MongoDB. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (DB-04) |
| Governing standards | `DB-04`, `DB-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `database-repository-pattern`, `query-optimization`, `mongodb-client`, `api-pagination`, `audit-logging` |

## Purpose
Correct uniqueness and predictable query cost.

## When to use
- New collection or query.
- Slow query/pagination.

## Organizational standards
- **MANDATORY:** Create indexes in the repository's `ensureXIndexes()`/init, invoked at startup; log failures at `warn` **and** surface them in readiness/monitoring - a service running unindexed is a degraded start (reference only warns; flag).
- **Verified convention patterns:** unique composite identity `{ productLine, tenantId, appId, period }`; outbox polling `{ status: 1, createdAt: 1 }`; TTL `{ createdAt: 1 }, { expireAfterSeconds: <env> }` (`USAGE_EVENT_OUTBOX_TTL_SECONDS`, `AUDIT_LOG_TTL_DAYS`); `sparse` for optional keys (`payload.idempotencyKey`); cleanup index `{ updatedAt: 1 }`.
- **MANDATORY:** Every list endpoint's default sort + common filter has a supporting index including `_id` tiebreaker.
- **MANDATORY:** Uniqueness that business logic depends on is enforced by a unique index, not by code.
- **Generic baseline (provisional):** Consumers' unique index for event dedupe is `{ productLine, clientId, usageEventId }`.

_Source of truth: `DB-04`, `DB-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add `createIndex` calls with names; document each index's reason in a comment.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Outbox indexes (reference)**

```ts
await coll.createIndex({ status: 1, createdAt: 1 });
await coll.createIndex({ "payload.idempotencyKey": 1 }, { sparse: true });
await coll.createIndex({ createdAt: 1 }, { expireAfterSeconds: config.usageOutbox.ttlSeconds });
```

## Error and failure handling
- Duplicate-key errors from unique indexes map to a conflict/idempotent-success decision, not a 500.
- Optional dependencies (cache) fail open to the source of truth; correctness-critical stores surface errors (DB-02, INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask connection URIs in logs (`maskConnectionUri`); credentials from environment only; scope every query by tenant identity where data is multi-tenant.

## Testing guidelines
- Duplicate insert rejected; TTL config applied; `explain` in review for new queries.
- Use the repository's in-memory/test-double pattern (TEST-02); cover connection failure, timeout, duplicate-key and empty-result paths.

## Anti-patterns
- Relying on app-level uniqueness.
- Fire-and-forget index creation with no signal.

## Implementation checklist
- [ ] Index per access path; unique where required; TTL where retention applies.

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
- Create indexes in the repository's `ensureXIndexes()`/init, invoked at startup; log failures at `warn` **and** surface them in readiness/monitoring - a service running unindexed is a degraded start (reference only warns; flag).
- Every list endpoint's default sort + common filter has a supporting index including `_id` tiebreaker.
- Uniqueness that business logic depends on is enforced by a unique index, not by code.

## Related skills
- `database-repository-pattern` — Database Repository Pattern
- `query-optimization` — Query Optimization
- `mongodb-client` — MongoDB Client
- `api-pagination` — API Pagination
- `audit-logging` — Audit Logging
