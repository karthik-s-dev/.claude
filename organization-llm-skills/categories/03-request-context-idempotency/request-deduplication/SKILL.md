---
name: request-deduplication
description: Use when duplicate requests or deliveries (client retries, webhook redelivery, at-least-once queues, replays) must not repeat side effects, and the operation is not covered by an Idempotency-Key header - threshold alert de-duplication, webhook delivery dedupe, fact-level event IDs.
---

# Request Deduplication

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `request-deduplication` |
| Category | 03 — Request Context & Idempotency |
| Scope | Duplicate detection outside the idempotency-key mechanism. |
| Applicability | Services with webhooks/queues/derived events. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (CTX-03, CTX-04, MSG-05) |
| Governing standards | `CTX-03`, `CTX-04`, `MSG-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `idempotency-management`, `message-deduplication`, `usage-event-identity`, `webhook-delivery`, `outbox-pattern` |

## Purpose
Pick the right dedupe layer and key.

## When to use
- Handling webhooks or queue messages.
- Emitting derived events (alerts, notifications).

## Organizational standards
- **MANDATORY:** Choose the layer: request-level (`idempotency-management`), message-level (`message-deduplication`), effect-level deterministic IDs (`usage-event-identity`). Effect-level dedupe is mandatory for durable events.
- **Verified convention:** Domain dedupe helpers exist and are unit-tested (`threshold-dedup`, `webhook-idempotency`, `fact-dedupe`); they derive keys from stable business identity (tenant, product, metric, period, threshold) and store with TTL.
- **Verified convention:** Inbound webhook (reference) uses the provider event ID with an upsert-by-event-ID record where available; the reference marks this as latent in one service (documented gap).
- **Generic baseline (provisional):** Retain dedupe records at least as long as the sender's maximum retry/replay window.

_Source of truth: `CTX-03`, `CTX-04`, `MSG-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Define the dedupe key from immutable business identity, not timestamps.
2. Use an atomic set-if-absent (`SET NX EX`) or unique index insert.
3. Treat "already seen" as success (idempotent response), not an error.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Threshold alert dedupe key (pattern)**

```ts
const key = ["alert", clientId, productLine, metricKey, periodKey, threshold].join(":");
const first = await redis.set(key, "1", "EX", ttlSeconds, "NX");
if (first !== "OK") return { skipped: true };
```

## Error and failure handling
- If the dedupe store is unavailable decide per effect: skipping risks a missed alert; sending risks a duplicate - document the choice (`fail-open-fail-closed-policy`).
- Context helpers never throw when context is missing; they return a documented fallback (`unknown`) and the request continues (CTX-01).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Treat inbound identifiers as untrusted input: validate charset/length; never let body or query override context (CTX-01).

## Testing guidelines
- First vs duplicate; TTL expiry; concurrent duplicates.
- Test with and without inbound identifiers, with malformed values, across async boundaries (ALS), and on outbound calls/messages.

## Anti-patterns
- Time-based keys.
- Raising errors on duplicates.

## Implementation checklist
- [ ] Stable identity key; atomic store; TTL; outage policy documented.

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
- Choose the layer: request-level (`idempotency-management`), message-level (`message-deduplication`), effect-level deterministic IDs (`usage-event-identity`). Effect-level dedupe is mandatory for durable events.

## Related skills
- `idempotency-management` — Idempotency Management
- `message-deduplication` — Message Deduplication
- `usage-event-identity` — Usage / Metered Event Identity
- `webhook-delivery` — Webhook Delivery (Outbound)
- `outbox-pattern` — Outbox Pattern
