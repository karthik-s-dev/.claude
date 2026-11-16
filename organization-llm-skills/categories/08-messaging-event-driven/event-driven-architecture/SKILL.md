---
name: event-driven-architecture
description: Use when designing flows across services using events, queues and webhooks instead of synchronous calls - choose channel, durability, idempotency, ordering expectations and failure policy using the organization's evidenced building blocks.
---

# Event-Driven Architecture

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `event-driven-architecture` |
| Category | 08 — Messaging & Event-Driven Architecture |
| Scope | Asynchronous architecture decisions. |
| Applicability | Azure Service Bus, Storage Queues, webhooks, HTTP notifications. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (ARCH-07, MSG-01, MSG-03, MSG-05) partial |
| Governing standards | `ARCH-07`, `MSG-01`, `MSG-03`, `MSG-05`, `CTX-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `event-publishing`, `event-consumption`, `outbox-pattern`, `service-boundary-responsibility`, `webhook-delivery`, `message-idempotency` |

## Purpose
Consistent event-driven designs.

## When to use
- A service must tell others something changed or happened.

## Organizational standards
- **Verified convention building blocks:** Service Bus topic per product (usage facts to ingestion), Storage Queues for background jobs (notification, threshold alert, webhook delivery), HTTP change notification with internal key, outbound signed webhooks to subscribers, Mongo outbox for durability, deterministic event IDs for dedupe, reconciler job comparing counters to facts.
- **MANDATORY:** Choose: topic for facts with many consumers; queue for work items; HTTP/webhook for direct notification; always with durability (outbox) and dedupe (event ID) and correlation propagation.
- **MANDATORY:** Document producer, consumers, contract, failure policy and replay procedure.
- **Generic baseline (provisional):** Ordering is not guaranteed; design for out-of-order.

_Source of truth: `ARCH-07`, `MSG-01`, `MSG-03`, `MSG-05`, `CTX-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Write a one-page flow note; implement producer/consumer skills; add reconciliation for counters.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Flow note**

```text
fact -> outbox -> topic usage-<product> -> ingestion (unique index on usageEventId) ; reconciler compares Redis counters to stored facts daily
```

## Error and failure handling
- Replay from outbox/DLQ per runbook.
- A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing.

## Testing guidelines
- End-to-end with in-memory doubles (`in-memory-test-harness`).
- Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths.

## Anti-patterns
- Synchronous cascades for non-critical work.
- Events without IDs.

## Implementation checklist
- [ ] Channel; durability; dedupe; docs.

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
- Choose: topic for facts with many consumers; queue for work items; HTTP/webhook for direct notification; always with durability (outbox) and dedupe (event ID) and correlation propagation.
- Document producer, consumers, contract, failure policy and replay procedure.

## Related skills
- `event-publishing` — Event Publishing
- `event-consumption` — Event Consumption
- `outbox-pattern` — Outbox Pattern
- `service-boundary-responsibility` — Service Boundary & Responsibility
- `webhook-delivery` — Webhook Delivery (Outbound)
- `message-idempotency` — Message Idempotency
