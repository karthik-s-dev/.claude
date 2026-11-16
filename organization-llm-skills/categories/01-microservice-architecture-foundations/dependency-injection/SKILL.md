---
name: dependency-injection
description: Use when wiring collaborators into services, handlers, workers or clients, or when making code testable. Enforces manual constructor injection with production defaults and lazy module singletons with get/close and test overrides - no DI container.
---

# Dependency Injection

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `dependency-injection` |
| Category | 01 — Microservice Architecture & Foundations |
| Scope | How dependencies are provided, shared and replaced in tests. |
| Applicability | TypeScript/Node services. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (ARCH-04), UNRESOLVED (test seam style C-04) |
| Governing standards | `ARCH-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `service-registration-lifecycle`, `mocking-test-doubles`, `clean-architecture`, `in-memory-test-harness` |

## Purpose
Makes collaborators explicit and replaceable without framework magic and keeps the same wiring style across services.

## When to use
- Creating a class or function that needs a client, repository or another service.
- Making a module testable.
- Reviewing global state and singletons.

## Organizational standards
- **MANDATORY:** Use manual constructor/function-parameter injection; compose objects in the composition root/bootstrap (ARCH-04).
- **MANDATORY:** Do not introduce a DI container library (`inversify`, `tsyringe`, Nest modules) without approval - none exists in the reference repos.
- **Verified convention:** Infrastructure clients are lazy module singletons exposing `getX()` and `closeX()`; they throw a clear error when required configuration is missing; `closeX()` is called on shutdown.
- **Verified convention:** Test seams are explicit and prefixed `__` (`__setRedisForTests`, `__setUsageDbForTests`, `__setPublishUsageEventForTests`, `__resetConfigServiceClientForTests`); production code paths must not depend on them.
- **UNRESOLVED — do not enforce; report:** Reference repos differ (explicit `__set*ForTests` hooks vs test-runner module mocks); follow the target repo (C-04).

_Source of truth: `ARCH-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Classes: `constructor(private readonly dep: Dep = defaultDep)`.
2. Clients: module-level `let client: X | null`; `getX()` creates on first use from config; `closeX()` closes and nulls.
3. Expose a `__set…ForTests` override only when module mocking is not used in the target repo.
4. Construct and connect everything in bootstrap; pass instances down.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Lazy singleton with close and test override**

```ts
let client: Redis | null = null;
let testOverride: Redis | null = null;
export function __setRedisForTests(o: Redis | null) { testOverride = o; }
export function getRedis(): Redis {
  if (testOverride) return testOverride;
  if (!client) client = new Redis(buildRedisOptions());   // throws a catalogued error if config missing
  return client;
}
export async function closeRedis() { if (client) { await client.quit(); client = null; } }
```

## Error and failure handling
- Missing client configuration throws a catalogued infrastructure error (for example `REDIS_CONFIG_MISSING`), never `undefined` use.
- Bootstrap failures must stop the process with a non-zero exit and a secret-free log (ARCH-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Never place secrets, tokens or connection strings in source, logs, examples or fixtures (CFG-07, OBS-03).

## Testing guidelines
- Replace singletons through the override/mocking mechanism of the target repo; reset it after each test.
- Where import-boundary/lint tooling exists, enforce layer rules in CI; otherwise add an architecture test or review-checklist item for each rule.

## Anti-patterns
- Module-level `new Client()` at import time.
- Hidden global state with no `close`.
- Reading `process.env` deep in services.
- Adding a container library.

## Implementation checklist
- [ ] Dependencies explicit; defaults wired; `close` implemented and called on shutdown.
- [ ] Tests can substitute every external client.

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
- Use manual constructor/function-parameter injection; compose objects in the composition root/bootstrap (ARCH-04).
- Do not introduce a DI container library (`inversify`, `tsyringe`, Nest modules) without approval - none exists in the reference repos.

## Related skills
- `service-registration-lifecycle` — Service Registration & Lifecycle
- `mocking-test-doubles` — Mocking & Test Doubles
- `clean-architecture` — Clean Architecture
- `in-memory-test-harness` — In-Memory Test Harness
