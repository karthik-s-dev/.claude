---
name: technical-exception-handling
description: Use when infrastructure or dependency failures occur - Redis, Mongo, broker, upstream HTTP, token acquisition, timeouts. Classifies them as unavailable (503/502/504), applies the documented fail-open or fail-closed policy and logs with context.
---

# Technical Exception Handling

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `technical-exception-handling` |
| Category | 04 — Error & Exception Management |
| Scope | Non-business, system-level failures. |
| Applicability | Any service. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (ERR-09, RES-01) |
| Governing standards | `ERR-09`, `RES-01`, `INT-02`, `ERR-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `exception-to-error-mapping`, `dependency-failure-handling`, `integration-error-handling`, `fail-open-fail-closed-policy`, `circuit-breaker` |

## Purpose
Dependency trouble degrades predictably and is diagnosable.

## When to use
- Writing code around a datastore, cache, broker or upstream.

## Organizational standards
- **MANDATORY:** Technical failures map to catalog infrastructure/external entries (500/502/503/504), never leak driver text, and are logged at `error` with dependency name, operation and context (never secrets).
- **MANDATORY:** Distinguish "confirmed absent" (`null`/404) from "unavailable" (typed throw); callers never treat unavailable as empty (ERR-09).
- **MANDATORY:** Optional dependencies (cache, notifications, non-mandatory broker) fail open and log `warn`; correctness-critical dependencies (quota counters, idempotency store, subscription for blocking mode) fail closed per `fail-open-fail-closed-policy`.
- **Verified convention:** Request-level timeout on write path returns 504 and releases idempotency keys; never records `allowed: true` under the key on timeout.

_Source of truth: `ERR-09`, `RES-01`, `INT-02`, `ERR-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Wrap the call; map by error type; apply policy; log with hints (what to check).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Typed unavailable error (reference)**

```ts
export class DependencyUnavailableError extends Error {
  constructor(message: string, public readonly status?: number) { super(message); this.name = "DependencyUnavailableError"; Object.setPrototypeOf(this, DependencyUnavailableError.prototype); }
}
```

## Error and failure handling
- After mapping, the handler produces the standard error envelope.
- Catch only where you can add context or translate; otherwise let the error propagate to the global handler (ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- `AppError.details` is public; internal causes live only on `Error.cause` and in logs (ERR-07).

## Testing guidelines
- Simulate timeout, 5xx, connection refused; assert status, code, logs, no secret.
- Assert code, numericCode, HTTP status and envelope for each catalog entry touched; assert that unknown errors become `UNHANDLED_ERROR` with no leaked detail.

## Anti-patterns
- Retrying without bounds.
- Returning `[]`/`null` on outage for blocking decisions.

## Implementation checklist
- [ ] Classification; policy; logging; tests.

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
- Technical failures map to catalog infrastructure/external entries (500/502/503/504), never leak driver text, and are logged at `error` with dependency name, operation and context (never secrets).
- Distinguish "confirmed absent" (`null`/404) from "unavailable" (typed throw); callers never treat unavailable as empty (ERR-09).
- Optional dependencies (cache, notifications, non-mandatory broker) fail open and log `warn`; correctness-critical dependencies (quota counters, idempotency store, subscription for blocking mode) fail closed per `fail-open-fail-closed-policy`.

## Related skills
- `exception-to-error-mapping` — Exception-to-Error Mapping
- `dependency-failure-handling` — Dependency Failure Handling
- `integration-error-handling` — Integration Error Handling
- `fail-open-fail-closed-policy` — Fail-Open / Fail-Closed Policy
- `circuit-breaker` — Circuit Breaker
