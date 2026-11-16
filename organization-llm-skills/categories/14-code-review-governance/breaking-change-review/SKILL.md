---
name: breaking-change-review
description: Use when a change might break consumers - APIs, error codes, envelopes, headers, message payloads, queue job shapes, DB shapes, env variables, shared package exports. Decides compatibility, required version bump/migration and communication.
---

# Breaking Change Review

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `breaking-change-review` |
| Category | 14 — Code Review & Engineering Governance |
| Scope | Breaking change detection across contracts. |
| Applicability | All. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (API-08) + GENERIC |
| Governing standards | `API-08`, `ERR-03`, `MSG-04`, `DB-07` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `api-compatibility-review`, `api-versioning`, `message-versioning`, `database-migration`, `deprecation-sunset-management` |

## Purpose
No surprise breaks.

## When to use
- Any contract change.

## Organizational standards
- **MANDATORY:** Treat as breaking: removed/renamed field/endpoint/env var/package export, changed error code or status for the same condition, changed envelope, new required header/field, tightened validation, message type/enum change (`USAGE_ALERT` -> `USAGE-ALERT`), DB shape change read by others.
- **MANDATORY:** Breaking requires version/migration/sunset plan (`api-versioning`, `database-migration`) and a CHANGELOG/README note; shared packages follow semver with deprecation before removal (GENERIC).
- **MANDATORY:** Consumers' lockfiles are updated in their own PRs to `devtest`.

_Source of truth: `API-08`, `ERR-03`, `MSG-04`, `DB-07`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Complete a table: change, contract, consumers, verdict, action.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Row**

```text
env AZURE_CACHE_FOR_REDIS_HOST_NAME -> REDIS_HOST_NAME | BREAKING | keep alias with warn for 2 releases
```

## Error and failure handling
- Unknown consumers -> assume breaking.
- When standards conflict or are ambiguous, report the conflict (see `conflicts-and-open-decisions`) rather than inventing a ruling.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Review findings must not quote secrets; reference location and rule ID instead.

## Testing guidelines
- Old-contract tests.
- A review is complete only when each applicable standard ID has been checked and the result (pass / deviation / not applicable) recorded.

## Anti-patterns
- Renaming in place.

## Implementation checklist
- [ ] Table; plan; communication.

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
- Treat as breaking: removed/renamed field/endpoint/env var/package export, changed error code or status for the same condition, changed envelope, new required header/field, tightened validation, message type/enum change (`USAGE_ALERT` -> `USAGE-ALERT`), DB shape change read by others.
- Breaking requires version/migration/sunset plan (`api-versioning`, `database-migration`) and a CHANGELOG/README note; shared packages follow semver with deprecation before removal (GENERIC).
- Consumers' lockfiles are updated in their own PRs to `devtest`.

## Related skills
- `api-compatibility-review` — API Compatibility Review
- `api-versioning` — API Versioning
- `message-versioning` — Message Versioning
- `database-migration` — Database Migration
- `deprecation-sunset-management` — Deprecation & Sunset Management
