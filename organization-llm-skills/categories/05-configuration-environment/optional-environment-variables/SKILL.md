---
name: optional-environment-variables
description: Use when adding tunables (timeouts, pool sizes, TTLs, batch sizes, poll intervals), optional integrations or toggles - safe explicit defaults, strict validation of supplied values, disabled-vs-misconfigured semantics.
---

# Optional Environment Variables

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `optional-environment-variables` |
| Category | 05 — Configuration & Environment Management |
| Scope | Optional environment variables and their defaults. |
| Applicability | Node services. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (CFG-05, CFG-06) |
| Governing standards | `CFG-05`, `CFG-06`, `CFG-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `configuration-defaults`, `feature-flag-management`, `configuration-validation`, `required-environment-variables` |

## Purpose
Operators can tune behaviour without code changes while invalid values are rejected rather than silently ignored.

## When to use
- Adding a timeout/TTL/limit.
- Making an integration optional.

## Organizational standards
- **MANDATORY:** Defaults are explicit in code, mirrored in `.env.example` (commented `# NAME=default` or with value), and documented by units in the name (`_MS`, `_SECONDS`, `_DAYS`).
- **MANDATORY:** A supplied optional value is parsed and range-checked (`getEnvInt`/Zod coerce with min/max); a present-but-invalid value fails startup or falls back with a `warn` per the service's helper - never silently becomes `NaN`.
- **MANDATORY:** An optional integration is **disabled** when its variable group is absent and **misconfigured** (startup error) when partially present (for example secret without URL).
- **Verified convention:** Examples - `CONFIG_SERVICE_TIMEOUT_MS=5000`, `REDIS_COMMAND_TIMEOUT_MS`, `RATE_LIMIT_STANDARD_PER_MIN=300`, `RATE_LIMIT_ADMIN_PER_MIN=5`, `USAGE_EVENT_OUTBOX_MAX_ATTEMPTS`, `WEBHOOK_DELIVERY_MAX_ATTEMPTS`, `MONGO_MAX_POOL_SIZE=50`, `LOG_LEVEL=info`.
- **MANDATORY:** Do not hard-code values that operators need to tune (reference defect: Redis 150 ms command timeout and breaker thresholds).

_Source of truth: `CFG-05`, `CFG-06`, `CFG-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Choose name with prefix and unit; set default; add validation bounds; document.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Typed helper (reference style)**

```ts
function getEnvInt(name: string, def: number, min = 0): number {
  const raw = process.env[name]?.trim(); if (!raw) return def;
  const n = Number(raw); if (!Number.isInteger(n) || n < min) throw new Error(name + " must be an integer >= " + min);
  return n;
}
const timeoutMs = getEnvInt("CONFIG_SERVICE_TIMEOUT_MS", 5000, 1);
```

## Error and failure handling
- Invalid optional value: fail startup (preferred) or documented fallback with `warn`.
- Invalid required configuration stops startup with an aggregated, secret-free message (CFG-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Secrets only from environment/secret store; never log values; fail closed when a required secret is missing outside local/dev (CFG-04).

## Testing guidelines
- Default, valid override, invalid, boundary.
- Test valid, missing, malformed and environment-specific configurations; reset any memoized config between tests.

## Anti-patterns
- `parseInt(process.env.X)` without NaN check.
- Booleans via truthiness (`"false"` is truthy).

## Implementation checklist
- [ ] Name/unit; default; validation; docs.

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
- Defaults are explicit in code, mirrored in `.env.example` (commented `# NAME=default` or with value), and documented by units in the name (`_MS`, `_SECONDS`, `_DAYS`).
- A supplied optional value is parsed and range-checked (`getEnvInt`/Zod coerce with min/max); a present-but-invalid value fails startup or falls back with a `warn` per the service's helper - never silently becomes `NaN`.
- An optional integration is **disabled** when its variable group is absent and **misconfigured** (startup error) when partially present (for example secret without URL).
- Do not hard-code values that operators need to tune (reference defect: Redis 150 ms command timeout and breaker thresholds).

## Related skills
- `configuration-defaults` — Configuration Defaults
- `feature-flag-management` — Feature Flag Management
- `configuration-validation` — Configuration Validation
- `required-environment-variables` — Required Environment Variables
