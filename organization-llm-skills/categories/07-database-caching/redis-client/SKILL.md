---
name: redis-client
description: Use when creating or changing the ioredis client or key helpers - Azure Cache for Redis TLS, bounded command timeout, retry/offline-queue profile, key prefix and builders, TTL defaults, fail-open wrappers, closing on shutdown.
---

# Redis Client

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `redis-client` |
| Category | 07 — Database & Caching Management |
| Scope | Redis connectivity and conventions. |
| Applicability | Node.js `ioredis` 5, Azure Cache for Redis. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (Azure TLS, ioredis) / TECH (profiles) / C-11 |
| Governing standards | `DB-02`, `RES-01`, `CFG-01`, `CFG-05`, `DB-06` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `caching-strategy`, `cache-invalidation`, `distributed-locking`, `circuit-breaker`, `timeout-management`, `database-connection-management` |

## Purpose
Fast, bounded and safe cache/counter access.

## When to use
- Adding Redis usage, keys or TTLs.
- Redis latency/outage incidents.

## Organizational standards
- **MANDATORY:** Configure from env: host (`AZURE_CACHE_FOR_REDIS_HOST_NAME` or `REDIS_HOST_NAME` per target repo), `..._ACCESS_KEY`/`REDIS_ACCESS_KEY`, port (default 6380 for Azure TLS), `REDIS_KEY_PREFIX`, timeouts; **TLS** (`tls: { servername: host }` or `tls: {}`) whenever a password is set/non-local host; refuse a missing password for non-local hosts.
- **MANDATORY:** Always set `connectTimeout`, `commandTimeout`, `keepAlive` (10000) and a bounded `retryStrategy` (`Math.min(times*200, cap)`).
- **MANDATORY:** Choose the profile deliberately: **fail-fast** for request-path caches (reference: `commandTimeout:150`, `maxRetriesPerRequest:1`, `enableOfflineQueue:false`) and **resilient** for correctness-critical counters/idempotency (reference: `maxRetriesPerRequest:5`, `enableOfflineQueue:true`, `retryStrategy cap 3000`). Make the numbers configurable (reference hard-codes the fail-fast ones - defect).
- **MANDATORY:** Log client events (`connect` debug, `error` error with hint, `close` warn, `reconnecting` debug); never log the password.
- **MANDATORY:** Key naming `<domain>:<scope>:<id>` via a key-builder module (`redisKeys.ts`) - no inline string building in services; an optional service-wide `keyPrefix`.
- **MANDATORY:** Provide `get/set/del` JSON helpers and `safe*` fail-open variants for cache use (`caching-strategy`); `closeRedis()` on shutdown.
- **UNRESOLVED — do not enforce; report (C-19):** Reading another service's keys through a second no-prefix client bypasses that service's API - do not copy.

_Source of truth: `DB-02`, `RES-01`, `CFG-01`, `CFG-05`, `DB-06`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Reuse the module's `getRedis()`; add key builders; choose TTL via env.
2. Add tests with the Redis double (`in-memory-test-harness`).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Client options (fail-fast profile, reference)**

```ts
client = new Redis({ host, port, password, tls: {}, connectTimeout: 15000, keepAlive: 10000,
  commandTimeout: 150, maxRetriesPerRequest: 1, enableOfflineQueue: false,
  retryStrategy: (times) => Math.min(times * 200, 2000) });
client.on("error", (err) => logger.error(err, "Redis error"));
```

## Error and failure handling
- Cache reads fail open to the source of truth; counters/idempotency surface the error (503) per policy.
- Optional dependencies (cache) fail open to the source of truth; correctness-critical stores surface errors (DB-02, INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- TLS always for Azure; no passwords in logs; key space never includes secrets/PII.
- Mask connection URIs in logs (`maskConnectionUri`); credentials from environment only; scope every query by tenant identity where data is multi-tenant.

## Testing guidelines
- Use the in-memory double; test timeout/breaker behaviour with forced rejection.
- Use the repository's in-memory/test-double pattern (TEST-02); cover connection failure, timeout, duplicate-key and empty-result paths.

## Anti-patterns
- Unbounded command timeout.
- `KEYS *` in request paths.
- Inline key strings.

## Implementation checklist
- [ ] Env-driven; TLS; timeouts; profile; key builders; close.

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
- Configure from env: host (`AZURE_CACHE_FOR_REDIS_HOST_NAME` or `REDIS_HOST_NAME` per target repo), `..._ACCESS_KEY`/`REDIS_ACCESS_KEY`, port (default 6380 for Azure TLS), `REDIS_KEY_PREFIX`, timeouts; **TLS** (`tls: { servername: host }` or `tls: {}`) whenever a password is set/non-local host; refuse a missing password for non-local hosts.
- Always set `connectTimeout`, `commandTimeout`, `keepAlive` (10000) and a bounded `retryStrategy` (`Math.min(times*200, cap)`).
- Choose the profile deliberately: **fail-fast** for request-path caches (reference: `commandTimeout:150`, `maxRetriesPerRequest:1`, `enableOfflineQueue:false`) and **resilient** for correctness-critical counters/idempotency (reference: `maxRetriesPerRequest:5`, `enableOfflineQueue:true`, `retryStrategy cap 3000`). Make the numbers configurable (reference hard-codes the fail-fast ones - defect).
- Log client events (`connect` debug, `error` error with hint, `close` warn, `reconnecting` debug); never log the password.
- Key naming `<domain>:<scope>:<id>` via a key-builder module (`redisKeys.ts`) - no inline string building in services; an optional service-wide `keyPrefix`.
- Provide `get/set/del` JSON helpers and `safe*` fail-open variants for cache use (`caching-strategy`); `closeRedis()` on shutdown.

## Related skills
- `caching-strategy` — Caching Strategy
- `cache-invalidation` — Cache Invalidation
- `distributed-locking` — Distributed Locking
- `circuit-breaker` — Circuit Breaker
- `timeout-management` — Timeout Management
- `database-connection-management` — Database Connection Management
