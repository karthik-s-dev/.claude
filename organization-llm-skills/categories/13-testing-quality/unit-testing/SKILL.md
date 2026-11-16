---
name: unit-testing
description: Use when writing or reviewing unit tests - use the target repo's runner (Jest + ts-jest in `test/`, or Vitest with colocated *.test.ts), mock @inextlabs packages with the shared pattern, test controllers with mock req/res/next and services with fakes.
---

# Unit Testing

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `unit-testing` |
| Category | 13 — Testing & Quality Engineering |
| Scope | Unit tests. |
| Applicability | Jest 29 + ts-jest, Vitest 4. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | TECH (Jest vs Vitest, C-04) + VERIFIED conventions |
| Governing standards | `TEST-01`, `TEST-02`, `TEST-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `mocking-test-doubles`, `test-coverage-standards`, `in-memory-test-harness`, `integration-testing`, `test-data-management` |

## Purpose
Fast, deterministic tests that enforce standards.

## When to use
- Any code change.

## Organizational standards
- **MANDATORY:** Use the repo's existing runner/layout; never add a second runner (C-04). Jest repo: `roots:["<rootDir>/test"]`, `test/setup.ts` env stubs, `test/helpers/request.ts` (`mockReq/mockRes/mockNext`), `test/mocks/{logger,platform-errors}.ts`, `*.spec.ts` per controller; moduleNameMapper mirrors tsconfig aliases. Vitest repo: `src/**/*.test.ts`, `globals:true`, `testTimeout:30_000` (suites use `vi.resetModules()`), config in `vitest.config.mts`.
- **MANDATORY:** Mock the logger package: `jest.mock("@inextlabs/logger", () => ({ __esModule: true, default: mockLogger, serializeError: jest.fn(...), createMasker: jest.fn(() => (v) => v) }))` (or the Vitest equivalent).
- **MANDATORY:** Test environments set env via a setup file; never real secrets.
- **Verified convention:** Names `describe("<unit>")`/`it("<behaviour>")`; pure rule modules have table-driven tests (`plan-limits.test.ts`, `threshold-dedup.test.ts`).
- **MANDATORY:** Each catalog error touched has an assertion on `code`, `numericCode`, status.

_Source of truth: `TEST-01`, `TEST-02`, `TEST-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Arrange (stub env/clients), Act, Assert (envelope/logger/error); reset module state in `afterEach`.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Controller unit test (Jest style, reference pattern)**

```ts
it("forwards a catalogued error", async () => {
  mockService.getItem.mockRejectedValue(new AppError(404, "CLIENT_NOT_FOUND", "10200017", "Client not found"));
  const next = mockNext();
  await getItem(mockReq({ params: { itemId: "x" } }), mockRes(), next);
  expect(next).toHaveBeenCalledWith(expect.objectContaining({ code: "CLIENT_NOT_FOUND", statusCode: 404 }));
});
```

## Error and failure handling
- Tests assert failure paths as first-class.
- Tests must fail loudly: no swallowed assertions, no `--passWithNoTests` as a quality gate.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Test fixtures contain no real secrets or personal data; stub environment variables in setup files (TEST-01).

## Testing guidelines
- Positive, negative, edge, failure; no network/DB.
- Follow the target repository's runner and layout (TEST-01); do not introduce a second test framework.

## Anti-patterns
- Real network/DB in unit tests.
- Snapshot-everything.
- Shared mutable fixtures.

## Implementation checklist
- [ ] Runner matches; logger mocked; catalog assertions; resets.

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
- Use the repo's existing runner/layout; never add a second runner (C-04). Jest repo: `roots:["<rootDir>/test"]`, `test/setup.ts` env stubs, `test/helpers/request.ts` (`mockReq/mockRes/mockNext`), `test/mocks/{logger,platform-errors}.ts`, `*.spec.ts` per controller; moduleNameMapper mirrors tsconfig aliases. Vitest repo: `src/**/*.test.ts`, `globals:true`, `testTimeout:30_000` (suites use `vi.resetModules()`), config in `vitest.config.mts`.
- Mock the logger package: `jest.mock("@inextlabs/logger", () => ({ __esModule: true, default: mockLogger, serializeError: jest.fn(...), createMasker: jest.fn(() => (v) => v) }))` (or the Vitest equivalent).
- Test environments set env via a setup file; never real secrets.
- Each catalog error touched has an assertion on `code`, `numericCode`, status.

## Related skills
- `mocking-test-doubles` — Mocking & Test Doubles
- `test-coverage-standards` — Test Coverage Standards
- `in-memory-test-harness` — In-Memory Test Harness
- `integration-testing` — Integration Testing
- `test-data-management` — Test Data Management
