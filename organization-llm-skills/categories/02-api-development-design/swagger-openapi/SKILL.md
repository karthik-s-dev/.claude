---
name: swagger-openapi
description: Use when documenting an HTTP API with OpenAPI, serving Swagger UI, or validating the spec. Follows the target repo's mechanism (typed TS spec object or `openapi.json` + swagger-ui-express) and requires a spec test.
---

# Swagger / OpenAPI

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `swagger-openapi` |
| Category | 02 — API Development & Design |
| Scope | OpenAPI authoring, serving and validation. |
| Applicability | Express services. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | TECH / UNRESOLVED (C-18) |
| Governing standards | `API-07` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `api-documentation`, `api-contract-testing`, `api-versioning`, `api-design-standards` |

## Purpose
A living, tested API contract that clients can consume.

## When to use
- Adding or changing an endpoint.
- Exposing docs.

## Organizational standards
- **MANDATORY:** Every public endpoint is in the spec with request schema, response envelope, error responses and security scheme.
- **Verified convention:** Reference service A: typed TS object `v2OpenApiSpec` + `getV2SwaggerHtml()` served at `/api/v2/swagger.json` and `/api/v2/docs`. Reference service B: `docs/openapi.json` + `swagger-ui-express` (`mountSwagger`), `/v2` paths derived from the base spec, plus a test (`swagger.test.ts`).
- **MANDATORY:** A test validates the spec loads and lists expected paths (B pattern).
- **UNRESOLVED — do not enforce; report:** Docs are served unauthenticated in the reference (C-18). GENERIC: gate docs for non-public APIs.

_Source of truth: `API-07`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add the path/operation next to the route change in the same PR.
2. Reference the shared envelope schemas (`SuccessEnvelope`, `ErrorEnvelope`).
3. Add or extend the spec test.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Operation fragment**

```json
{ "post": { "operationId": "checkAndRecord", "security": [{ "bearerAuth": [] }],
  "parameters": [{ "name": "Idempotency-Key", "in": "header", "required": true, "schema": { "type": "string" } }],
  "responses": { "200": { "description": "OK" }, "400": { "$ref": "#/components/responses/Error" }, "409": { "$ref": "#/components/responses/Error" } } } }
```

## Error and failure handling
- Spec load failure must fail the build/test, not the runtime request path.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Do not document internal-only endpoints in the public spec; do not expose docs for private APIs without auth.
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- Spec test; contract tests compare responses to the spec.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- Hand-edited spec drifting from code.
- Docs without auth for internal APIs.

## Implementation checklist
- [ ] Spec updated; test passes; envelopes referenced.

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
- Every public endpoint is in the spec with request schema, response envelope, error responses and security scheme.
- A test validates the spec loads and lists expected paths (B pattern).

## Related skills
- `api-documentation` — API Documentation
- `api-contract-testing` — API Contract Testing
- `api-versioning` — API Versioning
- `api-design-standards` — API Design Standards
