---
name: model-configuration
description: Use when managing model catalog, deployments and per-bot AI configuration - reference service A stores model master, deployments/resources and AI config overrides, caches them in Redis, and masks keys and endpoints.
---

# Model Configuration

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `model-configuration` |
| Category | 12 — LLM & AI Integration |
| Scope | Model/deployment configuration data. |
| Applicability | Reference service A + consumers. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (LLM-02) reference service A |
| Governing standards | `LLM-02`, `OBS-03`, `DB-05`, `SEC-06` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `llm-client-management`, `secrets-management`, `caching-strategy`, `sensitive-data-masking-in-logs` |

## Purpose
Central, secret-safe model configuration.

## When to use
- Adding or changing model/deployment configuration.

## Organizational standards
- **Verified convention:** Services `modelMaster.service`, `aiResources.service`, `aiConfig.service`/`aiConfigPlatform.service`; Mongoose model `aIConfigModel` (`@inextlabs/schema-models`); per-client DB for tenant overrides; Redis `aIConfig:{clientId}:{botId}:{featureId|all}` TTL 24 h; catalog errors `MODEL_NOT_FOUND`, `DEPLOYMENT_NOT_FOUND`, `FEATURE_MASTER_NOT_FOUND`.
- **MANDATORY:** `key`, `endpoint`, `connectionString` fields are masked (`MASK_CONFIG`) and never returned by public endpoints; mutations are audited (`audit-logging`).
- **MANDATORY:** Changes invalidate caches (`cache-invalidation`).

_Source of truth: `LLM-02`, `OBS-03`, `DB-05`, `SEC-06`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Extend through the services above; update mask config and docs.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Cache key (reference)**

```ts
const cacheKey = featureId ? "aIConfig:" + clientId + ":" + botId + ":" + featureId : "aIConfig:" + clientId + ":" + botId + ":all";
```

## Error and failure handling
- Missing model/deployment -> catalog 404.
- LLM failures map to catalogued errors (ERR-02) and follow the resilience standards (RES-02, RES-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Masking; access control.
- Model keys and endpoints are secrets (mask `key`, `endpoint`); never log prompts or completions containing PII; treat model output as untrusted input.

## Testing guidelines
- Cache hit/miss; masking.
- Mock the model client; cover malformed output, refusal, timeout, rate-limit and token-limit paths.

## Anti-patterns
- Returning keys.

## Implementation checklist
- [ ] Masked; audited; invalidated.

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
- `key`, `endpoint`, `connectionString` fields are masked (`MASK_CONFIG`) and never returned by public endpoints; mutations are audited (`audit-logging`).
- Changes invalidate caches (`cache-invalidation`).

## Related skills
- `llm-client-management` — LLM Client Management
- `secrets-management` — Secrets Management
- `caching-strategy` — Caching Strategy
- `sensitive-data-masking-in-logs` — Sensitive Data Masking in Logs
