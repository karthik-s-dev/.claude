---
name: retry-policy
description: Use when adding retries to outbound calls, datastore operations or background deliveries - which failures are retryable, attempt limits, delay, idempotency requirement and where retries live (client vs outbox). The shared withRetry exists but is unused in the references; outbox attempts and Redis retryStrategy are the evidenced forms.
---

# Retry Policy

> ⚠ **PARTIAL / DEFECTIVE EVIDENCE (E3).** The reference implementation is isolated, declared-only, inert or has known defects. Use the pattern's *contract* only; do not copy the defects documented below.

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `retry-policy` |
| Category | 11 — Resilience & Reliability |
| Scope | When and how to retry. |
| Applicability | Node services. |
| Evidence | E3 — isolated / declared-only / defective |
| Classification | PARTIAL evidence (RES-03); generic baseline for outbound calls |
| Governing standards | `RES-03`, `INT-01`, `MSG-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `exponential-backoff`, `resilient-http-communication`, `message-retry-strategy`, `timeout-management`, `idempotency-management`, `external-api-client` |

## Purpose
Bounded, safe retries that do not amplify outages.

## When to use
- A transient dependency failure is expected.

## Organizational standards
- **Verified convention forms:** outbox `attempts` with max (`*_MAX_ATTEMPTS`), Redis `retryStrategy: min(times*200, cap)`, inline Mongo retry `MAX_RETRY_ATTEMPTS=3`/`RETRY_DELAY_MS=100`, webhook `WEBHOOK_DELIVERY_MAX_ATTEMPTS`, shared `withRetry(fn, { maxAttempts, delayMs, backoffMultiplier, maxDelayMs })` (exported by `@inextlabs/inflow-usage-utils`, **unused** by the reference services).
- **MANDATORY:** Retry only idempotent or idempotency-keyed operations and only transient failures (timeouts, connection resets, 5xx, 429 with `Retry-After`); never retry 4xx validation/auth errors.
- **MANDATORY:** Attempts and delays are configurable with safe defaults; every retry logs `warn` with attempt number and `err`; exhaustion raises the typed unavailable error.
- **MANDATORY:** Request-path retries consume the request's timeout budget; durable work retries through the outbox, not in the request.
- **Generic baseline (provisional):** Use `withRetry` from the shared package where installed instead of hand-rolled loops; add jitter.

_Source of truth: `RES-03`, `INT-01`, `MSG-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Decide location (inline vs outbox); wrap call; test exhaustion.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Using the shared helper**

```ts
const data = await withRetry(() => callDependency(id), { maxAttempts: 3, delayMs: 200, backoffMultiplier: 2, maxDelayMs: 2000 });
```

## Error and failure handling
- Exhausted retries -> typed unavailable error -> 503/502.
- Decide fail-open vs fail-closed explicitly per dependency and document it (INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Resilience mechanisms must not bypass authentication or leak internal detail when degrading.

## Testing guidelines
- Fake timers: attempts, delays, non-retryable errors not retried.
- Use fake timers/forced failures to test timeout, retry exhaustion, breaker open/half-open, fallback and shutdown ordering.

## Anti-patterns
- Retry storms; retrying non-idempotent POSTs; retry inside retry.

## Implementation checklist
- [ ] Transient only; bounded; idempotent; logged; budgeted.

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
- Retry only idempotent or idempotency-keyed operations and only transient failures (timeouts, connection resets, 5xx, 429 with `Retry-After`); never retry 4xx validation/auth errors.
- Attempts and delays are configurable with safe defaults; every retry logs `warn` with attempt number and `err`; exhaustion raises the typed unavailable error.
- Request-path retries consume the request's timeout budget; durable work retries through the outbox, not in the request.

## Related skills
- `exponential-backoff` — Exponential Backoff
- `resilient-http-communication` — Resilient HTTP Communication
- `message-retry-strategy` — Message Retry Strategy
- `timeout-management` — Timeout Management
- `idempotency-management` — Idempotency Management
- `external-api-client` — External API Client
