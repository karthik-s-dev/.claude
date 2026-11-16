---
name: api-security
description: Use when hardening or reviewing an HTTP API - authenticate every route, validate input, CORS allow-list, rate limits, SSRF guards, constant-time secret checks, safe errors, and documented gaps (helmet, body size limit, docs exposure).
---

# API Security

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `api-security` |
| Category | 10 — Security & Identity Management |
| Scope | API-level security controls. |
| Applicability | Express. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (SEC-01..SEC-06, SEC-09 gaps) |
| Governing standards | `SEC-01`, `SEC-03`, `SEC-05`, `SEC-09`, `API-09`, `ERR-07` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `authentication`, `authorization`, `cors-policy`, `ssrf-protection`, `api-rate-limiting`, `security-review` |

## Purpose
Baseline API security consistent with the estate.

## When to use
- Security review; new public endpoint.

## Organizational standards
- **MANDATORY (VERIFIED):** authenticate every non-probe route; schema-validate input; CORS allow-list; SSRF guard for client-supplied URLs; tiered rate limiting on fan-out/admin routes; `timingSafeEqual` for keys/signatures; no internals in errors; raw-body HMAC for webhooks; fail-closed config.
- **Known gaps (not standards) (do not present as standards):** no `helmet`, no `express.json({limit})`, unauthenticated Swagger, relax flags, JWKS-from-unverified-claim in the auth package.
- **Generic baseline (provisional) (recommended, pending approval):** add `helmet`, explicit body limits, gate docs, HSTS via platform.

_Source of truth: `SEC-01`, `SEC-03`, `SEC-05`, `SEC-09`, `API-09`, `ERR-07`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Run the checklist in `security-review`; fix or record each gap.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Checklist excerpt**

```text
auth on all routes | validation on all segments | CORS allow-list | SSRF guard | rate limit | constant-time compare | no internal detail
```

## Error and failure handling
- Security failures use 401/403 catalog errors.
- Authentication failures return 401, authorization failures 403, both in the standard error envelope; log the reason, not the credential.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Fail closed: a missing or invalid credential rejects the request or stops startup, never opens the endpoint (CFG-04). Use constant-time comparison for secrets.

## Testing guidelines
- Security tests (`security-testing`).
- Test valid, missing, malformed, expired and wrong-audience/role credentials; test fail-closed behaviour when configuration is absent outside local/dev.

## Anti-patterns
- `origin: true` with credentials.

## Implementation checklist
- [ ] Checklist complete; gaps recorded.

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
- authenticate every non-probe route; schema-validate input; CORS allow-list; SSRF guard for client-supplied URLs; tiered rate limiting on fan-out/admin routes; `timingSafeEqual` for keys/signatures; no internals in errors; raw-body HMAC for webhooks; fail-closed config.

## Related skills
- `authentication` — Authentication
- `authorization` — Authorization
- `cors-policy` — CORS Policy
- `ssrf-protection` — SSRF Protection
- `api-rate-limiting` — API Rate Limiting
- `security-review` — Security Review
