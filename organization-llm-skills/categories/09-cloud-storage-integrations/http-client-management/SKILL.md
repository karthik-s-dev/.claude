---
name: http-client-management
description: Use when creating, sharing, configuring or testing axios (or other HTTP) client instances - singleton per dependency, base URL and timeout from config, interceptors, no global defaults, connection reuse, reset for tests.
---

# HTTP Client Management

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `http-client-management` |
| Category | 09 — Cloud Storage & External Integrations |
| Scope | HTTP client instances. |
| Applicability | Node.js axios. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (INT-01) / C-16 |
| Governing standards | `INT-01`, `CFG-05`, `ARCH-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `external-api-client`, `resilient-http-communication`, `timeout-management`, `mocking-test-doubles`, `request-header-management` |

## Purpose
Predictable shared clients.

## When to use
- Adding a dependency client; changing interceptors.

## Organizational standards
- **MANDATORY:** One shared instance per dependency; `baseURL`, `timeout` and default headers from the config module; interceptors for auth/correlation (not per-call code).
- **MANDATORY:** Do not mutate global `axios.defaults`; do not create a client per request (note: a reference notification module uses per-call `axios.post` with a 10 s timeout - acceptable for one-off best-effort calls, not for the main path; C-16).
- **MANDATORY:** Provide `__resetXClientForTests()` to drop the instance so interceptors/env re-apply.
- **Generic baseline (provisional):** Reuse keep-alive agents for high-throughput clients.

_Source of truth: `INT-01`, `CFG-05`, `ARCH-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Follow `external-api-client` template.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Reset hook**

```ts
export function __resetDependencyClientForTests(): void { client = null; }
```

## Error and failure handling
- See `external-api-client`.
- Distinguish confirmed absence from unavailability; never treat an unavailable dependency as empty data (ERR-09).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Outbound calls carry only the identity and correlation headers defined in CTX-02; validate any client-supplied URL with the SSRF guard (INT-03).

## Testing guidelines
- Interceptor unit tests.
- Mock the HTTP/SDK client; cover 2xx, confirmed-absent (404), 4xx, 5xx, timeout and token-acquisition failure.

## Anti-patterns
- `axios.get(url)` bare.

## Implementation checklist
- [ ] Singleton; config; interceptors; reset.

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
- One shared instance per dependency; `baseURL`, `timeout` and default headers from the config module; interceptors for auth/correlation (not per-call code).
- Do not mutate global `axios.defaults`; do not create a client per request (note: a reference notification module uses per-call `axios.post` with a 10 s timeout - acceptable for one-off best-effort calls, not for the main path; C-16).
- Provide `__resetXClientForTests()` to drop the instance so interceptors/env re-apply.

## Related skills
- `external-api-client` — External API Client
- `resilient-http-communication` — Resilient HTTP Communication
- `timeout-management` — Timeout Management
- `mocking-test-doubles` — Mocking & Test Doubles
- `request-header-management` — Request Header Management
