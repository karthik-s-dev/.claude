---
name: authentication
description: Use when deciding how requests are authenticated - authenticate every non-probe route, choose Entra bearer vs internal key vs webhook signature by route class, order middleware, and keep it fail-closed.
---

# Authentication

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `authentication` |
| Category | 10 — Security & Identity Management |
| Scope | Authentication policy per route class. |
| Applicability | Express. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (SEC-01, SEC-03, ARCH-05) |
| Governing standards | `SEC-01`, `SEC-03`, `ARCH-05`, `CFG-04`, `API-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `jwt-validation`, `internal-api-key-authentication`, `authorization`, `middleware-request-pipeline`, `api-security` |

## Purpose
No route is unauthenticated by omission.

## When to use
- New routers/routes; reviewing route files.

## Organizational standards
- **MANDATORY:** Route classes: public/service API -> Entra bearer; internal API -> internal key (plus bearer where required); webhook ingress -> signature; probes -> none (documented exception).
- **MANDATORY:** Mount authentication per router (explicit in the route file), after correlation, before validation.
- **MANDATORY:** Fail closed on missing configuration outside local/dev (`CFG-04`).
- **MANDATORY:** Each route file's middleware chain is visible in review; imported-but-unused auth middleware is a defect (reference: `requireRole`, `principalMiddleware` imported, never invoked).
- **Verified convention (defect to avoid):** internal-config routes without the key middleware; legacy v1 routes without token auth; fail-open internal auth in v1.

_Source of truth: `SEC-01`, `SEC-03`, `ARCH-05`, `CFG-04`, `API-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add middleware per route; add a test that unauthenticated calls get 401.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Route chain**

```ts
router.get("/configs/:id", validateAuthToken(), validate(IdSchema, "params"), getConfig);
```

## Error and failure handling
- 401 envelope.
- Authentication failures return 401, authorization failures 403, both in the standard error envelope; log the reason, not the credential.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Fail closed: a missing or invalid credential rejects the request or stops startup, never opens the endpoint (CFG-04). Use constant-time comparison for secrets.

## Testing guidelines
- Table test: every route returns 401/403 without credentials.
- Test valid, missing, malformed, expired and wrong-audience/role credentials; test fail-closed behaviour when configuration is absent outside local/dev.

## Anti-patterns
- Global "skip auth if path includes health" matching substrings (use exact paths).

## Implementation checklist
- [ ] All routes classed; chain explicit; test.

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
- Route classes: public/service API -> Entra bearer; internal API -> internal key (plus bearer where required); webhook ingress -> signature; probes -> none (documented exception).
- Mount authentication per router (explicit in the route file), after correlation, before validation.
- Fail closed on missing configuration outside local/dev (`CFG-04`).
- Each route file's middleware chain is visible in review; imported-but-unused auth middleware is a defect (reference: `requireRole`, `principalMiddleware` imported, never invoked).

## Related skills
- `jwt-validation` — JWT Validation
- `internal-api-key-authentication` — Internal API Key Authentication
- `authorization` — Authorization
- `middleware-request-pipeline` — Middleware & Request Pipeline
- `api-security` — API Security
