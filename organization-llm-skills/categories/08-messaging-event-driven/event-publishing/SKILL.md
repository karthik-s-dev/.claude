---
name: event-publishing
description: Use when a service announces a domain fact (usage recorded, subscription changed, threshold crossed) for others to consume - event naming, payload contract, identity, durability, and the webhook or topic channel.
---

# Event Publishing

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `event-publishing` |
| Category | 08 — Messaging & Event-Driven Architecture |
| Scope | Publishing domain events. |
| Applicability | Service Bus topics, webhooks. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (MSG-01, MSG-03, MSG-04) |
| Governing standards | `MSG-01`, `MSG-03`, `MSG-04`, `CTX-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `message-producer`, `event-driven-architecture`, `message-structure-contracts`, `outbox-pattern`, `usage-event-identity` |

## Purpose
Facts are published once, identifiably and durably.

## When to use
- Adding an event.

## Organizational standards
- **MANDATORY:** Event = immutable fact with a stable ID (`usageEventId`), tenant identity, timestamp ISO-8601, correlation ID, and a type/capability; see `message-structure-contracts`.
- **MANDATORY:** Publish after the fact is durably recorded (outbox); never publish before commit.
- **Verified convention:** Channels: Service Bus topic per product/solution (`usage-<slug>`), HTTP change notification to specific consumers (`POST .../internal/subscription-changed` with internal key), outbound webhooks to subscribers (`webhook-delivery`).

_Source of truth: `MSG-01`, `MSG-03`, `MSG-04`, `CTX-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Define type; add to contract doc; publish via producer facade.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Event naming**

```text
usage.recorded | subscription.changed | usage.alert.threshold-crossed  (GENERIC naming; follow target contract docs)
```

## Error and failure handling
- See producer/outbox.
- A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing.

## Testing guidelines
- Contract tests for payload.
- Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths.

## Anti-patterns
- Publishing commands as events.
- Mutable events.

## Implementation checklist
- [ ] ID, durability, contract.

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
- Event = immutable fact with a stable ID (`usageEventId`), tenant identity, timestamp ISO-8601, correlation ID, and a type/capability; see `message-structure-contracts`.
- Publish after the fact is durably recorded (outbox); never publish before commit.

## Related skills
- `message-producer` — Message Producer
- `event-driven-architecture` — Event-Driven Architecture
- `message-structure-contracts` — Message Structure & Contracts
- `outbox-pattern` — Outbox Pattern
- `usage-event-identity` — Usage / Metered Event Identity
