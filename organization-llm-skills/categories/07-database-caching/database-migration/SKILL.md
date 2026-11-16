---
name: database-migration
description: Use when changing the shape of data that other services or versions read. Applies the guarded migration sequence (dual-write, backfill, verify, fallback-read, drop-at-zero) behind a feature flag. No migration framework exists.
---

# Database Migration

> ⚠ **PARTIAL / DEFECTIVE EVIDENCE (E3).** The reference implementation is isolated, declared-only, inert or has known defects. Use the pattern's *contract* only; do not copy the defects documented below.

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `database-migration` |
| Category | 07 — Database & Caching Management |
| Scope | Data shape migrations. |
| Applicability | MongoDB services. |
| Evidence | E3 — isolated / declared-only / defective |
| Classification | VERIFIED pattern (guarded kit, partial) / GENERIC framework |
| Governing standards | `DB-07`, `CFG-06`, `API-08` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `feature-flag-management`, `mongodb-client`, `api-versioning`, `rollback-strategy`, `production-readiness-review` |

## Purpose
Cut over data models without outages.

## When to use
- Renaming/moving fields or collections used by multiple consumers.

## Organizational standards
- **Verified convention (reference service A, partial):** scripts in `src/scripts/migration/{backfill,verify,fallbackRead}.ts` (+ README), gated by `FEATURE_DUAL_READ` (default off), `legacyAccessMiddleware` to measure old-path usage. `dualWrite.ts` is referenced but missing and `verify.ts` uses `JSON.stringify` equality with a TODO - defects; do not copy them.
- **MANDATORY:** Sequence: dual-write -> backfill -> verify -> fallback-read -> drop only when legacy access is zero; each step reversible; flag default off.
- **MANDATORY:** Write consumers tolerate both shapes during the migration window; queued messages written in the old shape must still publish correctly (`toWirePayload` at last step).
- **Generic baseline (provisional):** Idempotent, re-runnable scripts with dry-run, batch size, and progress logging.

_Source of truth: `DB-07`, `CFG-06`, `API-08`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Plan in an ADR; implement scripts with dry-run; measure legacy access; remove after zero.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Plan skeleton**

```text
1 deploy dual-write (flag off) 2 enable flag 3 backfill 4 verify (deep equality) 5 switch reads with fallback 6 monitor legacy=0 7 remove old path
```

## Error and failure handling
- A failed verify stops the sequence.
- Optional dependencies (cache) fail open to the source of truth; correctness-critical stores surface errors (DB-02, INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask connection URIs in logs (`maskConnectionUri`); credentials from environment only; scope every query by tenant identity where data is multi-tenant.

## Testing guidelines
- Run scripts against a copy; verify counts and sample equality.
- Use the repository's in-memory/test-double pattern (TEST-02); cover connection failure, timeout, duplicate-key and empty-result paths.

## Anti-patterns
- One-shot irreversible updates.
- Verifying with string equality of unordered JSON.

## Implementation checklist
- [ ] Reversible; flagged; verified; monitored.

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
- Sequence: dual-write -> backfill -> verify -> fallback-read -> drop only when legacy access is zero; each step reversible; flag default off.
- Write consumers tolerate both shapes during the migration window; queued messages written in the old shape must still publish correctly (`toWirePayload` at last step).

## Related skills
- `feature-flag-management` — Feature Flag Management
- `mongodb-client` — MongoDB Client
- `api-versioning` — API Versioning
- `rollback-strategy` — Rollback Strategy
- `production-readiness-review` — Production Readiness Review
