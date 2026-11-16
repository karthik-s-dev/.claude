# Repository Analysis (Deliverable 1)

Analysis date: 2026-11-14. Method: direct source inspection of both repositories and of the installed `@inextlabs/*` packages in their `node_modules` (type declarations / README / small source packages). Neither repository was modified. `.env` files exist in both working trees (git-ignored); they were **not read**, only the committed `.env.example` files were.

## 1. Inventory

| Attribute | Reference A: `inflow-config-service-repo` | Reference B: `inflow-usage-enforcement-service` |
|---|---|---|
| Business role | Source of truth for client/bot configuration + subscription cache; notifies enforcement on subscription change | Checks subscription validity and usage limits; records usage; publishes usage events; threshold notifications |
| Language / runtime | TypeScript 5.4, Node 20 (Dockerfile `node:20-alpine`), CommonJS, ES2020 | TypeScript 5.6, Node 22 (Dockerfile `node:22-alpine`), CommonJS |
| Web framework | Express 4 | Express 4 |
| Entry points | `src/server.ts` (bootstrap) + `src/app.ts` (composition root) | `src/index.ts` (bootstrap + composition in one file) |
| Package manager | npm lockfile present; `packageManager: pnpm@10` declared (inconsistent) | npm |
| Module layout | `src/general/` (shared infra) + `src/v1/` (legacy) + `src/v2/` (standard) + `src/products/<product>/`; path aliases (`@general/*`, `@servicesv2/*` …) | Flat `src/*.ts` modules + `src/v2/`, `src/middleware/`, `src/services/`, `src/pricing/`, `src/llm/`, `src/reconciler/`, `src/test-harness/`; relative imports, no aliases |
| Validation | Zod schemas + `validate(schema, segment)` middleware | Hand-written validation, `V2Errors.*` |
| MongoDB | `mongoose` 8 + `@inextlabs/schema-models`; per-tenant DB connections cached in a `Map` | native `mongodb` 6 driver; module-level `MongoClient` singletons per repository |
| Redis | `ioredis` 5; Azure TLS; fail-fast options + circuit breaker + `safe*` wrappers; locks | `ioredis` 5; Azure TLS; `keyPrefix`; counters, idempotency, pricing L2 cache, reconcile lock |
| Messaging | none (HTTP webhooks out; Mongo outbox) | `@azure/service-bus` (topic publisher), `@azure/storage-queue` (3 queues), Mongo outbox + workers |
| Auth | `@inextlabs/azure-oauth` `validateAuthToken()` (Entra JWT) on v2 routes; internal API key; webhook HMAC | custom `jose` JWKS verification + client-claim binding; internal API-key registry; outbound `generateAuthToken()` (Managed Identity) |
| Observability | `@inextlabs/logger`; `applicationinsights` SDK (W3C); `/health/live` + `/health/ready` | `@inextlabs/logger` + `@inextlabs/inflow-usage-utils` `initOtelLogging` (OTEL); `/health`, `/v2/health` |
| Testing | Jest 29 + ts-jest + supertest (unused); `test/` tree; manual package mocks | Vitest 4; colocated `*.test.ts`; `*.integration.test.ts`, `e2e/`; in-memory Redis/Mongo/Service Bus doubles; Postman collections |
| CI/CD | Azure Pipelines `devtest`/`stg`/`prod` (UnitTest → Build; prod adds scans); GitHub `validate-pr.yml` | Azure Pipelines `devtest`/`prod`; GitHub `ci.yml` (tsc + tests) + `validate-pr.yml` |
| Container | multi-stage but runtime copies whole build tree; root user; `EXPOSE 3000` | multi-stage, `npm prune --omit=dev`, non-root user, `dumb-init`, `HEALTHCHECK`, `EXPOSE 3001` |
| Docs | README, `docs/ENGINEERING_STANDARDS_MATRIX.md`, ADR-001..003 (Chargebee target), architecture KB, Postman collections, repo `.claude/skills` (5) | README (18 KB), `docs/` (openapi.json, ai-credits.md, LOCAL-DEV-STACK.md, functional-test docs, NFR CSV), repo `.claude/skills` (2) |

## 2. Internal packages (all from GitHub Packages `@inextlabs:registry=https://npm.pkg.github.com/inextlabs/`, token via `${AuthToken}` in `.npmrc`)

| Package | Version(s) seen | Used in | Purpose (verified from package contents) |
|---|---|---|---|
| `@inextlabs/logger` | 1.0.4 (pinned, both) | A, B | Pino-based structured logger; `configureLogger()`, default singleton, `createLogger()`, `createMasker()`, `serializeError`, `child()`, `close()`; 19 default PII mask fields; optional Event Hub sink |
| `@inextlabs/platform-errors` | 1.0.1 (pinned, both) | A, B | `AppError(statusCode, code, numericCode, message, details?)`, `formatError(err, correlationId?)` → `{error:{code,numericCode,message,details?}, metadata:{correlationId,timestamp}}`; non-`AppError` ⇒ `UNKNOWN_ERROR`/`"0"` |
| `@inextlabs/azure-oauth` | 1.0.7 | A, B | `validateAuthToken(tenantIds?, audience?, role?)` Express middleware (Entra JWT, JWKS, role check); `generateAuthToken(scope?)` via `DefaultAzureCredential` |
| `@inextlabs/inflow-usage-utils` | ^1.3.0 | B | Usage-platform shared lib: `makeErrorCode`, `makeServicePrefix`, `SERVICE_CODES`, `PLATFORM_CODE`, `withRetry`, `HttpError`, `buildUsageEventId`/`deriveUsageEventId`, `maskConnectionUri`, `formatMongoConnectionError`, `initOtelLogging`, `getOrCreateCorrelationId`, `HEADERS`, `MetricCatalog` |
| `@inextlabs/schema-models` | ^1.1.89 (installed 1.1.52) | A | Shared Mongoose models (e.g. `aIConfigModel`) |
| `@inextlabs/lg-template`, `message-service`, `shared-bot-state` | transitive | — | present in `node_modules`, **not imported by either repo's `src/`**; not analysed |

## 3. Architecture summary

**A (config service).** Three-zone Express service: `general` (logger, correlation, telemetry, cache, mongo, health, response/error helpers) → `v2` (controllers → services → Mongoose models; Zod schemas; error catalog; env schema) with `v1` kept frozen and instrumented by `legacyAccessMiddleware`. `server.ts` fixes boot order: `validateEnv()` → `initLogger()` → fatal handlers → telemetry → Redis → outbox sweep → listen → SIGTERM/SIGINT. Cross-service calls: HTTP POST to enforcement with internal API key + correlation ID; webhook fan-out to subscribers guarded by an SSRF guard.

**B (enforcement service).** Express service with a legacy v1 router and a v2 router (`correlation → auth → routes → error middleware`). Hot path is Redis (atomic counters, idempotency claim/CAS) with Mongo for audit/outbox/state and Service Bus for usage events. Background workers (outbox, notification queue, webhook delivery, counter reconciler) start from `index.ts`. Subscription data comes from the config service via an axios client with a Managed-Identity interceptor, an LRU cache with a stale window, and a typed "unavailable" error that callers must not treat as "no subscription". Pricing uses Strategy + Decorator + Registry. Mocked in-memory harness supports unit/integration tests.

## 4. Major implementation patterns (detail and evidence in `standards/organization-engineering-standards.md`)

Banded error catalog + `AppError` + single error middleware; `x-correlation-id` + AsyncLocalStorage; Pino-shape structured logging with shared mask config; fail-fast env validation; `/health/live` + `/health/ready`; Redis fail-open + breaker; ownership-token locks; Mongo outbox + sweep/worker; internal API key (constant-time, fail-closed) + Entra JWT; HMAC webhooks (raw body inbound, `timestamp.body` outbound); SSRF guards in both repos; `Idempotency-Key` claim/fingerprint/replay; deterministic usage-event IDs reused as Service Bus `messageId`; L1/L2 cache; fail-open vs fail-closed policy by environment (`record_only` vs `enforce`).

## 5. What was **not** found (stated so skills do not invent it)

No Kubernetes manifests or Helm; no deployment (release) step in any pipeline — pipelines stop at pushing an image to ACR; no `eslint`/`prettier` config; no Azure Blob usage in either repo; no `helmet`; no metrics (Prometheus/OTEL metrics) endpoint; no alert definitions; no DB transactions; no migration framework (config has a guarded migration *script kit*); no mTLS / certificate management; no LLM *invocation* code (no OpenAI/Anthropic SDK imports) — LLM-related code is pricing, model catalog and AI-config storage only; no use of `withRetry` (exported by the shared package but unused); no inbox/consumer for Service Bus in these repos (ingestion is another service); no dead-letter handling code.

## 6. Scope limits

Other repositories under `D:\DEV` (`inflow-usage-utils`, `inflow-chargebee-repo`, …) were **not** analysed; `inflow-usage-utils` was read only through its published `dist/` and README in B's `node_modules`. The `docs/` of A describe a *target* service (chargebee) and are treated as authored guidance (`E2` evidence), verified against A's source before use.
