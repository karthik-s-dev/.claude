---
name: coding-standards-review
description: Use when checking that code follows the repo's and organization's coding conventions - TypeScript strict mode, aliases, naming/layout, logger/error idioms, config access, `__` test exports, comment style, no console, no `process.env` in features.
---

# Coding Standards Review

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `coding-standards-review` |
| Category | 14 — Code Review & Engineering Governance |
| Scope | Convention compliance. |
| Applicability | TypeScript/Node. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED conventions (TECH) |
| Governing standards | `ARCH-01`, `PKG-01`, `OBS-01`, `ERR-02`, `CFG-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `code-review`, `clean-code-review`, `project-structure`, `structured-logging`, `error-catalog-management` |

## Purpose
Mechanical conformance.

## When to use
- PR review; onboarding.

## Organizational standards
- **MANDATORY check:** `strict: true` (aliased reference uses strict; flag `strict: false` in repos); CommonJS/ES2020 target unless repo differs; imports via aliases/relative per repo; file naming per repo; no `console.*`; `logger` Pino order; `AppError` catalog throws; config via schema; `__` prefix for test hooks; `as const` catalogs; no `any` without comment; no commented-out code; `.env.example` updated.
- **UNRESOLVED — do not enforce; report:** No eslint/prettier configuration exists in the reference repos (E0) - do not claim lint rules; recommend adding with approval.

_Source of truth: `ARCH-01`, `PKG-01`, `OBS-01`, `ERR-02`, `CFG-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Run `tsc --noEmit`; scan with grep for `console\.`, `process.env`, `new Error(`.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Greps**

```text
grep -rn "console\." src | grep -v test ; grep -rn "process\.env" src/v2/services
```

## Error and failure handling
- N/A.
- When standards conflict or are ambiguous, report the conflict (see `conflicts-and-open-decisions`) rather than inventing a ruling.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Review findings must not quote secrets; reference location and rule ID instead.

## Testing guidelines
- CI type-check.
- A review is complete only when each applicable standard ID has been checked and the result (pass / deviation / not applicable) recorded.

## Anti-patterns
- Inventing lint rules.

## Implementation checklist
- [ ] Items.

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
- `strict: true` (aliased reference uses strict; flag `strict: false` in repos); CommonJS/ES2020 target unless repo differs; imports via aliases/relative per repo; file naming per repo; no `console.*`; `logger` Pino order; `AppError` catalog throws; config via schema; `__` prefix for test hooks; `as const` catalogs; no `any` without comment; no commented-out code; `.env.example` updated.

## Related skills
- `code-review` — Code Review
- `clean-code-review` — Clean Code Review
- `project-structure` — Project Structure & Folder Organization
- `structured-logging` — Structured Logging
- `error-catalog-management` — Error Catalog Management
