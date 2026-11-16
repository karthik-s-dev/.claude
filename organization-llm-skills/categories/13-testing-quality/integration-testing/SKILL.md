---
name: integration-testing
description: Use when testing several modules together - route plus middleware plus handler with in-memory Redis/Mongo/Service Bus doubles, or supertest against the app. Uses *.integration.test.ts with its own runner config.
---

# Integration Testing

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `integration-testing` |
| Category | 13 — Testing & Quality Engineering |
| Scope | Multi-module tests without real infrastructure. |
| Applicability | Vitest `vitest.config.integration.mts` (`src/**/*.integration.test.ts`); Jest + supertest where used. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (TEST-01, TEST-02) Vitest repo |
| Governing standards | `TEST-01`, `TEST-02`, `DB-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `unit-testing`, `in-memory-test-harness`, `database-testing`, `message-processing-testing`, `end-to-end-testing` |

## Purpose
Verify wiring, middleware order, idempotency and error envelopes.

## When to use
- Changing routes, auth, validation, idempotency, publish flows.

## Organizational standards
- **Verified convention:** `npm run test:integration`; `*.integration.test.ts` files use in-memory doubles via `__set*ForTests`.
- **MANDATORY:** Assert end-to-end envelope and headers (`x-correlation-id`), idempotency behaviours and outbox/event capture.
- **Generic baseline (provisional):** `supertest` is installed in the Jest repo but unused - use it for route tests (auth/validation/middleware order).

_Source of truth: `TEST-01`, `TEST-02`, `DB-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Install doubles in `beforeEach`; build the app/router; call; assert.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Route test (supertest, GENERIC use)**

```ts
const res = await request(app).post("/api/v2/items").set("x-correlation-id", "test-123456").send({});
expect(res.status).toBe(400); expect(res.body.error.code).toBe("VALIDATION_FAILED"); expect(res.headers["x-correlation-id"]).toBe("test-123456");
```

## Error and failure handling
- Failure injection via doubles.
- Tests must fail loudly: no swallowed assertions, no `--passWithNoTests` as a quality gate.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Test fixtures contain no real secrets or personal data; stub environment variables in setup files (TEST-01).

## Testing guidelines
- Auth, validation, success, duplicates, dependency down.
- Follow the target repository's runner and layout (TEST-01); do not introduce a second test framework.

## Anti-patterns
- Hitting real Azure.

## Implementation checklist
- [ ] Doubles; envelope; config.

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
- Assert end-to-end envelope and headers (`x-correlation-id`), idempotency behaviours and outbox/event capture.

## Related skills
- `unit-testing` — Unit Testing
- `in-memory-test-harness` — In-Memory Test Harness
- `database-testing` — Database Testing
- `message-processing-testing` — Message Processing Testing
- `end-to-end-testing` — End-to-End Testing
