---
name: api-request-structure
description: Use when defining or reviewing what an API request carries - path params, query, JSON body, headers (correlation, idempotency, internal key, client/bot identifiers) and tenant identity - and how it is validated and bound to the authenticated principal.
---

# API Request Structure

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `api-request-structure` |
| Category | 02 — API Development & Design |
| Scope | Shape of inbound requests and where each piece of information may come from. |
| Applicability | JSON/HTTP APIs. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (API-04, API-05) |
| Governing standards | `API-04`, `API-05`, `CTX-01`, `CTX-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `request-validation`, `correlation-id-management`, `idempotency-management`, `api-design-standards`, `request-header-management` |

## Purpose
Makes request contracts predictable and prevents identity spoofing through duplicate identifiers.

## When to use
- Adding an endpoint.
- Deciding where a field (identifier, key, flag) belongs.

## Organizational standards
- **MANDATORY:** Correlation comes only from `x-correlation-id` (never body/query) (CTX-01).
- **MANDATORY:** Write operations that can be retried carry the `Idempotency-Key` header (ADR default: header only, no body fallback) (CTX-03).
- **MANDATORY:** Every tenant/client identifier present in path, query or body must be consistent with the authenticated principal's claim; reject mismatches with a 403 catalogued error (reference: client-claim binding).
- **MANDATORY:** Body is JSON validated against a schema per segment; unknown/forbidden fields are rejected where the contract says a value is server-calculated (`CALCULATED_METRIC_FORBIDDEN` pattern).
- **Verified convention:** Header constants (`HEADERS`) come from one module; lowercase names.
- **DECIDED (C-07, approved 2026-11-16):** Approved: the ADR default is the target (Idempotency-Key header only, relational store for new services, IDEMPOTENCY_KEY_REUSED / IDEMPOTENCY_IN_PROGRESS); the Redis implementation is a documented deviation. _Earlier note (superseded where it conflicts):_ One reference service still reads an idempotency key from the body as well (C-07) - do not copy.

_Source of truth: `API-04`, `API-05`, `CTX-01`, `CTX-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Define a schema for params, query and body.
2. Declare which headers are required and map them via `request-header-management`.
3. Add the identity-consistency check in auth/validation middleware, not in each handler.
4. Document in OpenAPI.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Schema per segment (Zod, where the repo uses Zod)**

```ts
export const UpdateConfigSchema = z.object({ configName: z.string().min(1), value: z.unknown() }).strict();
export const ClientAndBotIdsSchema = z.object({ clientId: z.string().min(1), botId: z.string().min(1) });
router.put("/clients/:clientId/bots/:botId/config", validate(ClientAndBotIdsSchema, "params"), validate(UpdateConfigSchema, "body"), updateConfig);
```

## Error and failure handling
- Violations return `VALIDATION_FAILED` (400) with safe `details`; identity mismatch returns 403.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- Missing/extra/invalid fields; mismatched identifiers; absent idempotency key on a write.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- Accepting identity from the body when the token already carries it.
- Reading correlation or idempotency from the body.
- Accepting unvalidated JSON.

## Implementation checklist
- [ ] Schemas for all segments; headers declared; identity consistency enforced; docs updated.

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
- Correlation comes only from `x-correlation-id` (never body/query) (CTX-01).
- Write operations that can be retried carry the `Idempotency-Key` header (ADR default: header only, no body fallback) (CTX-03).
- Every tenant/client identifier present in path, query or body must be consistent with the authenticated principal's claim; reject mismatches with a 403 catalogued error (reference: client-claim binding).
- Body is JSON validated against a schema per segment; unknown/forbidden fields are rejected where the contract says a value is server-calculated (`CALCULATED_METRIC_FORBIDDEN` pattern).

## Related skills
- `request-validation` — Request Validation
- `correlation-id-management` — Correlation ID Management
- `idempotency-management` — Idempotency Management
- `api-design-standards` — API Design Standards
- `request-header-management` — Request Header Management
