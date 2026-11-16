---
name: dead-letter-queue-handling
description: Use when a message can never be processed or exceeds retries. No Service Bus dead-letter code exists in the reference repositories; evidenced analogues are the outbox `failed` status (kept for TTL) and deleting malformed queue messages. This is a generic baseline.
---

# Dead Letter Queue Handling

> ⚠ **GENERIC BASELINE (evidence E0).** No organizational implementation of this concern exists in the reference repositories. Everything marked GENERIC is a provisional recommendation pending architectural approval and is **not** an organizational standard. The skill still inherits the standards listed in *Related skills* (logging, errors, configuration, security).

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `dead-letter-queue-handling` |
| Category | 08 — Messaging & Event-Driven Architecture |
| Scope | Poison message handling. |
| Applicability | Service Bus (dead-letter sub-queue), Storage queue (poison queue). |
| Evidence | E0 — no organizational evidence (generic baseline) |
| Classification | GENERIC (no organizational evidence); terminal-state analogues |
| Governing standards | `MSG-03`, `MSG-06` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `message-retry-strategy`, `message-consumer`, `azure-queue-storage-client`, `operational-runbooks`, `alerting-standards` |

## Purpose
Poison messages do not block or loop and remain diagnosable.

## When to use
- Designing a consumer.

## Organizational standards
- **Verified convention analogue:** outbox `status: "failed"` + `lastError` retained until TTL; malformed Storage-queue messages are logged and deleted.
- **Generic baseline (provisional):** Prefer **retaining** unprocessable business messages (Service Bus `deadLetterMessage(reason, description)` or a `<queue>-poison` queue) over deleting; record reason, attempts, correlation ID; alert on depth > 0; provide a replay runbook.
- **MANDATORY:** Deletion is acceptable only for structurally invalid messages that cannot be repaired (log with `messageId`).

_Source of truth: `MSG-03`, `MSG-06`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Decide per message class; document in the runbook.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Dead-letter reason format (GENERIC)**

```text
reason=VALIDATION_FAILED; attempts=5; correlationId=...; lastError=...
```

## Error and failure handling
- Poison handling must not throw.
- A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing.

## Testing guidelines
- Poison message ends in DLQ with reason.
- Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths.

## Anti-patterns
- Infinite redelivery.
- Silent deletion of valid-looking business messages.

## Implementation checklist
- [ ] Retained; reason; alert; replay procedure.

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
- Deletion is acceptable only for structurally invalid messages that cannot be repaired (log with `messageId`).

## Related skills
- `message-retry-strategy` — Message Retry Strategy
- `message-consumer` — Message Consumer
- `azure-queue-storage-client` — Azure Queue Storage Client
- `operational-runbooks` — Operational Runbooks
- `alerting-standards` — Alerting Standards
