---
name: response-serialization
description: Use when serializing responses - JSON dates, numbers, BigInt/ObjectId, circular structures, non-enumerable markers and content type. Keeps serialization explicit, safe and consistent.
---

# Response Serialization

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `response-serialization` |
| Category | 02 — API Development & Design |
| Scope | How response objects become JSON. |
| Applicability | Node/Express JSON APIs. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (API-02) / GENERIC details |
| Governing standards | `API-02`, `OBS-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `response-dto-mapping`, `api-response-structure`, `sensitive-data-masking-in-logs` |

## Purpose
Predictable JSON output and no accidental leakage of internal markers or types.

## When to use
- Returning dates, ObjectIds, Maps/Sets or large numbers.
- Adding internal markers to responses.

## Organizational standards
- **Verified convention:** Timestamps are ISO-8601 strings (`new Date().toISOString()`).
- **Verified convention:** Internal response markers are attached as **non-enumerable symbols** (`markFailOpen`) so JSON never carries them while the route layer can read them.
- **Verified convention:** Telemetry/audit serialization uses a circular-safe, truncating stringify (`safeStringify`, max 4096 chars) and mask before export.
- **Generic baseline (provisional):** Convert `ObjectId` to string, `Map/Set` to arrays in DTO mappers (not at `res.json`).

_Source of truth: `API-02`, `OBS-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Convert special types in mappers.
2. Use `res.json` (Express sets `application/json`); do not hand-write `JSON.stringify` responses.
3. For internal markers use `Object.defineProperty(obj, SYMBOL, { enumerable: false, value: true })`.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Non-enumerable marker**

```ts
const FAIL_OPEN = Symbol.for("svc.failOpen");
export const markFailOpen = <T extends object>(r: T): T => (Object.defineProperty(r, FAIL_OPEN, { value: true, enumerable: false }), r);
```

## Error and failure handling
- Serialization errors (circular) are programming errors -> `UNHANDLED_ERROR`; avoid by mapping.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- JSON round trip has no marker; dates ISO; ObjectIds strings.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- Serializing Mongoose docs.
- Using `toJSON` side effects.

## Implementation checklist
- [ ] Types converted; markers hidden; ISO dates.

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


## Related skills
- `response-dto-mapping` — Response DTO Mapping
- `api-response-structure` — API Response Structure
- `sensitive-data-masking-in-logs` — Sensitive Data Masking in Logs
