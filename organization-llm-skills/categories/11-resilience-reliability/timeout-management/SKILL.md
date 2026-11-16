---
name: timeout-management
description: Use when setting or reviewing timeouts - every outbound call, Redis command, Mongo operation, webhook delivery and the request-level budget for write APIs (base plus per-item scaling, 504 fail-closed).
---

# Timeout Management

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `timeout-management` |
| Category | 11 — Resilience & Reliability |
| Scope | Timeout budgets. |
| Applicability | Node services. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (RES-02) |
| Governing standards | `RES-02`, `CFG-05`, `ERR-02`, `API-10` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `external-api-client`, `redis-client`, `mongodb-client`, `resilient-http-communication`, `idempotency-management` |

## Purpose
No unbounded waits.

## When to use
- Any I/O.

## Organizational standards
- **MANDATORY:** Explicit timeout on each dependency from env: `CONFIG_SERVICE_TIMEOUT_MS=5000`, `REDIS_CONNECT_TIMEOUT_MS`, `REDIS_COMMAND_TIMEOUT_MS`, `WEBHOOK_DELIVERY_TIMEOUT_MS`, Mongo `serverSelectionTimeoutMS=5000`, `socketTimeoutMS=45000`, `connectTimeoutMS=10000`.
- **MANDATORY:** Write APIs have a request budget (`CHECK_AND_RECORD_TIMEOUT_MS` + `CHECK_AND_RECORD_TIMEOUT_PER_METRIC_MS` per item); exceeding it returns **504 `REQUEST_TIMEOUT`** (fail-closed: never record `allowed:true` under an idempotency key), releases the idempotency key and logs.
- **MANDATORY:** Inner timeouts are shorter than the request budget; health checks have their own short timeouts.
- **Generic baseline (provisional):** Propagate cancellation with `AbortController` (not evidenced).

_Source of truth: `RES-02`, `CFG-05`, `ERR-02`, `API-10`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add timeout config; race the operation against the budget; release resources on timeout.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Budgeted operation**

```ts
const budgetMs = config.checkAndRecordTimeoutMs + metrics.length * config.checkAndRecordTimeoutPerMetricMs;
const result = await Promise.race([handle(req), rejectAfter(budgetMs, V2Errors.requestTimeout())]);
```

## Error and failure handling
- Timeout -> catalogued 504; resources released.
- Decide fail-open vs fail-closed explicitly per dependency and document it (INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Resilience mechanisms must not bypass authentication or leak internal detail when degrading.

## Testing guidelines
- Fake timers; release on timeout.
- Use fake timers/forced failures to test timeout, retry exhaustion, breaker open/half-open, fallback and shutdown ordering.

## Anti-patterns
- Infinite default timeouts.

## Implementation checklist
- [ ] Every call bounded; budget; release.

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
- Explicit timeout on each dependency from env: `CONFIG_SERVICE_TIMEOUT_MS=5000`, `REDIS_CONNECT_TIMEOUT_MS`, `REDIS_COMMAND_TIMEOUT_MS`, `WEBHOOK_DELIVERY_TIMEOUT_MS`, Mongo `serverSelectionTimeoutMS=5000`, `socketTimeoutMS=45000`, `connectTimeoutMS=10000`.
- Write APIs have a request budget (`CHECK_AND_RECORD_TIMEOUT_MS` + `CHECK_AND_RECORD_TIMEOUT_PER_METRIC_MS` per item); exceeding it returns **504 `REQUEST_TIMEOUT`** (fail-closed: never record `allowed:true` under an idempotency key), releases the idempotency key and logs.
- Inner timeouts are shorter than the request budget; health checks have their own short timeouts.

## Related skills
- `external-api-client` — External API Client
- `redis-client` — Redis Client
- `mongodb-client` — MongoDB Client
- `resilient-http-communication` — Resilient HTTP Communication
- `idempotency-management` — Idempotency Management
