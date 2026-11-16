---
name: service-to-service-authentication
description: Use when one organizational service calls another - outbound headers (bearer or internal key, caller, correlation), inbound validation, fail-closed token acquisition, and local/dev behaviour. Canonical skill for inter-service auth.
---

# Service-to-Service Authentication

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `service-to-service-authentication` |
| Category | 10 — Security & Identity Management |
| Scope | Outbound and inbound inter-service authentication. |
| Applicability | HTTP services. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (SEC-02, SEC-03, CTX-02, INT-01) |
| Governing standards | `SEC-02`, `SEC-03`, `CTX-02`, `INT-01`, `CFG-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `machine-authentication`, `azure-managed-identity`, `external-api-client`, `internal-api-key-authentication`, `request-header-management`, `correlation-id-management` |

## Purpose
Every internal call is authenticated and traceable.

## When to use
- Calling another service.
- Exposing an internal endpoint.

## Organizational standards
- **MANDATORY **outbound (Entra)**:** interceptor adds `Authorization: Bearer <generateAuthToken()>` when `AZURE_SERVICE_OAUTH_SCOPE` is set; token failure aborts (never unauthenticated).
- **MANDATORY **outbound (internal key)**:** headers `x-internal-api-key`, `x-internal-api-caller: <service-name>`, `x-correlation-id`; skip with a log when the target URL or key is unset (best-effort), but fail closed for blocking paths.
- **MANDATORY **inbound**:** authenticate every internal route (`requireInternalApiKey(allowedCallers?)` / `validateAuthToken()`); 401 missing/invalid; 403 caller not permitted; 503 when no keys configured (misconfiguration) - never open.
- **Verified convention:** Callers register in an `INTERNAL_API_CALLER_REGISTRY`; the declared `x-internal-api-caller` that disagrees with the key's caller is logged as a mismatch.
- **UNRESOLVED — do not enforce; report (C-12):** relax flags exist locally only; never in production.

_Source of truth: `SEC-02`, `SEC-03`, `CTX-02`, `INT-01`, `CFG-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Reuse `http-client-management` interceptor; mount inbound middleware per router.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Inbound route guard**

```ts
router.post("/internal/subscription-changed", requireInternalApiKey(["<caller-id>"]), validate(SubscriptionChangedSchema, "body"), handler);
```

## Error and failure handling
- Standard envelope with catalog `UNAUTHORIZED` / `FORBIDDEN`.
- Authentication failures return 401, authorization failures 403, both in the standard error envelope; log the reason, not the credential.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Constant-time compare; mask key in logs.
- Fail closed: a missing or invalid credential rejects the request or stops startup, never opens the endpoint (CFG-04). Use constant-time comparison for secrets.

## Testing guidelines
- Valid key, wrong key, wrong caller, missing config (503), local relax disabled in prod.
- Test valid, missing, malformed, expired and wrong-audience/role credentials; test fail-closed behaviour when configuration is absent outside local/dev.

## Anti-patterns
- Fail-open when the key is unset.
- Forwarding user tokens between services.

## Implementation checklist
- [ ] Outbound/inbound; fail-closed; caller header; correlation.

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
- interceptor adds `Authorization: Bearer <generateAuthToken()>` when `AZURE_SERVICE_OAUTH_SCOPE` is set; token failure aborts (never unauthenticated).
- headers `x-internal-api-key`, `x-internal-api-caller: <service-name>`, `x-correlation-id`; skip with a log when the target URL or key is unset (best-effort), but fail closed for blocking paths.
- authenticate every internal route (`requireInternalApiKey(allowedCallers?)` / `validateAuthToken()`); 401 missing/invalid; 403 caller not permitted; 503 when no keys configured (misconfiguration) - never open.

## Related skills
- `machine-authentication` — Machine Authentication
- `azure-managed-identity` — Azure Managed Identity
- `external-api-client` — External API Client
- `internal-api-key-authentication` — Internal API Key Authentication
- `request-header-management` — Request Header Management
- `correlation-id-management` — Correlation ID Management
