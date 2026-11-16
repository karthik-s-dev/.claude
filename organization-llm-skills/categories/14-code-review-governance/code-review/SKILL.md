---
name: code-review
description: Use when reviewing a pull request or diff in an organization repository. Evaluates changes against the organizational standards catalog - approved packages, logging, error catalog, envelopes, config, security, tests - and reports each finding with the standard ID, severity and fix.
---

# Code Review

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `code-review` |
| Category | 14 — Code Review & Engineering Governance |
| Scope | Pull request review. |
| Applicability | All repos. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (OPS-03) + checklist derived from all standards |
| Governing standards | `OPS-03`, `PKG-01`, `ERR-02`, `OBS-01`, `SEC-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `coding-standards-review`, `security-review`, `architecture-review`, `solid-compliance-review`, `breaking-change-review`, `dependency-review`, `production-readiness-review` |

## Purpose
Consistent enforcement of the organization's rulebook.

## When to use
- Any PR; self-review before commit.

## Organizational standards
- **Verified convention:** PRs target `devtest`/`staging`/`main` and are validated against Azure Boards via the org reusable workflow `validate-azure-boards-pr.yml`; CI runs `tsc --noEmit` and tests (GitHub) / UnitTest stage (Azure).
- **MANDATORY:** Review order: (1) correctness; (2) standards - PKG-01 packages (no `console`, no `pino/winston`, no public substitutes), ERR (catalog, `AppError`, envelope, no leaks), OBS (logger shape, masking, correlation), CFG (schema/.env.example), SEC (auth on every route, fail-closed, constant-time), API (validation, envelopes, headers), DB/MSG (repositories, indexes, outbox, IDs), RES (timeouts, policies), TEST; (3) maintainability.
- **MANDATORY:** Each finding lists `file:line`, standard ID, severity (blocker/major/minor/nit), and a concrete fix; deviations from standards in *new or modified* code are blockers unless an approved exception exists; pre-existing deviations are noted, not blocked.
- **MANDATORY:** Findings never quote secrets.
- **MANDATORY:** If standards conflict or are unresolved (C-xx), report the conflict instead of choosing.

_Source of truth: `OPS-03`, `PKG-01`, `ERR-02`, `OBS-01`, `SEC-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Read the diff and target conventions; run the checklist below; summarize verdict.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Finding format**

```text
BLOCKER src/v2/controllers/x.ts:42 [ERR-02,API-03] Controller writes res.status(400).json({error}). Throw catalog VALIDATION_FAILED via validate() and let the error middleware respond.
```

## Error and failure handling
- Unreviewable diffs -> ask to split.
- When standards conflict or are ambiguous, report the conflict (see `conflicts-and-open-decisions`) rather than inventing a ruling.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Escalate secrets/auth bypass immediately.
- Review findings must not quote secrets; reference location and rule ID instead.

## Testing guidelines
- Tests accompany behaviour changes.
- A review is complete only when each applicable standard ID has been checked and the result (pass / deviation / not applicable) recorded.

## Anti-patterns
- Style-only reviews.
- Approving with unmet blockers.

## Implementation checklist
- [ ] Standards checklist applied; findings with IDs; verdict.

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
- Review order: (1) correctness; (2) standards - PKG-01 packages (no `console`, no `pino/winston`, no public substitutes), ERR (catalog, `AppError`, envelope, no leaks), OBS (logger shape, masking, correlation), CFG (schema/.env.example), SEC (auth on every route, fail-closed, constant-time), API (validation, envelopes, headers), DB/MSG (repositories, indexes, outbox, IDs), RES (timeouts, policies), TEST; (3) maintainability.
- Each finding lists `file:line`, standard ID, severity (blocker/major/minor/nit), and a concrete fix; deviations from standards in *new or modified* code are blockers unless an approved exception exists; pre-existing deviations are noted, not blocked.
- Findings never quote secrets.
- If standards conflict or are unresolved (C-xx), report the conflict instead of choosing.

## Related skills
- `coding-standards-review` — Coding Standards Review
- `security-review` — Security Review
- `architecture-review` — Architecture Review
- `solid-compliance-review` — SOLID Compliance Review
- `breaking-change-review` — Breaking Change Review
- `dependency-review` — Dependency Review
- `production-readiness-review` — Production Readiness Review
