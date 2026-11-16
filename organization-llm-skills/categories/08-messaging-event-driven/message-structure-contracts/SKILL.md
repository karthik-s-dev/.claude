---
name: message-structure-contracts
description: Use when defining or changing message/job payloads - typed interface, identity and correlation fields, ISO timestamps, wire vs internal names, canonical type values, JSON Schema documentation, deprecation of enum values.
---

# Message Structure & Contracts

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `message-structure-contracts` |
| Category | 08 — Messaging & Event-Driven Architecture |
| Scope | Message shape and documentation. |
| Applicability | Service Bus/queue/webhook payloads. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (MSG-04) |
| Governing standards | `MSG-04`, `CTX-04`, `CTX-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `message-versioning`, `event-publishing`, `message-producer`, `api-contract-testing`, `contract-testing` |

## Purpose
Producers and consumers share an explicit, testable contract.

## When to use
- Adding/changing a field or type.

## Organizational standards
- **MANDATORY:** A typed interface per message with required identity (`usageEventId`, tenant/client ID, `appId`), metric/type key, numeric `value`, `ts` (ISO-8601), `correlationId`; optional context fields documented.
- **MANDATORY:** Wire names are the contract; internal renames are converted at the last step (`toWirePayload`: `tenantId -> clientId`) so queued rows older than the change still publish correctly.
- **MANDATORY:** Canonical enum/type strings (`USAGE-ALERT`) are constants; deprecated values are rejected with an `error` log naming the replacement.
- **Verified convention:** Input JSON Schemas under `docs/*.json`; payload field docs in `docs/`.
- **MANDATORY:** Do not include PII beyond what the consumer needs.

_Source of truth: `MSG-04`, `CTX-04`, `CTX-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Update interface, mapper, schema file, docs and contract tests together.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Interface (reference-style)**

```ts
export interface UsageEventPayload {
  productLine: string; tenantId: string; appId: string; metricKey: string; value: number; ts: string;
  usageEventId?: string; correlationId?: string; idempotencyKey?: string; enforcementStatus?: "recorded" | "skipped"; failOpenReason?: string;
}
```

## Error and failure handling
- Invalid inbound messages -> `dead-letter-queue-handling`.
- A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing.

## Testing guidelines
- Schema validation tests; round-trip serialization.
- Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths.

## Anti-patterns
- Reusing a field with new meaning.
- Unversioned breaking change.

## Implementation checklist
- [ ] Typed; documented; compatible.

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
- A typed interface per message with required identity (`usageEventId`, tenant/client ID, `appId`), metric/type key, numeric `value`, `ts` (ISO-8601), `correlationId`; optional context fields documented.
- Wire names are the contract; internal renames are converted at the last step (`toWirePayload`: `tenantId -> clientId`) so queued rows older than the change still publish correctly.
- Canonical enum/type strings (`USAGE-ALERT`) are constants; deprecated values are rejected with an `error` log naming the replacement.
- Do not include PII beyond what the consumer needs.

## Related skills
- `message-versioning` — Message Versioning
- `event-publishing` — Event Publishing
- `message-producer` — Message Producer
- `api-contract-testing` — API Contract Testing
- `contract-testing` — Contract Testing (Non-API Contracts)
