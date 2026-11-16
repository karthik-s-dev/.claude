---
name: usage-event-identity
description: Use when emitting metered, audit or domain events that downstream services must count exactly once - building deterministic event IDs (entity, metric, discriminator, derived events) with local deterministic helpers and using them as message IDs and unique-index keys.
---

# Usage / Metered Event Identity

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `usage-event-identity` |
| Category | 03 — Request Context & Idempotency |
| Scope | Event identity for effect-level deduplication. |
| Applicability | Services producing events consumed by other services; implemented as small local helpers. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (CTX-04) |
| Governing standards | `CTX-04`, `MSG-01`, `MSG-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `idempotency-management`, `message-deduplication`, `message-idempotency`, `azure-service-bus-client`, `event-publishing`, `request-deduplication` |

## Purpose
A replayed or retried publish of the same fact yields the same ID so consumers dedupe.

## When to use
- Publishing usage/metering/audit events.
- Adding a derived event (for example credits derived from tokens).

## Organizational standards
- **MANDATORY:** Every published event carries `usageEventId` (or equivalent) set **before** publishing; callers that know the entity set it; otherwise derive deterministically (`withUsageEventId`).
- **MANDATORY:** Implement the ID helpers once in the service (pattern from the reference): `buildEventId({ entityType, entityId, metricKey, discriminator? })` -> `idem:<requestId>:<metric>`; `derivedEventId(parentId, "aiCredits")` -> `<parent>:d:aiCredits`; a deterministic fallback (messageId/jobId/idempotencyKey/requestId, else a hash of the full identity) for legacy events.
- **MANDATORY:** A bare entity ID is not unique (one request can emit several metrics); always include the metric key and, where an entity can repeat a metric, a stable discriminator.
- **MANDATORY:** Use the ID as the broker `messageId` (enables duplicate detection) and as the consumers' unique-index key within `{productLine, clientId}`.
- **Verified convention:** Producer carries `idempotencyKey`, `correlationId`, `subscriptionId`, `enforcementStatus` ("recorded"/"skipped") and `failOpenReason` for audit.

_Source of truth: `CTX-04`, `MSG-01`, `MSG-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Choose entityType (`idem`, `job`, ...) and entityId from the request.
2. Build the ID; attach it to the payload and `messageId`.
3. Derive IDs for secondary events from the parent ID.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**IDs**

```ts
const id = buildEventId({ entityType: "idem", entityId: idempotencyKey, metricKey: "llmInputTokens" });
const credits = derivedEventId(id, "aiCredits");
await sender.sendMessages({ body: payload, messageId: id, applicationProperties: { correlationId } });
```

## Error and failure handling
- Missing identity inputs -> fall back to the deterministic hash; never publish without an ID.
- Context helpers never throw when context is missing; they return a documented fallback (`unknown`) and the request continues (CTX-01).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Treat inbound identifiers as untrusted input: validate charset/length; never let body or query override context (CTX-01).

## Testing guidelines
- Same inputs -> same ID; different metric/discriminator -> different ID; derived ID stable; replay yields identical message ID.
- Test with and without inbound identifiers, with malformed values, across async boundaries (ALS), and on outbound calls/messages.

## Anti-patterns
- Random UUID per publish attempt.
- Timestamps in IDs.
- Entity-only IDs.

## Implementation checklist
- [ ] Set before publish; local deterministic helpers; unique-index agreement with consumer.

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
- Every published event carries `usageEventId` (or equivalent) set **before** publishing; callers that know the entity set it; otherwise derive deterministically (`withUsageEventId`).
- Implement the ID helpers once in the service (pattern from the reference): `buildEventId({ entityType, entityId, metricKey, discriminator? })` -> `idem:<requestId>:<metric>`; `derivedEventId(parentId, "aiCredits")` -> `<parent>:d:aiCredits`; a deterministic fallback (messageId/jobId/idempotencyKey/requestId, else a hash of the full identity) for legacy events.
- A bare entity ID is not unique (one request can emit several metrics); always include the metric key and, where an entity can repeat a metric, a stable discriminator.
- Use the ID as the broker `messageId` (enables duplicate detection) and as the consumers' unique-index key within `{productLine, clientId}`.

## Related skills
- `idempotency-management` — Idempotency Management
- `message-deduplication` — Message Deduplication
- `message-idempotency` — Message Idempotency
- `azure-service-bus-client` — Azure Service Bus Client
- `event-publishing` — Event Publishing
- `request-deduplication` — Request Deduplication
