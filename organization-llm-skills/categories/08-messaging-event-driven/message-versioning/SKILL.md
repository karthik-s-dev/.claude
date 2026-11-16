---
name: message-versioning
description: Use when message contracts must evolve with producers and consumers deployed independently. Neither reference repository versions messages (no schema version field); this is a generic baseline requiring approval before a convention is introduced.
---

# Message Versioning

> ⚠ **GENERIC BASELINE (evidence E0).** No organizational implementation of this concern exists in the reference repositories. Everything marked GENERIC is a provisional recommendation pending architectural approval and is **not** an organizational standard. The skill still inherits the standards listed in *Related skills* (logging, errors, configuration, security).

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `message-versioning` |
| Category | 08 — Messaging & Event-Driven Architecture |
| Scope | Message schema evolution. |
| Applicability | Service Bus/queue/webhook. |
| Evidence | E0 — no organizational evidence (generic baseline) |
| Classification | GENERIC (no organizational evidence) |
| Governing standards | `MSG-04`, `API-08` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `message-structure-contracts`, `api-versioning`, `event-driven-architecture`, `breaking-change-review` |

## Purpose
Backward compatible evolution.

## When to use
- Changing a payload shape.

## Organizational standards
- **Generic baseline (provisional):** Additive-only changes within a version; add a `schemaVersion` (integer) field only when a breaking change is unavoidable and consumers are known; support N and N-1 during migration; use distinct topics/types for incompatible versions.
- **Verified convention (practice):** wire-name conversion at the last step and rejection of deprecated type values act as the de-facto compatibility tools.
- **MANDATORY:** Obtain architectural approval before introducing `schemaVersion` or versioned topics.

_Source of truth: `MSG-04`, `API-08`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Prefer additive change; document; test old-shape messages (including those already in outbox rows).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Optional version field (GENERIC)**

```json
{ "schemaVersion": 2, "usageEventId": "idem:req-1:llmInputTokens", "clientId": "..." }
```

## Error and failure handling
- Unknown version -> dead-letter with reason.
- A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing.

## Testing guidelines
- Old-shape and new-shape consumers.
- Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths.

## Anti-patterns
- Silent semantic change.

## Implementation checklist
- [ ] Additive; approval.

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
- Obtain architectural approval before introducing `schemaVersion` or versioned topics.

## Related skills
- `message-structure-contracts` — Message Structure & Contracts
- `api-versioning` — API Versioning
- `event-driven-architecture` — Event-Driven Architecture
- `breaking-change-review` — Breaking Change Review
