---
name: external-dependency-configuration
description: Use when adding configuration for an external dependency - base URL, timeout, credentials/scope, enable flag, cache TTLs, stale windows - naming, defaults, validation and documentation.
---

# External Dependency Configuration

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `external-dependency-configuration` |
| Category | 09 — Cloud Storage & External Integrations |
| Scope | Config keys for each external dependency. |
| Applicability | Node services. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (CFG-01, CFG-05, INT-01) |
| Governing standards | `CFG-01`, `CFG-02`, `CFG-05`, `INT-01`, `RES-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `required-environment-variables`, `optional-environment-variables`, `external-api-client`, `startup-dependency-validation`, `configuration-management` |

## Purpose
Every dependency is configurable, bounded and documented.

## When to use
- Adding a dependency.

## Organizational standards
- **MANDATORY:** Group by prefix: `<DEP>_BASE_URL` (required if mandatory), `<DEP>_TIMEOUT_MS` (default 5000), `<DEP>_INTERNAL_API_KEY`/`INTERNAL_API_KEY_<CALLER>`, `AZURE_SERVICE_OAUTH_SCOPE` (when Entra-protected), cache `*_CACHE_TTL_MS`, `*_STALE_MAX_MS`, `*_MAX_ENTRIES`.
- **MANDATORY:** URL trailing slashes normalized; product prefix included in the base URL when applicable (`DEP_BASE_URL=https://host/<product>`).
- **MANDATORY:** Document in `.env.example` and README; mandatory dependencies validated at startup.

_Source of truth: `CFG-01`, `CFG-02`, `CFG-05`, `INT-01`, `RES-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add keys with defaults and bounds; add readiness/startup checks.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**.env.example block**

```text
CONFIG_SERVICE_BASE_URL=http://localhost:3000   # REQUIRED
CONFIG_SERVICE_TIMEOUT_MS=5000
SUBSCRIPTION_CACHE_TTL_MS=30000
SUBSCRIPTION_CACHE_STALE_MAX_MS=...
```

## Error and failure handling
- Missing mandatory -> startup failure.
- Distinguish confirmed absence from unavailability; never treat an unavailable dependency as empty data (ERR-09).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Outbound calls carry only the identity and correlation headers defined in CTX-02; validate any client-supplied URL with the SSRF guard (INT-03).

## Testing guidelines
- Config parsing tests.
- Mock the HTTP/SDK client; cover 2xx, confirmed-absent (404), 4xx, 5xx, timeout and token-acquisition failure.

## Anti-patterns
- Hard-coded URLs.

## Implementation checklist
- [ ] Prefix; defaults; docs; validated.

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
- Group by prefix: `<DEP>_BASE_URL` (required if mandatory), `<DEP>_TIMEOUT_MS` (default 5000), `<DEP>_INTERNAL_API_KEY`/`INTERNAL_API_KEY_<CALLER>`, `AZURE_SERVICE_OAUTH_SCOPE` (when Entra-protected), cache `*_CACHE_TTL_MS`, `*_STALE_MAX_MS`, `*_MAX_ENTRIES`.
- URL trailing slashes normalized; product prefix included in the base URL when applicable (`DEP_BASE_URL=https://host/<product>`).
- Document in `.env.example` and README; mandatory dependencies validated at startup.

## Related skills
- `required-environment-variables` — Required Environment Variables
- `optional-environment-variables` — Optional Environment Variables
- `external-api-client` — External API Client
- `startup-dependency-validation` — Startup Dependency Validation
- `configuration-management` — Configuration Management
