---
name: message-consumer
description: Use when writing a consumer or worker that receives queue/topic messages - poll loop, batch limits, validation, correlation rebind, acknowledge-after-success, poison handling, attempt tracking. Queue consumers are evidenced; Service Bus consumers are a generic baseline.
---

# Message Consumer

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `message-consumer` |
| Category | 08 — Messaging & Event-Driven Architecture |
| Scope | Consumer-side processing. |
| Applicability | Storage queue workers (evidenced); Service Bus receivers (generic). |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (queue consumers MSG-02) / GENERIC (Service Bus) |
| Governing standards | `MSG-02`, `MSG-07`, `MSG-06`, `CTX-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `azure-queue-storage-client`, `background-worker-processing`, `message-idempotency`, `inbox-pattern`, `dead-letter-queue-handling`, `event-consumption` |

## Purpose
At-least-once processing without loops or loss.

## When to use
- Adding a consumer.

## Organizational standards
- **MANDATORY:** Worker loop per `background-worker-processing`; batch <= 32 for Storage queues; each message processed in its own try/catch.
- **MANDATORY:** Rebind correlation from the message payload (`runWithCorrelationId`) before processing; log with it.
- **MANDATORY:** Validate type and shape; invalid -> warn and delete; valid -> process -> acknowledge (delete) **after** success; failures leave the message to reappear or are re-enqueued with `attempt+1` up to `MAX_ATTEMPTS`.
- **MANDATORY:** Consumers are idempotent (`message-idempotency`).
- **Generic baseline (provisional) (Service Bus):** use `peekLock`, `completeMessage` after success, `abandonMessage` on transient failure, `deadLetterMessage` with reason on poison; broker MaxDeliveryCount configured in IaC.

_Source of truth: `MSG-02`, `MSG-07`, `MSG-06`, `CTX-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Implement receive -> validate -> dedupe -> process -> ack.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Worker body (reference pattern)**

```ts
for (const { messageId, popReceipt, job } of await receiveJobs(batchSize)) {
  await runWithCorrelationId(job.correlationId ?? randomUUID(), async () => {
    try { await handle(job); await deleteJob(messageId, popReceipt); }
    catch (err) { logger.warn({ messageId, attempt: job.attempt, err: serializeError(err) }, "Job failed; will retry"); }
  });
}
```

## Error and failure handling
- Poison handling per `dead-letter-queue-handling`.
- A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing.

## Testing guidelines
- Success, handler throws, malformed, duplicate delivery.
- Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths.

## Anti-patterns
- Ack-before-process.
- Infinite redelivery.

## Implementation checklist
- [ ] Ack timing; idempotent; poison path.

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
- Worker loop per `background-worker-processing`; batch <= 32 for Storage queues; each message processed in its own try/catch.
- Rebind correlation from the message payload (`runWithCorrelationId`) before processing; log with it.
- Validate type and shape; invalid -> warn and delete; valid -> process -> acknowledge (delete) **after** success; failures leave the message to reappear or are re-enqueued with `attempt+1` up to `MAX_ATTEMPTS`.
- Consumers are idempotent (`message-idempotency`).

## Related skills
- `azure-queue-storage-client` — Azure Queue Storage Client
- `background-worker-processing` — Background Worker Processing
- `message-idempotency` — Message Idempotency
- `inbox-pattern` — Inbox Pattern
- `dead-letter-queue-handling` — Dead Letter Queue Handling
- `event-consumption` — Event Consumption
