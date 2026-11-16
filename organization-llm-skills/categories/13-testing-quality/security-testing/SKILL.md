---
name: security-testing
description: Use when testing security properties - auth required on every route, wrong/expired tokens, internal key outcomes, fail-closed config, SSRF denials, webhook signatures, no secrets in logs - plus pipeline scans (secret scan, SCA, container scan).
---

# Security Testing

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `security-testing` |
| Category | 13 — Testing & Quality Engineering |
| Scope | Security tests and scans. |
| Applicability | Unit/integration tests + pipeline. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (partial) + GENERIC |
| Governing standards | `SEC-01`, `SEC-03`, `OPS-02`, `INT-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `api-security`, `pipeline-security-scanning`, `authentication`, `security-review`, `ssrf-protection` |

## Purpose
Prove controls work.

## When to use
- Auth/security code changes.

## Organizational standards
- **Verified convention:** tests exist for internal API auth (`internal-api-auth.test.ts`), client binding (`auth.client-binding.test.ts`), callback URL validation (`callback-url-validation.test.ts`), deprecated route; pipelines run TruffleHog, SonarQube, Snyk, Trivy in prod.
- **MANDATORY:** Table test asserting every route returns 401 (or 403) without credentials; fail-closed config tests; SSRF matrix; signature tamper tests; log-capture test for secrets.
- **Generic baseline (provisional):** Add dependency audit (`npm audit`) to CI.

_Source of truth: `SEC-01`, `SEC-03`, `OPS-02`, `INT-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add security tests next to the feature; keep scan stages gating the push.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Route auth table**

```ts
for (const [method, path] of PROTECTED) it(method + " " + path + " requires auth", async () => { expect((await request(app)[method](path)).status).toBe(401); });
```

## Error and failure handling
- Security test failure blocks merge.
- Tests must fail loudly: no swallowed assertions, no `--passWithNoTests` as a quality gate.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Test fixtures contain no real secrets or personal data; stub environment variables in setup files (TEST-01).

## Testing guidelines
- As above.
- Follow the target repository's runner and layout (TEST-01); do not introduce a second test framework.

## Anti-patterns
- Only testing the happy path.

## Implementation checklist
- [ ] Routes; fail-closed; SSRF; logs; scans.

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
- Table test asserting every route returns 401 (or 403) without credentials; fail-closed config tests; SSRF matrix; signature tamper tests; log-capture test for secrets.

## Related skills
- `api-security` — API Security
- `pipeline-security-scanning` — Pipeline Security Scanning
- `authentication` — Authentication
- `security-review` — Security Review
- `ssrf-protection` — SSRF Protection
