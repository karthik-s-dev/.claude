---
name: database-repository-pattern
description: Use when reading or writing persistent data from application code. Datastore access belongs in one repository module per aggregate that owns collection access, mapping, index creation and close, and exposes intent-named functions.
---

# Database Repository Pattern

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `database-repository-pattern` |
| Category | 07 — Database & Caching Management |
| Scope | Repository modules. |
| Applicability | TypeScript + Mongo. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (DB-03, ARCH-02), naming UNRESOLVED |
| Governing standards | `DB-03`, `ARCH-02`, `DB-04`, `ARCH-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `mongodb-client`, `layered-architecture`, `database-indexing`, `dependency-injection`, `database-testing` |

## Purpose
Isolate persistence from business logic and make it testable.

## When to use
- Adding a collection, query or write.
- Spotting direct model/collection use in services.

## Organizational standards
- **MANDATORY:** One module per aggregate (`<aggregate>.repository.ts` in aliased repos; `<aggregate>-repository.ts` in flat repo - follow target) exposing intent-named functions (`fetchPendingUsageEvents`, `markUsageEventPublished`), plus `ensureXIndexes()` and `closeX()`.
- **MANDATORY:** Services never call `collection.*`/model methods directly (reference gap in the aliased repo; do not extend it).
- **MANDATORY:** Return domain types, not driver cursors; convert `ObjectId` at the boundary.
- **Verified convention:** Small inline retry for transient write conflicts (`MAX_RETRY_ATTEMPTS=3`, `RETRY_DELAY_MS=100`) in a repository; prefer one local retry helper (`retry-policy`).
- **Verified convention:** State machines on documents use explicit statuses (`pending|published|failed`) and attempt counters.

_Source of truth: `DB-03`, `ARCH-02`, `DB-04`, `ARCH-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Create the module, implement `init/ensureIndexes/close`, functions by intent, unit tests with a test double.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Intent-named functions**

```ts
export async function markUsageEventFailed(id: ObjectId, error: string, attempts: number): Promise<void> {
  const coll = await getCollection();
  const status = attempts >= config.usageOutbox.maxAttempts ? "failed" : "pending";
  await coll.updateOne({ _id: id }, { $set: { status, lastError: error, attempts } });
}
```

## Error and failure handling
- Driver errors are translated by the caller's boundary (`exception-to-error-mapping`); repositories may throw typed `UsageReadError(context)` where the caller must distinguish read failure.
- Optional dependencies (cache) fail open to the source of truth; correctness-critical stores surface errors (DB-02, INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask connection URIs in logs (`maskConnectionUri`); credentials from environment only; scope every query by tenant identity where data is multi-tenant.

## Testing guidelines
- Repository tests with in-memory Mongo double: insert/duplicate-key/not-found/limit.
- Use the repository's in-memory/test-double pattern (TEST-02); cover connection failure, timeout, duplicate-key and empty-result paths.

## Anti-patterns
- Generic `BaseRepository<T>` hierarchy not used in the reference.
- Business rules inside repositories.

## Implementation checklist
- [ ] One per aggregate; intent names; indexes; close; tests.

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
- One module per aggregate (`<aggregate>.repository.ts` in aliased repos; `<aggregate>-repository.ts` in flat repo - follow target) exposing intent-named functions (`fetchPendingUsageEvents`, `markUsageEventPublished`), plus `ensureXIndexes()` and `closeX()`.
- Services never call `collection.*`/model methods directly (reference gap in the aliased repo; do not extend it).
- Return domain types, not driver cursors; convert `ObjectId` at the boundary.

## Related skills
- `mongodb-client` — MongoDB Client
- `layered-architecture` — Layered Architecture
- `database-indexing` — Database Indexing
- `dependency-injection` — Dependency Injection
- `database-testing` — Database Testing
