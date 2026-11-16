---
name: client-credentials-flow
description: Use when a service acquires an app-only token to call another API. The organization uses DefaultAzureCredential (Managed Identity in Azure, developer credential locally) through generateAuthToken(scope), not client-secret code.
---

# Client Credentials Flow

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `client-credentials-flow` |
| Category | 10 — Security & Identity Management |
| Scope | App-only token acquisition. |
| Applicability | Node with `@inextlabs/azure-oauth`. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (SEC-02) |
| Governing standards | `SEC-02`, `CFG-07`, `INT-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `azure-managed-identity`, `oauth-2-0`, `service-to-service-authentication`, `machine-authentication`, `external-api-client` |

## Purpose
Machine-to-machine access without secrets in code.

## When to use
- Calling an Entra-protected API.

## Organizational standards
- **MANDATORY:** `generateAuthToken(scope?)` -> `new DefaultAzureCredential().getToken(scope ?? AZURE_SERVICE_OAUTH_SCOPE)`; error "AZURE_SERVICE_OAUTH_SCOPE is not configured" when no scope; wrap failure as typed unavailable error at the HTTP client.
- **MANDATORY:** Tokens are not stored by the application (SDK caches); never log them.
- **MANDATORY:** Do not implement the client-secret grant by hand; if a client secret is unavoidable, request approval and store in the secret platform.
- **Generic baseline (provisional):** Acquire per request is acceptable; avoid fetching more often than the SDK cache requires.

_Source of truth: `SEC-02`, `CFG-07`, `INT-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Use the shared interceptor from `external-api-client`.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Token acquisition**

```ts
const token = await generateAuthToken();     // uses AZURE_SERVICE_OAUTH_SCOPE
headers["Authorization"] = "Bearer " + token;
```

## Error and failure handling
- Failure -> abort request, `error` log without token.
- Authentication failures return 401, authorization failures 403, both in the standard error envelope; log the reason, not the credential.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Least privilege app role on the target API.
- Fail closed: a missing or invalid credential rejects the request or stops startup, never opens the endpoint (CFG-04). Use constant-time comparison for secrets.

## Testing guidelines
- Mock `generateAuthToken` to throw -> no HTTP call made.
- Test valid, missing, malformed, expired and wrong-audience/role credentials; test fail-closed behaviour when configuration is absent outside local/dev.

## Anti-patterns
- Hand-rolled token endpoint calls.

## Implementation checklist
- [ ] Interceptor; failure behaviour; no token logging.

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
- `generateAuthToken(scope?)` -> `new DefaultAzureCredential().getToken(scope ?? AZURE_SERVICE_OAUTH_SCOPE)`; error "AZURE_SERVICE_OAUTH_SCOPE is not configured" when no scope; wrap failure as typed unavailable error at the HTTP client.
- Tokens are not stored by the application (SDK caches); never log them.
- Do not implement the client-secret grant by hand; if a client secret is unavoidable, request approval and store in the secret platform.

## Related skills
- `azure-managed-identity` — Azure Managed Identity
- `oauth-2-0` — OAuth 2.0
- `service-to-service-authentication` — Service-to-Service Authentication
- `machine-authentication` — Machine Authentication
- `external-api-client` — External API Client
