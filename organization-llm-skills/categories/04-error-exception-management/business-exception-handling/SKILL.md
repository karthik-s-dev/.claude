---
name: business-exception-handling
description: Use when a valid request violates a business rule or resource state (not found, conflict, quota exceeded, inactive subscription, forbidden for tenant). Models these as catalogued 4xx errors with actionable safe details.
---

# Business Exception Handling

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `business-exception-handling` |
| Category | 04 — Error & Exception Management |
| Scope | Expected domain failures. |
| Applicability | Any service. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (ERR-02) + defects noted |
| Governing standards | `ERR-02`, `API-10` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `error-catalog-management`, `http-status-codes`, `exception-handling`, `api-error-response` |

## Purpose
Callers can act on business failures; they are never reported as 500.

## When to use
- Implementing domain rules.
- Reviewing 500s that are really caller-fixable.

## Organizational standards
- **MANDATORY:** Business errors have their own catalog entries with 4xx statuses (404 absent, 403 not allowed, 409 conflict, 412 version conflict, **429 quota exceeded** with `Retry-After` hint in `details`).
- **MANDATORY:** Include only safe, actionable `details` (`[{ field, reason }]` or identifiers the caller already supplied).
- **Verified convention:** Subscription inactive vs not found are different entries; "quota exceeded" is returned as a business error, while record-only mode records and does not block (policy in config, `fail-open-fail-closed-policy`).
- **MANDATORY (prohibition):** map business conditions to 500 (reference defect: `BOT_INFO_NOT_FOUND`, `RUNTIME_FIELD_MISSING` -> 500).

_Source of truth: `ERR-02`, `API-10`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Name entries for the rule, not the code location (`USAGE_LIMIT_EXCEEDED`).
2. Throw in the service where the rule is evaluated.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Quota exceeded**

```ts
if (used + delta > limit) throw appErr(EC.USAGE_LIMIT_EXCEEDED, [{ field: "retryAfter", reason: String(secondsUntilReset) }]);
```

## Error and failure handling
- Business error logging is `warn` (expected), not `error`.
- Catch only where you can add context or translate; otherwise let the error propagate to the global handler (ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- `AppError.details` is public; internal causes live only on `Error.cause` and in logs (ERR-07).

## Testing guidelines
- Rule boundary tests (at limit, above, zero limit, unlimited).
- Assert code, numericCode, HTTP status and envelope for each catalog entry touched; assert that unknown errors become `UNHANDLED_ERROR` with no leaked detail.

## Anti-patterns
- Throwing `Error` for rule violations.
- Returning 200 with `allowed:false` where the contract requires an error (follow the contract).

## Implementation checklist
- [ ] 4xx; catalogued; safe details; warn-level log.

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
- Business errors have their own catalog entries with 4xx statuses (404 absent, 403 not allowed, 409 conflict, 412 version conflict, **429 quota exceeded** with `Retry-After` hint in `details`).
- Include only safe, actionable `details` (`[{ field, reason }]` or identifiers the caller already supplied).
- MUST NOT: map business conditions to 500 (reference defect: `BOT_INFO_NOT_FOUND`, `RUNTIME_FIELD_MISSING` -> 500).

## Related skills
- `error-catalog-management` — Error Catalog Management
- `http-status-codes` — HTTP Status Codes
- `exception-handling` — Exception Handling
- `api-error-response` — API Error Response
