---
name: configuration-precedence
description: Use when the same setting can come from several sources (process environment, .env, .env.local, legacy/alias variables, code defaults) and you must define which wins and how aliases and legacy flags behave.
---

# Configuration Precedence

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `configuration-precedence` |
| Category | 05 — Configuration & Environment Management |
| Scope | Source precedence and alias handling. |
| Applicability | Node services using dotenv. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (documented in `.env.example`) / CONFIG |
| Governing standards | `CFG-01`, `CFG-03`, `CFG-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `configuration-management`, `environment-specific-configuration`, `configuration-defaults` |

## Purpose
Predictable overrides and safe migration of renamed variables.

## When to use
- Renaming/deprecating a variable.
- Debugging "which value is used".

## Organizational standards
- **Verified convention:** Order (highest first) - real process environment (orchestrator/App Service settings) > `.env.local` (per-machine overrides, documented in `.env.example`) > `.env` (shared dev) > code defaults. `dotenv` never overrides variables already present in the process environment.
- **Verified convention:** Alias/legacy precedence is explicit and coded: `REDIS_HOST_NAME` then `AZURE_CACHE_FOR_REDIS_HOST_NAME` then `localhost`; `ENFORCEMENT_DEFAULT` (explicit) then legacy `ENFORCEMENT_BLOCKING_ENABLED`/`USAGE_LIMIT_ENFORCEMENT_ENABLED` then environment default.
- **MANDATORY:** When adding an alias, keep the old name working, document the order in `.env.example`, mark the old one `@deprecated`, and log a `warn` when only the legacy name is used.
- **UNRESOLVED — do not enforce; report:** `.env.local` loading is documented in the enforcement template; verify the target's `dotenv` setup before relying on it.

_Source of truth: `CFG-01`, `CFG-03`, `CFG-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Implement alias resolution in one helper; test each branch.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Alias chain**

```ts
const redisHost = process.env.REDIS_HOST_NAME?.trim() || process.env.AZURE_CACHE_FOR_REDIS_HOST_NAME?.trim() || "localhost";
```

## Error and failure handling
- Conflicting values between aliases -> prefer the new name and `warn`.
- Invalid required configuration stops startup with an aggregated, secret-free message (CFG-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Secrets only from environment/secret store; never log values; fail closed when a required secret is missing outside local/dev (CFG-04).

## Testing guidelines
- All combinations of alias presence.
- Test valid, missing, malformed and environment-specific configurations; reset any memoized config between tests.

## Anti-patterns
- Undocumented implicit fallbacks.
- Removing a legacy name without a deprecation window.

## Implementation checklist
- [ ] Order documented and tested.

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
- When adding an alias, keep the old name working, document the order in `.env.example`, mark the old one `@deprecated`, and log a `warn` when only the legacy name is used.

## Related skills
- `configuration-management` — Configuration Management
- `environment-specific-configuration` — Environment-Specific Configuration
- `configuration-defaults` — Configuration Defaults
