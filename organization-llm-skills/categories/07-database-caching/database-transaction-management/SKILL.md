---
name: database-transaction-management
description: Use when an operation must update several documents atomically. The reference repositories use no multi-document transactions (single-document atomic operations, idempotent steps and an outbox instead). This is a generic baseline requiring approval before transactions are introduced.
---

# Database Transaction Management

> ⚠ **GENERIC BASELINE (evidence E0).** No organizational implementation of this concern exists in the reference repositories. Everything marked GENERIC is a provisional recommendation pending architectural approval and is **not** an organizational standard. The skill still inherits the standards listed in *Related skills* (logging, errors, configuration, security).

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `database-transaction-management` |
| Category | 07 — Database & Caching Management |
| Scope | Atomicity across documents. |
| Applicability | MongoDB 4.0+ replica sets / Cosmos DB API for Mongo. |
| Evidence | E0 — no organizational evidence (generic baseline) |
| Classification | GENERIC (no organizational evidence) |
| Governing standards | `DB-07`, `MSG-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `outbox-pattern`, `idempotency-management`, `mongodb-client`, `database-repository-pattern` |

## Purpose
Prevent partial writes without inventing new patterns.

## When to use
- Asked to make a multi-document write atomic.

## Organizational standards
- **Generic baseline (provisional):** Prefer, in order: (1) a single-document atomic update (`$inc`, `findOneAndUpdate` with expected state) - as used for counters and idempotency claims; (2) idempotent steps + outbox (`outbox-pattern`); (3) multi-document transactions only after checking that the target Mongo/Cosmos tier supports them and obtaining approval.
- **Verified convention:** Atomic Redis operations (`SET NX`, Lua compare-and-swap/compare-and-delete) are the organization's atomic-claim idiom.
- **MANDATORY:** Do not wrap long-running I/O (HTTP, broker) inside a transaction.

_Source of truth: `DB-07`, `MSG-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Document why (1) and (2) are insufficient before proposing (3).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Single-document claim (VERIFIED idiom)**

```text
findOneAndUpdate({ _id, status: "pending" }, { $set: { status: "processing", owner } })
```

## Error and failure handling
- A transaction failure maps to `technical-exception-handling`; the whole unit is retried idempotently.
- Optional dependencies (cache) fail open to the source of truth; correctness-critical stores surface errors (DB-02, INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask connection URIs in logs (`maskConnectionUri`); credentials from environment only; scope every query by tenant identity where data is multi-tenant.

## Testing guidelines
- Failure injection between steps.
- Use the repository's in-memory/test-double pattern (TEST-02); cover connection failure, timeout, duplicate-key and empty-result paths.

## Anti-patterns
- Two-phase writes without idempotency.

## Implementation checklist
- [ ] Approval; alternatives considered.

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
- Do not wrap long-running I/O (HTTP, broker) inside a transaction.

## Related skills
- `outbox-pattern` — Outbox Pattern
- `idempotency-management` — Idempotency Management
- `mongodb-client` — MongoDB Client
- `database-repository-pattern` — Database Repository Pattern
