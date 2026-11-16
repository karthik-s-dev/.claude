---
name: fail-open-fail-closed-policy
description: Use when a decision depends on whether to allow or block when a check cannot be performed - quota/subscription gates, authentication, idempotency store, notifications - applying the organization's rules: security fails closed, correctness stores surface errors, optional features fail open and are marked.
---

# Fail-Open / Fail-Closed Policy

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `fail-open-fail-closed-policy` |
| Category | 11 — Resilience & Reliability |
| Scope | Failure-mode policy. |
| Applicability | Services. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (INT-02, CFG-03, CFG-04) |
| Governing standards | `INT-02`, `CFG-03`, `CFG-04`, `ERR-09`, `CTX-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `dependency-failure-handling`, `fallback-mechanism`, `idempotency-management`, `environment-specific-configuration`, `graceful-degradation` |

## Purpose
Deliberate, documented allow/deny under failure.

## When to use
- Any gate or check with a dependency.

## Organizational standards
- **MANDATORY:** **Security controls fail closed** (auth, internal key, webhook signature, SSRF) outside local/dev; never default open.
- **MANDATORY:** **Correctness stores surface errors** (idempotency store, usage counters): 503 + `Retry-After`; fail open only per operation with written approval naming downstream dedupe.
- **Verified convention:** **Quota/subscription gate**: `ENFORCEMENT_DEFAULT=enforce|record_only` (non-prod default `record_only`); blocking deployments fail closed on unavailable subscription data (`ConfigServiceUnavailableError`), record-only deployments record and never block; `UsageReadError` raised in blocking deployments.
- **Verified convention:** **Fail-open answers are marked** (non-enumerable `markFailOpen`), published with `enforcementStatus:"skipped"` + `failOpenReason`, and replayed under an idempotency key only briefly (`IDEMPOTENCY_FAILOPEN_TTL_SECONDS=30`, `IDEMPOTENCY_FAILOPEN_MAX_REPLAYS=3`).
- **Verified convention:** Timeout on write path -> fail closed (504), never store `allowed:true`.
- **MANDATORY:** Record the policy per gate in docs and config; test both modes.

_Source of truth: `INT-02`, `CFG-03`, `CFG-04`, `ERR-09`, `CTX-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add policy table; implement marker; test.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Policy table**

```text
auth: closed | idempotency store: closed(503) | quota (prod): closed | quota (devtest): record_only | cache: open | notifications: open(best-effort)
```

## Error and failure handling
- Per table.
- Decide fail-open vs fail-closed explicitly per dependency and document it (INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Resilience mechanisms must not bypass authentication or leak internal detail when degrading.

## Testing guidelines
- Both modes per gate.
- Use fake timers/forced failures to test timeout, retry exhaustion, breaker open/half-open, fallback and shutdown ordering.

## Anti-patterns
- Boolean "bypass" flags for security in prod.

## Implementation checklist
- [ ] Table; marker; tests.

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
- **Security controls fail closed** (auth, internal key, webhook signature, SSRF) outside local/dev; never default open.
- **Correctness stores surface errors** (idempotency store, usage counters): 503 + `Retry-After`; fail open only per operation with written approval naming downstream dedupe.
- Record the policy per gate in docs and config; test both modes.

## Related skills
- `dependency-failure-handling` — Dependency Failure Handling
- `fallback-mechanism` — Fallback Mechanism
- `idempotency-management` — Idempotency Management
- `environment-specific-configuration` — Environment-Specific Configuration
- `graceful-degradation` — Graceful Degradation
