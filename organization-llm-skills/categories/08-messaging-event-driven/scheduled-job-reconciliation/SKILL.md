---
name: scheduled-job-reconciliation
description: Use when a job must run on a schedule once across replicas - UTC run window with grace hours, single-run lock, per-day done marker, dry-run, tolerance and maximum-correction guards, and configurable thresholds.
---

# Scheduled Job & Reconciliation

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `scheduled-job-reconciliation` |
| Category | 08 — Messaging & Event-Driven Architecture |
| Scope | Scheduled single-run jobs. |
| Applicability | Node services with Redis. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (DB-06, MSG-07) single repo |
| Governing standards | `DB-06`, `MSG-07`, `CFG-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `distributed-locking`, `background-worker-processing`, `event-driven-architecture`, `feature-flag-management`, `operational-runbooks` |

## Purpose
Safe periodic correction jobs.

## When to use
- Daily/hourly maintenance or reconciliation.

## Organizational standards
- **MANDATORY:** A 60 s tick decides `shouldRunNow(now, runAtUtc "HH:MM", graceHours)` (missed run during restart still runs inside the grace window); skip if `reconcile:done:<UTC date>` exists; acquire `SET reconcile:lock <host:pid> EX <secs> NX`; set done marker with TTL after success.
- **MANDATORY:** Corrections are guarded: `dryRun`, tolerance (`tolerancePct`, `toleranceAbs`), `maxCorrectionPct`, `maxRechecks`, `recheckIntervalMin`, `ingestLagMin` - all env-configurable with safe defaults (dry-run on until approved).
- **MANDATORY:** `stopCounterReconciler()` awaited on shutdown.

_Source of truth: `DB-06`, `MSG-07`, `CFG-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Implement as worker + pure `runReconciliation(deps, options)` with injected deps for tests.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Window check (reference)**

```ts
export function shouldRunNow(now: Date, runAtUtc: string, graceHours: number): boolean {
  const m = /^(\d{1,2}):(\d{2})$/.exec(runAtUtc.trim()); if (!m) return false;
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), Number(m[1]), Number(m[2]));
  return now.getTime() >= start && now.getTime() < start + graceHours * 3600_000;
}
```

## Error and failure handling
- Failures release/skip; next tick may retry within grace; logs summary.
- A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing.

## Testing guidelines
- Window boundaries; lock contention; dry-run; tolerance.
- Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths.

## Anti-patterns
- cron-in-process without lock.
- Auto-correcting without caps.

## Implementation checklist
- [ ] Window; lock; done marker; guards; tests.

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
- A 60 s tick decides `shouldRunNow(now, runAtUtc "HH:MM", graceHours)` (missed run during restart still runs inside the grace window); skip if `reconcile:done:<UTC date>` exists; acquire `SET reconcile:lock <host:pid> EX <secs> NX`; set done marker with TTL after success.
- Corrections are guarded: `dryRun`, tolerance (`tolerancePct`, `toleranceAbs`), `maxCorrectionPct`, `maxRechecks`, `recheckIntervalMin`, `ingestLagMin` - all env-configurable with safe defaults (dry-run on until approved).
- `stopCounterReconciler()` awaited on shutdown.

## Related skills
- `distributed-locking` — Distributed Locking
- `background-worker-processing` — Background Worker Processing
- `event-driven-architecture` — Event-Driven Architecture
- `feature-flag-management` — Feature Flag Management
- `operational-runbooks` — Operational Runbooks
