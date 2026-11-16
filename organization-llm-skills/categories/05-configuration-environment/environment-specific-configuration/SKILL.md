---
name: environment-specific-configuration
description: Use when behaviour or strictness depends on the environment (local, devtest, staging, customerdev, production) - environment names, non-enforcing defaults, relaxed local security, branch-to-environment mapping.
---

# Environment-Specific Configuration

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `environment-specific-configuration` |
| Category | 05 — Configuration & Environment Management |
| Scope | Environment model and per-environment behaviour. |
| Applicability | Azure-hosted services. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (CFG-03) |
| Governing standards | `CFG-03`, `CFG-04`, `CFG-06` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `configuration-security`, `configuration-defaults`, `environment-deployment-standards`, `fail-open-fail-closed-policy` |

## Purpose
Same code runs everywhere; only configuration and strictness differ, and production is never accidentally relaxed.

## When to use
- Adding behaviour that differs by environment.
- Adding a bypass for local development.

## Organizational standards
- **MANDATORY:** Environment names: `local`, `development`, `devtest`, `staging`, `customerdev`, `production`; variable `APP_ENV` (reference service A) / `DEPLOYMENT_ENV` with `APP_ENV` fallback (reference service B); default `production`.
- **MANDATORY:** Branch mapping: `devtest` -> devtest, `staging` -> staging, `main` -> production; pipeline variable groups per environment.
- **MANDATORY:** Strictness is derived from the environment name through one helper (`isLocalOrDevEnv`, `NON_ENFORCING_DEPLOYMENT_ENVS`), not scattered string compares.
- **MANDATORY (prohibition):** add new "relax security" switches. Existing `SECURITY_RELAXED_FOR_DEVNDEMO` and `AUTH_FAIL_OPEN` are flagged risks (C-12): they must never be honoured in production (detect Azure App Service via `WEBSITE_INSTANCE_ID`) and must log a loud warning at startup.
- **Verified convention:** Non-production defaults to **record-only** enforcement (record usage, never block) via `ENFORCEMENT_DEFAULT`.

_Source of truth: `CFG-03`, `CFG-04`, `CFG-06`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add the behaviour behind the helper; document in `.env.example` per environment.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**One helper**

```ts
export const nonLocalEnvs = new Set(["local", "development", "devtest", "staging", "customerdev"]);
export const isLocalOrDevEnv = (e?: string) => nonLocalEnvs.has((e ?? "").toLowerCase());
```

## Error and failure handling
- Unknown environment name -> treat as production.
- Invalid required configuration stops startup with an aggregated, secret-free message (CFG-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Secrets only from environment/secret store; never log values; fail closed when a required secret is missing outside local/dev (CFG-04).

## Testing guidelines
- Each environment value; production guard when relax flag set.
- Test valid, missing, malformed and environment-specific configurations; reset any memoized config between tests.

## Anti-patterns
- `if (NODE_ENV === "production")` scattered with different meanings.
- Environment-specific code branches in business logic.

## Implementation checklist
- [ ] Helper used; defaults safe; docs per env.

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
- Environment names: `local`, `development`, `devtest`, `staging`, `customerdev`, `production`; variable `APP_ENV` (reference service A) / `DEPLOYMENT_ENV` with `APP_ENV` fallback (reference service B); default `production`.
- Branch mapping: `devtest` -> devtest, `staging` -> staging, `main` -> production; pipeline variable groups per environment.
- Strictness is derived from the environment name through one helper (`isLocalOrDevEnv`, `NON_ENFORCING_DEPLOYMENT_ENVS`), not scattered string compares.
- MUST NOT: add new "relax security" switches. Existing `SECURITY_RELAXED_FOR_DEVNDEMO` and `AUTH_FAIL_OPEN` are flagged risks (C-12): they must never be honoured in production (detect Azure App Service via `WEBSITE_INSTANCE_ID`) and must log a loud warning at startup.

## Related skills
- `configuration-security` — Configuration Security
- `configuration-defaults` — Configuration Defaults
- `environment-deployment-standards` — Environment Deployment Standards
- `fail-open-fail-closed-policy` — Fail-Open / Fail-Closed Policy
