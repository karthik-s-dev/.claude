---
name: role-based-access-control
description: Use when access depends on roles - Entra app roles in the token roles claim, mapping roles to operations, and wiring/testing role checks. Reference per-operation RBAC middleware is inert; use only the contract.
---

# Role-Based Access Control

> ⚠ **PARTIAL / DEFECTIVE EVIDENCE (E3).** The reference implementation is isolated, declared-only, inert or has known defects. Use the pattern's *contract* only; do not copy the defects documented below.

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `role-based-access-control` |
| Category | 10 — Security & Identity Management |
| Scope | Role checks. |
| Applicability | Express with Entra app roles. |
| Evidence | E3 — isolated / declared-only / defective |
| Classification | PARTIAL (inert in A; roles check in B) / CONFIG |
| Governing standards | `SEC-07`, `SEC-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `authorization`, `jwt-validation`, `audit-logging`, `security-review` |

## Purpose
Correct, tested role enforcement.

## When to use
- Operations differ by role.

## Organizational standards
- **Verified convention:** Roles come from the token `roles` claim (and `scp` for scopes); service-wide required role is validated in the token middleware; B enforces `ALLOWED_ROLES` (roles or scopes).
- **MANDATORY:** If per-operation roles are needed define a role-to-operation map in code, enforce with `requireRole(...)` mounted on routes, and test 403.
- **MANDATORY:** Do not copy the reference's unused `requireRole`/`principalMiddleware` without wiring and tests.

_Source of truth: `SEC-07`, `SEC-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Role map constant; middleware; tests; docs in OpenAPI (security scopes).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Role gate**

```ts
router.post("/admin/refresh", validateAuthToken(), requireRole("Config.Admin"), adminRateLimiter, refresh);
```

## Error and failure handling
- 403 `FORBIDDEN`.
- Authentication failures return 401, authorization failures 403, both in the standard error envelope; log the reason, not the credential.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Fail closed: a missing or invalid credential rejects the request or stops startup, never opens the endpoint (CFG-04). Use constant-time comparison for secrets.

## Testing guidelines
- Role present/absent/empty.
- Test valid, missing, malformed, expired and wrong-audience/role credentials; test fail-closed behaviour when configuration is absent outside local/dev.

## Anti-patterns
- Role names scattered as strings.

## Implementation checklist
- [ ] Map; wired; tested.

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
- If per-operation roles are needed define a role-to-operation map in code, enforce with `requireRole(...)` mounted on routes, and test 403.
- Do not copy the reference's unused `requireRole`/`principalMiddleware` without wiring and tests.

## Related skills
- `authorization` — Authorization
- `jwt-validation` — JWT Validation
- `audit-logging` — Audit Logging
- `security-review` — Security Review
