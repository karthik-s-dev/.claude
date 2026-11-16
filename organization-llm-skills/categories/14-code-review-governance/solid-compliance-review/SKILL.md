---
name: solid-compliance-review
description: Use when reviewing a change for SOLID violations using the organization's patterns as the benchmark - multi-responsibility classes, growing switches, base-class overrides that throw, fat interfaces, direct construction of collaborators.
---

# SOLID Compliance Review

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `solid-compliance-review` |
| Category | 14 — Code Review & Engineering Governance |
| Scope | SOLID review. |
| Applicability | TypeScript. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | derived from `solid-principles` |
| Governing standards | `ARCH-02`, `ARCH-04`, `ARCH-06` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `solid-principles`, `clean-code-review`, `design-patterns`, `dependency-injection` |

## Purpose
Objective SOLID findings.

## When to use
- Review of classes/services.

## Organizational standards
- **MANDATORY check:** S (one reason to change; role-based modules), O (strategy registry instead of switches), L (substitutable strategies/fetchers), I (narrow function types), D (constructor injection with defaults; no container).
- **MANDATORY:** Findings propose the organization's pattern (registry, injected fetcher), not a new framework.

_Source of truth: `ARCH-02`, `ARCH-04`, `ARCH-06`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Annotate each violation with the principle and fix.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Finding**

```text
MAJOR src/pricing/calc.ts:30 [O] switch(billingUnit) - register a strategy (see cost-calculation-strategy-registry).
```

## Error and failure handling
- N/A.
- When standards conflict or are ambiguous, report the conflict (see `conflicts-and-open-decisions`) rather than inventing a ruling.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Review findings must not quote secrets; reference location and rule ID instead.

## Testing guidelines
- Strategy tests.
- A review is complete only when each applicable standard ID has been checked and the result (pass / deviation / not applicable) recorded.

## Anti-patterns
- Demanding abstractions for single implementations.

## Implementation checklist
- [ ] Five principles.

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
- S (one reason to change; role-based modules), O (strategy registry instead of switches), L (substitutable strategies/fetchers), I (narrow function types), D (constructor injection with defaults; no container).
- Findings propose the organization's pattern (registry, injected fetcher), not a new framework.

## Related skills
- `solid-principles` — SOLID Principles
- `clean-code-review` — Clean Code Review
- `design-patterns` — Design Patterns
- `dependency-injection` — Dependency Injection
