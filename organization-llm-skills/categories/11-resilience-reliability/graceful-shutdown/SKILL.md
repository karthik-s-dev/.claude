---
name: graceful-shutdown
description: Use when handling SIGTERM/SIGINT - stop workers, stop accepting connections, drain in-flight requests with a bound, close dependencies, flush logs, then exit. Corrects the reference order (both close dependencies before the server drains).
---

# Graceful Shutdown

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `graceful-shutdown` |
| Category | 11 — Resilience & Reliability |
| Scope | Shutdown sequence. |
| Applicability | Node HTTP services in containers. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (ARCH-03) with defects in both repos (C-22) |
| Governing standards | `ARCH-03`, `RES-04`, `MSG-07`, `OBS-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `service-registration-lifecycle`, `background-worker-processing`, `logger-initialization`, `database-connection-management`, `liveness-readiness-checks` |

## Purpose
No dropped requests or lost logs on deploy.

## When to use
- Editing shutdown code; investigating errors on deploy.

## Organizational standards
- **MANDATORY order:** (1) set shutting-down flag (readiness 503), (2) `stopXWorker()` for all workers, (3) `server.close(cb)` **awaited** with a bounded timeout (`unref`ed), (4) close dependencies (`closeRedis`, `closeMongo`, `closeServiceBus`, ...), (5) `closeLogger()`, (6) `process.exit(0)`; second signal or timeout -> exit(1).
- **MANDATORY:** Register handlers for both SIGTERM and SIGINT; use `dumb-init` as PID 1 in containers (`docker-containerization`).
- **MANDATORY:** Each close is wrapped `.catch(warn)` so one failure doesn't block the rest.
- **Verified convention defects:** reference service A closes Redis/Mongo/logger **before** `server.close()`; reference service B calls `server.close()` without awaiting and then closes clients.

_Source of truth: `ARCH-03`, `RES-04`, `MSG-07`, `OBS-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Use the skeleton in `service-registration-lifecycle`.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Drain helper**

```ts
const drain = (server: http.Server, ms: number) => new Promise<void>((resolve) => { const t = setTimeout(resolve, ms).unref(); server.close(() => { clearTimeout(t); resolve(); }); });
```

## Error and failure handling
- Timeout exceeded -> log `warn` and continue closing.
- Decide fail-open vs fail-closed explicitly per dependency and document it (INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Resilience mechanisms must not bypass authentication or leak internal detail when degrading.

## Testing guidelines
- Mock server/clients; assert order.
- Use fake timers/forced failures to test timeout, retry exhaustion, breaker open/half-open, fallback and shutdown ordering.

## Anti-patterns
- Closing DB first.
- `process.exit` immediately.

## Implementation checklist
- [ ] Order; bounded; both signals.

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
- (1) set shutting-down flag (readiness 503), (2) `stopXWorker()` for all workers, (3) `server.close(cb)` **awaited** with a bounded timeout (`unref`ed), (4) close dependencies (`closeRedis`, `closeMongo`, `closeServiceBus`, ...), (5) `closeLogger()`, (6) `process.exit(0)`; second signal or timeout -> exit(1).
- Register handlers for both SIGTERM and SIGINT; use `dumb-init` as PID 1 in containers (`docker-containerization`).
- Each close is wrapped `.catch(warn)` so one failure doesn't block the rest.

## Related skills
- `service-registration-lifecycle` — Service Registration & Lifecycle
- `background-worker-processing` — Background Worker Processing
- `logger-initialization` — Logger Initialization
- `database-connection-management` — Database Connection Management
- `liveness-readiness-checks` — Liveness & Readiness Checks
