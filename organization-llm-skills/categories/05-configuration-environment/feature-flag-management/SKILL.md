---
name: feature-flag-management
description: Use when adding, rolling out or removing runtime toggles - environment boolean flags (dual-read migration, outbox enable, worker enable, channel enable, debug routes), naming, defaults and lifecycle. No flag service exists.
---

# Feature Flag Management

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `feature-flag-management` |
| Category | 05 — Configuration & Environment Management |
| Scope | Environment-based feature flags and operational toggles. |
| Applicability | Node services. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (CFG-06) |
| Governing standards | `CFG-06`, `CFG-05`, `API-08` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `optional-environment-variables`, `api-versioning`, `outbox-pattern`, `environment-specific-configuration` |

## Purpose
Reversible, explicit rollout controls.

## When to use
- Rolling out risky behaviour.
- Enabling workers/channels.

## Organizational standards
- **MANDATORY:** Flags are environment variables read through one accessor (`isDualReadEnabled()`), parsed strictly (`"true"` only), default **off** (safe/legacy), documented in `.env.example` with purpose and removal condition.
- **Verified convention:** Examples: `FEATURE_DUAL_READ`, `USAGE_EVENT_OUTBOX_ENABLED`, `USAGE_EVENT_OUTBOX_WORKER_ENABLED`, `NOTIFICATION_{EMAIL,PORTAL,WHATSAPP,WEBHOOK}_ENABLED`, `WEBHOOK_DELIVERY_WORKER_ENABLED`, `DEBUG_ROUTES_ENABLED`, `ENFORCEMENT_DEFAULT`.
- **MANDATORY:** Debug/diagnostic routes behind a flag are also behind authentication (`debug-route-auth`) and never enabled in production by default.
- **Generic baseline (provisional):** Record owner and removal date in the flag's comment; delete flags after rollout.
- **MANDATORY:** Do not introduce a third-party flag service without approval.

_Source of truth: `CFG-06`, `CFG-05`, `API-08`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add accessor + default off + docs; gate code paths; log the active flag state at startup (without secrets).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Accessor**

```ts
export const isDualReadEnabled = () => (process.env.FEATURE_DUAL_READ ?? "false").toLowerCase() === "true";
```

## Error and failure handling
- Flag read errors cannot occur; accessor is total.
- Invalid required configuration stops startup with an aggregated, secret-free message (CFG-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Secrets only from environment/secret store; never log values; fail closed when a required secret is missing outside local/dev (CFG-04).

## Testing guidelines
- On/off paths both covered.
- Test valid, missing, malformed and environment-specific configurations; reset any memoized config between tests.

## Anti-patterns
- Flags that change security posture.
- Permanent flags.

## Implementation checklist
- [ ] Default off; documented; both paths tested; removal planned.

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
- Flags are environment variables read through one accessor (`isDualReadEnabled()`), parsed strictly (`"true"` only), default **off** (safe/legacy), documented in `.env.example` with purpose and removal condition.
- Debug/diagnostic routes behind a flag are also behind authentication (`debug-route-auth`) and never enabled in production by default.
- Do not introduce a third-party flag service without approval.

## Related skills
- `optional-environment-variables` — Optional Environment Variables
- `api-versioning` — API Versioning
- `outbox-pattern` — Outbox Pattern
- `environment-specific-configuration` — Environment-Specific Configuration
