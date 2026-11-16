---
name: background-worker-processing
description: Use when adding any in-process background loop (outbox publisher, queue consumer, delivery worker, sweep) - start/stop functions, setInterval with immediate first run, running flag, per-batch try/catch, env enable/poll/batch, shutdown order.
---

# Background Worker Processing

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `background-worker-processing` |
| Category | 08 — Messaging & Event-Driven Architecture |
| Scope | In-process worker lifecycle. |
| Applicability | Node services. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (MSG-07) |
| Governing standards | `MSG-07`, `ARCH-03`, `CFG-06`, `RES-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `outbox-pattern`, `message-consumer`, `scheduled-job-reconciliation`, `graceful-shutdown`, `service-registration-lifecycle`, `bounded-concurrency` |

## Purpose
Workers that never overlap, never crash the process, and stop cleanly.

## When to use
- Any polling/sweep logic.

## Organizational standards
- **MANDATORY:** Export `startXWorker()` / `stopXWorker()`; enabled by `X_WORKER_ENABLED` and the feature flag; interval from `X_WORKER_POLL_MS`; batch from `X_WORKER_BATCH_SIZE`; log started/disabled with settings.
- **MANDATORY:** Module-level `timer` and `running` guard; `processBatch()` returns immediately if `running`; always `finally { running = false }`; whole batch in try/catch and per item try/catch.
- **MANDATORY:** First run immediately (`void processBatch()`), then interval; `unref()` timers when they must not block exit.
- **MANDATORY:** Stopped first during shutdown; wait for the in-flight batch when feasible.
- **Generic baseline (provisional):** Bind a fresh correlation ID per tick.

_Source of truth: `MSG-07`, `ARCH-03`, `CFG-06`, `RES-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Copy the skeleton; add metrics logs; add tests with fake timers.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Skeleton (reference)**

```ts
let timer: ReturnType<typeof setInterval> | null = null; let running = false;
async function processBatch() { if (running || !config.worker.enabled) return; running = true;
  try { for (const item of await fetchPending(config.worker.batch)) { try { await handle(item); } catch (err) { logger.warn({ id: item.id, err: serializeError(err) }, "Item failed"); } } }
  catch (err) { logger.error(err, "Worker batch error"); } finally { running = false; } }
export function startWorker() { if (timer || !config.worker.enabled) return; timer = setInterval(() => void processBatch(), config.worker.pollMs); void processBatch(); }
export function stopWorker() { if (timer) { clearInterval(timer); timer = null; } }
```

## Error and failure handling
- Errors logged and counted; loop continues.
- A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing.

## Testing guidelines
- Fake timers: no overlap; stop prevents ticks; batch error does not kill loop.
- Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths.

## Anti-patterns
- `while(true)` loops.
- Unhandled promise in interval.

## Implementation checklist
- [ ] start/stop; guard; flags; shutdown.

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
- Export `startXWorker()` / `stopXWorker()`; enabled by `X_WORKER_ENABLED` and the feature flag; interval from `X_WORKER_POLL_MS`; batch from `X_WORKER_BATCH_SIZE`; log started/disabled with settings.
- Module-level `timer` and `running` guard; `processBatch()` returns immediately if `running`; always `finally { running = false }`; whole batch in try/catch and per item try/catch.
- First run immediately (`void processBatch()`), then interval; `unref()` timers when they must not block exit.
- Stopped first during shutdown; wait for the in-flight batch when feasible.

## Related skills
- `outbox-pattern` — Outbox Pattern
- `message-consumer` — Message Consumer
- `scheduled-job-reconciliation` — Scheduled Job & Reconciliation
- `graceful-shutdown` — Graceful Shutdown
- `service-registration-lifecycle` — Service Registration & Lifecycle
- `bounded-concurrency` — Bounded Concurrency
