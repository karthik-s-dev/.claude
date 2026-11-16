---
name: microservice-architecture-standards
description: Use when creating a new microservice, restructuring one, or reviewing its overall shape. Enforces the organization's Express/TypeScript service anatomy - shared-infrastructure zone, composition root, ordered bootstrap, approved internal packages, standard envelopes - instead of ad-hoc structure.
---

# Microservice Architecture Standards

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `microservice-architecture-standards` |
| Category | 01 — Microservice Architecture & Foundations |
| Scope | Whole-service structure and cross-cutting wiring for HTTP microservices. |
| Applicability | Node.js/TypeScript/Express services (reference stack); contract applies to any stack. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (ARCH-01..07), UNRESOLVED (layout naming C-17) |
| Governing standards | `ARCH-01`, `ARCH-02`, `ARCH-03`, `ARCH-05`, `ARCH-07`, `PKG-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `project-structure`, `layered-architecture`, `service-registration-lifecycle`, `middleware-request-pipeline`, `service-boundary-responsibility`, `internal-package-management` |

## Purpose
Gives every service the same anatomy so engineers and AI assistants find logging, errors, correlation, config, health and API contracts in predictable places, and so cross-cutting concerns are implemented once. Prevents each service from inventing its own bootstrap, error format or logger.

## When to use
- Creating a new service or a new module/zone inside a service.
- Adding a cross-cutting concern (logging, auth, correlation, health) to a service.
- Reviewing a pull request that changes `server`/`app`/bootstrap files or adds a top-level folder.
- Migrating a legacy surface (v1) to the standard surface (v2).

## Organizational standards
- **MANDATORY:** Provide exactly one composition root (mounts middleware and routers in order) and one bootstrap entry (validates config, configures the logger, connects dependencies, starts workers, listens, handles signals) - ARCH-01, ARCH-03.
- **MANDATORY:** Use the approved internal packages for logging (`@inextlabs/logger`), errors (`@inextlabs/platform-errors`) and Entra auth (`@inextlabs/azure-oauth`); report them if missing (PKG-01).
- **MANDATORY:** Keep shared, domain-agnostic infrastructure in one zone that imports no feature code (`general/` in the reference).
- **MANDATORY:** Mount the single error middleware last for each API surface (ARCH-05, ERR-06).
- **MANDATORY:** Expose probe endpoints and API docs per `health-endpoint-implementation` and `swagger-openapi`.
- **Verified convention:** Layering `routes -> controllers -> services -> repositories/integrations -> shared infra` (ARCH-02).
- **UNRESOLVED — do not enforce; report:** Folder/file naming style differs between the reference repos (C-17) - follow the target repository's existing style.
- **UNRESOLVED — do not enforce; report:** Health, route and envelope naming differences are listed in `conflicts-and-open-decisions` (C-06, C-14, C-15).

_Source of truth: `ARCH-01`, `ARCH-02`, `ARCH-03`, `ARCH-05`, `ARCH-07`, `PKG-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Inspect the target: entry files, folder layout, existing `general`-style zone, dependency manifest, `.npmrc`, test runner.
2. Map the work onto the standard anatomy (see `project-structure`); extend the existing layout, do not add a parallel one.
3. Wire cross-cutting concerns through their canonical skills: config (`configuration-validation`), logger (`logger-initialization`), correlation (`correlation-id-management`), errors (`global-exception-handling`), health (`liveness-readiness-checks`).
4. Keep controllers thin and services framework-free (`layered-architecture`).
5. Put outbound HTTP in integration modules and datastore access in repositories.
6. Document any deviation you must keep in an ADR (`architecture-decision-records`).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- One bootstrap, one composition root, one shared-infra zone, ordered middleware, one error middleware, standard envelopes, health probes, graceful shutdown.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Express 4, TypeScript (`strict: true`, CommonJS, ES2020+), path aliases mirrored in the test runner and `tsc-alias` for build output, `dotenv`.
- Reference zones: `general/` (infra), a versioned feature zone (`v2/`), optional `products/<name>/` mounted with a single line.

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Canonical anatomy**

```text
src/
  server.ts            # bootstrap (order matters)
  app.ts               # composition root
  general/             # shared infra: logger, correlation, telemetry, cache, db, health, response/error helpers
  <feature>/           # routes/ controllers/ services/ repositories/ integrations/ schemas/ utils/(errorCatalog, env.schema) docs/
```

## Error and failure handling
- Dependency or config failure at boot exits non-zero before listening.
- Bootstrap failures must stop the process with a non-zero exit and a secret-free log (ARCH-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Authenticate every route except health probes; document intentional exceptions.
- Never place secrets, tokens or connection strings in source, logs, examples or fixtures (CFG-07, OBS-03).

## Testing guidelines
- Boot test: the app imports without side effects and the middleware order matches the standard.
- Where import-boundary/lint tooling exists, enforce layer rules in CI; otherwise add an architecture test or review-checklist item for each rule.

## Anti-patterns
- Two bootstrap paths or two logger modules in one service.
- Feature code imported into the shared zone.
- Per-service reinvention of error envelope, correlation or logger wrapper.
- Business logic inside route files or controllers.

## Implementation checklist
- [ ] One bootstrap and one composition root exist and follow the standard order.
- [ ] Approved internal packages are used; none replaced by public packages.
- [ ] Error middleware is last; probes exist; docs exist.
- [ ] Deviations are recorded.

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
- Provide exactly one composition root (mounts middleware and routers in order) and one bootstrap entry (validates config, configures the logger, connects dependencies, starts workers, listens, handles signals) - ARCH-01, ARCH-03.
- Use the approved internal packages for logging (`@inextlabs/logger`), errors (`@inextlabs/platform-errors`) and Entra auth (`@inextlabs/azure-oauth`); report them if missing (PKG-01).
- Keep shared, domain-agnostic infrastructure in one zone that imports no feature code (`general/` in the reference).
- Mount the single error middleware last for each API surface (ARCH-05, ERR-06).
- Expose probe endpoints and API docs per `health-endpoint-implementation` and `swagger-openapi`.

## Related skills
- `project-structure` — Project Structure & Folder Organization
- `layered-architecture` — Layered Architecture
- `service-registration-lifecycle` — Service Registration & Lifecycle
- `middleware-request-pipeline` — Middleware & Request Pipeline
- `service-boundary-responsibility` — Service Boundary & Responsibility
- `internal-package-management` — Internal Package Management
