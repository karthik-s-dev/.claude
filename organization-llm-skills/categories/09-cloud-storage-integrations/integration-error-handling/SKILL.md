---
name: integration-error-handling
description: Use when handling failures from external systems - classify (absent, rejected, unavailable, timeout), map to catalog (502/503/504), choose fail-open or fail-closed, log with context and hints, and avoid leaking upstream details.
---

# Integration Error Handling

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `integration-error-handling` |
| Category | 09 — Cloud Storage & External Integrations |
| Scope | Failure handling at integration boundaries. |
| Applicability | Any integration. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (ERR-09, INT-01, INT-02) |
| Governing standards | `ERR-09`, `INT-01`, `INT-02`, `ERR-05`, `API-10` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `external-api-client`, `exception-to-error-mapping`, `dependency-failure-handling`, `technical-exception-handling`, `error-propagation` |

## Purpose
Predictable, safe behaviour when a dependency misbehaves.

## When to use
- Any integration module.

## Organizational standards
- **MANDATORY classification:** **absent** (404 -> `null`/not-found), **rejected** (4xx other -> specific catalog entry or `CONFIG_SERVICE_ERROR`-style 502 for upstream-contract failures), **unavailable** (5xx/network/timeout/token failure -> typed unavailable error -> 503/502), **budget exceeded** (504).
- **MANDATORY:** Policy per dependency (`fail-open-fail-closed-policy`): blocking enforcement dependencies fail **closed**; optional ones fail open and are marked.
- **MANDATORY:** Log context + hint; response contains this service's own code/message.
- **Verified convention:** Catalog entries for integration failures: `ENFORCEMENT_SERVICE_ERROR` / `WEBHOOK_CALL_FAILED` (502), `CONFIG_SERVICE_ERROR` (502), `REDIS_UNAVAILABLE` / `SERVICE_BUS_UNAVAILABLE` (503), `REQUEST_TIMEOUT` (504).

_Source of truth: `ERR-09`, `INT-01`, `INT-02`, `ERR-05`, `API-10`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add the mapping table to the module header comment; test each class.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Mapping table**

```text
404 -> null | 4xx -> CONFIG_SERVICE_ERROR(502) | 5xx/timeout/network -> unavailable(503) | token failure -> unavailable(503, status 401 internal)
```

## Error and failure handling
- As above.
- Distinguish confirmed absence from unavailability; never treat an unavailable dependency as empty data (ERR-09).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Outbound calls carry only the identity and correlation headers defined in CTX-02; validate any client-supplied URL with the SSRF guard (INT-03).

## Testing guidelines
- Each class.
- Mock the HTTP/SDK client; cover 2xx, confirmed-absent (404), 4xx, 5xx, timeout and token-acquisition failure.

## Anti-patterns
- Same handling for 404 and 500.

## Implementation checklist
- [ ] Classes; policy; mapping; logs.

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
- **absent** (404 -> `null`/not-found), **rejected** (4xx other -> specific catalog entry or `CONFIG_SERVICE_ERROR`-style 502 for upstream-contract failures), **unavailable** (5xx/network/timeout/token failure -> typed unavailable error -> 503/502), **budget exceeded** (504).
- Policy per dependency (`fail-open-fail-closed-policy`): blocking enforcement dependencies fail **closed**; optional ones fail open and are marked.
- Log context + hint; response contains this service's own code/message.

## Related skills
- `external-api-client` — External API Client
- `exception-to-error-mapping` — Exception-to-Error Mapping
- `dependency-failure-handling` — Dependency Failure Handling
- `technical-exception-handling` — Technical Exception Handling
- `error-propagation` — Error Propagation
