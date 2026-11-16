---
name: internal-package-management
description: Use when adding, upgrading, pinning or auditing `@inextlabs/*` packages, editing `.npmrc`, Docker build auth, or when code is about to import a public library for a concern an internal package already covers (logging, errors, Entra auth, usage utilities).
---

# Internal Package Management

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `internal-package-management` |
| Category | 01 — Microservice Architecture & Foundations |
| Scope | Internal npm package selection, registry access, versioning and substitution rules. |
| Applicability | Node.js/TypeScript services using GitHub Packages. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | MANDATED (PKG-01) |
| Governing standards | `PKG-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `microservice-architecture-standards`, `docker-containerization`, `ci-cd-pipeline`, `dependency-review`, `structured-logging` |

## Purpose
Ensures internal packages are used instead of public alternatives and that registry credentials are handled safely.

## When to use
- Adding a dependency for logging, error formatting, auth, usage utilities, shared models.
- A build/CI/Docker install fails with 401/403 on `@inextlabs/*`.
- Reviewing `package.json` changes.

## Organizational standards
- **MANDATORY:** Use `@inextlabs/logger` (logging), `@inextlabs/platform-errors` (`AppError`, `formatError`), `@inextlabs/azure-oauth` (`validateAuthToken`, `generateAuthToken`), `@inextlabs/schema-models` (shared Mongoose models). `@inextlabs/inflow-usage-utils` is usage-platform specific and is **not** part of this ecosystem: do not add it for generic concerns; implement small local helpers (error-code builder, header constants, URI masking) per the relevant skills.
- **MANDATORY:** `.npmrc` contains `@inextlabs:registry=https://npm.pkg.github.com/inextlabs/` and the token **only** as `${AuthToken}` (environment variable); no literal token ever committed.
- **MANDATORY:** Docker build takes `ARG AuthToken`, runs `npm ci`, then deletes `.npmrc` before the image is finalized.
- **MANDATORY:** If a needed internal package is not installed in the target, report it; do not substitute a public library.
- **Configurable:** Foundational packages (`logger`, `platform-errors`) are pinned to exact versions in the reference (`1.0.4`, `1.0.1`); others use `^`.
- **Verified convention:** A service's logger is `@inextlabs/logger`; no other logging library is introduced (C-02).

_Source of truth: `PKG-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Inspect `package.json`, lockfile, `.npmrc`, Dockerfile, pipeline for `AuthToken`.
2. Add or update the package with the repo's package manager; keep lockfile committed.
3. Read the package's `.d.ts`/README in `node_modules` before using its API.
4. Check internal packages for known defects (see `conflicts-and-open-decisions` C-05) before wrapping them.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**.npmrc (token by reference only)**

```text
@inextlabs:registry=https://npm.pkg.github.com/inextlabs/
//npm.pkg.github.com/:_authToken=${AuthToken}
```

## Error and failure handling
- 401/403 on install: token missing/expired or package access not granted to the repo (see package Manage Actions access); fix access, do not vendor the code.
- Bootstrap failures must stop the process with a non-zero exit and a secret-free log (ARCH-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Never print `.npmrc` contents or the token in logs; scrub from image layers.
- Never place secrets, tokens or connection strings in source, logs, examples or fixtures (CFG-07, OBS-03).

## Testing guidelines
- CI installs with `AuthToken` from secrets and runs `tsc --noEmit` and tests.
- Where import-boundary/lint tooling exists, enforce layer rules in CI; otherwise add an architecture test or review-checklist item for each rule.

## Anti-patterns
- Public logger/error libraries replacing internal ones.
- Vendoring copies of package code (`v2/platform.ts` copy in the reference is a documented defect, C-08).
- Literal tokens in `.npmrc`.

## Implementation checklist
- [ ] Internal packages used for their concerns; `.npmrc` safe; Docker removes `.npmrc`; versions pinned per policy.

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
- Use `@inextlabs/logger` (logging), `@inextlabs/platform-errors` (`AppError`, `formatError`), `@inextlabs/azure-oauth` (`validateAuthToken`, `generateAuthToken`), `@inextlabs/schema-models` (shared Mongoose models). `@inextlabs/inflow-usage-utils` is usage-platform specific and is **not** part of this ecosystem: do not add it for generic concerns; implement small local helpers (error-code builder, header constants, URI masking) per the relevant skills.
- `.npmrc` contains `@inextlabs:registry=https://npm.pkg.github.com/inextlabs/` and the token **only** as `${AuthToken}` (environment variable); no literal token ever committed.
- Docker build takes `ARG AuthToken`, runs `npm ci`, then deletes `.npmrc` before the image is finalized.
- If a needed internal package is not installed in the target, report it; do not substitute a public library.

## Related skills
- `microservice-architecture-standards` — Microservice Architecture Standards
- `docker-containerization` — Docker & Containerization
- `ci-cd-pipeline` — CI/CD Pipeline
- `dependency-review` — Dependency Review
- `structured-logging` — Structured Logging
