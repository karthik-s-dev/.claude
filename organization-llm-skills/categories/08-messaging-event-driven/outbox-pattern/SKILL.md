---
name: outbox-pattern
description: Use when a side effect (publish, notify) must not be lost if the process crashes or the broker/downstream is down - persist the intent first, deliver from a background worker with attempts, TTL and terminal failure.
---

# Outbox Pattern

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `outbox-pattern` |
| Category | 08 — Messaging & Event-Driven Architecture |
| Scope | Durable asynchronous delivery. |
| Applicability | Mongo + Service Bus/HTTP. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (MSG-03) |
| Governing standards | `MSG-03`, `DB-04`, `CFG-06`, `RES-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `message-producer`, `azure-service-bus-client`, `message-retry-strategy`, `background-worker-processing`, `event-publishing`, `database-indexing` |

## Purpose
No lost business-critical side effects.

## When to use
- Publishing usage events.
- Notifying another service of a change that must not be missed.

## Organizational standards
- **MANDATORY:** Insert the outbox row (`payload`, `status:"pending"`, `attempts:0`, `createdAt`) **before** attempting delivery; delivery by a worker polls `{status:"pending"}` sorted by `createdAt`, batch size from env, `running` flag prevents overlap, per-item try/catch.
- **MANDATORY:** Success -> `published` + `publishedAt`; failure -> increment `attempts`, store `lastError`, `failed` after max attempts; TTL index removes old rows.
- **MANDATORY:** Enabled/worker flags `USAGE_EVENT_OUTBOX_ENABLED`, `..._WORKER_ENABLED`; poll/batch/max/TTL env; fallback to direct send only when disabled.
- **MANDATORY:** Apply to **every** business-critical async side effect (reference gap: webhook fan-out is fire-and-forget).
- **Generic baseline (provisional):** Claim rows atomically (`processing` state) before sending when more than one replica runs workers; add `nextAttemptAt`.

_Source of truth: `MSG-03`, `DB-04`, `CFG-06`, `RES-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Repository (`enqueue/fetchPending/markPublished/markFailed/ensureIndexes`) + worker + start/stop in bootstrap.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Enqueue then deliver**

```ts
await coll.insertOne({ payload, status: "pending", attempts: 0, createdAt: new Date() });
// worker
const entries = await coll.find({ status: "pending" }).sort({ createdAt: 1 }).limit(batch).toArray();
for (const e of entries) { try { await publishDirect(e.payload); await markPublished(e._id); } catch (err) { await markFailed(e._id, String(err), (e.attempts ?? 0) + 1); } }
```

## Error and failure handling
- Outbox insert failure is a hard failure of the operation (503) unless fail-open approved.
- A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Payload may include PII - TTL and access control.
- Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing.

## Testing guidelines
- Row-before-send; retry; max attempts; TTL; worker overlap guard.
- Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths.

## Anti-patterns
- Publishing then writing the row.
- Unbounded retries.

## Implementation checklist
- [ ] Row first; worker; attempts; TTL; indexes.

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
- Insert the outbox row (`payload`, `status:"pending"`, `attempts:0`, `createdAt`) **before** attempting delivery; delivery by a worker polls `{status:"pending"}` sorted by `createdAt`, batch size from env, `running` flag prevents overlap, per-item try/catch.
- Success -> `published` + `publishedAt`; failure -> increment `attempts`, store `lastError`, `failed` after max attempts; TTL index removes old rows.
- Enabled/worker flags `USAGE_EVENT_OUTBOX_ENABLED`, `..._WORKER_ENABLED`; poll/batch/max/TTL env; fallback to direct send only when disabled.
- Apply to **every** business-critical async side effect (reference gap: webhook fan-out is fire-and-forget).

## Related skills
- `message-producer` — Message Producer
- `azure-service-bus-client` — Azure Service Bus Client
- `message-retry-strategy` — Message Retry Strategy
- `background-worker-processing` — Background Worker Processing
- `event-publishing` — Event Publishing
- `database-indexing` — Database Indexing
