---
name: service-registration-lifecycle
description: Use when writing or changing a service's bootstrap, startup validation, dependency connection, worker start/stop, signal handling or shutdown. Enforces the organization's boot order (validate config, configure logger, crash handlers, telemetry, connect, workers, listen) and correct shutdown order.
---

# Service Registration & Lifecycle

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `service-registration-lifecycle` |
| Category | 01 — Microservice Architecture & Foundations |
| Scope | Process lifecycle from first line to exit. |
| Applicability | Node/TypeScript services. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (ARCH-03), defects documented |
| Governing standards | `ARCH-03`, `RES-04`, `CFG-02`, `OBS-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `graceful-shutdown`, `fatal-error-process-policy`, `startup-dependency-validation`, `logger-initialization`, `configuration-validation`, `background-worker-processing` |

## Purpose
Guarantees that misconfiguration stops the process early, logging is configured before any module logs, and shutdown drains requests and flushes logs without losing work.

## When to use
- Creating or editing `server.ts`/`index.ts`.
- Adding a worker, client, or dependency that must connect at start and close at stop.
- Diagnosing restart loops, dropped requests at deploy, or lost logs.

## Organizational standards
- **MANDATORY:** Order: load env -> validate config (before importing `app`) -> configure logger (before modules that log are imported) -> register fatal-error handlers -> init telemetry -> connect datastores -> start workers -> `listen` (ARCH-03).
- **MANDATORY:** Shutdown order: stop workers -> stop accepting connections and drain HTTP with a bounded timeout -> close dependencies -> flush/close logger -> exit. Both reference repos get this wrong (C-22); do not copy.
- **MANDATORY:** Every started worker/client has a matching stop/close registered for SIGTERM and SIGINT.
- **Verified convention:** Fire-and-forget index creation is logged on failure; treat failure as a degraded-start warning and see `database-indexing`.
- **Verified convention:** B-style services also run dependency reachability checks at start and exit(1) on failure (`startup-dependency-validation`).

_Source of truth: `ARCH-03`, `RES-04`, `CFG-02`, `OBS-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Import `dotenv` config first; call config validation, then `initLogger()`, then `require`/import the app.
2. Register `uncaughtException`/`unhandledRejection` handlers (`fatal-error-process-policy`).
3. Start dependencies; start workers only after dependencies are connected.
4. In the signal handler: set a `shuttingDown` flag, stop workers, `await new Promise(res => server.close(res))` with a timeout, close clients, `await closeLogger()`, `process.exit(0)`.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Boot and shutdown skeleton**

```ts
import { config as loadEnv } from "dotenv"; loadEnv();
import http from "http";
import { validateEnv } from "./<feature>/utils/env.schema";
import { initLogger } from "./general/service/logger.bootstrap";
validateEnv();            // 1. fail fast, before importing app
initLogger();             // 2. configure @inextlabs/logger before anything logs
async function start() {
  const { default: app } = await import("./app");   // 3. import app only now
  initTelemetry(); await connectDatastores(); startWorkers();
  const server = http.createServer(app).listen(PORT);
  const shutdown = async (sig: string) => {
    logger.info({ sig }, "Shutting down");
    stopWorkers();
    await new Promise<void>((r) => { const t = setTimeout(r, 10_000).unref(); server.close(() => { clearTimeout(t); r(); }); });
    await closeDatastores(); await closeLogger(); process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM")); process.on("SIGINT", () => void shutdown("SIGINT"));
}
void start().catch((err) => { logger.error(err, "Startup error"); process.exit(1); });
```

## Error and failure handling
- Startup error -> log with `logger.error(err, msg)` and exit(1); shutdown errors are logged and do not block exit.
- Bootstrap failures must stop the process with a non-zero exit and a secret-free log (ARCH-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Do not log configuration values at startup; log which keys are missing.
- Never place secrets, tokens or connection strings in source, logs, examples or fixtures (CFG-07, OBS-03).

## Testing guidelines
- Test the order via mocks (config validated before app import) and that `close*` functions are invoked on shutdown.
- Where import-boundary/lint tooling exists, enforce layer rules in CI; otherwise add an architecture test or review-checklist item for each rule.

## Anti-patterns
- Importing `app` (and thus loggers) before `configureLogger`.
- Closing dependencies before draining HTTP.
- Starting workers before dependencies are connected.
- Un-awaited `server.close()`.

## Implementation checklist
- [ ] Boot order matches; workers have stop; shutdown awaited; logger flushed.

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
- Order: load env -> validate config (before importing `app`) -> configure logger (before modules that log are imported) -> register fatal-error handlers -> init telemetry -> connect datastores -> start workers -> `listen` (ARCH-03).
- Shutdown order: stop workers -> stop accepting connections and drain HTTP with a bounded timeout -> close dependencies -> flush/close logger -> exit. Both reference repos get this wrong (C-22); do not copy.
- Every started worker/client has a matching stop/close registered for SIGTERM and SIGINT.

## Related skills
- `graceful-shutdown` — Graceful Shutdown
- `fatal-error-process-policy` — Fatal Error Process Policy
- `startup-dependency-validation` — Startup Dependency Validation
- `logger-initialization` — Logger Initialization
- `configuration-validation` — Configuration Validation
- `background-worker-processing` — Background Worker Processing
