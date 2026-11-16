---
name: azure-queue-storage-client
description: Use when producing or consuming Azure Queue Storage messages with @azure/storage-queue - QueueClient from connection string, base64 JSON bodies, receive batch limits, delete-after-success, poison/invalid message handling, queue provisioning and readiness.
---

# Azure Queue Storage Client

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `azure-queue-storage-client` |
| Category | 08 — Messaging & Event-Driven Architecture |
| Scope | Azure Queue Storage usage (separate from Service Bus). |
| Applicability | Node.js `@azure/storage-queue` 12. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (MSG-02) single repo; auth C-13 |
| Governing standards | `MSG-02`, `INT-06`, `CFG-01`, `ERR-09` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `message-consumer`, `message-producer`, `background-worker-processing`, `azure-sdk-client-management`, `message-structure-contracts`, `dead-letter-queue-handling` |

## Purpose
Reliable background job queues with explicit acknowledgement.

## When to use
- Adding a queue-backed job or worker.
- Handling malformed queue messages.

## Organizational standards
- **MANDATORY:** One lazy `QueueClient(connectionString, queueName)` per queue; connection string from `AZURE_QUEUE_STORAGE_CONNECTION_STRING`, queue names from env (`AZURE_QUEUE_NOTIFICATIONS_NAME`, `AZURE_QUEUE_THRESHOLD_JOBS_NAME`, `AZURE_QUEUE_WEBHOOK_DELIVERY_NAME`); the getter returns `null`/no-op when unconfigured.
- **MANDATORY:** Body = **base64(JSON)** with a canonical `notificationType` (`USAGE-ALERT`) validated on receive; unsupported/legacy types are rejected loudly (error log) and deleted.
- **MANDATORY:** `receiveMessages({ numberOfMessages: min(requested, 32) })`; process; then `deleteMessage(messageId, popReceipt)` only **after** success; return `{ messageId, popReceipt, job }` to the worker.
- **MANDATORY:** Malformed JSON/unknown type -> warn, count (`droppedInvalidNotificationTypeCount`), **delete** (it can never succeed). Transient processing failure -> do not delete (visibility timeout redelivers) and track attempts in the job (`attempt`) up to max.
- **MANDATORY:** Enqueue failures return `false`/throw per caller contract and are logged with identifiers; never silently drop.
- **Verified convention:** Queue existence ensured at startup (IaC/startup) and a `markReady` flag asserted before use (warn if used earlier).
- **DECIDED (C-13, approved 2026-11-16):** Approved: plan migration of messaging to Managed Identity; connection strings stay until adapters are approved. _Earlier note (superseded where it conflicts):_ Connection-string auth; Managed Identity (`QueueClient` with `DefaultAzureCredential`) is not implemented - adapter pending approval.

_Source of truth: `MSG-02`, `INT-06`, `CFG-01`, `ERR-09`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Create the module `<name>-job-queue.ts` with `enqueue`, `receive`, `delete` functions; add worker (`background-worker-processing`).
2. Add max-attempt and dead-letter-like handling (`dead-letter-queue-handling`).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Enqueue and receive (reference)**

```ts
await client.sendMessage(Buffer.from(JSON.stringify(job)).toString("base64"));
const res = await client.receiveMessages({ numberOfMessages: Math.min(max, 32) });
for (const m of res.receivedMessageItems) {
  const job = JSON.parse(Buffer.from(m.messageText, "base64").toString("utf8"));
  // validate type -> process -> deleteMessage(m.messageId, m.popReceipt)
}
```

## Error and failure handling
- Receive/enqueue exceptions logged with queue name; worker loop continues.
- A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Connection string is a secret; message bodies may hold PII - do not log them.
- Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing.

## Testing guidelines
- In-memory queue double; malformed, unsupported type, delete-after-success, redelivery.
- Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths.

## Anti-patterns
- Deleting before processing.
- Unbounded retry via requeue.
- Logging bodies.

## Implementation checklist
- [ ] Base64 JSON; type gate; delete semantics; env; readiness.

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
- One lazy `QueueClient(connectionString, queueName)` per queue; connection string from `AZURE_QUEUE_STORAGE_CONNECTION_STRING`, queue names from env (`AZURE_QUEUE_NOTIFICATIONS_NAME`, `AZURE_QUEUE_THRESHOLD_JOBS_NAME`, `AZURE_QUEUE_WEBHOOK_DELIVERY_NAME`); the getter returns `null`/no-op when unconfigured.
- Body = **base64(JSON)** with a canonical `notificationType` (`USAGE-ALERT`) validated on receive; unsupported/legacy types are rejected loudly (error log) and deleted.
- `receiveMessages({ numberOfMessages: min(requested, 32) })`; process; then `deleteMessage(messageId, popReceipt)` only **after** success; return `{ messageId, popReceipt, job }` to the worker.
- Malformed JSON/unknown type -> warn, count (`droppedInvalidNotificationTypeCount`), **delete** (it can never succeed). Transient processing failure -> do not delete (visibility timeout redelivers) and track attempts in the job (`attempt`) up to max.
- Enqueue failures return `false`/throw per caller contract and are logged with identifiers; never silently drop.

## Related skills
- `message-consumer` — Message Consumer
- `message-producer` — Message Producer
- `background-worker-processing` — Background Worker Processing
- `azure-sdk-client-management` — Azure SDK Client Management
- `message-structure-contracts` — Message Structure & Contracts
- `dead-letter-queue-handling` — Dead Letter Queue Handling
