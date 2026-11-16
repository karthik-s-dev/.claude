---
name: configuration-defaults
description: Use when choosing default values for configuration - safe-by-default policy, production default when the environment name is unset, documented numeric defaults and the rule that defaults never apply to secrets.
---

# Configuration Defaults

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `configuration-defaults` |
| Category | 05 — Configuration & Environment Management |
| Scope | Default value policy. |
| Applicability | Any service. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (CFG-05) |
| Governing standards | `CFG-05`, `CFG-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `optional-environment-variables`, `configuration-validation`, `environment-specific-configuration` |

## Purpose
Defaults that are safe, explicit and consistent.

## When to use
- Adding a config key.
- Reviewing literal fallbacks (`|| "1"`).

## Organizational standards
- **MANDATORY:** Unset environment name defaults to **production** strictness (`APP_ENV`/`DEPLOYMENT_ENV` default `production`).
- **MANDATORY:** Defaults are safe: toggles default off or to the more restrictive behaviour (`FEATURE_DUAL_READ=false`, non-prod enforcement `record_only` defaults only for named non-prod environments, `AUTH_FAIL_OPEN=false`).
- **MANDATORY:** No defaults for secrets, URIs of production systems, or identity constants (error-code constants are code constants, not env).
- **Verified convention:** Local convenience defaults (localhost URLs, local Redis without password) exist but are guarded: non-local hosts require credentials.
- **Verified convention:** Every default is mirrored in `.env.example` ("every value shown is the default unless marked REQUIRED").

_Source of truth: `CFG-05`, `CFG-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Put the default next to the read; add comment with rationale for non-obvious values.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Safe defaults**

```ts
const deploymentEnv = (process.env.DEPLOYMENT_ENV ?? process.env.APP_ENV ?? "production").trim().toLowerCase();
const authFailOpen = (process.env.AUTH_FAIL_OPEN ?? "false") === "true";
```

## Error and failure handling
- N/A (see validation).
- Invalid required configuration stops startup with an aggregated, secret-free message (CFG-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Secrets only from environment/secret store; never log values; fail closed when a required secret is missing outside local/dev (CFG-04).

## Testing guidelines
- Defaults under empty env.
- Test valid, missing, malformed and environment-specific configurations; reset any memoized config between tests.

## Anti-patterns
- `process.env.SERVICE_CODE || "02"`.
- Default `true` for security bypasses.

## Implementation checklist
- [ ] Safe, documented, mirrored.

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
- Unset environment name defaults to **production** strictness (`APP_ENV`/`DEPLOYMENT_ENV` default `production`).
- Defaults are safe: toggles default off or to the more restrictive behaviour (`FEATURE_DUAL_READ=false`, non-prod enforcement `record_only` defaults only for named non-prod environments, `AUTH_FAIL_OPEN=false`).
- No defaults for secrets, URIs of production systems, or identity constants (error-code constants are code constants, not env).

## Related skills
- `optional-environment-variables` — Optional Environment Variables
- `configuration-validation` — Configuration Validation
- `environment-specific-configuration` — Environment-Specific Configuration
