---
name: message-retry-strategy
description: Use when deciding how failed publishes or jobs are retried - attempt counters, max attempts, backoff via nextAttemptAt, terminal failed state, per-batch isolation and configuration.
---

# Message Retry Strategy

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `message-retry-strategy` |
| Category | 08 — Messaging & Event-Driven Architecture |
| Scope | Retry behaviour of outbox and queue workers. |
| Applicability | Mongo outbox, Storage queue jobs. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (MSG-03) / defects |
| Governing standards | `MSG-03`, `RES-03`, `CFG-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `outbox-pattern`, `retry-policy`, `exponential-backoff`, `dead-letter-queue-handling`, `background-worker-processing` |

## Purpose
Bounded, observable retries.

## When to use
- Adding an outbox/job.

## Organizational standards
- **MANDATORY:** Persist `attempts`, `lastError` and (for backoff) `nextAttemptAt`; `status` transitions `pending -> published|failed`; after `MAX_ATTEMPTS` (env, e.g. `USAGE_EVENT_OUTBOX_MAX_ATTEMPTS`, `WEBHOOK_DELIVERY_MAX_ATTEMPTS`; reference outbox constant 8) set `failed` and alert.
- **Verified convention:** One reference outbox uses **linear** delay `min(60 s * attempts, 15 min)` with `nextAttemptAt` and a 30 s sweep; the other reference outbox has no delay (re-polled each tick) - defect: add `nextAttemptAt` backoff in new code.
- **MANDATORY:** Retry is idempotent downstream (deterministic IDs).
- **Generic baseline (provisional):** Add jitter to backoff (not present in the reference).

_Source of truth: `MSG-03`, `RES-03`, `CFG-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add fields + index `{status, nextAttemptAt}`; claim rows atomically (`findOneAndUpdate` to `processing`) when multi-replica.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Backoff (reference)**

```ts
const backoffMs = Math.min(60_000 * attempts, 15 * 60_000);
await coll.updateOne({ _id }, { $set: { status: attempts >= MAX_ATTEMPTS ? "failed" : "pending", nextAttemptAt: new Date(Date.now() + backoffMs), lastError, attempts } });
```

## Error and failure handling
- Terminal `failed` rows are retained (TTL) and surfaced to operators.
- A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing.

## Testing guidelines
- Attempts increment; max -> failed; delay respected.
- Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths.

## Anti-patterns
- Hot retry loops.
- Unlimited attempts.

## Implementation checklist
- [ ] Counters; max; backoff; terminal state; alerting.

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
- Persist `attempts`, `lastError` and (for backoff) `nextAttemptAt`; `status` transitions `pending -> published|failed`; after `MAX_ATTEMPTS` (env, e.g. `USAGE_EVENT_OUTBOX_MAX_ATTEMPTS`, `WEBHOOK_DELIVERY_MAX_ATTEMPTS`; reference outbox constant 8) set `failed` and alert.
- Retry is idempotent downstream (deterministic IDs).

## Related skills
- `outbox-pattern` — Outbox Pattern
- `retry-policy` — Retry Policy
- `exponential-backoff` — Exponential Backoff
- `dead-letter-queue-handling` — Dead Letter Queue Handling
- `background-worker-processing` — Background Worker Processing
