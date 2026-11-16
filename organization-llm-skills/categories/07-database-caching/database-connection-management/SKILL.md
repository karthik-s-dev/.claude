---
name: database-connection-management
description: Use when managing the lifecycle of datastore connections - lazy initialization, pooling, per-tenant caching, reconnect behaviour, readiness pings and orderly closing at shutdown.
---

# Database Connection Management

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `database-connection-management` |
| Category | 07 — Database & Caching Management |
| Scope | Connection lifecycle. |
| Applicability | Node services. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (DB-01, DB-02, ARCH-04) |
| Governing standards | `DB-01`, `DB-02`, `ARCH-03`, `ARCH-04`, `RES-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `mongodb-client`, `redis-client`, `graceful-shutdown`, `startup-dependency-validation`, `azure-service-connection-management` |

## Purpose
No leaked connections, predictable startup/shutdown.

## When to use
- Adding a datastore.
- Seeing connection exhaustion or hung shutdown.

## Organizational standards
- **MANDATORY:** Each client is a lazy module singleton (`getX()`), has `init`/`close`, is verified at startup (`startup-dependency-validation`), probed by readiness (`health-endpoint-implementation`) and closed during graceful shutdown **after** HTTP drain (ARCH-03).
- **MANDATORY:** Pool sizes/timeouts configurable via env (`MONGO_MAX_POOL_SIZE`).
- **MANDATORY:** Per-tenant connection maps are bounded and closed on shutdown (reference caches indefinitely - note growth risk).
- **Verified convention:** Close helpers swallow-and-warn so one failed close does not prevent the rest (`.catch(err => logger.warn(...))`).

_Source of truth: `DB-01`, `DB-02`, `ARCH-03`, `ARCH-04`, `RES-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Register `close*` in the shutdown list; test that all are called.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Shutdown closes each client, warning on failure**

```ts
await closeRedis().catch((err) => logger.warn({ err: serializeError(err) }, "Redis close error"));
await closeMongo().catch((err) => logger.warn({ err: serializeError(err) }, "Mongo close error"));
```

## Error and failure handling
- Close failures are logged, shutdown continues.
- Optional dependencies (cache) fail open to the source of truth; correctness-critical stores surface errors (DB-02, INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask connection URIs in logs (`maskConnectionUri`); credentials from environment only; scope every query by tenant identity where data is multi-tenant.

## Testing guidelines
- Shutdown calls every `close*`.
- Use the repository's in-memory/test-double pattern (TEST-02); cover connection failure, timeout, duplicate-key and empty-result paths.

## Anti-patterns
- Clients created inside handlers.
- Missing close for new clients.

## Implementation checklist
- [ ] Singleton; env pool; probe; close registered.

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
- Each client is a lazy module singleton (`getX()`), has `init`/`close`, is verified at startup (`startup-dependency-validation`), probed by readiness (`health-endpoint-implementation`) and closed during graceful shutdown **after** HTTP drain (ARCH-03).
- Pool sizes/timeouts configurable via env (`MONGO_MAX_POOL_SIZE`).
- Per-tenant connection maps are bounded and closed on shutdown (reference caches indefinitely - note growth risk).

## Related skills
- `mongodb-client` — MongoDB Client
- `redis-client` — Redis Client
- `graceful-shutdown` — Graceful Shutdown
- `startup-dependency-validation` — Startup Dependency Validation
- `azure-service-connection-management` — Azure Service Connection Management
