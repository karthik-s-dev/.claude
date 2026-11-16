---
name: circuit-breaker
description: Use when repeated dependency failures should short-circuit calls - consecutive-failure threshold, open cooldown, probe on close, fallback. The reference implements a breaker for Redis only (5 failures, 15 s); outbound HTTP breakers are a gap (generic baseline).
---

# Circuit Breaker

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `circuit-breaker` |
| Category | 11 — Resilience & Reliability |
| Scope | Breaker semantics. |
| Applicability | Node. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (RES-01, Redis only) / generic for HTTP |
| Governing standards | `RES-01`, `RES-02`, `INT-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `caching-strategy`, `fallback-mechanism`, `resilient-http-communication`, `graceful-degradation`, `redis-client` |

## Purpose
Protect latency and the dependency.

## When to use
- A cache/optional dependency fails intermittently.

## Organizational standards
- **Verified convention:** Breaker around cache calls: `consecutiveFailures` increments on error, opens for `BREAKER_COOLDOWN_MS=15000` after `BREAKER_FAILURE_THRESHOLD=5`, success resets; while open calls return the fallback immediately and log at `debug`; opening logs `warn`.
- **MANDATORY:** Thresholds/cooldown configurable (reference constants are hard-coded).
- **Generic baseline (provisional):** HTTP dependency breakers follow the same state machine (closed/open/half-open); do not add a breaker library without approval.
- **MANDATORY:** A breaker must always have a defined fallback (`fallback-mechanism`).

_Source of truth: `RES-01`, `RES-02`, `INT-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Reuse the cache module's breaker; extend with env config.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**State (reference)**

```ts
if (Date.now() < breakerOpenUntil) return fallback;
// on failure: if (++consecutiveFailures >= THRESHOLD) breakerOpenUntil = Date.now() + COOLDOWN_MS;
```

## Error and failure handling
- Open breaker = degraded, not failed.
- Decide fail-open vs fail-closed explicitly per dependency and document it (INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Resilience mechanisms must not bypass authentication or leak internal detail when degrading.

## Testing guidelines
- Open after N failures; probe after cooldown; reset on success.
- Use fake timers/forced failures to test timeout, retry exhaustion, breaker open/half-open, fallback and shutdown ordering.

## Anti-patterns
- Breakers without fallback.

## Implementation checklist
- [ ] Thresholds; fallback; logs.

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
- Thresholds/cooldown configurable (reference constants are hard-coded).
- A breaker must always have a defined fallback (`fallback-mechanism`).

## Related skills
- `caching-strategy` — Caching Strategy
- `fallback-mechanism` — Fallback Mechanism
- `resilient-http-communication` — Resilient HTTP Communication
- `graceful-degradation` — Graceful Degradation
- `redis-client` — Redis Client
