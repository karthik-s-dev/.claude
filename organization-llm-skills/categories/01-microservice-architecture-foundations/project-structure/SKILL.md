---
name: project-structure
description: Use when adding files, folders, modules or path aliases to a service, or scaffolding a service. Places code in the organization's zones (shared infra, feature zone, routes/controllers/services/repositories/integrations/schemas/utils/docs) and keeps tests and aliases consistent.
---

# Project Structure & Folder Organization

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `project-structure` |
| Category | 01 — Microservice Architecture & Foundations |
| Scope | Folder and module organization, aliases, file placement and naming within a service. |
| Applicability | TypeScript services; layout concepts apply to any language. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (ARCH-01), UNRESOLVED (C-17) |
| Governing standards | `ARCH-01`, `ARCH-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `microservice-architecture-standards`, `layered-architecture`, `clean-architecture`, `service-registration-lifecycle` |

## Purpose
Ensures new code lands where reviewers and tools expect it, keeps the dependency direction one-way, and keeps build/test aliases in sync.

## When to use
- Creating any new source file or folder.
- Introducing a new API version, product module or background worker.
- Changing `tsconfig` paths or test-runner module mappers.

## Organizational standards
- **MANDATORY:** One-way dependency direction `routes -> controllers -> services -> {repositories, integrations} -> shared infra`; shared infra imports no feature code (ARCH-01/02).
- **MANDATORY:** Test-only exports are prefixed `__` (for example `__setRedisForTests`).
- **Verified convention:** Role-suffixed file names (`config.controller.ts`, `error.middleware.ts`, `subscription.repository.ts`) in the aliased repo; `kebab-case.ts` in the flat repo.
- **Verified convention:** `.env.example`, `Dockerfile`, pipeline YAMLs, `docs/` (ADRs, OpenAPI, Postman) live at repo root; scripts in `scripts/` or `src/scripts/`.
- **Configurable:** Path aliases (`@general/*`, `@servicesv2/*`) are optional, but when present they must be declared in `tsconfig.json`, mirrored in the test runner and resolved in the build (`tsc-alias`).
- **UNRESOLVED — do not enforce; report:** Test location - separate `test/` tree (Jest repo) vs colocated `*.test.ts` (Vitest repo); follow the target (C-04).

_Source of truth: `ARCH-01`, `ARCH-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Read the target tree and alias config; list where each role already lives.
2. Place the new file by role; reuse the existing file naming style.
3. If you add an alias, update `tsconfig.json`, the test runner mapping and the build step in the same change.
4. Keep one module per aggregate for repositories and one per external dependency for integrations.
5. Co-locate feature schemas (`schemas/`) and error catalog (`utils/errorCatalog.ts`) with the feature zone.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Placement guide**

```text
route definition         -> <feature>/routes/<resource>.routes.ts
request parsing          -> <feature>/controllers/<resource>.controller.ts
domain logic             -> <feature>/services/<name>.service.ts
datastore access         -> <feature>/repositories/<aggregate>.repository.ts
outbound HTTP            -> <feature>/integrations/<dependency>.ts
request schemas          -> <feature>/schemas/<resource>.schema.ts
error catalog / env      -> <feature>/utils/errorCatalog.ts, env.schema.ts
logger, correlation, db  -> general/service|middlewares|utils
```

## Error and failure handling
- Alias mismatch between build and tests shows up as runtime "module not found"; fix all three config files together.
- Bootstrap failures must stop the process with a non-zero exit and a secret-free log (ARCH-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Never place secrets, tokens or connection strings in source, logs, examples or fixtures (CFG-07, OBS-03).

## Testing guidelines
- CI should run a type-check (`tsc --noEmit`) and the test suite so alias drift fails the build.
- Where import-boundary/lint tooling exists, enforce layer rules in CI; otherwise add an architecture test or review-checklist item for each rule.

## Anti-patterns
- Creating `utils/misc.ts` dumping grounds.
- Importing `express` types into services.
- A second copy of a shared helper inside a feature folder.
- Changing aliases in `tsconfig` only.

## Implementation checklist
- [ ] File is in the correct role folder and named per the repo's convention.
- [ ] No upward or circular import introduced.
- [ ] Aliases consistent across `tsconfig`, test runner, build.

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
- One-way dependency direction `routes -> controllers -> services -> {repositories, integrations} -> shared infra`; shared infra imports no feature code (ARCH-01/02).
- Test-only exports are prefixed `__` (for example `__setRedisForTests`).

## Related skills
- `microservice-architecture-standards` — Microservice Architecture Standards
- `layered-architecture` — Layered Architecture
- `clean-architecture` — Clean Architecture
- `service-registration-lifecycle` — Service Registration & Lifecycle
