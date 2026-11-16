---
name: layered-architecture
description: Use when writing or reviewing routes, controllers, services, repositories or integration modules. Enforces thin controllers, framework-free services, repository-owned data access, integration-owned outbound HTTP, and the controller error idiom.
---

# Layered Architecture

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `layered-architecture` |
| Category | 01 — Microservice Architecture & Foundations |
| Scope | Responsibilities and allowed dependencies of each layer inside a service. |
| Applicability | Node/Express services; contract is language-neutral. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (ARCH-02) |
| Governing standards | `ARCH-02`, `ARCH-05`, `ERR-08` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `clean-architecture`, `project-structure`, `database-repository-pattern`, `external-api-client`, `request-dto-mapping` |

## Purpose
Keeps responsibilities separate so behaviour is testable, error handling is uniform and datastores/HTTP clients can be swapped or mocked.

## When to use
- Adding an endpoint end-to-end.
- Moving logic out of controllers or route files.
- Reviewing for layer violations.

## Organizational standards
- **MANDATORY:** Routes only compose middleware (`correlation -> auth -> validate -> controller`) and map paths; no logic.
- **MANDATORY:** Controllers parse validated input, call exactly one service operation, respond via the standard success helper, and forward failures with `next(toAppError(err))` (or an `asyncHandler` wrapper) - never write error bodies (ERR-08).
- **MANDATORY:** Services contain domain logic and import no `express` types.
- **MANDATORY:** Repositories own all datastore access (queries, indexes, mapping, `close()`); integrations own all outbound HTTP.
- **Verified convention:** Gap - the aliased reference repo lets services call models directly in places; do not extend that; add a repository.

_Source of truth: `ARCH-02`, `ARCH-05`, `ERR-08`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Create the route with validation and auth middleware, then the controller, service, repository/integration in that order.
2. Map request -> service input in the controller; map result -> response DTO in the controller or a mapper.
3. Throw catalog errors from services; do not catch just to rethrow.
4. Add tests per layer: controller (mock service), service (mock repository), repository (test double).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Controller idiom**

```ts
export async function getItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { itemId } = req.params;            // already validated by validate(schema, "params")
    const item = await itemService.getItem(itemId);
    sendSuccess(req, res, toItemResponse(item));
  } catch (err) {
    next(toAppError(err));                    // never res.status(500).json(...)
  }
}
```

## Error and failure handling
- Unknown errors are wrapped as `UNHANDLED_ERROR` by `toAppError`; business failures throw catalog errors.
- Bootstrap failures must stop the process with a non-zero exit and a secret-free log (ARCH-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Never place secrets, tokens or connection strings in source, logs, examples or fixtures (CFG-07, OBS-03).

## Testing guidelines
- Controllers: assert `sendSuccess` or `next` called with an `AppError` carrying the expected code.
- Where import-boundary/lint tooling exists, enforce layer rules in CI; otherwise add an architecture test or review-checklist item for each rule.

## Anti-patterns
- Controller calling two services plus a repository.
- `res.json({ error })` in handlers.
- Services depending on `Request`.
- Repositories returning raw driver errors to controllers.

## Implementation checklist
- [ ] Each layer only depends downward.
- [ ] Error idiom used in every controller.
- [ ] Mapping is explicit.

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
- Routes only compose middleware (`correlation -> auth -> validate -> controller`) and map paths; no logic.
- Controllers parse validated input, call exactly one service operation, respond via the standard success helper, and forward failures with `next(toAppError(err))` (or an `asyncHandler` wrapper) - never write error bodies (ERR-08).
- Services contain domain logic and import no `express` types.
- Repositories own all datastore access (queries, indexes, mapping, `close()`); integrations own all outbound HTTP.

## Related skills
- `clean-architecture` — Clean Architecture
- `project-structure` — Project Structure & Folder Organization
- `database-repository-pattern` — Database Repository Pattern
- `external-api-client` — External API Client
- `request-dto-mapping` — Request DTO Mapping
