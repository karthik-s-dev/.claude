---
name: database-testing
description: Use when testing repositories and queries - the in-memory Mongo and Redis doubles (`memory-mongo`, `memory-redis`), index/uniqueness behaviour, duplicate-key paths, and overrides via `__setUsageDbForTests`/`__setRedisForTests`.
---

# Database Testing

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `database-testing` |
| Category | 13 — Testing & Quality Engineering |
| Scope | Datastore tests. |
| Applicability | Vitest/Jest with in-memory doubles. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (TEST-02) |
| Governing standards | `TEST-02`, `DB-03`, `DB-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `in-memory-test-harness`, `mongodb-client`, `database-repository-pattern`, `database-indexing`, `integration-testing` |

## Purpose
Repository correctness without real databases.

## When to use
- Adding repositories/queries.

## Organizational standards
- **Verified convention:** `src/test-harness/mocks/memory-mongo.ts`, `memory-redis.ts` (Redis-compatible client incl. SET NX EX and EVAL-style CAS used by idempotency); injected through test hooks; reconciler tests with injected deps (`reconcile.test.ts`).
- **MANDATORY:** Cover unique-key duplicates, TTL semantics (where doubled), empty results and driver-error paths.
- **Generic baseline (provisional):** Real-database tests only in a dedicated, disposable environment.

_Source of truth: `TEST-02`, `DB-03`, `DB-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Install doubles in setup; reset between tests.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Override hook**

```ts
__setUsageDbForTests(createMemoryMongo());   // afterEach: __setUsageDbForTests(null)
```

## Error and failure handling
- Inject failures via doubles.
- Tests must fail loudly: no swallowed assertions, no `--passWithNoTests` as a quality gate.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Test fixtures contain no real secrets or personal data; stub environment variables in setup files (TEST-01).

## Testing guidelines
- Unique, not found, partial updates.
- Follow the target repository's runner and layout (TEST-01); do not introduce a second test framework.

## Anti-patterns
- Shared DB across tests.

## Implementation checklist
- [ ] Doubles; reset; failure cases.

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
- Cover unique-key duplicates, TTL semantics (where doubled), empty results and driver-error paths.

## Related skills
- `in-memory-test-harness` — In-Memory Test Harness
- `mongodb-client` — MongoDB Client
- `database-repository-pattern` — Database Repository Pattern
- `database-indexing` — Database Indexing
- `integration-testing` — Integration Testing
