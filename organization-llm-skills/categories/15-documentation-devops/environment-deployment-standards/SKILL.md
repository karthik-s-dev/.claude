---
name: environment-deployment-standards
description: Use when defining per-environment deployment rules - devtest, staging, customerdev, production names and branches, per-environment registries and variable groups, strictness differences (record_only vs enforce, relaxed local), secrets per environment.
---

# Environment Deployment Standards

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `environment-deployment-standards` |
| Category | 15 — Documentation & DevOps |
| Scope | Environment model for delivery. |
| Applicability | Azure. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (CFG-03, OPS-02) |
| Governing standards | `CFG-03`, `OPS-02`, `CFG-04`, `OPS-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `environment-specific-configuration`, `ci-cd-pipeline`, `deployment-documentation`, `configuration-security`, `deployment-release-management` |

## Purpose
Consistent environments.

## When to use
- New environment/service.

## Organizational standards
- **Verified convention:** environments `devtest`, `staging`, `customerdev`, `production`; branches `devtest`, `staging`, `main`; registry per env (`<env>acr.azurecr.io`), repository pattern `<env>/<service>`; `DEPLOYMENT_ENV`/`APP_ENV` set per environment; non-prod enforcement default `record_only`.
- **MANDATORY:** Production defaults to strict (unset env = production); no relax flags honoured in production; separate secrets per environment.
- **MANDATORY:** Document each environment's required variables (`required-environment-variables`).

_Source of truth: `CFG-03`, `OPS-02`, `CFG-04`, `OPS-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add an environment matrix to deployment docs.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Matrix**

```text
Env | Branch | Registry | APP_ENV | Enforcement default
devtest | devtest | <devtest-registry> | devtest | record_only
production | main | <prod registry> | production | enforce
```

## Error and failure handling
- N/A.
- A failed stage stops the pipeline; no image is pushed unless tests and scans pass (OPS-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Documentation and pipelines never contain secrets; registry tokens come from `AuthToken`/variable groups and are removed from image layers.

## Testing guidelines
- Config tests per env.
- Validate pipelines and Dockerfiles in CI (build, scan, test stages gate the push).

## Anti-patterns
- Shared secrets between environments.

## Implementation checklist
- [ ] Matrix; strictness.

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
- Production defaults to strict (unset env = production); no relax flags honoured in production; separate secrets per environment.
- Document each environment's required variables (`required-environment-variables`).

## Related skills
- `environment-specific-configuration` — Environment-Specific Configuration
- `ci-cd-pipeline` — CI/CD Pipeline
- `deployment-documentation` — Deployment Documentation
- `configuration-security` — Configuration Security
- `deployment-release-management` — Deployment & Release Management
