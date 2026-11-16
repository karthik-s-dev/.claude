# Observability Standards (domain view)

IDs: OBS-01..07, CTX-01/05, ERR-06.

## Logging (OBS-01/02) — `@inextlabs/logger` only
- Configure once **before** importing modules that log: `configureLogger({ level, service, serviceCode, environment, mask })` (A) or `createLogger({...})` instance (B).
- Pino order `(obj|Error, msg)`; Error → `err` via `serializeError`; levels trace/debug/info/warn/error/fatal.
- Wrapper adds `correlationId` from AsyncLocalStorage; request lifecycle logs with `method,path,statusCode,durationMs`; level by status; error path logs route metadata only.
- Flush with `close()` at shutdown.
- Never: `console.*`, `pino`/`winston`/`bunyan`, any other logger, `(msg, meta)` order in new code.

## Masking (OBS-03)
Extend the 19 default fields with service fields (`emailId`, `phoneNumber`, `key`, `endpoint`, `connectionString`, `conn_str`); reuse for telemetry and audit; `maskConnectionUri`, `maskApiKeyForLog`.

## Health (OBS-04)
`/health/live` (no I/O), `/health/ready` (critical dependencies, per-check timeout, sanitized, 503) — unauthenticated, unversioned. B's single `/health` is a recorded deviation (C-15).

## Tracing/APM (OBS-05, CTX-05)
App Insights SDK with W3C (A) or OTEL via `initOtelLogging` (B) — C-10. Trace ID ≠ correlation ID. Telemetry is no-op when unconfigured and masked before export.

## Audit (OBS-07)
Non-blocking, masked before/after diff with a real actor, TTL.

## Not evidenced (GENERIC)
Metrics endpoint/collection, operational alerts, dashboards (OBS-06).

Skills: `structured-logging`, `logger-initialization`, `log-level-standards`, `sensitive-data-masking-in-logs`, `health-endpoint-implementation`, `liveness-readiness-checks`, `distributed-tracing`, `opentelemetry-integration`, `audit-logging`, `application-monitoring`, `metrics-collection`, `alerting-standards`.
