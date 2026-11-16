---
name: inbox-pattern
description: Use when a consumer must persist processed message IDs to guarantee exactly-once effects across restarts. Not implemented in the reference repositories (consumers are in other services); generic baseline.
---

# Inbox Pattern

> ⚠ **GENERIC BASELINE (evidence E0).** No organizational implementation of this concern exists in the reference repositories. Everything marked GENERIC is a provisional recommendation pending architectural approval and is **not** an organizational standard. The skill still inherits the standards listed in *Related skills* (logging, errors, configuration, security).

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `inbox-pattern` |
| Category | 08 — Messaging & Event-Driven Architecture |
| Scope | Consumer inbox table. |
| Applicability | Mongo/relational. |
| Evidence | E0 — no organizational evidence (generic baseline) |
| Classification | GENERIC (no organizational evidence) |
| Governing standards | `MSG-06` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `message-idempotency`, `message-consumer`, `event-consumption`, `database-indexing` |

## Purpose
Durable dedupe of consumed messages.

## When to use
- Consuming broker events with side effects.

## Organizational standards
- **Generic baseline (provisional):** `inbox` collection with unique index on `{ source, messageId }`, `status`, `processedAt`, TTL >= max redelivery window; insert-then-process (duplicate key => skip) or process-in-transaction where supported.
- **MANDATORY:** Reuse deterministic event IDs as `messageId`.
- **MANDATORY:** Approval before adding a new collection for this purpose in shared stores.

_Source of truth: `MSG-06`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Insert first; on duplicate key return; process; mark done.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**GENERIC**

```ts
try { await inbox.insertOne({ _id: messageId, receivedAt: new Date() }); } catch (e) { if (isDuplicateKey(e)) return; throw e; }
```

## Error and failure handling
- Failure after insert before effect: use status `processing` + lease to resume.
- A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing.

## Testing guidelines
- Duplicate and crash-resume.
- Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths.

## Anti-patterns
- In-memory dedupe.

## Implementation checklist
- [ ] Unique; TTL; approval.

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
- Reuse deterministic event IDs as `messageId`.
- Approval before adding a new collection for this purpose in shared stores.

## Related skills
- `message-idempotency` — Message Idempotency
- `message-consumer` — Message Consumer
- `event-consumption` — Event Consumption
- `database-indexing` — Database Indexing
