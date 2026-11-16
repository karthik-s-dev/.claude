---
name: configuration-management
description: Use when organizing, reading or documenting service configuration as a whole - one config module/schema, no scattered process.env reads, env-example, README table, test setup. Entry skill for the configuration category.
---

# Configuration Management

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `configuration-management` |
| Category | 05 — Configuration & Environment Management |
| Scope | Configuration architecture of a service. |
| Applicability | Node services. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (CFG-01..CFG-07) |
| Governing standards | `CFG-01`, `CFG-02`, `CFG-03`, `CFG-05`, `CFG-06`, `CFG-07` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `configuration-validation`, `configuration-defaults`, `configuration-precedence`, `environment-specific-configuration`, `configuration-security`, `feature-flag-management` |

## Purpose
Single, discoverable, validated configuration surface.

## When to use
- Starting a service.
- Finding `process.env` reads scattered across files.

## Organizational standards
- **MANDATORY:** One configuration source of truth per service (env schema and/or `config.ts`), read via a typed object; no new ad-hoc `process.env` reads in feature code.
- **MANDATORY:** `.env` / `.env.*` git-ignored; `.env.example` committed and complete; README lists variables by group.
- **MANDATORY:** Configuration is grouped by integration prefix (`REDIS_*`, `SERVICE_BUS_*`, `AZURE_QUEUE_*`, `WEBHOOK_*`, `NOTIFICATION_*`, `RATE_LIMIT_*`, `ENTRA_*`/`AZURE_SERVICE_OAUTH_*`).
- **Verified convention:** Config object sections (reference service B): `port, security, deployment, configService, redis, serviceBus, azureQueue, auth, idempotency, usageOutbox, reconciler, ...`.
- **Verified convention:** Test environments stub variables in a setup file (`test/setup.ts`).

_Source of truth: `CFG-01`, `CFG-02`, `CFG-03`, `CFG-05`, `CFG-06`, `CFG-07`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add the variable in schema/config, example, docs, test setup in one change.
2. Prefer injecting config values into constructors for testability.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Config section (flat reference style)**

```ts
export const config = {
  port: getEnvInt("PORT", 3001),
  configService: { baseUrl: getEnv("CONFIG_SERVICE_BASE_URL", "http://localhost:3000"), timeoutMs: getEnvInt("CONFIG_SERVICE_TIMEOUT_MS", 5000) },
};
```

## Error and failure handling
- Config load errors are startup errors (see `configuration-validation`).
- Invalid required configuration stops startup with an aggregated, secret-free message (CFG-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Secrets only from environment/secret store; never log values; fail closed when a required secret is missing outside local/dev (CFG-04).

## Testing guidelines
- `config.*.test.ts` style tests that re-import the module with different env (`vi.resetModules()`), or reset memoized env.
- Test valid, missing, malformed and environment-specific configurations; reset any memoized config between tests.

## Anti-patterns
- `process.env` in services/controllers.
- Multiple config modules.

## Implementation checklist
- [ ] Single source; example; docs; tests.

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
- One configuration source of truth per service (env schema and/or `config.ts`), read via a typed object; no new ad-hoc `process.env` reads in feature code.
- `.env` / `.env.*` git-ignored; `.env.example` committed and complete; README lists variables by group.
- Configuration is grouped by integration prefix (`REDIS_*`, `SERVICE_BUS_*`, `AZURE_QUEUE_*`, `WEBHOOK_*`, `NOTIFICATION_*`, `RATE_LIMIT_*`, `ENTRA_*`/`AZURE_SERVICE_OAUTH_*`).

## Related skills
- `configuration-validation` — Configuration Validation
- `configuration-defaults` — Configuration Defaults
- `configuration-precedence` — Configuration Precedence
- `environment-specific-configuration` — Environment-Specific Configuration
- `configuration-security` — Configuration Security
- `feature-flag-management` — Feature Flag Management
