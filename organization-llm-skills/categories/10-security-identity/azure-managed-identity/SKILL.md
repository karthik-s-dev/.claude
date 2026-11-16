---
name: azure-managed-identity
description: Use when authenticating to Azure-protected resources without secrets - system/user-assigned Managed Identity via DefaultAzureCredential, role assignments, local developer fallbacks, and the current limits (HTTP APIs yes, Service Bus/Queue/Redis/Mongo not yet).
---

# Azure Managed Identity

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `azure-managed-identity` |
| Category | 10 — Security & Identity Management |
| Scope | Managed Identity usage. |
| Applicability | Azure-hosted Node services. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (SEC-02, CFG-07) / messaging gap C-13 |
| Governing standards | `SEC-02`, `CFG-07`, `INT-06` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `client-credentials-flow`, `azure-service-connection-management`, `secrets-management`, `azure-sdk-client-management` |

## Purpose
Secretless access wherever supported.

## When to use
- Authenticating to Azure/Entra resources.

## Organizational standards
- **Verified convention:** Used for outbound upstream-service calls (token with `AZURE_SERVICE_OAUTH_SCOPE`); local runs use developer credentials via `DefaultAzureCredential` or run unauthenticated when the scope is unset in non-production.
- **MANDATORY:** New Azure integrations default to Managed Identity when the SDK supports it and approval exists; otherwise follow `azure-service-connection-management`.
- **DECIDED (C-13, approved 2026-11-16):** Approved: plan migration of messaging to Managed Identity; connection strings stay until adapters are approved. _Earlier note (superseded where it conflicts):_ Service Bus/Queue Storage/Redis/Mongo use connection strings/keys; migration to identity-based access is pending approval.
- **MANDATORY:** Document required role assignments (e.g. "Azure Service Bus Data Sender") in `deployment-documentation`.

_Source of truth: `SEC-02`, `CFG-07`, `INT-06`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Use `generateAuthToken()` from `@inextlabs/azure-oauth` (wraps `DefaultAzureCredential`) for tokens; for SDK clients pass the credential object when approved.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**GENERIC SDK identity form (pending approval for messaging)**

```ts
const sb = new ServiceBusClient(config.serviceBus.fullyQualifiedNamespace, new DefaultAzureCredential());
```

## Error and failure handling
- Identity failures are config/RBAC problems: log with hint (check role assignment), exit at startup if mandatory.
- Authentication failures return 401, authorization failures 403, both in the standard error envelope; log the reason, not the credential.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Fail closed: a missing or invalid credential rejects the request or stops startup, never opens the endpoint (CFG-04). Use constant-time comparison for secrets.

## Testing guidelines
- Mock credential.
- Test valid, missing, malformed, expired and wrong-audience/role credentials; test fail-closed behaviour when configuration is absent outside local/dev.

## Anti-patterns
- Embedding client secrets to emulate MI.

## Implementation checklist
- [ ] Role assignments documented; fail-closed.

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
- New Azure integrations default to Managed Identity when the SDK supports it and approval exists; otherwise follow `azure-service-connection-management`.
- Document required role assignments (e.g. "Azure Service Bus Data Sender") in `deployment-documentation`.

## Related skills
- `client-credentials-flow` — Client Credentials Flow
- `azure-service-connection-management` — Azure Service Connection Management
- `secrets-management` — Secrets Management
- `azure-sdk-client-management` — Azure SDK Client Management
