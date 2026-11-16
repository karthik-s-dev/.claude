---
name: contract-testing
description: Use when testing contracts that are not HTTP API responses - message/job payload schemas, webhook payloads, shared package interfaces. For API contracts use api-contract-testing; this skill only adds message and webhook contract guidance.
---

# Contract Testing (Non-API Contracts)

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `contract-testing` |
| Category | 13 — Testing & Quality Engineering |
| Scope | Message, webhook and package contracts. |
| Applicability | JSON Schema, TypeScript types. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (TEST-03, MSG-04); canonical API contract skill is `api-contract-testing` |
| Governing standards | `TEST-03`, `MSG-04`, `API-07` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `api-contract-testing`, `message-structure-contracts`, `swagger-openapi`, `postman-functional-testing` |

## Purpose
Producers and consumers stay compatible.

## When to use
- Changing a payload or shared package API.

## Organizational standards
- **MANDATORY:** HTTP/API contract tests live in `api-contract-testing` (do not duplicate).
- **Verified convention:** Payload contract artifacts: JSON Schema files under `docs/`, typed interfaces, dedicated mapper tests (wire conversion, event-ID derivation) and enum-constant tests.
- **MANDATORY:** Test old-shape payloads still processed (outbox rows written before a change).

_Source of truth: `TEST-03`, `MSG-04`, `API-07`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Validate sample payloads against the schema; test mappers and enum constants.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Wire mapper**

```ts
expect(toWirePayload({ ...event, tenantId: "C1" })).toMatchObject({ clientId: "C1" });
expect(toWirePayload(event)).not.toHaveProperty("tenantId");
```

## Error and failure handling
- Contract drift fails CI.
- Tests must fail loudly: no swallowed assertions, no `--passWithNoTests` as a quality gate.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Test fixtures contain no real secrets or personal data; stub environment variables in setup files (TEST-01).

## Testing guidelines
- Round trip; old shapes.
- Follow the target repository's runner and layout (TEST-01); do not introduce a second test framework.

## Anti-patterns
- Untested wire renames.

## Implementation checklist
- [ ] Schemas; mappers; enums.

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
- HTTP/API contract tests live in `api-contract-testing` (do not duplicate).
- Test old-shape payloads still processed (outbox rows written before a change).

## Related skills
- `api-contract-testing` — API Contract Testing
- `message-structure-contracts` — Message Structure & Contracts
- `swagger-openapi` — Swagger / OpenAPI
- `postman-functional-testing` — Postman Functional Testing
