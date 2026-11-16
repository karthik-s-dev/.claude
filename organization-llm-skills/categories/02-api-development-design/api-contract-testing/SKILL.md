---
name: api-contract-testing
description: Use when verifying that an API's actual requests/responses match its documented contract - OpenAPI spec, envelopes, error codes, headers - and when guarding consumer/provider compatibility. This is the canonical contract-testing skill; other skills link here.
---

# API Contract Testing

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `api-contract-testing` |
| Category | 02 — API Development & Design |
| Scope | API contract verification (provider and consumer). |
| Applicability | HTTP APIs; Postman/Newman or the repo's test runner. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (TEST-03), GENERIC tooling |
| Governing standards | `TEST-03`, `API-02`, `API-03`, `API-07` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `contract-testing`, `swagger-openapi`, `postman-functional-testing`, `api-testing`, `api-compatibility-review` |

## Purpose
Detects breaking changes before release.

## When to use
- Changing an endpoint, schema or error code.
- Introducing a consumer of another service.

## Organizational standards
- **Verified convention:** Postman collections committed with the repo (`postman/*.json`, `docs/postman-enforcement-v2.json`, `docs/functional-tests/...`) with an environment file; Postman CLI is available on developer machines.
- **Verified convention:** Spec test loads the OpenAPI document (`swagger.test.ts`).
- **MANDATORY:** Contract tests assert envelope shape (`success`, `data`/`error`, `metadata.correlationId`), status code, catalog `code`/`numericCode`, and required headers.
- **Generic baseline (provisional):** Add schema validation of live responses against the OpenAPI schemas; run in CI. Consumer-driven (Pact-style) tests are not evidenced and need approval.

_Source of truth: `TEST-03`, `API-02`, `API-03`, `API-07`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Keep the spec and Postman collection updated in the same PR.
2. Add runner-level tests (supertest or HTTP mocks) for every documented status.
3. Run collection in CI against the test stack (`postman-functional-testing`).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Envelope assertion (runner-neutral)**

```ts
expect(res.status).toBe(409);
expect(res.body).toMatchObject({ success: false, error: { code: "IDEMPOTENCY_KEY_REUSED", numericCode: expect.stringMatching(/^1\d{7}$/) },
  metadata: { correlationId: expect.any(String), timestamp: expect.any(String) } });
expect(res.headers["x-correlation-id"]).toBeDefined();
```

## Error and failure handling
- Contract drift fails CI; do not weaken assertions to pass.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- All documented statuses; error catalog codes; backwards compatibility with the previous spec.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- Contract tests that only check 200.
- Spec not updated.

## Implementation checklist
- [ ] Spec + collection + tests updated; CI executes them.

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
- Contract tests assert envelope shape (`success`, `data`/`error`, `metadata.correlationId`), status code, catalog `code`/`numericCode`, and required headers.

## Related skills
- `contract-testing` — Contract Testing (Non-API Contracts)
- `swagger-openapi` — Swagger / OpenAPI
- `postman-functional-testing` — Postman Functional Testing
- `api-testing` — API Testing
- `api-compatibility-review` — API Compatibility Review
