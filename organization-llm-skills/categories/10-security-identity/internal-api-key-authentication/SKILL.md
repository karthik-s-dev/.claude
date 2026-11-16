---
name: internal-api-key-authentication
description: Use when implementing or reviewing internal endpoint protection with x-internal-api-key - constant-time comparison, fail-closed outside local/dev, startup guard, per-caller key registry, caller allow-list per route, masked logging.
---

# Internal API Key Authentication

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `internal-api-key-authentication` |
| Category | 10 — Security & Identity Management |
| Scope | Internal API key middleware. |
| Applicability | Express. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (SEC-03) |
| Governing standards | `SEC-03`, `CFG-04`, `CTX-02`, `ERR-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `service-to-service-authentication`, `machine-authentication`, `secrets-management`, `request-header-management`, `authentication` |

## Purpose
Only registered internal callers reach internal endpoints.

## When to use
- Adding an internal route or caller.

## Organizational standards
- **MANDATORY:** Header `x-internal-api-key` (and `x-internal-api-caller`); compare with `crypto.timingSafeEqual` after a length check; **fail closed**: key unset outside local/dev -> reject (and refuse to boot via env validation); in local/dev warn and allow.
- **MANDATORY:** One key per caller from `INTERNAL_API_KEY_<CALLER>`; registry maps key -> caller; per-route allowed callers; missing keys configured -> 503 misconfigured; bad key -> 401 (log masked suffix); caller not allowed -> 403.
- **MANDATORY:** Mount the middleware on **every** internal route (reference defect: internal-config routes did not mount it); use catalog errors (`UNAUTHORIZED`/`FORBIDDEN`).
- **MANDATORY (prohibition):** bypass flags in production; Map-key lookup comparisons are not constant-time (reference B) - prefer `timingSafeEqual` over each configured key.

_Source of truth: `SEC-03`, `CFG-04`, `CTX-02`, `ERR-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Implement per the reference; add tests for each outcome.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Constant-time compare (reference)**

```ts
function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8"), bBuf = Buffer.from(b, "utf8");
  return aBuf.length === bBuf.length && timingSafeEqual(aBuf, bBuf);
}
```

## Error and failure handling
- 401/403/503 in the standard envelope.
- Authentication failures return 401, authorization failures 403, both in the standard error envelope; log the reason, not the credential.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Never log the key; rotate per caller.
- Fail closed: a missing or invalid credential rejects the request or stops startup, never opens the endpoint (CFG-04). Use constant-time comparison for secrets.

## Testing guidelines
- Valid, invalid, missing, wrong caller, unset-in-prod rejection, unset-in-local allowed.
- Test valid, missing, malformed, expired and wrong-audience/role credentials; test fail-closed behaviour when configuration is absent outside local/dev.

## Anti-patterns
- `if (!configuredKey) return next()` in production.

## Implementation checklist
- [ ] Constant time; fail closed; every route; per-caller.

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
- Header `x-internal-api-key` (and `x-internal-api-caller`); compare with `crypto.timingSafeEqual` after a length check; **fail closed**: key unset outside local/dev -> reject (and refuse to boot via env validation); in local/dev warn and allow.
- One key per caller from `INTERNAL_API_KEY_<CALLER>`; registry maps key -> caller; per-route allowed callers; missing keys configured -> 503 misconfigured; bad key -> 401 (log masked suffix); caller not allowed -> 403.
- Mount the middleware on **every** internal route (reference defect: internal-config routes did not mount it); use catalog errors (`UNAUTHORIZED`/`FORBIDDEN`).
- MUST NOT: bypass flags in production; Map-key lookup comparisons are not constant-time (reference B) - prefer `timingSafeEqual` over each configured key.

## Related skills
- `service-to-service-authentication` — Service-to-Service Authentication
- `machine-authentication` — Machine Authentication
- `secrets-management` — Secrets Management
- `request-header-management` — Request Header Management
- `authentication` — Authentication
