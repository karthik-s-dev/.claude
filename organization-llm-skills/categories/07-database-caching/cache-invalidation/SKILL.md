---
name: cache-invalidation
description: Use when cached data must be refreshed or dropped - explicit refresh/reset endpoints, subscription-changed notifications and webhooks, tenant-scoped invalidation, TTL fallback.
---

# Cache Invalidation

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `cache-invalidation` |
| Category | 07 — Database & Caching Management |
| Scope | Invalidation triggers and mechanics. |
| Applicability | Services with Redis/in-process caches. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (DB-05, ARCH-07) |
| Governing standards | `DB-05`, `ARCH-07`, `MSG-05`, `CTX-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `caching-strategy`, `redis-client`, `event-driven-architecture`, `webhook-delivery`, `service-boundary-responsibility` |

## Purpose
Bound staleness predictably.

## When to use
- Data changes in the owning service.
- Consumers hold caches of another service's data.

## Organizational standards
- **MANDATORY:** The owner exposes refresh/reset operations (`POST .../{id}/refresh`, rate-limited strict tier for fan-out) and publishes change notifications; consumers invalidate on receipt (`invalidateSubscriptionCache(tenantId?, appId?)` clears matching entries or all) and always keep a TTL as a safety net.
- **MANDATORY:** Change notification calls carry internal auth + correlation (`CTX-02`) and are delivered durably when loss causes business harm (`outbox-pattern`).
- **Verified convention:** Consumer cache keys encode source/product/tenant/app (`${source}:${productLine}:${tenantId}:${appId}`) so versions never mix.
- **MANDATORY:** Tenant-scoped invalidation must not clear other tenants.

_Source of truth: `DB-05`, `ARCH-07`, `MSG-05`, `CTX-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add the trigger path, the invalidation function and a test for scope.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Scoped invalidation (reference)**

```ts
export function invalidateSubscriptionCache(tenantId?: string, appId?: string): void {
  if (!tenantId) { subscriptionCache.clear(); return; }
  for (const key of subscriptionCache.keys()) { if (matchesTenant(key, tenantId, appId)) subscriptionCache.delete(key); }
}
```

## Error and failure handling
- Failed notification -> outbox retry; staleness bounded by TTL.
- Optional dependencies (cache) fail open to the source of truth; correctness-critical stores surface errors (DB-02, INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask connection URIs in logs (`maskConnectionUri`); credentials from environment only; scope every query by tenant identity where data is multi-tenant.

## Testing guidelines
- Scope isolation; notification triggers invalidation; TTL expiry.
- Use the repository's in-memory/test-double pattern (TEST-02); cover connection failure, timeout, duplicate-key and empty-result paths.

## Anti-patterns
- Global flush per event.
- No TTL.

## Implementation checklist
- [ ] Trigger, scope, durability, TTL.

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
- The owner exposes refresh/reset operations (`POST .../{id}/refresh`, rate-limited strict tier for fan-out) and publishes change notifications; consumers invalidate on receipt (`invalidateSubscriptionCache(tenantId?, appId?)` clears matching entries or all) and always keep a TTL as a safety net.
- Change notification calls carry internal auth + correlation (`CTX-02`) and are delivered durably when loss causes business harm (`outbox-pattern`).
- Tenant-scoped invalidation must not clear other tenants.

## Related skills
- `caching-strategy` — Caching Strategy
- `redis-client` — Redis Client
- `event-driven-architecture` — Event-Driven Architecture
- `webhook-delivery` — Webhook Delivery (Outbound)
- `service-boundary-responsibility` — Service Boundary & Responsibility
