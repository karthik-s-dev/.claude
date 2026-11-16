---
name: health-endpoint-implementation
description: Use when adding or changing health endpoints - /health/live and /health/ready, dependency-aware readiness with per-check timeouts and sanitized output, status codes, auth/rate-limit exclusion and container health checks.
---

# Health Endpoint Implementation

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `health-endpoint-implementation` |
| Category | 06 — Observability & Health Management |
| Scope | Health endpoint contract and implementation. |
| Applicability | Express services. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (OBS-04) / UNRESOLVED (C-15) |
| Governing standards | `OBS-04`, `ARCH-05`, `API-10` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `liveness-readiness-checks`, `startup-dependency-validation`, `dependency-failure-handling`, `middleware-request-pipeline`, `graceful-shutdown` |

## Purpose
Orchestrators route traffic correctly and restart only when needed.

## When to use
- New service.
- Adding a dependency.
- Diagnosing restart loops or traffic to unready pods.

## Organizational standards
- **MANDATORY:** Two endpoints: `GET /health/live` (process only, no I/O: `{status:"ok", uptime, timestamp, metadata:{correlationId}}`) and `GET /health/ready` (parallel dependency pings -> 200 when none `error`, else **503**; body `status`, `uptime`, `timestamp`, `dependencies:[{ name, status: ok|error|skipped, responseTimeMs, message? }]`, `metadata.correlationId`).
- **MANDATORY:** Probes are unauthenticated, not rate-limited, mounted before auth, unversioned; logged at `debug`.
- **MANDATORY:** Each check has an explicit bounded timeout and returns a sanitized message (never raw exception text, URIs or secrets).
- **MANDATORY:** Readiness includes only dependencies the service cannot serve traffic without (datastore, cache if required); do **not** include upstream services (cascading-unready risk; reference defect) and do not duplicate startup env validation at runtime.
- **DECIDED (C-15, approved 2026-11-16):** Approved: new services expose /health/live and /health/ready. _Earlier note (superseded where it conflicts):_ The other reference service exposes `/health` and `/v2/health` returning `ok|degraded|unavailable` with `dependencies:{redis,mongo,serviceBus:{ok,detail}}` and deployment policy fields, and the Dockerfile `HEALTHCHECK` targets `/health`. In that repo keep it; new services use live/ready. Do not expose policy fields (`enforcementDefault`, etc.) on unauthenticated probes.
- **Verified convention:** Optional dependency not configured -> `status:"skipped"` and does not fail readiness.

_Source of truth: `OBS-04`, `ARCH-05`, `API-10`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Implement `live` and `ready` handlers wrapped with `withCorrelationId`.
2. Run checks with `Promise.all` and per-check timeout (`Promise.race`).
3. Wire container `HEALTHCHECK` to `/health/live`.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Readiness core (reference, with timeout added)**

```ts
const withTimeout = <T>(p: Promise<T>, ms: number) => Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
const results = await Promise.all([checkMongo(), checkRedis()]);
const allOk = results.every((d) => d.status !== "error");
res.status(allOk ? 200 : 503).json({ status: allOk ? "ok" : "error", uptime, timestamp: new Date().toISOString(), dependencies: results, metadata: { correlationId } });
```

## Error and failure handling
- A throwing check yields `status:"error"` with a generic message; the handler itself never throws.
- Observability code must never throw into the request path; failures degrade to no-op with a warning (OBS-05).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Expose no hostnames, versions or config values.
- Mask sensitive fields with the shared mask configuration before logging or exporting telemetry (OBS-03); never log request bodies on the error path.

## Testing guidelines
- All ok -> 200; one error -> 503; skipped dependency; slow dependency -> timeout.
- Mock `@inextlabs/logger` per the shared test-double pattern (TEST-02) and assert level, message and structured fields; assert no secret/PII values are emitted.

## Anti-patterns
- Calling remote services in readiness.
- Logging every probe at info.
- Authenticated probes.

## Implementation checklist
- [ ] live/ready; timeouts; sanitized; unauthenticated; Docker/pipeline probes updated.

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
- Two endpoints: `GET /health/live` (process only, no I/O: `{status:"ok", uptime, timestamp, metadata:{correlationId}}`) and `GET /health/ready` (parallel dependency pings -> 200 when none `error`, else **503**; body `status`, `uptime`, `timestamp`, `dependencies:[{ name, status: ok|error|skipped, responseTimeMs, message? }]`, `metadata.correlationId`).
- Probes are unauthenticated, not rate-limited, mounted before auth, unversioned; logged at `debug`.
- Each check has an explicit bounded timeout and returns a sanitized message (never raw exception text, URIs or secrets).
- Readiness includes only dependencies the service cannot serve traffic without (datastore, cache if required); do **not** include upstream services (cascading-unready risk; reference defect) and do not duplicate startup env validation at runtime.

## Related skills
- `liveness-readiness-checks` — Liveness & Readiness Checks
- `startup-dependency-validation` — Startup Dependency Validation
- `dependency-failure-handling` — Dependency Failure Handling
- `middleware-request-pipeline` — Middleware & Request Pipeline
- `graceful-shutdown` — Graceful Shutdown
