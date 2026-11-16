---
name: configuration-validation
description: Use when validating configuration at startup - declarative schema, type/format/cross-field checks, environment-aware rules, aggregated errors, memoization and the test hook. Dependency reachability checks are in startup-dependency-validation.
---

# Configuration Validation

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `configuration-validation` |
| Category | 05 — Configuration & Environment Management |
| Scope | Validating configuration values. |
| Applicability | Zod (aliased reference) or explicit validators (flat reference). |
| Evidence | E1 — consistent across both reference repositories |
| Classification | TECH / UNRESOLVED (C-03) |
| Governing standards | `CFG-02`, `CFG-04`, `CFG-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `required-environment-variables`, `startup-dependency-validation`, `optional-environment-variables`, `service-registration-lifecycle`, `health-endpoint-implementation` |

## Purpose
Fail fast with clear, secret-free errors.

## When to use
- Changing required/optional config.
- Writing startup code.

## Organizational standards
- **MANDATORY:** Validate before the app module graph loads (`validateEnv()` in `server.ts` before `import app`); memoize the result and expose `resetValidatedEnvCache()` for tests.
- **MANDATORY:** Aggregate all issues into one error; never print values.
- **MANDATORY:** Cross-field/environment rules (for example `INTERNAL_API_KEY` required unless `isLocalOrDevEnv(APP_ENV)`) live in the validator, not in request handlers.
- **MANDATORY:** `isLocalOrDevEnv` set: `local, development, devtest, staging, customerdev` (reference). Production (default when unset) is the strict mode.
- **Technology-specific:** Zod in repos that already depend on it; hand-written `getEnv*` helpers where it is not present. Do not add a validation library without approval.
- **MANDATORY:** Do not leave a boot guard commented out (reference defect: webhook-secret guard).

_Source of truth: `CFG-02`, `CFG-04`, `CFG-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Extend the schema; add `superRefine`/post-parse checks for environment-specific rules.
2. Call once in bootstrap; pass the result to consumers.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Environment-conditional guard**

```ts
const isLocalOrDev = isLocalOrDevEnv(parsed.APP_ENV);
if (!isLocalOrDev && !parsed.INTERNAL_API_KEY?.trim()) throw new Error("INTERNAL_API_KEY is required outside local/dev (APP_ENV=" + parsed.APP_ENV + ")");
```

## Error and failure handling
- Validation exceptions exit non-zero with a log line listing keys.
- Invalid required configuration stops startup with an aggregated, secret-free message (CFG-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Secrets only from environment/secret store; never log values; fail closed when a required secret is missing outside local/dev (CFG-04).

## Testing guidelines
- Invalid/missing/environment-conditional cases; memoization.
- Test valid, missing, malformed and environment-specific configurations; reset any memoized config between tests.

## Anti-patterns
- Validating lazily on first use.
- Throwing per-field errors one at a time.

## Implementation checklist
- [ ] Before app import; aggregated; env-aware; tested.

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
- Validate before the app module graph loads (`validateEnv()` in `server.ts` before `import app`); memoize the result and expose `resetValidatedEnvCache()` for tests.
- Aggregate all issues into one error; never print values.
- Cross-field/environment rules (for example `INTERNAL_API_KEY` required unless `isLocalOrDevEnv(APP_ENV)`) live in the validator, not in request handlers.
- `isLocalOrDevEnv` set: `local, development, devtest, staging, customerdev` (reference). Production (default when unset) is the strict mode.
- Do not leave a boot guard commented out (reference defect: webhook-secret guard).

## Related skills
- `required-environment-variables` — Required Environment Variables
- `startup-dependency-validation` — Startup Dependency Validation
- `optional-environment-variables` — Optional Environment Variables
- `service-registration-lifecycle` — Service Registration & Lifecycle
- `health-endpoint-implementation` — Health Endpoint Implementation
