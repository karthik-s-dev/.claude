---
name: authorization
description: Use when deciding what an authenticated caller may do - coarse service-level app-role gate, allowed caller app IDs, tenant/client binding, and (only when needed) per-operation roles.
---

# Authorization

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `authorization` |
| Category | 10 — Security & Identity Management |
| Scope | Access decisions after authentication. |
| Applicability | Express. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (SEC-01, SEC-07) partial |
| Governing standards | `SEC-01`, `SEC-07`, `API-10` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `role-based-access-control`, `jwt-validation`, `authentication`, `api-security`, `security-review` |

## Purpose
Least privilege.

## When to use
- Adding operations with different privilege levels or tenant data.

## Organizational standards
- **MANDATORY:** Baseline gate: required app role (`AZURE_SERVICE_OAUTH_APP_ROLE`) and/or `ALLOWED_ROLES`/`ALLOWED_APP_IDS`.
- **MANDATORY:** Tenant isolation: the caller's client claim must match the requested client identifiers (`CLIENT_CONTEXT_MISMATCH` 403).
- **Configurable:** Per-operation roles and tenant scoping are **conditional** - implement and test them if the service needs them; otherwise ship none (reference `requireRole`/`enforceTenantScope` are inert: imported, never invoked, no-op because `req.principal` is never populated).
- **MANDATORY:** Audit `actor` comes from the verified principal.

_Source of truth: `SEC-01`, `SEC-07`, `API-10`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Create the principal middleware only with tests proving it populates `req.principal`.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Binding check**

```ts
for (const id of requestClientIds(req)) if (id !== principal.clientClaimValue) throw V2Errors.clientMismatch();
```

## Error and failure handling
- 403 envelope; log reason without claim values.
- Authentication failures return 401, authorization failures 403, both in the standard error envelope; log the reason, not the credential.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Fail closed: a missing or invalid credential rejects the request or stops startup, never opens the endpoint (CFG-04). Use constant-time comparison for secrets.

## Testing guidelines
- Matching and mismatching IDs (body/query/both).
- Test valid, missing, malformed, expired and wrong-audience/role credentials; test fail-closed behaviour when configuration is absent outside local/dev.

## Anti-patterns
- Shipping inert authorization middleware.
- Trusting client-supplied tenant IDs.

## Implementation checklist
- [ ] Gate; binding; actor; tests.

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
- Baseline gate: required app role (`AZURE_SERVICE_OAUTH_APP_ROLE`) and/or `ALLOWED_ROLES`/`ALLOWED_APP_IDS`.
- Tenant isolation: the caller's client claim must match the requested client identifiers (`CLIENT_CONTEXT_MISMATCH` 403).
- Audit `actor` comes from the verified principal.

## Related skills
- `role-based-access-control` — Role-Based Access Control
- `jwt-validation` — JWT Validation
- `authentication` — Authentication
- `api-security` — API Security
- `security-review` — Security Review
