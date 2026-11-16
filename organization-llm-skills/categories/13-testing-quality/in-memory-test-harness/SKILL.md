---
name: in-memory-test-harness
description: Use when tests need Redis/Mongo/Service Bus behaviour without infrastructure - build or reuse in-memory doubles implementing the used subset (SET NX EX, GET, EVAL CAS, HASH counters; collection find/insert/update; sender capture) and install them through the production modules' test hooks.
---

# In-Memory Test Harness

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `in-memory-test-harness` |
| Category | 13 — Testing & Quality Engineering |
| Scope | Doubles and hooks. |
| Applicability | Vitest/Jest. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (TEST-02) single repo |
| Governing standards | `TEST-02`, `ARCH-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `mocking-test-doubles`, `database-testing`, `message-processing-testing`, `integration-testing`, `dependency-injection` |

## Purpose
Realistic, fast tests of stateful behaviour.

## When to use
- Testing idempotency, counters, outbox, publish flows.

## Organizational standards
- **Verified convention:** `test-harness/mocks/{memory-redis,memory-mongo,memory-service-bus}`, a harness README listing the hooks (`__setRedisForTests`, `__setPublishUsageEventForTests`, `__setUsageDbForTests`) and a step runner for stepwise inspection.
- **MANDATORY:** Production code exposes hooks prefixed `__` only for tests; hooks accept `null` to restore; doubles implement only methods used and fail loudly on unsupported commands.
- **MANDATORY:** Doubles live under a `test-harness` folder with a README.

_Source of truth: `TEST-02`, `ARCH-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add the double method when a new command is used; add a test for the double itself where non-trivial.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Install and restore**

```ts
beforeEach(() => { __setRedisForTests(new MemoryRedis()); __setPublishUsageEventForTests(async (p) => { captured.push(p); }); });
afterEach(() => { __setRedisForTests(null); __setPublishUsageEventForTests(null); });
```

## Error and failure handling
- Unsupported command throws `Error("MemoryRedis: unsupported command X")`.
- Tests must fail loudly: no swallowed assertions, no `--passWithNoTests` as a quality gate.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Test fixtures contain no real secrets or personal data; stub environment variables in setup files (TEST-01).

## Testing guidelines
- Self-tests for NX/TTL/CAS.
- Follow the target repository's runner and layout (TEST-01); do not introduce a second test framework.

## Anti-patterns
- Doubles that silently accept anything.

## Implementation checklist
- [ ] Hooks; README; self-tests.

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
- Production code exposes hooks prefixed `__` only for tests; hooks accept `null` to restore; doubles implement only methods used and fail loudly on unsupported commands.
- Doubles live under a `test-harness` folder with a README.

## Related skills
- `mocking-test-doubles` — Mocking & Test Doubles
- `database-testing` — Database Testing
- `message-processing-testing` — Message Processing Testing
- `integration-testing` — Integration Testing
- `dependency-injection` — Dependency Injection
