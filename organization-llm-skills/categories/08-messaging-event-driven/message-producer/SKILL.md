---
name: message-producer
description: Use when writing code that sends messages or jobs - typed payload, identity set before send, correlation attached, durable outbox vs direct send, failure visibility to the caller, wire-shape conversion.
---

# Message Producer

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `message-producer` |
| Category | 08 — Messaging & Event-Driven Architecture |
| Scope | Producer-side contract and failure behaviour. |
| Applicability | Service Bus topics and Storage queues. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (MSG-01, MSG-03, CTX-04) |
| Governing standards | `MSG-01`, `MSG-02`, `MSG-03`, `MSG-04`, `CTX-04`, `CTX-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `azure-service-bus-client`, `azure-queue-storage-client`, `outbox-pattern`, `message-structure-contracts`, `usage-event-identity`, `event-publishing` |

## Purpose
Every message is identifiable, traceable and never silently lost.

## When to use
- Adding a publish.

## Organizational standards
- **MANDATORY:** Build a typed payload; set the deterministic message ID and `correlationId` before publish; convert to wire shape last.
- **MANDATORY:** Prefer **outbox then publish** (row first); direct send only when the outbox is disabled by configuration.
- **MANDATORY:** The producing API reports publication failure (`207` + `auditPublished:false`) - the caller can reconcile.
- **MANDATORY:** Fail-open answers publish with `enforcementStatus: "skipped"` and `failOpenReason` so consumers know the live check did not run.

_Source of truth: `MSG-01`, `MSG-02`, `MSG-03`, `MSG-04`, `CTX-04`, `CTX-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Implement `publishX(input)` that normalizes -> ID -> outbox/direct -> returns status.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Producer facade (reference pattern)**

```ts
export async function publishUsageEvent(input: UsageEventPayload): Promise<void> {
  const payload = withUsageEventId(input);
  if (config.usageOutbox.enabled) { await enqueueUsageEventOutbox(payload); return; }
  await publishUsageEventDirect(payload);   // throws -> caller returns 207
}
```

## Error and failure handling
- Explicit; see outbox.
- A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing.

## Testing guidelines
- Outbox on/off; failure surfaces; ID stable on retry.
- Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths.

## Anti-patterns
- Fire-and-forget publish without catch.

## Implementation checklist
- [ ] ID, correlation, outbox, failure visibility.

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
- Build a typed payload; set the deterministic message ID and `correlationId` before publish; convert to wire shape last.
- Prefer **outbox then publish** (row first); direct send only when the outbox is disabled by configuration.
- The producing API reports publication failure (`207` + `auditPublished:false`) - the caller can reconcile.
- Fail-open answers publish with `enforcementStatus: "skipped"` and `failOpenReason` so consumers know the live check did not run.

## Related skills
- `azure-service-bus-client` — Azure Service Bus Client
- `azure-queue-storage-client` — Azure Queue Storage Client
- `outbox-pattern` — Outbox Pattern
- `message-structure-contracts` — Message Structure & Contracts
- `usage-event-identity` — Usage / Metered Event Identity
- `event-publishing` — Event Publishing
