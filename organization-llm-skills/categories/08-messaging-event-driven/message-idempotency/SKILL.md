---
name: message-idempotency
description: Use when a consumer or webhook handler may process the same message more than once - make the effect idempotent with a deterministic key, atomic claim and result recording.
---

# Message Idempotency

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `message-idempotency` |
| Category | 08 — Messaging & Event-Driven Architecture |
| Scope | Consumer-side idempotent effects. |
| Applicability | Workers/webhooks. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (CTX-03, CTX-04) + GENERIC |
| Governing standards | `CTX-03`, `CTX-04`, `MSG-06` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `idempotency-management`, `message-deduplication`, `message-consumer`, `inbox-pattern`, `usage-event-identity` |

## Purpose
At-least-once delivery yields exactly-once effects.

## When to use
- Writing handlers.

## Organizational standards
- **MANDATORY:** The effect is keyed by an immutable event/message ID; use unique index/atomic set-if-absent; treat "already processed" as success.
- **Verified convention:** Domain dedupe helpers (`threshold-dedup`, `webhook-idempotency`, `fact-dedupe`) are table-tested.
- **MANDATORY:** Request-level HTTP idempotency uses `idempotency-management`, not this skill.

_Source of truth: `CTX-03`, `CTX-04`, `MSG-06`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Choose key; implement claim; record outcome.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Atomic claim**

```ts
const claimed = await redis.set("msg:" + eventId, "1", "EX", ttl, "NX");
if (claimed !== "OK") return; // already handled
```

## Error and failure handling
- Claim store unavailable -> retry later (do not process blind) unless fail-open approved.
- A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing.

## Testing guidelines
- Duplicate delivery.
- Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths.

## Anti-patterns
- Non-atomic check-then-set.

## Implementation checklist
- [ ] Atomic; TTL >= replay window.

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
- The effect is keyed by an immutable event/message ID; use unique index/atomic set-if-absent; treat "already processed" as success.
- Request-level HTTP idempotency uses `idempotency-management`, not this skill.

## Related skills
- `idempotency-management` — Idempotency Management
- `message-deduplication` — Message Deduplication
- `message-consumer` — Message Consumer
- `inbox-pattern` — Inbox Pattern
- `usage-event-identity` — Usage / Metered Event Identity
