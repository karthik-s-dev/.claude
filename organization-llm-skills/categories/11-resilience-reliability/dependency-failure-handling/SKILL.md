---
name: dependency-failure-handling
description: Use when writing code that depends on Redis, Mongo, a broker or another service - classify dependency criticality, bound calls, choose fail-open vs fail-closed, surface degradation, and log with hints. Umbrella skill linking the specific resilience skills.
---

# Dependency Failure Handling

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `dependency-failure-handling` |
| Category | 11 — Resilience & Reliability |
| Scope | Dependency failure strategy. |
| Applicability | Services. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (INT-02, ERR-09, RES-01) |
| Governing standards | `INT-02`, `ERR-09`, `RES-01`, `RES-02`, `OBS-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `fail-open-fail-closed-policy`, `integration-error-handling`, `technical-exception-handling`, `fallback-mechanism`, `graceful-degradation`, `startup-dependency-validation` |

## Purpose
Predictable outage behaviour per dependency.

## When to use
- Adding a dependency or reviewing outage behaviour.

## Organizational standards
- **MANDATORY:** For each dependency record: criticality (mandatory/optional), timeout, failure policy (fail-closed/fail-open), fallback, retry location, readiness inclusion, log/alert signal.
- **Verified convention policies:** Redis cache -> fail-open to Mongo; Redis counters/idempotency -> surface 503 (fail-closed); Reference service A -> fail-closed when blocking, stale window otherwise; Service Bus -> outbox, optional unless mandatory; notifications -> best-effort.
- **MANDATORY:** "Absent" and "unavailable" are never conflated (`ERR-09`).

_Source of truth: `INT-02`, `ERR-09`, `RES-01`, `RES-02`, `OBS-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add the table to the module header or README.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Dependency table**

```text
Dependency | Critical | Timeout | Policy | Fallback
Redis cache | no | 150ms | fail-open | Mongo
Upstream service | yes (blocking mode) | 5s | fail-closed | stale<=maxMs
```

## Error and failure handling
- Per table.
- Decide fail-open vs fail-closed explicitly per dependency and document it (INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Resilience mechanisms must not bypass authentication or leak internal detail when degrading.

## Testing guidelines
- One test per row.
- Use fake timers/forced failures to test timeout, retry exhaustion, breaker open/half-open, fallback and shutdown ordering.

## Anti-patterns
- Unspecified behaviour.

## Implementation checklist
- [ ] Table complete; tests.

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
- For each dependency record: criticality (mandatory/optional), timeout, failure policy (fail-closed/fail-open), fallback, retry location, readiness inclusion, log/alert signal.
- "Absent" and "unavailable" are never conflated (`ERR-09`).

## Related skills
- `fail-open-fail-closed-policy` — Fail-Open / Fail-Closed Policy
- `integration-error-handling` — Integration Error Handling
- `technical-exception-handling` — Technical Exception Handling
- `fallback-mechanism` — Fallback Mechanism
- `graceful-degradation` — Graceful Degradation
- `startup-dependency-validation` — Startup Dependency Validation
