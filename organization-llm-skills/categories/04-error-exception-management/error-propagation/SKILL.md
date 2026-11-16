---
name: error-propagation
description: Use when deciding how a failure moves across layers and services - throw vs return, what is returned upstream when a downstream call fails, how correlation travels with the failure, and background-job failure handling.
---

# Error Propagation

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `error-propagation` |
| Category | 04 — Error & Exception Management |
| Scope | Failure flow from origin to client/operator. |
| Applicability | Services and workers. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (ERR-07, ERR-08, ERR-09) |
| Governing standards | `ERR-07`, `ERR-08`, `ERR-09`, `CTX-01`, `INT-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `exception-handling`, `global-exception-handling`, `integration-error-handling`, `dependency-failure-handling`, `correlation-id-management` |

## Purpose
A failure keeps its identity and safe context from origin to response, without leaking causes.

## When to use
- Adding a layer or integration.
- Handling downstream HTTP failures.

## Organizational standards
- **MANDATORY:** Within a service failures propagate by **throwing** catalogued errors; "result objects" are used only where the contract defines them (`null` = confirmed absence; `{ status: "new"|"duplicate"|... }` acquisition results).
- **MANDATORY:** A downstream failure that blocks the operation is translated at the integration boundary (typed unavailable error) and mapped to 502/503/504; the upstream response carries this service's own code, not the downstream's raw body.
- **MANDATORY:** Downstream error codes may be logged (`errorSource`) but are not forwarded as this service's codes.
- **MANDATORY:** Background workers never let a failure kill the loop: per-batch try/catch, log, mark the item failed with attempts and `lastError`, continue.
- **Verified convention:** Best-effort calls swallow and log; durable calls use the outbox (`outbox-pattern`).

_Source of truth: `ERR-07`, `ERR-08`, `ERR-09`, `CTX-01`, `INT-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Draw the failure path; check each layer adds nothing leaky.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Propagation**

```text
repo throws DependencyUnavailableError -> service lets it pass -> controller next(toAppError) -> error middleware -> 503 CONFIG_SERVICE_UNAVAILABLE envelope + log with cause
```

## Error and failure handling
- Do not retry inside a request path without a budget.
- Catch only where you can add context or translate; otherwise let the error propagate to the global handler (ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- `AppError.details` is public; internal causes live only on `Error.cause` and in logs (ERR-07).

## Testing guidelines
- Integration test with the dependency down.
- Assert code, numericCode, HTTP status and envelope for each catalog entry touched; assert that unknown errors become `UNHANDLED_ERROR` with no leaked detail.

## Anti-patterns
- Forwarding upstream response bodies.
- Using exceptions for normal control flow (absence).

## Implementation checklist
- [ ] Contract for absent vs unavailable; mapping at boundary; workers resilient.

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
- Within a service failures propagate by **throwing** catalogued errors; "result objects" are used only where the contract defines them (`null` = confirmed absence; `{ status: "new"|"duplicate"|... }` acquisition results).
- A downstream failure that blocks the operation is translated at the integration boundary (typed unavailable error) and mapped to 502/503/504; the upstream response carries this service's own code, not the downstream's raw body.
- Downstream error codes may be logged (`errorSource`) but are not forwarded as this service's codes.
- Background workers never let a failure kill the loop: per-batch try/catch, log, mark the item failed with attempts and `lastError`, continue.

## Related skills
- `exception-handling` — Exception Handling
- `global-exception-handling` — Global Exception Handling
- `integration-error-handling` — Integration Error Handling
- `dependency-failure-handling` — Dependency Failure Handling
- `correlation-id-management` — Correlation ID Management
