---
name: startup-dependency-validation
description: Use when a service should verify its critical dependencies are reachable before listening - Redis ping, Mongo ping, upstream reachability, queue provisioning, broker connectivity - and refuse to start with actionable messages.
---

# Startup Dependency Validation

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `startup-dependency-validation` |
| Category | 05 — Configuration & Environment Management |
| Scope | Reachability checks at boot. |
| Applicability | Node services. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (CFG-02, ARCH-03) single repo |
| Governing standards | `CFG-02`, `ARCH-03`, `OBS-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `configuration-validation`, `service-registration-lifecycle`, `liveness-readiness-checks`, `dependency-failure-handling`, `health-endpoint-implementation` |

## Purpose
Detect misconfigured infrastructure at deploy time instead of at first request.

## When to use
- Adding a mandatory dependency.
- Diagnosing crash loops after deploy.

## Organizational standards
- **MANDATORY:** `validateStartup()` runs after config validation and before `listen`; it checks each **mandatory** dependency with a bounded timeout and collects errors; any error -> log all with remediation hints and `process.exit(1)`.
- **MANDATORY:** Distinguish connection failures (fail) from "reachable but unexpected status" (warn): the reference accepts any HTTP status from the upstream health URL and fails only on `ECONNREFUSED/ETIMEDOUT/ENOTFOUND`.
- **MANDATORY:** Optional dependencies (non-mandatory broker, notifications) warn, do not block (`SERVICE_BUS_MANDATORY`).
- **Verified convention:** Hints name the variables to check (`REDIS_HOST_NAME`, `REDIS_ACCESS_KEY`, `CONFIG_SERVICE_BASE_URL`); queue existence is ensured at startup and marked ready (`markThresholdJobsQueueReady`).
- **Generic baseline (provisional):** Do not put upstream *services* in readiness probes (cascade risk) - startup validation is the place for them.

_Source of truth: `CFG-02`, `ARCH-03`, `OBS-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Collect errors in an array; ping Redis (`PING` -> `PONG`), Mongo (`ping` command), broker (create sender), queue (create-if-missing).
2. Log summary; exit non-zero on any mandatory failure.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Collect-then-fail**

```ts
const errors: string[] = [];
try { if ((await getRedis().ping()) !== "PONG") errors.push("Redis: unexpected ping response. Check REDIS_HOST_NAME, REDIS_PORT, REDIS_ACCESS_KEY"); }
catch (e) { errors.push("Redis: connection failed - " + (e as Error).message); }
if (errors.length) { logger.error({ errorCount: errors.length, errors }, "Startup validation failed"); process.exit(1); }
```

## Error and failure handling
- Startup validation failure exits(1) so the orchestrator restarts/rolls back.
- Invalid required configuration stops startup with an aggregated, secret-free message (CFG-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Error strings must not include credentials or full URIs (mask).
- Secrets only from environment/secret store; never log values; fail closed when a required secret is missing outside local/dev (CFG-04).

## Testing guidelines
- Each dependency failing; optional dependency failing; success path.
- Test valid, missing, malformed and environment-specific configurations; reset any memoized config between tests.

## Anti-patterns
- Validation after `listen`.
- Failing on non-2xx from a service without a health route.
- Logging connection strings.

## Implementation checklist
- [ ] Mandatory vs optional; timeouts; hints; exit code; masked.

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
- `validateStartup()` runs after config validation and before `listen`; it checks each **mandatory** dependency with a bounded timeout and collects errors; any error -> log all with remediation hints and `process.exit(1)`.
- Distinguish connection failures (fail) from "reachable but unexpected status" (warn): the reference accepts any HTTP status from the upstream health URL and fails only on `ECONNREFUSED/ETIMEDOUT/ENOTFOUND`.
- Optional dependencies (non-mandatory broker, notifications) warn, do not block (`SERVICE_BUS_MANDATORY`).

## Related skills
- `configuration-validation` — Configuration Validation
- `service-registration-lifecycle` — Service Registration & Lifecycle
- `liveness-readiness-checks` — Liveness & Readiness Checks
- `dependency-failure-handling` — Dependency Failure Handling
- `health-endpoint-implementation` — Health Endpoint Implementation
