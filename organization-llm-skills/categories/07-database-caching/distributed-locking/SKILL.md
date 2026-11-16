---
name: distributed-locking
description: Use when only one instance may perform an action - Redis SET NX EX locks with a per-acquisition ownership token, compare-and-delete release via Lua, contention behaviour and single-run job guards.
---

# Distributed Locking

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `distributed-locking` |
| Category | 07 — Database & Caching Management |
| Scope | Cross-instance mutual exclusion. |
| Applicability | Redis. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (DB-06) with variation C-11 |
| Governing standards | `DB-06`, `RES-01`, `ERR-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `redis-client`, `scheduled-job-reconciliation`, `idempotency-management`, `fail-open-fail-closed-policy`, `background-worker-processing` |

## Purpose
Safe exclusivity without releasing someone else's lock.

## When to use
- Preventing stampedes on refresh.
- Running scheduled jobs on one replica.

## Organizational standards
- **MANDATORY:** Acquire with `SET lockKey token NX EX ttl` where `token` is a fresh UUID per acquisition; release only through a Lua compare-and-delete (`if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) end`); never release a lock you cannot prove you hold.
- **MANDATORY:** Contention policy is explicit: for cache/refresh locks **proceed unlocked** after the wait timeout rather than returning 500 (`LOCK_ACQUISITION_FAILED` reserved for cases that must not proceed).
- **Verified convention (jobs):** single-run guard `SET reconcile:lock <host:pid> EX <secs> NX` plus a per-day `done` marker; lock expires by TTL (acceptable only for idempotent jobs; prefer token+compare-delete).
- **MANDATORY:** TTL longer than the worst-case critical section; no lock around network calls without timeouts.

_Source of truth: `DB-06`, `RES-01`, `ERR-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Use `withLock(key, fn, { ttl, wait })` helper from the cache module.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Token lock (reference)**

```ts
const token = randomUUID();
const ok = await redis.set("lock:" + key, token, "EX", ttl, "NX");
if (ok === "OK") { try { return await fn(); } finally { await redis.eval(RELEASE_LOCK_SCRIPT, 1, "lock:" + key, token); } }
```

## Error and failure handling
- Redis down: fall through unlocked (cache locks) or skip the run (jobs) - log `warn`.
- Optional dependencies (cache) fail open to the source of truth; correctness-critical stores surface errors (DB-02, INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask connection URIs in logs (`maskConnectionUri`); credentials from environment only; scope every query by tenant identity where data is multi-tenant.

## Testing guidelines
- Two contenders; expiry; release by non-owner no-op.
- Use the repository's in-memory/test-double pattern (TEST-02); cover connection failure, timeout, duplicate-key and empty-result paths.

## Anti-patterns
- `DEL lock:key` blindly.
- Fixed token value.

## Implementation checklist
- [ ] Token; Lua release; policy; TTL.

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
- Acquire with `SET lockKey token NX EX ttl` where `token` is a fresh UUID per acquisition; release only through a Lua compare-and-delete (`if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) end`); never release a lock you cannot prove you hold.
- Contention policy is explicit: for cache/refresh locks **proceed unlocked** after the wait timeout rather than returning 500 (`LOCK_ACQUISITION_FAILED` reserved for cases that must not proceed).
- TTL longer than the worst-case critical section; no lock around network calls without timeouts.

## Related skills
- `redis-client` — Redis Client
- `scheduled-job-reconciliation` — Scheduled Job & Reconciliation
- `idempotency-management` — Idempotency Management
- `fail-open-fail-closed-policy` — Fail-Open / Fail-Closed Policy
- `background-worker-processing` — Background Worker Processing
