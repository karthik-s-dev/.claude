---
name: design-patterns
description: Use when choosing a design pattern for new logic. Lists the patterns actually used in the organization's services (Strategy+Registry+Decorator, factory helpers, outbox, adapter/normalizer, LRU+tiered cache, lazy singleton) and when each applies, to avoid introducing foreign patterns.
---

# Design Patterns

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `design-patterns` |
| Category | 01 — Microservice Architecture & Foundations |
| Scope | Pattern selection within a service. |
| Applicability | TypeScript services. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (ARCH-06) |
| Governing standards | `ARCH-06`, `MSG-03`, `DB-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `solid-principles`, `cost-calculation-strategy-registry`, `outbox-pattern`, `caching-strategy`, `clean-architecture` |

## Purpose
Keeps solutions consistent and prevents pattern sprawl.

## When to use
- A switch on type/unit/provider is growing.
- Two representations must be reconciled (adapter).
- Work must survive a crash (outbox).

## Organizational standards
- **Verified convention:** **Strategy + Registry** for variants resolved by key with product override then global fallback (`CostCalculatorRegistry`).
- **Verified convention:** **Decorator** for cross-cutting calculation rules (free tier, margin, minimum charge) wrapping a strategy.
- **Verified convention:** **Factory helpers** for typed errors (`appErr`, `throwXError`, `V2Errors.*`).
- **Verified convention:** **Adapter/normalizer** converting external payloads into internal entries (`config-subscription-normalizer`, `subscription-cache-entry`).
- **Verified convention:** **Outbox** for durable side effects (`outbox-pattern`); **tiered cache** (`caching-strategy`); **lazy singleton** clients (`dependency-injection`).
- **MANDATORY:** Prefer these before introducing a new pattern; any new framework-level pattern needs an ADR.

_Source of truth: `ARCH-06`, `MSG-03`, `DB-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Name the force (variant growth, representation mismatch, durability).
2. Pick the matching pattern from the list; implement in the existing layer.
3. Add tests for resolution order and fallbacks.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Decorator over a strategy**

```ts
const strategy = withMinimumCharge(withMargin(withFreeTier(new LlmTokenStrategy(), freeTier), marginPct), minCharge);
registry.registerProductOverride("<product>", "per_million_tokens", strategy);
```

## Error and failure handling
- Unresolved variant returns `null`; the caller logs and applies the documented default (not an exception) unless correctness requires it.
- Bootstrap failures must stop the process with a non-zero exit and a secret-free log (ARCH-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Never place secrets, tokens or connection strings in source, logs, examples or fixtures (CFG-07, OBS-03).

## Testing guidelines
- Table-driven tests per variant.
- Where import-boundary/lint tooling exists, enforce layer rules in CI; otherwise add an architecture test or review-checklist item for each rule.

## Anti-patterns
- Reflection/plugin frameworks.
- Singletons holding mutable request state.
- Abstract base classes for one implementation.

## Implementation checklist
- [ ] Pattern matches an evidenced one or has an ADR.

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
- Prefer these before introducing a new pattern; any new framework-level pattern needs an ADR.

## Related skills
- `solid-principles` — SOLID Principles
- `cost-calculation-strategy-registry` — Cost Calculation Strategy Registry
- `outbox-pattern` — Outbox Pattern
- `caching-strategy` — Caching Strategy
- `clean-architecture` — Clean Architecture
