---
name: test-coverage-standards
description: Use when setting or checking coverage expectations. The reference publishes JUnit and Cobertura reports but enforces no threshold (and runs with --passWithNoTests); this skill states the evidenced reporting and a provisional threshold recommendation.
---

# Test Coverage Standards

> ⚠ **PARTIAL / DEFECTIVE EVIDENCE (E3).** The reference implementation is isolated, declared-only, inert or has known defects. Use the pattern's *contract* only; do not copy the defects documented below.

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `test-coverage-standards` |
| Category | 13 — Testing & Quality Engineering |
| Scope | Coverage policy. |
| Applicability | Jest (`--coverage`, cobertura) / Vitest. |
| Evidence | E3 — isolated / declared-only / defective |
| Classification | PARTIAL (coverage reported, no threshold) / GENERIC target |
| Governing standards | `TEST-01`, `TEST-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `unit-testing`, `ci-cd-pipeline`, `code-review`, `technical-debt-assessment` |

## Purpose
Make coverage a gate, not a number.

## When to use
- Setting CI gates.

## Organizational standards
- **Verified convention:** Jest reporters `default` + `jest-junit` (test-results/junit.xml); coverage reporters `text`, `cobertura`, `html`; Azure pipeline publishes results and the test stage gates the build (config repo); GitHub CI runs `tsc --noEmit` + tests (enforcement repo).
- **Generic baseline (provisional) (provisional, needs approval):** threshold e.g. 80% lines for new/changed code via `coverageThreshold` (Jest) / `coverage.thresholds` (Vitest); remove `--passWithNoTests` from gates.
- **MANDATORY:** Standards-critical code (catalog, envelope, auth, idempotency) requires explicit tests regardless of percentage.

_Source of truth: `TEST-01`, `TEST-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add threshold config; fail CI under it.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Jest threshold (GENERIC)**

```ts
coverageThreshold: { global: { lines: 80, functions: 80, branches: 70 } }
```

## Error and failure handling
- Under threshold fails the test stage.
- Tests must fail loudly: no swallowed assertions, no `--passWithNoTests` as a quality gate.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Test fixtures contain no real secrets or personal data; stub environment variables in setup files (TEST-01).

## Testing guidelines
- N/A.
- Follow the target repository's runner and layout (TEST-01); do not introduce a second test framework.

## Anti-patterns
- Coverage-padding tests.

## Implementation checklist
- [ ] Reports published; gate; critical areas.

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
- Standards-critical code (catalog, envelope, auth, idempotency) requires explicit tests regardless of percentage.

## Related skills
- `unit-testing` — Unit Testing
- `ci-cd-pipeline` — CI/CD Pipeline
- `code-review` — Code Review
- `technical-debt-assessment` — Technical Debt Assessment
