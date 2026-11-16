---
name: api-design-standards
description: Use when designing, adding or reviewing HTTP endpoints - paths, methods, internal vs public namespaces, versioning prefix, envelopes, headers and status codes - so new APIs match the organization's contract conventions.
---

# API Design Standards

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `api-design-standards` |
| Category | 02 — API Development & Design |
| Scope | Endpoint design decisions for REST-style services. |
| Applicability | Express services (reference); contract is stack-neutral. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (API-01 shared parts), UNRESOLVED (route naming C-14) |
| Governing standards | `API-01`, `API-02`, `API-03`, `API-04`, `API-10` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `api-request-structure`, `api-response-structure`, `api-error-response`, `api-versioning`, `request-validation`, `swagger-openapi`, `http-status-codes` |

## Purpose
Gives every service a recognizable API shape and keeps clients from special-casing each service.

## When to use
- Designing a new endpoint or resource.
- Reviewing an API change for contract consistency.
- Deciding path/method/status for an operation.

## Organizational standards
- **MANDATORY:** Version appears as a path prefix (`/api/v2/...` or `/v2/...`); health endpoints are unversioned.
- **MANDATORY:** Internal (service-to-service) endpoints sit in a separate namespace (`/api/v2/internal/...`) with internal-key auth (SEC-03).
- **MANDATORY:** Every response uses the standard envelopes (API-02, API-03) and sets `x-correlation-id`.
- **MANDATORY:** All input validated before use (`request-validation`); all failures catalogued (`api-error-response`).
- **Verified convention:** Resource style in the aliased reference service: plural nouns, nested sub-resources (`/clients/:clientId/bots/:botId/configs/:configType`), state changes as `POST .../{id}/refresh`, capability-named endpoints, static paths mounted before parameterized.
- **UNRESOLVED — do not enforce; report:** The other reference service uses action endpoints (`POST /v2/check`, `/check-and-record`, `/record-usage-event`) (C-14). Follow the target repo's style; use resource style for CRUD-like new APIs and action endpoints only where the operation is not a resource state change.

_Source of truth: `API-01`, `API-02`, `API-03`, `API-04`, `API-10`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. List the existing routes of the target service and mirror their style.
2. Choose method by semantics (GET read, PUT replace, PATCH partial, POST create/action, DELETE remove).
3. Define request schema, response DTO, error codes and status mapping before coding.
4. Add OpenAPI entries (`swagger-openapi`) and contract tests (`api-contract-testing`).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Route definition (reference style)**

```ts
router.use(correlationIdMiddleware);
router.get("/clients/:clientId/bots/:botId/configs/:configType",
  validateAuthToken(), validate(GetConfigOfBotSchema, "params"), getConfigOfBot);
router.post("/clients/:clientId/bots/:botId/refresh", validateAuthToken(), resetConfig);
```

## Error and failure handling
- Unknown route -> catalogued 404 `RESOURCE_NOT_FOUND`; wrong method -> 405 through the same envelope.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Internal namespace must never be reachable without the internal key; do not put identifiers that grant access in URLs without authorization checks.
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- Contract tests per endpoint covering the envelope and status mapping.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- Verbs in resource paths where a resource noun exists.
- Raw `res.json` bodies.
- Endpoints without auth by omission.
- Ad-hoc 400s outside the catalog.

## Implementation checklist
- [ ] Path/method style matches the repo.
- [ ] Envelope, headers, validation, errors, docs, tests present.

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
- Version appears as a path prefix (`/api/v2/...` or `/v2/...`); health endpoints are unversioned.
- Internal (service-to-service) endpoints sit in a separate namespace (`/api/v2/internal/...`) with internal-key auth (SEC-03).
- Every response uses the standard envelopes (API-02, API-03) and sets `x-correlation-id`.
- All input validated before use (`request-validation`); all failures catalogued (`api-error-response`).

## Related skills
- `api-request-structure` — API Request Structure
- `api-response-structure` — API Response Structure
- `api-error-response` — API Error Response
- `api-versioning` — API Versioning
- `request-validation` — Request Validation
- `swagger-openapi` — Swagger / OpenAPI
- `http-status-codes` — HTTP Status Codes
