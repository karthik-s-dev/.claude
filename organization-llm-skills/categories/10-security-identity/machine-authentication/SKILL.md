---
name: machine-authentication
description: Use when a non-human caller (service, job, portal backend) must authenticate to or call a service. Chooses the organization's mechanisms - Entra app tokens via Managed Identity for HTTP APIs and x-internal-api-key with a caller header for internal endpoints.
---

# Machine Authentication

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `machine-authentication` |
| Category | 10 — Security & Identity Management |
| Scope | Choosing and applying machine credentials. |
| Applicability | Azure-hosted Node services. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (SEC-01, SEC-02, SEC-03) |
| Governing standards | `SEC-01`, `SEC-02`, `SEC-03`, `PKG-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `service-to-service-authentication`, `azure-managed-identity`, `client-credentials-flow`, `internal-api-key-authentication`, `jwt-validation` |

## Purpose
Callers are identified and authorized without human credentials.

## When to use
- Adding a service-to-service endpoint or caller.

## Organizational standards
- **MANDATORY:** Entra-protected APIs: caller obtains a token with `generateAuthToken(scope)` (`@inextlabs/azure-oauth`, `DefaultAzureCredential`) and sends `Authorization: Bearer`; callee validates (`jwt-validation`) including audience and **app role**.
- **MANDATORY:** Internal-only endpoints additionally accept/require `x-internal-api-key` (+ `x-internal-api-caller`) validated fail-closed (`internal-api-key-authentication`).
- **MANDATORY:** Machine identities are named per caller (`<service-name>`, `<portal-name>`); one key per caller (`INTERNAL_API_KEY_<CALLER>`).
- **MANDATORY (prohibition):** invent new schemes (basic auth, shared passwords, custom HMAC headers) without approval.

_Source of truth: `SEC-01`, `SEC-02`, `SEC-03`, `PKG-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Decide token vs key vs both from the endpoint's exposure; implement per the linked skills.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Choice**

```text
public/service API (Entra)  -> Bearer token + app role
internal notification API    -> x-internal-api-key + x-internal-api-caller (+ correlation)
```

## Error and failure handling
- 401 unauthenticated / 403 caller not permitted via catalog.
- Authentication failures return 401, authorization failures 403, both in the standard error envelope; log the reason, not the credential.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Fail closed: a missing or invalid credential rejects the request or stops startup, never opens the endpoint (CFG-04). Use constant-time comparison for secrets.

## Testing guidelines
- Each credential type valid/invalid.
- Test valid, missing, malformed, expired and wrong-audience/role credentials; test fail-closed behaviour when configuration is absent outside local/dev.

## Anti-patterns
- Shared keys across callers.
- Unauthenticated internal routes.

## Implementation checklist
- [ ] Mechanism chosen; fail-closed; caller named.

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
- Entra-protected APIs: caller obtains a token with `generateAuthToken(scope)` (`@inextlabs/azure-oauth`, `DefaultAzureCredential`) and sends `Authorization: Bearer`; callee validates (`jwt-validation`) including audience and **app role**.
- Internal-only endpoints additionally accept/require `x-internal-api-key` (+ `x-internal-api-caller`) validated fail-closed (`internal-api-key-authentication`).
- Machine identities are named per caller (`<service-name>`, `<portal-name>`); one key per caller (`INTERNAL_API_KEY_<CALLER>`).
- MUST NOT: invent new schemes (basic auth, shared passwords, custom HMAC headers) without approval.

## Related skills
- `service-to-service-authentication` — Service-to-Service Authentication
- `azure-managed-identity` — Azure Managed Identity
- `client-credentials-flow` — Client Credentials Flow
- `internal-api-key-authentication` — Internal API Key Authentication
- `jwt-validation` — JWT Validation
