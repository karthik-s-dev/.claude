---
name: oauth-2-0
description: Use when working with OAuth 2.0 in the organization's Azure estate - Microsoft Entra ID as the authorization server, resource audience/scope, app roles, JWKS-based validation. Interactive flows and custom OAuth servers are not evidenced.
---

# OAuth 2.0

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `oauth-2-0` |
| Category | 10 — Security & Identity Management |
| Scope | OAuth 2.0 usage in services. |
| Applicability | Entra ID. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (SEC-01, SEC-02) via Entra |
| Governing standards | `SEC-01`, `SEC-02`, `PKG-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `client-credentials-flow`, `jwt-validation`, `azure-managed-identity`, `authentication`, `service-to-service-authentication` |

## Purpose
Standards-based authentication.

## When to use
- Adding token-protected APIs or callers.

## Organizational standards
- **Verified convention:** Entra tenant(s) (`AZURE_SERVICE_OAUTH_TENANT_IDS`/`ENTRA_TENANT_ID`), audience (`AZURE_SERVICE_OAUTH_AUDIENCE`/`ENTRA_AUDIENCE`), issuer (`https://login.microsoftonline.com/{tid}/v2.0` / `ENTRA_ISSUER`), JWKS (`.../discovery/v2.0/keys`/`ENTRA_JWKS_URI`), RS256, app role (`AZURE_SERVICE_OAUTH_APP_ROLE`), scope for callers (`AZURE_SERVICE_OAUTH_SCOPE`, `api://.../.default`).
- **MANDATORY:** Use `@inextlabs/azure-oauth` for validation and token acquisition where installed; do not add `passport`, `oauth2-server` or other OAuth libraries.
- **Generic baseline (provisional):** Authorization code/PKCE for end-user flows is out of scope of the reference repos; request approval.

_Source of truth: `SEC-01`, `SEC-02`, `PKG-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Configure env; use the package functions; document audience/role per API.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Env contract (Entra)**

```text
AZURE_SERVICE_OAUTH_TENANT_IDS, AZURE_SERVICE_OAUTH_AUDIENCE, AZURE_SERVICE_OAUTH_APP_ROLE  (validated at startup)
```

## Error and failure handling
- 401/403 catalog errors.
- Authentication failures return 401, authorization failures 403, both in the standard error envelope; log the reason, not the credential.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Fail closed: a missing or invalid credential rejects the request or stops startup, never opens the endpoint (CFG-04). Use constant-time comparison for secrets.

## Testing guidelines
- Valid/expired/wrong audience/wrong role.
- Test valid, missing, malformed, expired and wrong-audience/role credentials; test fail-closed behaviour when configuration is absent outside local/dev.

## Anti-patterns
- Accepting tokens from any tenant.

## Implementation checklist
- [ ] Env; package; role.

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
- Use `@inextlabs/azure-oauth` for validation and token acquisition where installed; do not add `passport`, `oauth2-server` or other OAuth libraries.

## Related skills
- `client-credentials-flow` — Client Credentials Flow
- `jwt-validation` — JWT Validation
- `azure-managed-identity` — Azure Managed Identity
- `authentication` — Authentication
- `service-to-service-authentication` — Service-to-Service Authentication
