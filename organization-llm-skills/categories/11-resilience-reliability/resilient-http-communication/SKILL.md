---
name: resilient-http-communication
description: Use when making an outbound HTTP call must tolerate failures - timeout, typed unavailable error, fail-closed auth, optional retry with backoff for idempotent calls, optional breaker, durable outbox for must-deliver notifications. Builds on external-api-client.
---

# Resilient HTTP Communication

> ⚠ **PARTIAL / DEFECTIVE EVIDENCE (E3).** The reference implementation is isolated, declared-only, inert or has known defects. Use the pattern's *contract* only; do not copy the defects documented below.

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `resilient-http-communication` |
| Category | 11 — Resilience & Reliability |
| Scope | Resilience layers for HTTP calls. |
| Applicability | Node axios. |
| Evidence | E3 — isolated / declared-only / defective |
| Classification | PARTIAL (timeout, auth fail-closed, typed error) / generic retry+breaker |
| Governing standards | `INT-01`, `RES-02`, `RES-03`, `RES-01`, `ERR-09` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `external-api-client`, `retry-policy`, `circuit-breaker`, `timeout-management`, `http-client-management`, `integration-error-handling` |

## Purpose
Dependable inter-service calls.

## When to use
- Calls on critical paths.

## Organizational standards
- **Verified convention:** timeout always set; token failure aborts; failures typed; durable outbox for notifications that cannot be lost; stale cache fallback.
- **Not evidenced (gap) (generic baseline):** retries with backoff+jitter, HTTP circuit breaker, bulkhead, `AbortController` cancellation.
- **MANDATORY:** Layer order: timeout -> (retry for idempotent only) -> breaker -> fallback -> typed error; document each in the integration module.
- **MANDATORY:** Do not add `axios-retry`/`opossum`/`cockatiel` without approval; prefer `withRetry` from the shared package.

_Source of truth: `INT-01`, `RES-02`, `RES-03`, `RES-01`, `ERR-09`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Start with `external-api-client`; add retry only for idempotent GETs/keyed POSTs.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Idempotent GET with retry**

```ts
const res = await withRetry(() => getDependencyClient().get("/subscriptions/" + id), { maxAttempts: 3, delayMs: 200, backoffMultiplier: 2, maxDelayMs: 2000 });
```

## Error and failure handling
- Exhausted -> `DependencyUnavailableError`.
- Decide fail-open vs fail-closed explicitly per dependency and document it (INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Resilience mechanisms must not bypass authentication or leak internal detail when degrading.

## Testing guidelines
- 5xx then success; permanent 4xx not retried.
- Use fake timers/forced failures to test timeout, retry exhaustion, breaker open/half-open, fallback and shutdown ordering.

## Anti-patterns
- Unbounded retry; retry POST without key.

## Implementation checklist
- [ ] Layers documented; approvals.

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
- Layer order: timeout -> (retry for idempotent only) -> breaker -> fallback -> typed error; document each in the integration module.
- Do not add `axios-retry`/`opossum`/`cockatiel` without approval; prefer `withRetry` from the shared package.

## Related skills
- `external-api-client` — External API Client
- `retry-policy` — Retry Policy
- `circuit-breaker` — Circuit Breaker
- `timeout-management` — Timeout Management
- `http-client-management` — HTTP Client Management
- `integration-error-handling` — Integration Error Handling
