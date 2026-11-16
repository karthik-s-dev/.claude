---
name: request-dto-mapping
description: Use when converting validated request data into service inputs or domain types, renaming wire fields, or when services receive `req` objects. Keeps mapping explicit in controllers/mappers and transport types out of services.
---

# Request DTO Mapping

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `request-dto-mapping` |
| Category | 02 — API Development & Design |
| Scope | Mapping from validated request to service input. |
| Applicability | TypeScript services. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (ARCH-02), GENERIC naming |
| Governing standards | `ARCH-02`, `API-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `layered-architecture`, `request-validation`, `response-dto-mapping`, `clean-architecture` |

## Purpose
Isolates the wire contract from domain logic and enables contract evolution (renames at the boundary).

## When to use
- Adding an endpoint or changing field names.
- Wire name differs from internal name.

## Organizational standards
- **MANDATORY:** Services accept plain typed inputs; they never receive `Request`.
- **Verified convention:** Wire/internal names may differ and are converted at the boundary (producer converts `tenantId -> clientId` at the last step `toWirePayload`).
- **Verified convention:** Schemas live in `schemas/`; inferred types (`z.infer`) are the request DTO types where Zod is used.
- **Generic baseline (provisional):** DTO naming `<Operation>Request` / `<Operation>Response` and mapper functions `toXResponse` / `fromXRequest` (no explicit org naming evidence beyond `*.schema.ts`).

_Source of truth: `ARCH-02`, `API-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Define the schema, infer or declare the DTO type.
2. Map in the controller: `const input = { clientId: req.params.clientId, ...req.body }`.
3. Keep mapper functions pure and tested.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Last-step wire conversion (pattern)**

```ts
export function toWirePayload(p: InternalEvent): Record<string, unknown> {
  const { tenantId, ...rest } = p;          // internal name
  return { ...rest, clientId: tenantId };   // wire name
}
```

## Error and failure handling
- Mapping failures are programming errors -> `UNHANDLED_ERROR`; validate first so they cannot occur from user input.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- Mapper unit tests including renamed and optional fields.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- Passing `req.body` through to repositories.
- Mapping inside repositories.
- Silent field drops.

## Implementation checklist
- [ ] Explicit mapping; names documented; mapper tested.

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
- Services accept plain typed inputs; they never receive `Request`.

## Related skills
- `layered-architecture` — Layered Architecture
- `request-validation` — Request Validation
- `response-dto-mapping` — Response DTO Mapping
- `clean-architecture` — Clean Architecture
