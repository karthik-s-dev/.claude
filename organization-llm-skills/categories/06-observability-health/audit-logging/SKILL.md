---
name: audit-logging
description: Use when a service mutates data that needs an attributable change history - record action, target, before/after (masked), route, actor and correlation, non-blocking and never throwing, with TTL retention and indexes.
---

# Audit Logging

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `audit-logging` |
| Category | 06 — Observability & Health Management |
| Scope | Audit trail for mutations and enforcement decisions. |
| Applicability | Services with Mongo. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (OBS-07); actor gap |
| Governing standards | `OBS-07`, `OBS-03`, `DB-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `sensitive-data-masking-in-logs`, `database-indexing`, `structured-logging`, `mongodb-client`, `security-review` |

## Purpose
Investigate who changed what and when without blocking the operation.

## When to use
- Adding a mutating endpoint or admin operation.
- Recording enforcement/limit decisions.

## Organizational standards
- **MANDATORY:** `recordAuditEntry({ action, targetType, targetId, before, after, route, actor })` called with `void` after the mutation committed; it catches and logs its own errors (never throws) and masks `before/after` with `MASK_CONFIG`.
- **MANDATORY:** `actor` is the verified principal (token `azp/appid/sub` or `job:<id>`/`webhook:<id>`); an always-`undefined` actor (reference defect) is not acceptable in new code.
- **MANDATORY:** Audit collection has a TTL index (`AUDIT_LOG_TTL_DAYS`) and query indexes created by an `ensureAuditIndexes()` at startup.
- **Verified convention:** Enforcement audit repository stores each check/record decision with correlation ID.

_Source of truth: `OBS-07`, `OBS-03`, `DB-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add the call after the successful write; pass the correlation ID; add indexes.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Non-blocking audit call**

```ts
void recordAuditEntry({ action: "UPDATE_CONFIG", targetType: "botConfig", targetId: botId, before, after, route: req.route?.path, actor: req.principal?.id });
```

## Error and failure handling
- Audit failure logs `warn` and does not fail the request.
- Observability code must never throw into the request path; failures degrade to no-op with a warning (OBS-05).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask before persisting; restrict read access to the audit collection.
- Mask sensitive fields with the shared mask configuration before logging or exporting telemetry (OBS-03); never log request bodies on the error path.

## Testing guidelines
- Entry written with masked fields; failure does not propagate.
- Mock `@inextlabs/logger` per the shared test-double pattern (TEST-02) and assert level, message and structured fields; assert no secret/PII values are emitted.

## Anti-patterns
- Awaiting audit inside the transaction path.
- Storing raw secrets.
- Missing actor.

## Implementation checklist
- [ ] Masked; non-blocking; actor; TTL; indexes.

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
- `recordAuditEntry({ action, targetType, targetId, before, after, route, actor })` called with `void` after the mutation committed; it catches and logs its own errors (never throws) and masks `before/after` with `MASK_CONFIG`.
- `actor` is the verified principal (token `azp/appid/sub` or `job:<id>`/`webhook:<id>`); an always-`undefined` actor (reference defect) is not acceptable in new code.
- Audit collection has a TTL index (`AUDIT_LOG_TTL_DAYS`) and query indexes created by an `ensureAuditIndexes()` at startup.

## Related skills
- `sensitive-data-masking-in-logs` — Sensitive Data Masking in Logs
- `database-indexing` — Database Indexing
- `structured-logging` — Structured Logging
- `mongodb-client` — MongoDB Client
- `security-review` — Security Review
