---
name: api-compatibility-review
description: Use when reviewing a change to an API for backward compatibility - fields, enums, status codes, error codes, headers, pagination and auth. Produces a compatible / additive / breaking verdict with required version actions.
---

# API Compatibility Review

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `api-compatibility-review` |
| Category | 02 — API Development & Design |
| Scope | Reviewing API diffs. |
| Applicability | HTTP APIs. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (API-08) + GENERIC checklist |
| Governing standards | `API-08`, `API-02`, `API-03`, `ERR-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `api-versioning`, `breaking-change-review`, `api-contract-testing`, `deprecation-sunset-management`, `code-review` |

## Purpose
Prevent accidental breaking changes.

## When to use
- Any PR touching routes, schemas, DTOs, error catalog, envelope or auth.

## Organizational standards
- **MANDATORY:** Shipped error codes and numeric codes are never changed, reused or renumbered (ERR-03).
- **MANDATORY:** A breaking change requires a new version or a documented, approved migration with sunset (`api-versioning`).
- **Verified convention:** Wire-level renames are done at the boundary mapper while keeping queued/older data valid (`toWirePayload`).
- **Generic baseline (provisional):** Treat these as breaking: removed/renamed field, narrowed type, new required field/header, changed status for the same condition, changed envelope, stricter validation of previously accepted input, auth requirement added.

_Source of truth: `API-08`, `API-02`, `API-03`, `ERR-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Diff spec/schemas and error catalog.
2. Classify each change; record verdicts.
3. Require tests/version actions for breaking ones.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Review verdict format**

```text
Change: field `plan` renamed to `planId` in response  -> BREAKING (rename) -> add `plan` alias for 1 version or bump version
Change: new optional query `status`                    -> ADDITIVE
Change: 404 -> 403 for foreign tenant                  -> BREAKING (status semantics)
```

## Error and failure handling
- Unclear classification -> treat as breaking and ask.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- Run old contract tests against new code.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- Approving because the UI still works.
- Changing codes "just once".

## Implementation checklist
- [ ] Verdict recorded; version/migration plan; tests.

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
- Shipped error codes and numeric codes are never changed, reused or renumbered (ERR-03).
- A breaking change requires a new version or a documented, approved migration with sunset (`api-versioning`).

## Related skills
- `api-versioning` — API Versioning
- `breaking-change-review` — Breaking Change Review
- `api-contract-testing` — API Contract Testing
- `deprecation-sunset-management` — Deprecation & Sunset Management
- `code-review` — Code Review
