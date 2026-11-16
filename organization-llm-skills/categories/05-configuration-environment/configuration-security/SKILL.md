---
name: configuration-security
description: Use when handling secrets and sensitive configuration - sourcing, validation, masking, logging, Docker/CI injection, local files, and fail-closed behaviour when a secret is missing.
---

# Configuration Security

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `configuration-security` |
| Category | 05 — Configuration & Environment Management |
| Scope | Protecting configuration values. |
| Applicability | Node services on Azure. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (CFG-04, CFG-07) |
| Governing standards | `CFG-04`, `CFG-07`, `SEC-06`, `OBS-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `secrets-management`, `required-environment-variables`, `sensitive-data-masking-in-logs`, `internal-package-management`, `data-protection` |

## Purpose
Secrets never leak and a missing secret never opens an endpoint.

## When to use
- Adding a credential/key/connection string.
- Reviewing `.env`, Dockerfile, pipeline.

## Organizational standards
- **MANDATORY:** Secrets come only from the environment (secret store injected by the platform); never from source, fixtures or logs. Reference gap: no Key Vault integration yet (`// TODO: read secret from keyvault`) - do not invent one.
- **MANDATORY:** `.env`, `.env.*` are git-ignored; only `.env.example` with placeholders is committed; never copy real values from a working `.env` into docs, tests or skills.
- **MANDATORY:** Log configuration by key name only; mask URIs (`maskConnectionUri`) and key suffixes (`maskApiKeyForLog`); extend `MASK_CONFIG` for service-specific secret fields (`key`, `endpoint`, `connectionString`, `conn_str`).
- **MANDATORY:** Missing secret outside local/dev -> startup failure (config) or fail-closed rejection (request), never open (CFG-04).
- **MANDATORY:** Package-registry token is `${AuthToken}` only; Docker deletes `.npmrc` after install.
- **Verified convention:** Outbound Azure auth prefers Managed Identity over secrets for HTTP calls (`azure-managed-identity`); messaging still uses connection strings (C-13).

_Source of truth: `CFG-04`, `CFG-07`, `SEC-06`, `OBS-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add placeholder to `.env.example`; add to mask config if loggable object field; verify CI/pipeline injection.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**.env.example entry**

```text
# Internal API keys (header x-internal-api-key) - REQUIRED outside local/dev
INTERNAL_API_KEY_ADMIN_PORTAL=
```

## Error and failure handling
- Secret read failures never print values.
- Invalid required configuration stops startup with an aggregated, secret-free message (CFG-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Rotate secrets found in repos immediately and report (do not repeat their values).
- Secrets only from environment/secret store; never log values; fail closed when a required secret is missing outside local/dev (CFG-04).

## Testing guidelines
- Secret absent in prod mode -> startup/request rejection; log capture contains no secret.
- Test valid, missing, malformed and environment-specific configurations; reset any memoized config between tests.

## Anti-patterns
- Committed `.env`.
- Default secret values.
- Logging `process.env`.

## Implementation checklist
- [ ] Source; masking; fail-closed; CI injection.

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
- Secrets come only from the environment (secret store injected by the platform); never from source, fixtures or logs. Reference gap: no Key Vault integration yet (`// TODO: read secret from keyvault`) - do not invent one.
- `.env`, `.env.*` are git-ignored; only `.env.example` with placeholders is committed; never copy real values from a working `.env` into docs, tests or skills.
- Log configuration by key name only; mask URIs (`maskConnectionUri`) and key suffixes (`maskApiKeyForLog`); extend `MASK_CONFIG` for service-specific secret fields (`key`, `endpoint`, `connectionString`, `conn_str`).
- Missing secret outside local/dev -> startup failure (config) or fail-closed rejection (request), never open (CFG-04).
- Package-registry token is `${AuthToken}` only; Docker deletes `.npmrc` after install.

## Related skills
- `secrets-management` — Secrets Management
- `required-environment-variables` — Required Environment Variables
- `sensitive-data-masking-in-logs` — Sensitive Data Masking in Logs
- `internal-package-management` — Internal Package Management
- `data-protection` — Data Protection
