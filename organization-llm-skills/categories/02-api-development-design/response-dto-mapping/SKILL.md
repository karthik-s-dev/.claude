---
name: response-dto-mapping
description: Use when shaping data returned to clients from persistence documents or upstream payloads. Ensures explicit response DTOs, no leakage of internal fields (keys, endpoints, connection strings, internal ids) and consistent field naming.
---

# Response DTO Mapping

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `response-dto-mapping` |
| Category | 02 — API Development & Design |
| Scope | Mapping domain/persistence data to response payloads. |
| Applicability | TypeScript services. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (API-02), GENERIC naming |
| Governing standards | `API-02`, `ARCH-02`, `OBS-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `api-response-structure`, `request-dto-mapping`, `response-serialization`, `sensitive-data-masking-in-logs` |

## Purpose
Prevents exposing storage shape and secrets; keeps the API stable when persistence changes.

## When to use
- Returning documents from Mongo/Mongoose.
- Adding fields to a response.

## Organizational standards
- **MANDATORY:** Return mapped DTOs, never raw documents; strip `_id`/`__v` and internal fields unless part of the contract.
- **MANDATORY:** Fields named `key`, `endpoint`, `connectionString`, tokens or secrets are never returned except by explicitly authorized internal endpoints, and are masked in logs (OBS-03).
- **Verified convention:** Normalizers convert upstream payloads into internal entries before use (adapter) and entitlements are typed as boolean features or numeric limits.
- **Generic baseline (provisional):** Prefer `lean()` projections and explicit selected fields.

_Source of truth: `API-02`, `ARCH-02`, `OBS-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Write `toXResponse(doc)` returning only contract fields.
2. Apply it before `sendSuccess`.
3. Add a contract test (`api-contract-testing`).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Mapper**

```ts
export const toBotConfigResponse = (d: BotConfigDoc) => ({ botId: d.botId, clientId: d.clientId, enabled: d.enabled, updatedAt: d.updatedAt.toISOString() });
```

## Error and failure handling
- Missing optional fields yield omitted keys, not `null` surprises, unless the contract says otherwise.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- Assert absence of internal fields.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- `res.json(doc)`.
- Serializing Mongoose documents directly.

## Implementation checklist
- [ ] DTO mapper used; no secrets; contract test.

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
- Return mapped DTOs, never raw documents; strip `_id`/`__v` and internal fields unless part of the contract.
- Fields named `key`, `endpoint`, `connectionString`, tokens or secrets are never returned except by explicitly authorized internal endpoints, and are masked in logs (OBS-03).

## Related skills
- `api-response-structure` — API Response Structure
- `request-dto-mapping` — Request DTO Mapping
- `response-serialization` — Response Serialization
- `sensitive-data-masking-in-logs` — Sensitive Data Masking in Logs
