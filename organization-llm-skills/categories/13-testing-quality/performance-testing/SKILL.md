---
name: performance-testing
description: Use when verifying latency and throughput characteristics. The reference has NFR assertions (`v2-nfr.test.ts`) and an NFR review sheet but no performance tooling; generic baseline.
---

# Performance Testing

> ⚠ **GENERIC BASELINE (evidence E0).** No organizational implementation of this concern exists in the reference repositories. Everything marked GENERIC is a provisional recommendation pending architectural approval and is **not** an organizational standard. The skill still inherits the standards listed in *Related skills* (logging, errors, configuration, security).

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `performance-testing` |
| Category | 13 — Testing & Quality Engineering |
| Scope | Performance verification. |
| Applicability | Node. |
| Evidence | E0 — no organizational evidence (generic baseline) |
| Classification | GENERIC (closest evidence: NFR review CSV and v2-nfr.test.ts) |
| Governing standards | `TEST-05`, `RES-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `load-testing`, `performance-review`, `test-coverage-standards`, `metrics-collection` |

## Purpose
Detect regressions.

## When to use
- Hot paths, SLO changes.

## Organizational standards
- **Verified convention:** `src/v2-nfr.test.ts` and `docs/usage-enforcement-nfr-review.csv` capture NFR expectations (timeouts, fail-open behaviours).
- **Generic baseline (provisional):** Micro-benchmarks for pure functions; timing budgets in tests with generous thresholds; profile with `--prof`; compare p95 before/after.
- **MANDATORY:** Approval before introducing a perf tool (k6/autocannon) into repos.

_Source of truth: `TEST-05`, `RES-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Define budget; measure on representative data.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Budget (GENERIC)**

```text
check-and-record p95 < 150 ms at 200 rps with Redis healthy
```

## Error and failure handling
- N/A.
- Tests must fail loudly: no swallowed assertions, no `--passWithNoTests` as a quality gate.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Test fixtures contain no real secrets or personal data; stub environment variables in setup files (TEST-01).

## Testing guidelines
- Repeatable.
- Follow the target repository's runner and layout (TEST-01); do not introduce a second test framework.

## Anti-patterns
- One-off timings.

## Implementation checklist
- [ ] Budget; method.

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
- Approval before introducing a perf tool (k6/autocannon) into repos.

## Related skills
- `load-testing` — Load Testing
- `performance-review` — Performance Review
- `test-coverage-standards` — Test Coverage Standards
- `metrics-collection` — Metrics Collection
