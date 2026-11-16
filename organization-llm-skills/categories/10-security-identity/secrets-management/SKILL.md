---
name: secrets-management
description: Use when handling secrets (API keys, connection strings, HMAC secrets, private keys, registry tokens) - sourcing from environment, masking, rotation, CI/CD injection, secret scanning, and what to do when a secret is found in a repo.
---

# Secrets Management

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `secrets-management` |
| Category | 10 — Security & Identity Management |
| Scope | Secret lifecycle. |
| Applicability | Services and pipelines. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (CFG-04, CFG-07) / Key Vault absent |
| Governing standards | `CFG-07`, `CFG-04`, `SEC-06`, `OBS-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `configuration-security`, `azure-managed-identity`, `internal-package-management`, `data-protection`, `pipeline-security-scanning` |

## Purpose
No leaked or default secrets.

## When to use
- Adding/rotating a secret; seeing a secret in code or `.env`.

## Organizational standards
- **MANDATORY:** Secrets only via environment variables injected by the platform/variable groups; no Key Vault code exists (`// TODO: read secret from keyvault`) - do not add vault SDK usage without approval.
- **MANDATORY:** `.env*` ignored; secrets absent from Docker layers (`AuthToken` build-arg; `.npmrc` removed); pipelines scan secrets (TruffleHog in prod pipelines).
- **MANDATORY:** Mask in logs (`MASK_CONFIG`, `maskApiKeyForLog`); never echo `.env` values in answers, docs or tests.
- **MANDATORY:** If a real secret is found committed or in working files, do not reproduce it; report location and require rotation.
- **Verified convention:** Per-caller internal keys (`INTERNAL_API_KEY_<CALLER>`) enable independent rotation.

_Source of truth: `CFG-07`, `CFG-04`, `SEC-06`, `OBS-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add placeholder to `.env.example`; configure pipeline variable; rotate if exposed.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Rotation checklist**

```text
generate new key -> set in platform settings for callee and caller -> deploy -> remove old -> verify 401 with old
```

## Error and failure handling
- Missing secret -> startup/request failure.
- Authentication failures return 401, authorization failures 403, both in the standard error envelope; log the reason, not the credential.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Constant-time compare; least privilege.
- Fail closed: a missing or invalid credential rejects the request or stops startup, never opens the endpoint (CFG-04). Use constant-time comparison for secrets.

## Testing guidelines
- Secret scan in CI.
- Test valid, missing, malformed, expired and wrong-audience/role credentials; test fail-closed behaviour when configuration is absent outside local/dev.

## Anti-patterns
- Defaults for secrets; shared keys.

## Implementation checklist
- [ ] Source; masked; scanned; rotatable.

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
- Secrets only via environment variables injected by the platform/variable groups; no Key Vault code exists (`// TODO: read secret from keyvault`) - do not add vault SDK usage without approval.
- `.env*` ignored; secrets absent from Docker layers (`AuthToken` build-arg; `.npmrc` removed); pipelines scan secrets (TruffleHog in prod pipelines).
- Mask in logs (`MASK_CONFIG`, `maskApiKeyForLog`); never echo `.env` values in answers, docs or tests.
- If a real secret is found committed or in working files, do not reproduce it; report location and require rotation.

## Related skills
- `configuration-security` — Configuration Security
- `azure-managed-identity` — Azure Managed Identity
- `internal-package-management` — Internal Package Management
- `data-protection` — Data Protection
- `pipeline-security-scanning` — Pipeline Security Scanning
