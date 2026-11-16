---
name: azure-service-connection-management
description: Use when deciding how a service authenticates to Azure resources - Managed Identity for HTTP APIs, connection strings for Service Bus/Queue Storage/Redis/Mongo today - and how those secrets are supplied, validated and rotated.
---

# Azure Service Connection Management

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `azure-service-connection-management` |
| Category | 09 — Cloud Storage & External Integrations |
| Scope | Connection credentials for Azure resources. |
| Applicability | Azure-hosted Node services. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (INT-06, CFG-07) / auth C-13 |
| Governing standards | `INT-06`, `CFG-07`, `SEC-02`, `CFG-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `azure-sdk-client-management`, `azure-managed-identity`, `configuration-security`, `startup-dependency-validation`, `secrets-management` |

## Purpose
Right credential type, no secrets in code.

## When to use
- Adding a resource connection.

## Organizational standards
- **Verified convention:** Entra-protected HTTP APIs: Managed Identity bearer via `generateAuthToken(scope)` (`AZURE_SERVICE_OAUTH_SCOPE`); Service Bus/Queue Storage/Redis/Mongo: connection strings/keys from environment.
- **MANDATORY:** Prefer identity-based access for **new** Azure resources when the SDK supports it **and** approval exists; until C-13 is decided keep the connection-string contract and label identity as "adapter pending approval".
- **MANDATORY:** Validate presence at startup (mandatory ones); mask on logs.
- **MANDATORY:** Rotation: values come from platform settings (not rebuilt images); services re-read on restart.

_Source of truth: `INT-06`, `CFG-07`, `SEC-02`, `CFG-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Document each resource's credential type in README config table.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Table**

```text
Resource | Credential | Env
Upstream service API | Managed Identity | AZURE_SERVICE_OAUTH_SCOPE
Service Bus | connection string | SERVICE_BUS_CONNECTION_STRING
```

## Error and failure handling
- Token failure for an authenticated HTTP dependency aborts the call (fail closed).
- Distinguish confirmed absence from unavailability; never treat an unavailable dependency as empty data (ERR-09).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Outbound calls carry only the identity and correlation headers defined in CTX-02; validate any client-supplied URL with the SSRF guard (INT-03).

## Testing guidelines
- Missing credential; token failure.
- Mock the HTTP/SDK client; cover 2xx, confirmed-absent (404), 4xx, 5xx, timeout and token-acquisition failure.

## Anti-patterns
- Keys in code/config files.

## Implementation checklist
- [ ] Documented; validated; masked.

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
- Prefer identity-based access for **new** Azure resources when the SDK supports it **and** approval exists; until C-13 is decided keep the connection-string contract and label identity as "adapter pending approval".
- Validate presence at startup (mandatory ones); mask on logs.
- Rotation: values come from platform settings (not rebuilt images); services re-read on restart.

## Related skills
- `azure-sdk-client-management` — Azure SDK Client Management
- `azure-managed-identity` — Azure Managed Identity
- `configuration-security` — Configuration Security
- `startup-dependency-validation` — Startup Dependency Validation
- `secrets-management` — Secrets Management
