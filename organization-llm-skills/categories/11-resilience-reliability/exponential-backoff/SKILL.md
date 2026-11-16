---
name: exponential-backoff
description: Use when spacing retries - multiplier, cap, jitter. Reference code uses capped incremental delays (Redis min(times*200, 2000), config outbox min(60s*attempts, 15min)) and the shared withRetry backoffMultiplier; no jitter exists. Provides the generic baseline.
---

# Exponential Backoff

> ⚠ **PARTIAL / DEFECTIVE EVIDENCE (E3).** The reference implementation is isolated, declared-only, inert or has known defects. Use the pattern's *contract* only; do not copy the defects documented below.

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `exponential-backoff` |
| Category | 11 — Resilience & Reliability |
| Scope | Delay computation. |
| Applicability | Node. |
| Evidence | E3 — isolated / declared-only / defective |
| Classification | PARTIAL evidence (linear/min-capped forms) / generic baseline |
| Governing standards | `RES-03`, `MSG-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `retry-policy`, `message-retry-strategy`, `resilient-http-communication`, `outbox-pattern` |

## Purpose
Avoid synchronized retries.

## When to use
- Implementing delays.

## Organizational standards
- **Verified convention:** Capped incremental delays in Redis `retryStrategy` and the outbox; `withRetry` supports `backoffMultiplier` and `maxDelayMs`.
- **Generic baseline (provisional):** `delay = min(maxDelay, base * 2^(attempt-1))` with full jitter `random(0, delay)`; document base/cap in config.
- **MANDATORY:** A cap is always set.

_Source of truth: `RES-03`, `MSG-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Implement once in a helper and reuse.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**GENERIC**

```ts
const delay = Math.min(maxMs, baseMs * 2 ** (attempt - 1)); await sleep(Math.random() * delay);
```

## Error and failure handling
- N/A.
- Decide fail-open vs fail-closed explicitly per dependency and document it (INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Resilience mechanisms must not bypass authentication or leak internal detail when degrading.

## Testing guidelines
- Deterministic RNG; cap respected.
- Use fake timers/forced failures to test timeout, retry exhaustion, breaker open/half-open, fallback and shutdown ordering.

## Anti-patterns
- Fixed tight retry.

## Implementation checklist
- [ ] Cap; jitter; config.

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
- A cap is always set.

## Related skills
- `retry-policy` — Retry Policy
- `message-retry-strategy` — Message Retry Strategy
- `resilient-http-communication` — Resilient HTTP Communication
- `outbox-pattern` — Outbox Pattern
