---
name: caching-strategy
description: Use when adding or changing caches - cache-aside/write-through with Redis, in-process LRU, tiered L1/L2, TTLs, stale windows, caching confirmed absence, and fail-open wrappers with a circuit breaker.
---

# Caching Strategy

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `caching-strategy` |
| Category | 07 — Database & Caching Management |
| Scope | Cache design. |
| Applicability | Redis + in-process. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (DB-05, RES-01) |
| Governing standards | `DB-05`, `DB-02`, `RES-01`, `ERR-09` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `redis-client`, `cache-invalidation`, `circuit-breaker`, `fallback-mechanism`, `distributed-locking`, `query-optimization` |

## Purpose
Latency without sacrificing availability or correctness.

## When to use
- Adding a cache.
- Dependency outage tolerance.

## Organizational standards
- **MANDATORY:** Source of truth is authoritative; cache failure never fails the request: wrap every request-path cache call in a fail-open helper (`withCacheFailOpen(op, key, fallback, fn)`): error -> record failure, `warn`, return fallback; **circuit breaker** opens after 5 consecutive failures for 15 s (reference constants - make configurable).
- **MANDATORY:** Deterministic keys from a key-builder; TTL from env (`REDIS_DEFAULT_TTL_IN_MINUTES` default 1440; subscription TTL, pricing TTL 3600 s).
- **Verified convention:** Tiers - L1 in-process `LruCache` (bounded entries) -> L2 Redis (`pricing:{llmKey}:{provider}:{region}`) -> Mongo; fresh-TTL plus **stale-max** window so a short upstream outage is survivable; cached `null` means **confirmed absent** and is distinct from "unavailable" (`ERR-09`).
- **Verified convention:** Write-through for configuration documents (write Mongo, then refresh cache).
- **MANDATORY:** Do not cache unavailability or errors as values.

_Source of truth: `DB-05`, `DB-02`, `RES-01`, `ERR-09`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Choose read path (aside/through); write key builder; set TTL/stale; add invalidation (`cache-invalidation`); tests for hit/miss/failure.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Fail-open wrapper (reference)**

```ts
async function withCacheFailOpen<T>(op: string, key: string, fallback: T, fn: () => Promise<T>): Promise<T> {
  if (isBreakerOpen()) return fallback;
  try { const r = await fn(); recordSuccess(); return r; }
  catch (err) { recordFailure(); logger.warn({ op, key, err: serializeError(err) }, "Redis operation failed - falling open"); return fallback; }
}
```

## Error and failure handling
- Cache blip degrades latency, never availability.
- Optional dependencies (cache) fail open to the source of truth; correctness-critical stores surface errors (DB-02, INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Never cache secrets/PII beyond need; key space tenant-scoped.
- Mask connection URIs in logs (`maskConnectionUri`); credentials from environment only; scope every query by tenant identity where data is multi-tenant.

## Testing guidelines
- Hit, miss, expired, stale-window serve, cache down, breaker open, null caching.
- Use the repository's in-memory/test-double pattern (TEST-02); cover connection failure, timeout, duplicate-key and empty-result paths.

## Anti-patterns
- Caching errors.
- Unbounded in-process maps.
- Cache as source of truth for counters without reconciliation.

## Implementation checklist
- [ ] Fail-open; breaker; TTL; keys; absence semantics; tests.

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
- Source of truth is authoritative; cache failure never fails the request: wrap every request-path cache call in a fail-open helper (`withCacheFailOpen(op, key, fallback, fn)`): error -> record failure, `warn`, return fallback; **circuit breaker** opens after 5 consecutive failures for 15 s (reference constants - make configurable).
- Deterministic keys from a key-builder; TTL from env (`REDIS_DEFAULT_TTL_IN_MINUTES` default 1440; subscription TTL, pricing TTL 3600 s).
- Do not cache unavailability or errors as values.

## Related skills
- `redis-client` — Redis Client
- `cache-invalidation` — Cache Invalidation
- `circuit-breaker` — Circuit Breaker
- `fallback-mechanism` — Fallback Mechanism
- `distributed-locking` — Distributed Locking
- `query-optimization` — Query Optimization
