---
name: solid-principles
description: Use when designing or reviewing classes and modules for single responsibility, extension without modification, substitutability, small interfaces and dependency inversion - expressed through the organization's actual patterns (strategy registries, injected collaborators, role-based modules).
---

# SOLID Principles

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `solid-principles` |
| Category | 01 — Microservice Architecture & Foundations |
| Scope | Class/module design rules inside a service. |
| Applicability | TypeScript (classes and function modules); principles are language-neutral. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | GENERIC principles applied through VERIFIED org patterns |
| Governing standards | `ARCH-02`, `ARCH-04`, `ARCH-06` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `dependency-injection`, `design-patterns`, `clean-architecture`, `solid-compliance-review` |

## Purpose
Provides concrete, repo-grounded ways to apply SOLID so reviewers can check it consistently.

## When to use
- Adding a branch (`if/switch`) on a type/unit that will grow.
- Writing a class with more than one reason to change.
- Reviewing code for SOLID compliance (use with `solid-compliance-review`).

## Organizational standards
- **Verified convention:** **S** - modules per role (controller/service/repository/integration); catalog and env schema in their own files.
- **Verified convention:** **O** - new billing units/products are added by registering a strategy (`registerGlobal`, `registerProductOverride`), not by editing a switch (ARCH-06).
- **Verified convention:** **L** - strategies implement one interface (`canHandle`, `calculate`) and are interchangeable; fetcher functions share one type.
- **Verified convention:** **I** - narrow function types and small interfaces (`ConfigSubscriptionFetcher`, `ICostCalculatorStrategy`).
- **Verified convention:** **D** - collaborators passed to constructors with production defaults; no DI container (ARCH-04).
- **MANDATORY:** Do not add a DI container or abstract factory layers to satisfy SOLID; use the patterns above.

_Source of truth: `ARCH-02`, `ARCH-04`, `ARCH-06`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. For a growing conditional, introduce a strategy interface plus a registry resolved by key (product override, then global, then explicit "not found").
2. For a class with mixed concerns, split by role and inject the collaborator.
3. Keep interfaces to the methods the consumer calls.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Open/closed via registry (pattern from the reference)**

```ts
interface Strategy { id: string; canHandle(unit: string): boolean; calculate(input: Input): Result }
class Registry {
  private globals = new Map<string, Strategy>();
  registerGlobal(unit: string, s: Strategy) { this.globals.set(unit, s); return this; }
  resolve(unit: string): Strategy | null { return this.globals.get(unit) ?? null; }  // explicit null, caller logs
}
```

## Error and failure handling
- A missing strategy resolves to `null` and is logged; callers decide (skip vs throw) per the dependency's failure policy.
- Bootstrap failures must stop the process with a non-zero exit and a secret-free log (ARCH-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Never place secrets, tokens or connection strings in source, logs, examples or fixtures (CFG-07, OBS-03).

## Testing guidelines
- One test per strategy plus a registry resolution-order test.
- Where import-boundary/lint tooling exists, enforce layer rules in CI; otherwise add an architecture test or review-checklist item for each rule.

## Anti-patterns
- God services.
- `switch` on product/unit repeated in many files.
- Interface with unused methods.
- Subclass overriding to throw "not supported".

## Implementation checklist
- [ ] One reason to change per module.
- [ ] New variants added without editing existing branches.
- [ ] Dependencies injected.

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
- Do not add a DI container or abstract factory layers to satisfy SOLID; use the patterns above.

## Related skills
- `dependency-injection` — Dependency Injection
- `design-patterns` — Design Patterns
- `clean-architecture` — Clean Architecture
- `solid-compliance-review` — SOLID Compliance Review
