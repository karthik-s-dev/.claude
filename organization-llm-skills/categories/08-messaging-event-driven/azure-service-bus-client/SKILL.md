---
name: azure-service-bus-client
description: Use when publishing to Azure Service Bus topics with @azure/service-bus - singleton ServiceBusClient, cached sender per topic, topic naming, messageId for duplicate detection, application properties, mandatory-vs-optional broker, health and close.
---

# Azure Service Bus Client

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `azure-service-bus-client` |
| Category | 08 — Messaging & Event-Driven Architecture |
| Scope | Service Bus publisher client (producer side). |
| Applicability | Node.js `@azure/service-bus` 7. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (MSG-01) single repo; auth C-13 |
| Governing standards | `MSG-01`, `CTX-04`, `MSG-03`, `INT-06`, `CFG-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `message-producer`, `event-publishing`, `usage-event-identity`, `outbox-pattern`, `azure-sdk-client-management`, `azure-service-connection-management` |

## Purpose
Durable event publication with duplicate protection.

## When to use
- Publishing events/audit/usage facts.
- Broker outage handling.

## Organizational standards
- **MANDATORY:** `ServiceBusClient(connectionString)` created lazily from `SERVICE_BUS_CONNECTION_STRING`; **one `ServiceBusSender` per topic** cached in a `Map`; topic from `SERVICE_BUS_TOPIC_*` overrides or `<SERVICE_BUS_TOPIC_PREFIX><slug>` (`usage-` default), slug lower-case `[a-z0-9-]`.
- **MANDATORY:** Message = `{ body, messageId: <deterministic id>, applicationProperties: { productLine, clientId, appId, capability, correlationId? } }`; body converted to the **wire** shape at the last step (`toWirePayload`).
- **MANDATORY:** Publish through the outbox when enabled (`outbox-pattern`); direct send only when disabled; failure is never silent (`api-response-structure` 207 + `auditPublished:false`).
- **MANDATORY:** `isServiceBusConfigured()`; `SERVICE_BUS_MANDATORY` decides whether absence/outage is fatal at startup/readiness (`checkServiceBusHealth` creates a sender to prove credentials).
- **MANDATORY:** `closeServiceBus()` closes senders then the client during shutdown.
- **DECIDED (C-13, approved 2026-11-16):** Approved: plan migration of messaging to Managed Identity; connection strings stay until adapters are approved. _Earlier note (superseded where it conflicts):_ connection-string auth; Managed Identity not implemented. Consuming (receivers/sessions) is not implemented in either repo (E0) - see `message-consumer`.

_Source of truth: `MSG-01`, `CTX-04`, `MSG-03`, `INT-06`, `CFG-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Reuse the module; add a typed payload interface; add `messageId`; test with the Service Bus double.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Send (reference)**

```ts
const sender = await getSenderForTopic(topic);
await sender.sendMessages({
  body: toWirePayload(payload),
  messageId: payload.usageEventId,
  applicationProperties: { productLine: payload.productLine, clientId: payload.tenantId, correlationId: payload.correlationId },
});
```

## Error and failure handling
- Send failure -> outbox row stays `pending` and retries; in direct mode log `error` and throw so the caller reports `207`.
- A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Connection string in env only; never log message bodies with PII.
- Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing.

## Testing guidelines
- `__setPublishUsageEventForTests`-style override or in-memory Service Bus double; assert messageId, properties and failure path.
- Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths.

## Anti-patterns
- Creating a sender per message.
- Random message IDs.
- Dropping events when sender missing.

## Implementation checklist
- [ ] Sender cache; messageId; outbox; health; close.

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
- `ServiceBusClient(connectionString)` created lazily from `SERVICE_BUS_CONNECTION_STRING`; **one `ServiceBusSender` per topic** cached in a `Map`; topic from `SERVICE_BUS_TOPIC_*` overrides or `<SERVICE_BUS_TOPIC_PREFIX><slug>` (`usage-` default), slug lower-case `[a-z0-9-]`.
- Message = `{ body, messageId: <deterministic id>, applicationProperties: { productLine, clientId, appId, capability, correlationId? } }`; body converted to the **wire** shape at the last step (`toWirePayload`).
- Publish through the outbox when enabled (`outbox-pattern`); direct send only when disabled; failure is never silent (`api-response-structure` 207 + `auditPublished:false`).
- `isServiceBusConfigured()`; `SERVICE_BUS_MANDATORY` decides whether absence/outage is fatal at startup/readiness (`checkServiceBusHealth` creates a sender to prove credentials).
- `closeServiceBus()` closes senders then the client during shutdown.

## Related skills
- `message-producer` — Message Producer
- `event-publishing` — Event Publishing
- `usage-event-identity` — Usage / Metered Event Identity
- `outbox-pattern` — Outbox Pattern
- `azure-sdk-client-management` — Azure SDK Client Management
- `azure-service-connection-management` — Azure Service Connection Management
