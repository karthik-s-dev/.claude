---
name: postman-functional-testing
description: Use when creating or running functional API tests as Postman collections - collection and environment files in the repo, synthetic data, variables for URLs/tokens (no secrets), pre-request token handling, CLI execution and CI.
---

# Postman Functional Testing

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `postman-functional-testing` |
| Category | 13 — Testing & Quality Engineering |
| Scope | Postman collections. |
| Applicability | Postman, Postman CLI. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (TEST-03) |
| Governing standards | `TEST-03`, `API-07` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `api-contract-testing`, `end-to-end-testing`, `api-testing`, `test-data-management`, `swagger-openapi` |

## Purpose
Executable API documentation and regression checks.

## When to use
- Adding endpoints; cross-service flows.

## Organizational standards
- **Verified convention:** `postman/*.postman_collection.json` or `docs/*postman*.json` collections, a synthetic environment file and `docs/functional-tests/**` setup/walkthrough guides.
- **MANDATORY:** Collections reference `{{baseUrl}}`, `{{correlationId}}`, `{{internalApiKey}}` variables; environments hold placeholders only; tokens obtained at run time.
- **MANDATORY:** Tests assert the standard envelope, status and catalog `code`.
- **Generic baseline (provisional):** Run with the Postman CLI in a pipeline stage against the test stack (not currently wired).

_Source of truth: `TEST-03`, `API-07`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Export updated collection with the PR; document the run in `TEST-SETUP.md`.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Postman test script**

```js
pm.test("envelope", () => { const b = pm.response.json(); pm.expect(b.success).to.eql(true); pm.expect(b.metadata.correlationId).to.be.a("string"); });
```

## Error and failure handling
- Failed assertion fails the run.
- Tests must fail loudly: no swallowed assertions, no `--passWithNoTests` as a quality gate.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Test fixtures contain no real secrets or personal data; stub environment variables in setup files (TEST-01).

## Testing guidelines
- Positive/negative per request.
- Follow the target repository's runner and layout (TEST-01); do not introduce a second test framework.

## Anti-patterns
- Real secrets in environment files.

## Implementation checklist
- [ ] Variables; assertions; docs.

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
- Collections reference `{{baseUrl}}`, `{{correlationId}}`, `{{internalApiKey}}` variables; environments hold placeholders only; tokens obtained at run time.
- Tests assert the standard envelope, status and catalog `code`.

## Related skills
- `api-contract-testing` — API Contract Testing
- `end-to-end-testing` — End-to-End Testing
- `api-testing` — API Testing
- `test-data-management` — Test Data Management
- `swagger-openapi` — Swagger / OpenAPI
