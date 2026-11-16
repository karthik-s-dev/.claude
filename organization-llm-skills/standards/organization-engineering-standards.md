# Organization Engineering Standards Catalog (Deliverable 2)

**Single source of truth for the skills ecosystem.** Skills cite standards by ID (e.g. `ERR-03`) and must not restate or contradict them.

Evidence repositories: **A** = `inflow-config-service-repo`, **B** = `inflow-usage-enforcement-service`. Paths are relative to each repo. Installed internal packages were read from `node_modules/@inextlabs/*`.

## How to read this catalog

**Classification** (task §6): `MANDATED` · `VERIFIED` · `TECH` (technology-specific) · `CONFIG` (configurable) · `GENERIC` (baseline, pending approval) · `UNRESOLVED` (conflict/gap — never enforce as a rule).
**Evidence strength:** `E1` both repos · `E2` one repo, repeated and/or tested · `E3` one repo, isolated, declared-only, inert or defective · `E0` no evidence.
**MANDATED** is used only where the organization stated the rule explicitly: (a) the task brief (`@inextlabs/logger`, error-code composition, data-fetching/propagation pattern); (b) the `ARCH-LLD-003` response envelope and `ADR-004` error-code scheme cited in B's source; (c) the "Organisation standards (ADR defaults)" sections inside the repos' own `.claude/skills` (correlation ID, idempotency). Where implementation *deviates* from a mandated rule, the deviation is recorded in `governance/conflicts-and-open-decisions.md` — it is not promoted to a standard.

Conflict IDs (`C-xx`) are defined in `governance/conflicts-and-open-decisions.md`.

---

## Owner decisions (2026-11-16)
1. **`@inextlabs/inflow-usage-utils` is removed from the ecosystem** (too usage-service specific): no skill depends on it; helpers are specified locally.
2. **Conflict recommendations approved** ("ok with recommendation") — see `governance/conflicts-and-open-decisions.md` §E for each outcome. Where a skill note was marked UNRESOLVED and the conflict is now decided, the skill renders it as **DECIDED (C-xx)** with the decision. Items still open: **C-10** (APM stack), the Node LTS version (C-20), the package manager (C-21); two choices below were made on the owner's behalf and need confirmation: **C-01 sequence banding optional**, **C-09 pagination shape = `data.pagination { page, limit, totalItems, totalPages, hasNextPage }`**.
3. Where a standard below still reads "UNRESOLVED" for a decided conflict, the decision in §E of the conflicts file prevails.

---

## PKG — Internal packages

### PKG-01 Approved internal packages · MANDATED · E1
- **Rule:** use the `@inextlabs/*` package for each concern before any public alternative. Never replace one with a public package; if absent from the target repo, report the missing dependency (do not substitute).
- **Registry:** `@inextlabs:registry=https://npm.pkg.github.com/inextlabs/` in `.npmrc`; token injected via the `AuthToken` environment variable (`${AuthToken}` in `.npmrc`, `ARG AuthToken` in Docker). Never commit a literal token.
- **Approved mapping:** logging → `@inextlabs/logger`; error type/response → `@inextlabs/platform-errors`; Entra auth + Managed-Identity token → `@inextlabs/azure-oauth`; shared Mongoose models → `@inextlabs/schema-models`. **`@inextlabs/inflow-usage-utils` is excluded from this ecosystem (owner decision 2026-11-16: usage-platform specific).** Its capabilities (error-code builder, retry, event IDs, Mongo URI helpers, correlation helpers, OTEL init, header constants) are specified as small **local helpers** inside each service; skills never require the package. Where a reference service imports it, that is evidence only. logging → `@inextlabs/logger`; error type/response → `@inextlabs/platform-errors`; Entra auth + Managed-Identity token → `@inextlabs/azure-oauth`; error-code construction / retry / usage event IDs / Mongo URI helpers / correlation helpers / OTEL init (usage services) → `@inextlabs/inflow-usage-utils`; shared Mongoose models → `@inextlabs/schema-models`.
- **Version policy observed:** `logger` and `platform-errors` pinned exactly (`1.0.4`, `1.0.1`); others use `^`. Treat pinning as the default for foundational packages (**CONFIG**).
- **Evidence:** A/B `package.json`, `.npmrc`; B `src/*` imports.
- **Skills:** `internal-package-management`, `structured-logging`, `error-catalog-management`.

---

## ARCH — Architecture & structure

### ARCH-01 Shared-infrastructure zone, composition root, bootstrap · VERIFIED · E2 (A) / C-17
- **Pattern (A):** `src/general/**` holds transport/domain-agnostic infra (logger, correlation, telemetry, cache, mongo, health, response/error helpers) and imports no feature code; one `app.ts` composition root mounts middleware/routers; one `server.ts` boots dependencies in fixed order. Feature zones sit beside it (`v2/`, `products/<product>/`).
- **B variation:** flat `src/*.ts` modules; `index.ts` is both bootstrap and composition root.
- **Aliases (A):** `tsconfig.json` `paths` mirrored in `jest.config.ts` `moduleNameMapper` and `tsc-alias` at build.
- **Naming:** files `camelCase.role.ts` in A (`config.controller.ts`, `error.middleware.ts`); `kebab-case.ts` in B (`service-bus-publisher.ts`). **UNRESOLVED (C-17):** follow the target repo's existing convention.
- **Evidence:** A `src/app.ts`, `src/server.ts`, `tsconfig.json`; B `src/index.ts`.
- **Skills:** `microservice-architecture-standards`, `project-structure`, `service-registration-lifecycle`.

### ARCH-02 Layering: routes → controllers → services → repositories/integrations · VERIFIED · E2
- Routes only mount middleware chains; controllers parse request, call one service, `sendSuccess` or `next(err)`; services hold domain logic and no `express` types; repositories own datastore access; integrations own outbound HTTP.
- **Observed gap (A, E3):** only one repository file exists; services call Mongoose models directly. B uses `*-repository.ts` files (`audit-repository.ts`, `current-usage-state-repository.ts`) and `repositories/` + `usage-event-outbox.repository.ts` (mixed naming).
- **Skills:** `layered-architecture`, `clean-architecture`, `database-repository-pattern`, `solid-principles`.

### ARCH-03 Bootstrap order and process lifecycle · VERIFIED · E1
- Order (A `server.ts`): load `.env` → `validateEnv()` → `initLogger()` → register `uncaughtException`/`unhandledRejection` crash handlers → telemetry → connect datastores → start workers → `listen` → SIGTERM/SIGINT graceful shutdown. **Critical:** env validation and logger configuration happen **before** importing `app`.
- B: OTEL init → `validateStartup()` (dependency reachability; `process.exit(1)` on failure) → build services → mount routes → start workers → ensure indexes (fire-and-forget) → `listen` → SIGINT/SIGTERM shutdown that stops workers then closes each client.
- **Known defects not to copy:** both close dependencies without first awaiting `server.close()` drain (A closes deps then server; B calls `server.close()` un-awaited). Correct order: stop workers → stop accepting + drain HTTP (bounded) → close dependencies → flush logger → exit.
- **Skills:** `service-registration-lifecycle`, `graceful-shutdown`, `fatal-error-process-policy`, `startup-dependency-validation`.

### ARCH-04 Manual constructor injection; module singletons; test seams · VERIFIED (DI) · E2 / UNRESOLVED (seam style) · C-04
- No DI container in either repo (no `inversify`/`tsyringe`). Classes receive collaborators via constructor (B `new EnforcementHandler(subscriptionService, pricingCache)`, `new SubscriptionService(fetcher, "v2")`; A `new AIConfigService(connection)`). Infra clients are lazy module singletons with `getX()` + `closeX()` (B `getRedis`, `getUsageDb`, `closeRedis`).
- Test seams differ: B exports `__setXForTests()` overrides; A uses `jest.mock` + `__setRedisClientForTests`. Both prefix test-only exports with `__`.
- **Skills:** `dependency-injection`, `service-registration-lifecycle`, `mocking-test-doubles`.

### ARCH-05 Request pipeline order · VERIFIED · E2
- A: `cors(allow-list)` → `express.json({verify: capture rawBody})` → rate limiter → request telemetry → per-router `correlationIdMiddleware` → `validateAuthToken()` → `validate(schema, segment)` → controller → error middleware **last** (one per API surface).
- B v2: `correlationMiddleware` → auth (health bypass) → router → `v2ErrorMiddleware`.
- Rule: correlation precedes auth and error handling; error middleware is mounted last; webhook routes need raw-body capture before JSON parsing.
- **Skills:** `middleware-request-pipeline`, `global-exception-handling`.

### ARCH-06 Design patterns in use · VERIFIED · E2 (B)
- **Strategy + Registry + Decorator:** `CostCalculatorRegistry` (product override → global → null), `ICostCalculatorStrategy` (`strategyId`, `canHandle`, `calculate`), decorators (free-tier, margin, minimum-charge).
- **Factory helpers:** `appErr(entry, details)`, catalog entry builder `e(mm, seq, http, code, msg)`, `V2Errors.*`.
- **Outbox**, **Adapter** (`config-subscription-normalizer`), **LRU cache**, **Singleton-by-module**.
- **Skills:** `design-patterns`, `cost-calculation-strategy-registry`, `outbox-pattern`.

### ARCH-07 Service boundaries & inter-service contracts · VERIFIED · E1
- A owns configuration + subscription cache and notifies B (`POST …/internal/subscription-changed`); B owns usage counters/limits/audit and calls A for subscription data (HTTP, Managed Identity bearer) and registers a subscription webhook with A. Internal calls carry `x-internal-api-key`, `x-internal-api-caller`, `x-correlation-id`.
- **Risk (E2, C-19):** B reads A's Redis keys directly (`getRedisForSubscription()` without key prefix) — shared-cache coupling bypassing A's API. Flag for architecture review; do not replicate.
- **Skills:** `service-boundary-responsibility`, `service-to-service-authentication`.

---

## API — Contracts

### API-01 Routes and naming · UNRESOLVED (C-14) with shared parts VERIFIED · E1/E2
- Shared (E1): version as path prefix (`/api/v2/...` in A, `/v2/...` in B); internal endpoints separated (A `/api/v2/internal/...`; B `x-internal-api-key` routes); health unversioned.
- A (E2): plural resource nouns, nested sub-resources, state changes as `POST …/{id}/refresh`, capability-named endpoints, product prefix (`/api/v2/engage-ai/...`, `/api/v2/platform/...`), static paths mounted before parameterized.
- B (E2): action endpoints (`POST /v2/check`, `/check-and-record`, `/record-usage-event`), query endpoints (`GET /v2/usages`).
- **Skills:** `api-design-standards`, `api-versioning`.

### API-02 Success envelope · UNRESOLVED (C-06)
- A `sendSuccess()`: `{ success:true, message, data, metadata:{ correlationId, timestamp } }`.
- (Excluded) The usage-utils `buildSuccessResponse()` shape `{ success, data, metadata{…, pagination{limit,offset,total,hasMore}} }` is not an org standard. **Decided (C-06): the envelope is A's `{ success, message, data, metadata:{ correlationId, timestamp } }`.**: `{ success:true, data, metadata:{ correlationId, timestamp, requestId?, pagination?{limit,offset,total,hasMore} } }` (no `message`).
- B v2 success paths return the **raw payload** (`res.json(result)`), no envelope.
- **Rule until decided:** new endpoints use the envelope (`success`, `data`, `metadata.correlationId`, `metadata.timestamp`) — follow the target repo's existing success shape; never mix shapes inside one API surface. Whether `message` is included needs architecture approval.
- **Skills:** `api-response-structure`, `response-dto-mapping`, `response-serialization`.

### API-03 Error envelope · MANDATED (ARCH-LLD-003) · E1
- `{ success:false, error:{ code, numericCode, message, details? }, metadata:{ correlationId, timestamp } }` produced by `{ success:false, ...formatError(appError, correlationId) }` from `@inextlabs/platform-errors`.
- `details` is **public**; internal causes go to logs only (ERR-07). Correlation ID also in `x-correlation-id` response header.
- **Skills:** `api-error-response`, `exception-to-error-mapping`.

### API-04 Standard headers · VERIFIED · E1
- `x-correlation-id`, `x-request-id` (legacy fallback only, see CTX-01), `idempotency-key`, `x-internal-api-key`, `x-internal-api-caller`, `client-id`, `bot-id`, `authorization`, `retry-after`, `deprecation`, `sunset`, `link` — constants in `HEADERS` (`@inextlabs/inflow-usage-utils`; B vendors a copy in `src/v2/platform.ts`, C-08). Lowercase constants; read case-insensitively.
- CORS (A) must list the custom headers in `allowedHeaders` and expose `x-correlation-id`.
- **Skills:** `request-header-management`.

### API-05 Request validation · TECH / UNRESOLVED (C-03)
- A: Zod schema per segment (`body|query|params`) via `validate(schema, segment)`; failure → catalogued `VALIDATION_FAILED` (400) with flattened issues as `details`; parsed data written back to the request.
- B: hand-written checks throwing `V2Errors.badRequest(msg, [{field, reason}])`; `details` is an array of `{field, reason}`.
- **Rule:** validate every segment before business logic; a validation failure is a catalogued error (never an ad-hoc 400). Use Zod in repos that already depend on it; do not add Zod to B-style repos without approval.
- **Skills:** `request-validation`, `request-dto-mapping`, `query-parameter-management`.

### API-06 Pagination & filtering · UNRESOLVED (C-09)
- Three shapes in the estate: A `{ data, pagination:{ page, limit, totalItems, totalPages, hasNextPage } }` (applied inconsistently — E3); B `pagination:{ page, pageSize, totalItems, totalPages }` with Mongo `$facet`/`$skip`/`$limit`, stable sort `{lastEventAt:-1,_id:1}`; shared package `metadata.pagination:{ limit, offset, total, hasMore }`.
- **Rule:** one shape per API surface; bounded `limit/pageSize` with a server max; deterministic sort including a unique tiebreaker (`_id`); follow target repo's shape; flag mixing.
- **Skills:** `api-pagination`, `api-filtering-sorting`.

### API-07 OpenAPI/Swagger · TECH / UNRESOLVED (C-18)
- A: typed TS object `v2OpenApiSpec` + `getV2SwaggerHtml()`, served at `/api/v2/swagger.json` and `/api/v2/docs` (unauthenticated — gap). B: `docs/openapi.json` + `swagger-ui-express` (`mountSwagger`), with `swagger.test.ts` verifying the spec; `/v2` paths derived from the base spec.
- **Rule:** every public endpoint documented; spec validated by a test; secure-by-default docs exposure is **GENERIC** (gate non-public docs).
- **Skills:** `swagger-openapi`, `api-documentation`.

### API-08 Versioning & deprecation · VERIFIED · E1
- Path-segment versions. A keeps `v1` frozen + `legacyAccessMiddleware` (logs warn + telemetry trace on every legacy call) to prove zero usage before removal. B `rejectDeprecatedRoute()`: HTTP **410 Gone**, headers `Deprecation: true`, `Sunset: <date>`, `Link: <…>; rel="deprecation"`, logs every call with `useInstead`.
- **Rule:** one live version per surface; record sunset date before shipping the next; measure legacy traffic before removal.
- **Skills:** `api-versioning`, `deprecation-sunset-management`, `api-compatibility-review`.

### API-09 API-level rate limiting · VERIFIED · E2 (A)
- `express-rate-limit`: global `standardRateLimiter` (`RATE_LIMIT_STANDARD_PER_MIN`, default 300/min) + strict `adminRateLimiter` (`RATE_LIMIT_ADMIN_PER_MIN`, default 5/min) on fan-out/admin routes; `standardHeaders:true`; in-memory store (per instance); keyed on IP. **Defects:** 429 body hand-built with `UNHANDLED_ERROR` numeric code and a non-catalog `code:"RATE_LIMITED"`. B has no API rate limiting (its HTTP 429 means *quota exceeded*, `USAGE_LIMIT_EXCEEDED`).
- **Skills:** `api-rate-limiting` (API level), `rate-limiting` (dependency level).

### API-10 HTTP status mapping · VERIFIED · E1
- 400 validation; 401 unauthenticated; 403 forbidden/CORS/client mismatch; 404 not found; 409 idempotency conflict / in-progress; 412 version conflict (declared, E3); 429 quota exceeded (B) / rate limited (A); 502 upstream (config service / enforcement / webhook); 503 dependency unavailable (Redis, Service Bus, internal-auth misconfigured); 504 request timeout (B `REQUEST_TIMEOUT`); **207 Multi-Status** when the main operation succeeded but audit/event publication failed (`auditPublished:false`); 410 deprecated route.
- **Defect (A, E3):** several *business* conditions are mapped to 500 (`BOT_INFO_NOT_FOUND`, `RUNTIME_FIELD_MISSING`). Do not copy; business errors map to 4xx.
- **Skills:** `http-status-codes`.

---

## CTX — Request context & idempotency

### CTX-01 Correlation ID · MANDATED (ADR defaults) / implementation VERIFIED · E1 / C-08
- Header `x-correlation-id`; resolve-or-generate (`randomUUID()`) on entry **before** auth and error handling; bind to `AsyncLocalStorage` (`runWithCorrelationId` / `getCorrelationId`); echo in response header, every envelope's `metadata.correlationId`, every log line (automatic via logger wrapper in A), every outbound HTTP call, and message `applicationProperties.correlationId`. Never fatal when missing (`"unknown"` fallback).
- **ADR default (documented in B's `correlation-id-management` skill):** untrusted callers' values are ignored (regenerate); only trusted internal callers' IDs are kept; strict charset/length validation; **no** `x-request-id` fallback; body/query can never set it; correlation ≠ request ID ≠ trace ID.
- **Deviation (both repos, C-08):** both accept any non-empty inbound value and fall back to `x-request-id`; neither validates charset/length; no trusted-caller mechanism. New/modified code must follow the ADR default where feasible and report the gap; do not silently weaken it.
- **Skills:** `correlation-id-management`, `request-context-propagation`, `distributed-request-tracking`.

### CTX-02 Outbound service-to-service headers · VERIFIED · E2
- Every internal outbound call sends `x-internal-api-key`, `x-internal-api-caller: <service-name>`, `x-correlation-id` (A `enforcementNotification.service.ts`). Calls to Entra-protected services send `Authorization: Bearer <generateAuthToken()>` (B `config-service-http.ts`).
- **Skills:** `request-header-management`, `service-to-service-authentication`.

### CTX-03 Idempotency · MANDATED (ADR defaults) / implementation UNRESOLVED · E2 (B) / C-07
- **ADR defaults:** `Idempotency-Key` header only (no body fallback); mandatory on externally exposed writes (400 if missing/invalid); scope = authenticated tenant + operation + key; canonical SHA-256 fingerprint; authoritative store = shared durable **relational DB**; unique constraint + atomic claim + owner token/lease; effect-level dedupe mandatory; fail **closed** on store outage (503 + `Retry-After`); retention 72 h (7 d for financial); same key + different payload → 409 `IDEMPOTENCY_KEY_REUSED`; duplicate while running → wait ≤1 s then 409 `IDEMPOTENCY_IN_PROGRESS` + `Retry-After`.
- **B implementation:** Redis key `idem:{clientId}:{key}`, `SET … EX ttl NX` claim, stored `{bodyHash, resultSummary, recordedAt, failOpen?, replays?}`, Lua compare-and-swap for stale takeover, canonical (sorted-key) SHA-256, statuses `new|duplicate|in_progress|conflict`, release on failure/timeout, fail-open answers replayed only briefly (`IDEMPOTENCY_FAILOPEN_TTL_SECONDS=30`, `…MAX_REPLAYS=3`). **Deviations from ADR default:** Redis store (not relational), reads `idempotencyKey` from body as well as header, error codes `IDEMPOTENCY_KEY_CONFLICT` / `IDEMPOTENCY_REQUEST_IN_PROGRESS`.
- A has **no** idempotency (declared `VERSION_CONFLICT` 412 only, E3).
- **Skills:** `idempotency-management`, `request-deduplication`, `message-idempotency`.

### CTX-04 Effect-level dedupe / deterministic event identity · VERIFIED · E2 (B)
- `buildUsageEventId({entityType, entityId, metricKey, discriminator?})` → `idem:<requestId>:<metric>`; `derivedUsageEventId(parent, "aiCredits")`; `deriveUsageEventId(...)` for legacy events. The ID is used as the Service Bus `messageId` and consumer unique-index key. Bare entity IDs are not unique — always include metric key (and discriminator when repeatable).
- **Skills:** `usage-event-identity`, `message-deduplication`.

### CTX-05 Trace context · TECH / UNRESOLVED (C-10)
- A: `applicationinsights` SDK, W3C (`AI_AND_W3C`), mask-before-export, graceful no-op without connection string. B: OTEL via `initOtelLogging()` (spike: validates env and documents targets; SDK wiring per service) + `APPLICATIONINSIGHTS_CONNECTION_STRING`/`OTEL_*` env.
- **Skills:** `trace-context-propagation`, `distributed-tracing`, `opentelemetry-integration`.

---

## ERR — Errors

### ERR-01 `AppError` and `formatError` · MANDATED · E1
- `new AppError(statusCode, code, numericCode, message, details?)`; `code` = stable semantic key (`VALIDATION_FAILED`); `numericCode` = 8-digit string (ERR-03). `formatError(err, correlationId)` is the only serializer; a non-`AppError` serializes as `UNKNOWN_ERROR`/`"0"` — therefore always wrap strays (ERR-05).
- **Skills:** `exception-handling`, `api-error-response`.

### ERR-02 Error catalog structure · MANDATED (task) / VERIFIED · E1
- A: `ErrorCatalog` const map `KEY → { numericCode, httpStatus, message }`, `ErrorCodeKey = keyof typeof ErrorCatalog`, `throwConfigError(key, safeDetails?)`. B: `EC` const map `KEY → { num, http, code, message }` built by `e(mm, seq, http, code, msg)`; `appErr(entry, details?)` returns an `AppError`; `V2Errors.*` thin helpers.
- Rule: one catalog per service; entries are `as const`; every error thrown by application code references a catalog entry; messages are safe, generic, human-readable and never branch-on text; the catalog also defines the catch-all `UNHANDLED_ERROR`.
- **Skills:** `error-catalog-management`, `business-exception-handling`, `technical-exception-handling`.

### ERR-03 Numeric error-code composition · MANDATED (task + ADR-004) · E1 / C-01
- **Format (observed in the usage platform's service registry; implemented locally by each service as `makeErrorCode(ss, mm, seq)` = `"1" + pad2(ss) + pad2(mm) + pad3(seq)`):** `numericCode = PLATFORM_CODE + SERVICE_CODE + MODULE_NUM + SEQ`, 8 characters: `P`(1 digit, always `1`) + `SS`(2 digits, zero-padded service number) + `MM`(2 digits, module) + `EEE`(3 digits, sequence starting `001`). Example `makeErrorCode(3, 0, 1) → "10300001"`. Human-readable service prefix: `"INXT1" + SS` (for example `INXT103`).
- **Registered services:** config = 02 (reference only; not in `SERVICE_CODES`), enforcement = 03, ingestion = 04, rollup = 05, portal = 06. New services must register a new `SS` in the organization's service-code registry (owner/location to be confirmed) — never reuse. (Config's `02` is not in the usage-platform registry.)
- **Sequence banding (registry doc comment + A catalog comments):** 001–010 validation(400) · 011 authentication(401) · 012 authorization(403) · 013–022 not found(404) · 023–034 infrastructure(500) · 035–048 business logic · 049–050 external dependency (502/503) · 051–052 catch-all(500). A follows this banding with `MM="00"`.
- **MM semantics — DECIDED (C-01, approved 2026-11-16): MM = functional module (not source file); sequence banding optional (confirm); migrate legacy schemes.** Earlier analysis: A hard-codes `MM="00"` (no module segmentation); B sets `MM` = **source-file/functional-area** (`01` v2-routes … `07` error middleware) with per-file sequences starting `001` and **no** category banding. Both produce valid 8-digit codes via the same format; the organization must choose one MM policy. Until decided: keep `PLATFORM+SERVICE+MODULE+SEQ`, follow the target repo's existing MM policy, never change codes already shipped, and use the service's local `makeErrorCode` helper. Existing shipped codes are never changed.
- **Uniqueness rules (VERIFIED):** codes are never reused, renamed or renumbered; `(SS, MM, EEE)` unique per service; duplicates must be prevented by a catalog test (see ERR-09). B's `error-catalog.test.ts` exists (v2); A has `test/mocks/platform-errors.ts` only — duplicate-prevention is a **GENERIC** addition.
- **Env hygiene defect (A, C-01):** `PLATFORM_CODE`/`SERVICE_CODE` read from env with literal fallbacks (`"1"`, `"02"`) and `SERVICE_CODE` is `"102"` in `logger.bootstrap.ts` — a single constant must feed both. Prefer a code constant over env (B uses a constant `SS = 3`).
- **Legacy schemes (do not extend):** B `src/error-codes.ts` `50`+HTTP (`50404`) and vendored `HttpError` `INXT50`+HTTP (`INXT50404`) — C-01.
- **Skills:** `error-code-standards`, `error-catalog-management`.

### ERR-04 Catalog organization · VERIFIED · E1
- A: sections banded by HTTP category with `// reserved` ranges in comments. B: sections by `MM` file with a header table mapping MM → source file. Either way: header comment documents scheme; new entries appended (never inserted/renumbered).
- **Skills:** `error-catalog-management`.

### ERR-05 Wrap strays at the boundary · VERIFIED · E2 (A)
- `toAppError(err)`: `AppError` passes through; anything else → `UNHANDLED_ERROR` with `details` **undefined** and the original kept on `Error.cause` (+ original stack) for server-side logging only (SEC-09 in A). B's `v2ErrorMiddleware` calls `formatError(err)` directly, so non-`AppError` become `UNKNOWN_ERROR`/`"0"` (not in catalog) — gap (C-01b).
- **Skills:** `exception-to-error-mapping`, `global-exception-handling`.

### ERR-06 Single error middleware per API surface, mounted last · VERIFIED · E1
- Derives `correlationId` (`req.correlationId ?? getCorrelationId() ?? "unknown"`), maps to `AppError` (typed errors like `CorsRejectedError` selected by **type**, not message), logs once (`warn` for <500, `error` for ≥500) with route metadata only, responds `{success:false, ...formatError()}`.
- **Skills:** `global-exception-handling`, `error-logging`.

### ERR-07 `details` public; cause private · VERIFIED · E2
- Only caller-supplied safe context (`{botId, clientId}` / `[{field, reason}]`) in `details`; never driver text, stack, connection strings.
- **Skills:** `error-propagation`, `api-error-response`.

### ERR-08 Controller/handler error idiom · VERIFIED · E1
- A: `try { … sendSuccess(...) } catch (err) { next(toAppError(err)); }`. B: `asyncHandler(fn)` wraps handlers so rejections reach `next`. Do not hand-write error responses in handlers.
- **Skills:** `exception-handling`, `error-propagation`.

### ERR-09 Typed dependency failures; "absent" vs "unavailable" · VERIFIED · E2 (B)
- Distinguish **confirmed absence** (404 → `null`) from **unavailability** (timeout/5xx/auth → throw `ConfigServiceUnavailableError`); callers must never treat unavailable as "no subscription / unlimited". Domain error classes (`UsageReadError`) carry structured context. Request-timeout on write path fails closed (504) and releases the idempotency key.
- **Skills:** `integration-error-handling`, `dependency-failure-handling`, `technical-exception-handling`.

---

## CFG — Configuration

### CFG-01 Env-var configuration with committed template · VERIFIED · E1
- `dotenv` loads `.env`; `.env`/`.env.*` git-ignored; `.env.example` committed with every variable, default and REQUIRED marker (B's file is organized by sections: Server, Mongo, Redis, Config Service, Policy, Security, Service Bus, Outbox, Notifications, Observability). Variable names `UPPER_SNAKE_CASE`, grouped by integration prefix (`REDIS_*`, `SERVICE_BUS_*`, `USAGE_EVENT_OUTBOX_*`, `WEBHOOK_*`, `RATE_LIMIT_*`).
- **Skills:** `configuration-management`, `required-environment-variables`, `optional-environment-variables`.

### CFG-02 Validation at startup · TECH / UNRESOLVED (C-03)
- A: one Zod schema (`env.schema.ts`) → `validateEnv()` aggregated errors, memoized (`resetValidatedEnvCache()` for tests), called in `server.ts` **before** `import app`. B: `config.ts` with `getEnv/getEnvInt/getEnv…` defaults + `validateStartup()` that pings dependencies and exits non-zero (`process.exit(1)`) on failures; `scripts/validate-env.ts` exists.
- **Rule:** one declarative source of truth; fail fast with aggregated, secret-free messages; derive health/readiness env checks and `.env.example` from it (A defect: three divergent lists, C-03).
- **Skills:** `configuration-validation`, `startup-dependency-validation`.

### CFG-03 Environment names & strictness · VERIFIED · E1
- A: `APP_ENV` (default `production`); local/dev set = `local, development, devtest, staging, customerdev`. B: `DEPLOYMENT_ENV` (fallback `APP_ENV`, default `production`); non-enforcing set = `devtest, staging, customerdev`. Branches map to environments: `devtest` → `staging` → `main` (production).
- Strictness depends on environment (secrets may be absent only in local/dev).
- **Skills:** `environment-specific-configuration`, `configuration-precedence`.

### CFG-04 Fail-closed for secrets outside local/dev · VERIFIED · E2 (A) / defects E3
- A: internal API key required outside local/dev (boot guard + request-time guard). **Defect:** webhook-secret boot guard commented out (`env.schema.ts`), internal-config routes do not mount the key middleware. B: `SECURITY_RELAXED_FOR_DEVNDEMO` and `AUTH_FAIL_OPEN` bypass internal API auth / JWT / SSRF checks; "never honoured on Azure App Service production" (detected via `WEBSITE_INSTANCE_ID`).
- **Rule:** missing secret ⇒ stop or reject, never open. Relax-flags are a risk (C-12): do not introduce new ones; flag existing ones.
- **Skills:** `configuration-security`, `secrets-management`.

### CFG-05 Defaults · VERIFIED · E1
- Defaults live in code, mirrored in `.env.example`, numeric parsing via helpers (`getEnvInt`) with safe fallback; timeouts/TTL/poll/batch/attempts always configurable (`CONFIG_SERVICE_TIMEOUT_MS=5000`, `REDIS_COMMAND_TIMEOUT_MS`, `USAGE_EVENT_OUTBOX_MAX_ATTEMPTS`, `WEBHOOK_DELIVERY_MAX_ATTEMPTS`). **Defect (A):** hard-coded Redis timeouts (150 ms) and breaker constants are not configurable; unvalidated `parseInt` in places.
- **Skills:** `configuration-defaults`.

### CFG-06 Feature flags & operational toggles · VERIFIED · E1
- Boolean env toggles: `FEATURE_DUAL_READ` (A `isDualReadEnabled()`, default false), `USAGE_EVENT_OUTBOX_ENABLED`, `*_WORKER_ENABLED`, `NOTIFICATION_*_ENABLED`, `ENFORCEMENT_DEFAULT=enforce|record_only`, `DEBUG_ROUTES_ENABLED`. Default **off/safe**; flags documented in `.env.example`. No flag service.
- **Skills:** `feature-flag-management`.

### CFG-07 Secret sources · VERIFIED · E1 (limited)
- Secrets from environment only (`// TODO: read secret from keyvault` in A); outbound Azure access via Managed Identity (`DefaultAzureCredential`); connection strings for Service Bus/Queue are env strings (not identity-based); GitHub Packages token via `AuthToken`. Mask URIs in logs with `maskConnectionUri`.
- **Skills:** `secrets-management`, `configuration-security`.

---

## OBS — Observability

### OBS-01 Logger package, initialization and call shape · MANDATED (task) · E1 / C-02
- Use `@inextlabs/logger` only. **Package API (from its README):** default export singleton; `configureLogger({level, service, version, environment, mask})` **once at startup before other modules import the default export**; `createLogger(opts)` for extra/isolated instances; `createMasker(mask)`; `serializeError`; `logger.child(bindings)`; levels `trace, debug, info, warn, error, fatal`; call shapes `(msg)`, `(obj)`, `(obj, msg)`, `(Error)`, `(Error, msg)` — **Pino order: object first, message second**; `close()` flushes the optional Event Hub sink (`AZURE_EVENTHUB_NAMESPACE`/`AZURE_EVENTHUB_NAME`).
- **A implementation:** `logger.bootstrap.ts#initLogger()` → `configureLogger({ level: LOG_LEVEL ?? "info", service: SERVICE_NAME, serviceCode: SERVICE_CODE, environment: APP_ENV, mask: MASK_CONFIG })` called in `server.ts` before `app` import; `general/service/logger.ts` exports a thin wrapper (drop-in `(obj|Error|msg, msg?)`) that merges `correlationId` from ALS and `closeLogger()`.
- **B implementation:** `logger.ts` calls `createLogger({ service, level: LOG_LEVEL, eventHub? })` and wraps it in `FlexibleLogger` that also accepts legacy `(msg, meta)`; OTEL init separate. **Deviation (C-02):** legacy argument order, correlation ID not auto-stamped, service name literal.
- **Rule:** new code uses `(obj, msg)` Pino order; one logger module per service; no `console.*` (both repos have residual `console.*` in config bootstrap/CORS and `azure-oauth`; flag, do not copy); do not add `pino`/`winston`/`bunyan` — `winston` is declared in B's `package.json` but unused.
- **Skills:** `structured-logging`, `logger-initialization`, `log-level-standards`.

### OBS-02 Log content rules · VERIFIED · E2
- Request lifecycle: one "Incoming request" + one completion log with `method`, `path`, `statusCode`, `durationMs`; level by status (5xx `error`, 4xx `warn`, else `info`). Error path logs route metadata only — never body/params/query. Structured fields (objects), not string concatenation. Errors logged via `err` key (`serializeError`). Include `correlationId` (automatic in A).
- **Gaps (E3):** health probes logged at `info`/`debug` inconsistently; no trace-id field in logs (shared package README says OTEL adds it).
- **Skills:** `structured-logging`, `error-logging`, `log-level-standards`.

### OBS-03 Sensitive-data masking · VERIFIED · E2 (A) / MANDATED (package capability)
- `MASK_CONFIG: MaskConfig` extends package defaults (19 fields: email, phone, mobile, password, passcode, otp, token, jwt, authorization, cookie, set-cookie, refreshToken, accessToken, apiKey, secret, clientSecret, creditCard, cvv, ssn) with service-specific names (`emailId: partial`, `phoneNumber: partial`, `key/endpoint/connectionString/connectionstring/conn_str: full`). The same config feeds the logger, telemetry export (`createMasker(MASK_CONFIG)`) and audit log. Helpers: local `maskConnectionUri` and `maskApiKeyForLog` (B).
- **Skills:** `sensitive-data-masking-in-logs`, `audit-logging`.

### OBS-04 Health endpoints · VERIFIED (A) / UNRESOLVED (C-15)
- A: `GET /health/live` (process uptime, no I/O) and `GET /health/ready` (parallel pings of Mongo, Redis, upstream, env → 200/503 with `dependencies:[{name,status:ok|error|skipped,responseTimeMs,message?}]`, correlation metadata). Legacy `GET /config/v1/health` → `OK`. Defects: upstream service inside readiness (cascade risk), no per-check timeouts, raw error messages in body, env check duplicates startup validation.
- B: `GET /health` and `GET /v2/health` (unauthenticated for LB) → `{status: ok|degraded|unavailable, dependencies:{redis,mongo,serviceBus:{ok,detail}}, …}`; Service Bus is non-critical unless `SERVICE_BUS_MANDATORY`; also leaks deployment policy fields. Dockerfile `HEALTHCHECK` hits `/health`.
- **Rule:** liveness has no I/O; readiness checks only dependencies the service cannot function without, each with a bounded timeout and a sanitized message; unauthenticated probe paths excluded from auth/rate limiting.
- **Skills:** `health-endpoint-implementation`, `liveness-readiness-checks`.

### OBS-05 Telemetry/APM · TECH · C-10
- A `telemetry.service.ts`: `initTelemetry()`, `trackTrace/Exception/Request`, request context store, mask before export (`createMasker`), truncation (4096 chars), no-op when connection string missing. B: OTEL env (`OTEL_SERVICE_NAME`, `OTEL_EXPORTER_OTLP_ENDPOINT`, …) via `initOtelLogging`; `APPLICATIONINSIGHTS_CONNECTION_STRING` in `.env.example`.
- **Skills:** `application-monitoring`, `distributed-tracing`, `opentelemetry-integration`.

### OBS-06 Metrics, alerting · E0 (GENERIC)
- No metrics endpoint, dashboards or ops alert definitions in either repo. B has *business* alerting (usage-threshold notifications via queue/webhook/FCM/email) — not operational alerting. `metrics-collection` and `alerting-standards` are generic baselines.
- **Skills:** `metrics-collection`, `alerting-standards`.

### OBS-07 Audit logging · VERIFIED · E2
- A `recordAuditEntry({action, targetType, targetId, before, after, route, actor})`: masked before/after diff written to an audit collection, non-blocking (`void`), never throws. **Defect:** `actor` always `undefined`. B `audit-repository.ts` with TTL (`AUDIT_LOG_TTL_DAYS`) and `ensureAuditIndexes()`.
- **Skills:** `audit-logging`.

---

## DB — Data & caching

### DB-01 MongoDB clients · TECH / UNRESOLVED (C-11) · E1 (driver) 
- Shared: connection string + db name from env; URI/credential helpers in the shared package (`buildMongoConnectionString`, `maskConnectionUri`, `formatMongoConnectionError`); errors on connect wrapped (`formatMongoConnectionError`); `close()` on shutdown.
- A: `mongoose.createConnection(uri, { dbName, user, pass, maxPoolSize (MONGO_MAX_POOL_SIZE, default 50), serverSelectionTimeoutMS:5000, socketTimeoutMS:45000, connectTimeoutMS:10000, retryWrites:true, retryReads:true }).asPromise()`; per-tenant DB connections cached in a `Map`; connection events logged (`connected/error/disconnected`); models from `@inextlabs/schema-models`.
- B: `new MongoClient(uri)`; `await connect()`; `client.db(name)`; module singletons per repository; `ensure*Indexes()` at startup; `getUsageDb()` throws if uninitialized; test override `__setUsageDbForTests`.
- **Skills:** `mongodb-client`, `database-connection-management`.

### DB-02 Redis client · VERIFIED (Azure TLS) / TECH (options) · E1 / C-11
- `ioredis`; Azure Redis needs TLS (`tls: { servername: host }` / `tls: {}`), port 6380; password from env; error/connect/close events logged.
- A (fail-fast profile): `commandTimeout:150`, `maxRetriesPerRequest:1`, `enableOfflineQueue:false`, `retryStrategy: min(times*200, 2000)`, `connectTimeout:15000`, `keepAlive:10000`; env `AZURE_CACHE_FOR_REDIS_HOST_NAME/ACCESS_KEY/PORT`.
- B (resilient-connection profile): `keyPrefix`, `maxRetriesPerRequest:5`, `enableOfflineQueue:true`, `retryStrategy: min(times*200,3000)`, `commandTimeout` and `connectTimeout` from env; env `REDIS_HOST_NAME/ACCESS_KEY/PORT` with `AZURE_CACHE_FOR_REDIS_*` fallbacks; refuses missing password for non-local hosts; `getRedisForSubscription()` second client **without** prefix (C-19).
- **Rule:** bounded command timeout is mandatory; choose fail-fast vs queued per use (request-path cache → fail-fast + fail-open; counters/idempotency → correctness-critical, surface errors).
- **Skills:** `redis-client`.

### DB-03 Repository pattern · VERIFIED · E2 (B) / E3 (A)
- One module per aggregate owning collection access, indexes (`ensure*Indexes`), mapping and `close()`. Naming inconsistent in B (`x-repository.ts` vs `x.repository.ts`). Retry on writes: `MAX_RETRY_ATTEMPTS=3`, `RETRY_DELAY_MS=100` in `current-usage-state-repository.ts` (inline; no shared retry helper).
- **Skills:** `database-repository-pattern`.

### DB-04 Indexes · VERIFIED · E2
- Created in code at startup via `createIndex` (fire-and-forget with warn log on failure — **risk**: service may run unindexed); unique composite keys for identity (`{productLine, tenantId, appId, period}` unique), `{status:1, createdAt:1}` for outbox polling, **TTL indexes** (`expireAfterSeconds`) for outbox/audit retention, sparse index for optional keys.
- **Skills:** `database-indexing`, `query-optimization`.

### DB-05 Caching · VERIFIED · E1
- A: write-through Redis cache with deterministic key builders (`redisKeys.ts`), default TTL `REDIS_DEFAULT_TTL_IN_MINUTES` (1440), cache-aside reads with fail-open to Mongo; invalidation via explicit refresh/reset endpoints and subscription-changed events. B: three tiers — in-process `LruCache` (bounded by `SUBSCRIPTION_CACHE_MAX_ENTRIES`) → Redis (`pricing:{llmKey}:{provider}:{region}`, TTL 3600 s) → Mongo; subscription cache `fresh TTL` + `stale max` window so a short config-service outage is survivable; cached `null` means "confirmed absent".
- **Skills:** `caching-strategy`, `cache-invalidation`.

### DB-06 Distributed locks · VERIFIED · E2 (A) / E2 (B) / C-11b
- A: `SET lock:key <uuid-token> NX EX ttl`; release via Lua compare-and-delete; on contention timeout **proceed unlocked** rather than 500. B: reconciler `SET reconcile:lock <host:pid> EX 10800 NX` single-run guard + `done` marker per UTC day (release by expiry).
- **Skills:** `distributed-locking`, `scheduled-job-reconciliation`.

### DB-07 Transactions & migrations · E0 / partial
- No multi-document transactions. A has a **guarded migration script kit** (`src/scripts/migration/{backfill,verify,fallbackRead}.ts`, `FEATURE_DUAL_READ`; `dualWrite.ts` referenced but missing) — dual-write → backfill → verify → fallback-read → drop only at zero legacy access. No migration framework.
- **Skills:** `database-transaction-management` (GENERIC), `database-migration`.

---

## MSG — Messaging & events

### MSG-01 Azure Service Bus producer · VERIFIED · E2 (B)
- `ServiceBusClient(connectionString)` singleton; one cached `ServiceBusSender` per topic (`Map<topic, sender>`); topic = `usage-{solutionId|productLine}` (slugged) with env overrides (`SERVICE_BUS_TOPIC_ENGAGE_AI`, `…_DOCS_AI`, `SERVICE_BUS_TOPIC_PREFIX=usage-`); message `{ body, messageId: usageEventId, applicationProperties:{ productLine, clientId, appId, capability, correlationId?, … } }`; `sendMessages`; `closeServiceBus()` closes senders then client; readiness = sender creation; `SERVICE_BUS_MANDATORY` decides whether outage is fatal. Auth: connection string (no managed identity — C-13).
- **Skills:** `azure-service-bus-client`, `message-producer`, `event-publishing`.

### MSG-02 Azure Queue Storage · VERIFIED · E2 (B)
- `QueueClient(connectionString, queueName)` singleton per queue; body = **base64(JSON)**; `receiveMessages({numberOfMessages: min(max,32)})`; process then `deleteMessage(id, popReceipt)`; malformed or unsupported-type messages are **deleted** (dropped, with warn + counter); canonical `notificationType` gate (`USAGE-ALERT`; legacy `USAGE_ALERT` rejected); queue existence ensured at startup (IaC/startup), `markReady` flag; three queues (`AZURE_QUEUE_NOTIFICATIONS_NAME`, `…_THRESHOLD_JOBS_NAME`, `…_WEBHOOK_DELIVERY_NAME`); enqueue failure returns `false` (logged) — caller decides.
- **Skills:** `azure-queue-storage-client`, `message-consumer`.

### MSG-03 Outbox · VERIFIED · E2 (both)
- Row persisted **before** the delivery attempt. B `usage_event_outbox`: `{payload, status: pending|published|failed, attempts, lastError?, createdAt, publishedAt?}`; poll worker (`USAGE_EVENT_OUTBOX_WORKER_POLL_MS`, `…_BATCH_SIZE`, `…_MAX_ATTEMPTS`), `running` re-entrancy guard, `failed` after max attempts, TTL index (`…_TTL_SECONDS`); fallback to direct send when outbox disabled; if both fail the API reports `auditPublished:false` with **HTTP 207**. A `enforcementOutbox.service.ts`: Mongo row before attempt (`nextAttemptAt`), 30 s sweep (`startEnforcementOutboxSweep`), **linear** backoff `min(60 s × attempts, 15 min)`, `MAX_ATTEMPTS=8`; applied to enforcement notification only (webhook fan-out is fire-and-forget — E3).
- **Defect (B):** retries have no backoff/delay (re-polled each tick); no row-level claim ⇒ multi-replica workers may double-send (mitigated downstream by `messageId`/`usageEventId` dedupe).
- **Skills:** `outbox-pattern`, `message-retry-strategy`, `background-worker-processing`.

### MSG-04 Message contracts · VERIFIED · E2
- Typed payload interface with explicit identity (`usageEventId`), tenant identity, `correlationId`, timestamps ISO-8601; internal field names may differ from wire names and are converted **at the last step** (`toWirePayload`: `tenantId → clientId`) so queued rows written earlier publish in the new shape. Deprecated enum values are rejected loudly (`USAGE_ALERT` vs `USAGE-ALERT`). JSON Schema files for inputs in `docs/*.json`.
- **Versioning:** no message schema version field in either repo (E0) — GENERIC baseline.
- **Skills:** `message-structure-contracts`, `message-versioning`.

### MSG-05 Webhooks (outbound & inbound) · VERIFIED · E1
- Inbound (A): HMAC-SHA256 over the **raw** body (`express.json({verify})` captures `req.rawBody`), header `x-chargebee-webhook-signature`, `timingSafeEqual`, secret required outside local/dev, POST only. Outbound (B): signature `sha256=HMAC(secret, "<unix-ts>.<body>")` with `X-Webhook-Timestamp` + `X-Webhook-Signature`; timeout `WEBHOOK_DELIVERY_TIMEOUT_MS`; attempts `WEBHOOK_DELIVERY_MAX_ATTEMPTS`; queue-backed worker; callback URL validation (https + SSRF deny-list + allow-list); idempotency util (`webhook-idempotency.ts`).
- **Skills:** `webhook-delivery`, `webhook-signature-verification`.

### MSG-06 Inbox / consumer-side dedupe · E0 for Service Bus; partial for queues
- Neither repo consumes Service Bus. Queue consumers delete after success and drop malformed items; no inbox table. B defines the *producer's* dedupe key so consumers (ingestion) can dedupe via unique index. `inbox-pattern`, `dead-letter-queue-handling`, `event-consumption` are GENERIC baselines.
- **Skills:** `inbox-pattern`, `dead-letter-queue-handling`, `event-consumption`, `message-deduplication`.

### MSG-07 Background workers · VERIFIED · E2 (B)
- `startXWorker()` / `stopXWorker()` pair; `setInterval` poll + immediate first run; `running` flag prevents overlap; per-batch try/catch so one failure never kills the loop; enabled by env flag; stopped first on shutdown; single-run jobs guarded by Redis lock + done marker (reconciler).
- **Skills:** `background-worker-processing`, `scheduled-job-reconciliation`.

---

## INT — Integrations

### INT-01 Outbound HTTP client (internal service calls) · VERIFIED · E2 / C-16
- **B `getConfigServiceHttpClient()`:** lazily created singleton `axios.create({ baseURL, timeout: CONFIG_SERVICE_TIMEOUT_MS (5000), headers:{Content-Type: application/json} })`; request interceptor attaches `Authorization: Bearer <generateAuthToken()>` **only when** `AZURE_SERVICE_OAUTH_SCOPE` is set; **if the scope is set and token acquisition fails → abort the request** by throwing `ConfigServiceUnavailableError(…, 401)` (never call unauthenticated); test reset `__resetConfigServiceClientForTests()`.
- **Result handling:** `handleConfigServiceRequestError(err, ctx)`: `404 → return null` (info log "no subscription"), **any other failure → log error with context + hint, throw `ConfigServiceUnavailableError(message, status)`**. Callers: `null` = confirmed absence, throw = unavailable, never "empty".
- **A `notifyEnforcementSubscriptionChanged()`:** per-call `axios.post(url, body, { timeout: 10_000, headers: { x-internal-api-key, x-internal-api-caller, x-correlation-id } })`; skip with log when base URL/key unset; failures logged (`warn`, `serializeError`) and swallowed (best-effort); `...Async` variant `void …catch(log error)`; durable path via outbox (MSG-03).
- **Retry:** none on these paths in either repo; no retry helper is used (E0 for retry in code) — GENERIC baseline in `retry-policy`.
- **Cancellation:** no `AbortController`/signal use (E0).
- **Tests:** `config-service-client.test.ts` (B) with mocked axios.
- **Skills:** `external-api-client`, `http-client-management`, `resilient-http-communication`, `integration-error-handling`, `service-to-service-authentication`.

### INT-02 Failure-policy for dependency data (fail-open vs fail-closed) · VERIFIED · E2 (B)
- `ENFORCEMENT_DEFAULT=enforce|record_only` (non-prod `record_only`: record usage, never block); on dependency failure: quota gate **fails closed** when blocking is enabled, otherwise answer is **fail-open** and marked (`markFailOpen`, non-enumerable symbol) so it is replayed only briefly under the idempotency key; usage read failure raises `UsageReadError` in blocking deployments; events published with `enforcementStatus:"skipped"` + `failOpenReason`.
- **Skills:** `fail-open-fail-closed-policy`, `dependency-failure-handling`, `graceful-degradation`.

### INT-03 SSRF protection for client-supplied URLs · VERIFIED · E1
- A `ssrfGuard.ts`: https only (schema), deny loopback/RFC1918/link-local (169.254.x → cloud metadata)/`0.0.0.0/8`/IPv6 ULA/`localhost`/`.local`, optional operator allow-list (`SUBSCRIBER_HOST_ALLOWLIST`). B `utils/callback-url-validation.ts` with `WEBHOOK_CALLBACK_URL_ALLOWLIST`; bypass only under relaxed flag (C-12). **Gap:** DNS-rebinding / hostname resolution not checked.
- **Skills:** `ssrf-protection`, `third-party-service-integration`.

### INT-04 Third-party services · VERIFIED · E2 (B)
- Firebase Admin (FCM push; credentials from `FIREBASE_*` env), Logic App HTTP URL for email (`LOGIC_APP_EMAIL_URL`), Chargebee webhooks (inbound). Each behind its own module (`fcm-notification-service.ts`, `notification-dispatcher.ts`), enabled by `NOTIFICATION_*_ENABLED` flags.
- **Skills:** `third-party-service-integration`.

### INT-05 Azure Blob Storage · E0 (GENERIC)
- Not used in A/B (other org repos depend on `@azure/storage-blob` but were out of scope). `azure-blob-storage-client`, `file-upload-download`, `file-streaming` are GENERIC baselines aligned to INT-01/DB-01 conventions.
- **Skills:** `azure-blob-storage-client`, `file-upload-download`, `file-streaming`.

### INT-06 Azure SDK management · VERIFIED · E2 (B)
- Lazy module-level clients (`ServiceBusClient`, `QueueClient`, Redis, Mongo), connection-string config from env, `close*()` on shutdown, `is*Configured()` checks, readiness probes, test overrides.
- **Skills:** `azure-sdk-client-management`, `azure-service-connection-management`, `external-dependency-configuration`.

---

## SEC — Security

### SEC-01 Entra (Azure AD) JWT validation · TECH / UNRESOLVED (C-05) · E1
- A: `validateAuthToken()` from `@inextlabs/azure-oauth` per route; env `AZURE_SERVICE_OAUTH_TENANT_IDS`, `…_AUDIENCE`, `…_APP_ROLE` (all required at startup). Package behaviour: decodes token → checks `tid/tenantId/tenant/azp` ∈ allowed tenants → `express-jwt` + `jwks-rsa` (JWKS `…/{tid}/discovery/v2.0/keys`, RS256, issuer `…/{tid}/v2.0`, audience) → app-role check (`roles` claim) → `req.auth`. **Package defects:** `console.log` of tenant ID, error bodies lack `numericCode`, JWKS URL built from unverified token claim before signature check.
- B: `jose` `createRemoteJWKSet` + `jwtVerify` with `ENTRA_ISSUER`, `ENTRA_AUDIENCE`, optional `ALLOWED_APP_IDS` (azp/appid), `ALLOWED_ROLES` (roles or scp), **client-claim binding** (every `clientId`/`tenantId` in body/query must equal token claim `AUTH_CLIENT_CLAIM`; `AUTH_ENFORCE_CLIENT_BINDING`); failures via `V2Errors`; `AUTH_FAIL_OPEN` bypass (C-12).
- **Rule:** authenticate every non-probe route; use `@inextlabs/azure-oauth` where the target already depends on it; report (do not silently reimplement) when unavailable.
- **Skills:** `jwt-validation`, `authentication`, `authorization`, `oauth-2-0`.

### SEC-02 Service identity: client credentials / Managed Identity · VERIFIED · E1
- `generateAuthToken(scope?)` (package) = `new DefaultAzureCredential().getToken(scope ?? AZURE_SERVICE_OAUTH_SCOPE)`; used by B for calls to A. Scope env `AZURE_SERVICE_OAUTH_SCOPE` (e.g. `api://…/.default`). Token acquired per request (no explicit cache in repo; SDK caches). Failure ⇒ fail closed (INT-01).
- **Skills:** `machine-authentication`, `client-credentials-flow`, `azure-managed-identity`, `service-to-service-authentication`.

### SEC-03 Internal API key · VERIFIED · E1
- Header `x-internal-api-key` (+ `x-internal-api-caller`). A: single key env, `timingSafeEqual` with length pre-check, fail-closed outside local/dev, boot guard. B: registry `INTERNAL_API_CALLER_REGISTRY` (`INTERNAL_API_KEY_CONFIG_SERVICE`, `…_ADMIN_PORTAL`, `…_LIVE_AGENT_PORTAL`) → key→caller map, per-route `requireInternalApiKey([callers])`, 503 when no keys configured, 401 bad key, 403 caller not permitted, key masked in logs (`maskApiKeyForLog`). **B defect:** key comparison via `Map` lookup (not constant time); bypass flag.
- **Skills:** `internal-api-key-authentication`, `service-to-service-authentication`.

### SEC-04 Webhook authenticity · VERIFIED · E1 — see MSG-05.
### SEC-05 CORS allow-list · VERIFIED · E2 (A)
- `CORS_ALLOWED_ORIGINS` (comma list, normalized); empty ⇒ browser origins denied; no `Origin` header ⇒ allowed (server-to-server); typed `CorsRejectedError` → catalogued 403 `CORS_REJECTED`; `credentials:true`; never `origin:true` with credentials.
- **Skills:** `cors-policy`, `api-security`.
### SEC-06 Secrets & data protection · VERIFIED · E2
- No secrets in repo; masked logs/telemetry/audit; `.env.example` placeholders; connection URIs masked; Docker build removes `.npmrc` after install (B) — A's Dockerfile copies `.npmrc` and whole tree into the runtime stage (defect, C-20).
- **Skills:** `secrets-management`, `data-protection`.
### SEC-07 RBAC · E3 (A inert) / E2 (B roles check)
- A `requireRole`/`enforceTenantScope`/`principalMiddleware` exist but are never invoked/no-op; coarse app-role gate is inside `validateAuthToken`. B enforces `ALLOWED_ROLES` and tenant binding. `role-based-access-control` documents the contract; wire and test or ship none.
- **Skills:** `role-based-access-control`.
### SEC-08 mTLS / certificates · E0 (GENERIC)
- **Skills:** `mutual-tls`, `certificate-management`.
### SEC-09 Security hardening gaps · E3
- No `helmet`, no `express.json({limit})`, docs unauthenticated (A), `AUTH_FAIL_OPEN` / `SECURITY_RELAXED_FOR_DEVNDEMO` (B). Not standards — recorded for reviewers.
- **Skills:** `api-security`, `security-review`.

---

## RES — Resilience

### RES-01 Cache fail-open + bounded timeout + circuit breaker · VERIFIED · E2 (A)
- `withCacheFailOpen(op, key, fallback, fn)`: breaker open ⇒ skip cache and return fallback; any error ⇒ record failure, warn, return fallback; breaker opens after 5 consecutive failures for 15 s (constants, not configurable). `safe*` wrappers expose cache ops. A cache blip degrades latency, never availability.
- **Skills:** `circuit-breaker`, `fallback-mechanism`, `graceful-degradation`.

### RES-02 Timeouts · VERIFIED · E2
- Every outbound/dependency call has an explicit timeout from env (`CONFIG_SERVICE_TIMEOUT_MS`, `REDIS_COMMAND_TIMEOUT_MS`, `WEBHOOK_DELIVERY_TIMEOUT_MS`, Mongo `*TimeoutMS`); request-level budget for write path `CHECK_AND_RECORD_TIMEOUT_MS` + `CHECK_AND_RECORD_TIMEOUT_PER_METRIC_MS` (batch scales per metric) → 504 `REQUEST_TIMEOUT` fail-closed on writes.
- **Skills:** `timeout-management`.

### RES-03 Retry & backoff · E3
- Present: outbox attempts with max (A linear backoff with `nextAttemptAt` (not exponential); B poll-based, no delay), Redis `retryStrategy` (`min(times*200, cap)`), Mongo inline `MAX_RETRY_ATTEMPTS=3`/`RETRY_DELAY_MS=100`, webhook delivery attempts. No retry helper exists; a local `withRetry(fn, {maxAttempts, delayMs, backoffMultiplier, maxDelayMs})` is the GENERIC baseline. No jitter anywhere.
- **Skills:** `retry-policy`, `exponential-backoff`, `message-retry-strategy`.

### RES-04 Crash on fatal · VERIFIED · E2 (A)
- `uncaughtException` / `unhandledRejection` → `logger.error(err, "Fatal … — exiting")` → `setTimeout(process.exit(1), 250).unref()`; never resume. B registers **no** `uncaughtException`/`unhandledRejection` handlers (grep: none) — gap.
- **Skills:** `fatal-error-process-policy`.

### RES-05 Graceful shutdown · UNRESOLVED (defective in both) — ARCH-03.
- **Skills:** `graceful-shutdown`.

### RES-06 Bounded concurrency · VERIFIED · E2
- A `mapWithConcurrency(items, limit, fn)` returns settled results in order; B `WEBHOOK_INLINE_DELIVERY_CONCURRENCY`, queue batch size ≤32.
- **Skills:** `bounded-concurrency`, `bulkhead-pattern`.

### RES-07 Isolation · E3
- Failures of optional integrations (notifications, Service Bus when not mandatory, outbox disabled) must not fail the main path; workers isolated per batch. No bulkhead library.
- **Skills:** `fault-isolation`, `bulkhead-pattern`, `graceful-degradation`.

### RES-08 Dependency-level rate limiting · E0 (GENERIC)
- **Skills:** `rate-limiting`.

---

## LLM — AI

### LLM-01 LLM invocation · E0 (GENERIC)
- No LLM invocation code (no OpenAI/Anthropic/Semantic Kernel imports) in A or B. Skills `llm-api-call`, `llm-client-management`, `prompt-management`, `prompt-versioning`, `structured-llm-output`, `llm-response-validation`, `llm-retry-timeout`, `ai-guardrails`, `llm-error-handling` are **GENERIC baselines** that inherit INT-01/RES/ERR/OBS standards; they explicitly make no organizational-standard claim.

### LLM-02 AI configuration storage · VERIFIED · E2 (A)
- A manages model master, deployments, resources (`modelMaster.service`, `aiResources.service`, `aiConfig.service`, `aIConfigModel` from `@inextlabs/schema-models`); AI config cached in Redis `aIConfig:{clientId}:{botId}:{featureId|all}` (24 h TTL); `MASK_CONFIG` masks `key`, `endpoint`, `connectionString`. Model/deployment keys are **secrets**.
- **Skills:** `model-configuration`.

### LLM-03 Token & cost accounting · VERIFIED · E2 (B)
- Cost via `CostCalculatorRegistry` + `LlmTokenStrategy` (`per_million_tokens`/`per_token`; input, cached-input, output, reasoning (`reasoning_billing`), embedding tokens) over pricing resolved L1(1 h) → L2 Redis(3600 s) → Mongo `llm_model_pricing`; decorators (free tier, margin, minimum charge); `usdToCredits` with `USD_PER_CREDIT`; derived usage event `aiCredits` with deterministic derived ID; missing pricing ⇒ skip + log (zero cost) rather than throw.
- **Skills:** `token-management`, `token-cost-optimization`, `cost-calculation-strategy-registry`.

---

## TEST — Testing

### TEST-01 Frameworks and layout · TECH / UNRESOLVED (C-04)
- A: Jest 29 + `ts-jest`, `roots:["<rootDir>/test"]`, `test/setup.ts` env stubs, `test/helpers/request.ts` (`mockReq/mockRes/mockNext`), `test/mocks/{logger,platform-errors}.ts`, per-controller `*.spec.ts` (~21), `jest-junit` + cobertura output; **no coverage threshold**, `--passWithNoTests`; `supertest` installed but unused.
- B: Vitest 4, colocated `*.test.ts` (~60 files), `*.integration.test.ts` (separate config), `e2e/*.e2e.test.ts` (separate config), `globals:true`, `testTimeout:30_000` because suites call `vi.resetModules()`.
- **Rule:** follow the target repo's framework; do not add a second runner.
- **Skills:** `unit-testing`, `integration-testing`, `end-to-end-testing`, `test-coverage-standards`.

### TEST-02 Doubles · VERIFIED · E2
- A: `jest.mock("@inextlabs/logger", …)` returning `{default: mockLogger, serializeError, createMasker}`; manual mock for `@inextlabs/platform-errors`. B: in-memory `memory-redis`, `memory-mongo`, `memory-service-bus` doubles + `__set*ForTests` hooks; axios mocked for client tests.
- **Skills:** `mocking-test-doubles`, `in-memory-test-harness`, `database-testing`, `message-processing-testing`.

### TEST-03 Functional/API testing with Postman · VERIFIED · E2
- Postman collections committed (`postman/*.json` in A; `docs/postman-enforcement-v2.json`, `docs/functional-tests/docsai/*` in B) with environment file and step runner (`scripts/docsai-step-runner.ts`); Postman CLI is available on developer machines.
- **Skills:** `api-testing`, `postman-functional-testing`, `api-contract-testing`.

### TEST-04 CI test gating · VERIFIED · E1
- A: Azure pipeline `UnitTest` stage publishes JUnit + Cobertura and gates `Build`. B: GitHub `ci.yml`: `npm ci` → `npx tsc --noEmit` → `npm test` on PRs to `devtest|staging|main`.
- **Skills:** `ci-cd-pipeline`, `test-coverage-standards`.

### TEST-05 Perf/load/security testing · E0 (GENERIC)
- B has NFR review CSV and `v2-nfr.test.ts` (NFR assertions) — closest evidence. 
- **Skills:** `performance-testing`, `load-testing`, `security-testing`, `test-data-management`.

---

## DOC / OPS — Documentation & DevOps

### DOC-01 Docs set · VERIFIED · E2
- README (what/how/env/API), `docs/` with ADRs (`docs/adr/ADR-00x-*.md`), architecture knowledge base, functional-test walkthroughs, local dev stack, OpenAPI JSON, Postman collections, repo-local `.claude/skills`, `.github/copilot-instructions.md`.
- **Skills:** `readme-documentation`, `technical-documentation`, `architecture-documentation`, `architecture-decision-records`, `api-documentation`, `operational-runbooks`, `developer-onboarding-documentation`, `deployment-documentation`.

### OPS-01 Dockerfile · TECH / UNRESOLVED (C-20)
- Best observed (B): multi-stage; build stage `npm ci` with `AuthToken` build-arg then **delete `.npmrc`**; `npm prune --omit=dev`; runtime copies only `package*.json`, `node_modules`, `dist`; `dumb-init` entrypoint; non-root `nodejs:1001`; `HEALTHCHECK` node one-liner; `EXPOSE 3001`; `ENV NODE_ENV=production`. A's Dockerfile copies the whole build tree (incl. sources, `.npmrc`) and runs as root — do not copy.
- **Skills:** `docker-containerization`.

### OPS-02 Pipelines · VERIFIED · E1 / C-21
- Azure DevOps YAML per environment: `azure-pipeline-devtest.yaml` (branch `devtest`), `-stg.yaml` (A), `-prod.yaml`. Image repo `<env>/<service>` in ACR (`inflowdevtestacr.azurecr.io`), tags `<shortSha8>` (+ `latest` in devtest — defect), variable group `iNextLabs-DevTest-Variables`, secrets via `AuthToken`. **Prod:** `SecretScan (TruffleHog)` → `SonarQubeScan` (quality gate) → `SnykScan` (SCA) → `Build` → `TrivyScan` (container) → `Push`. A also has `UnitTest` gating `Build` in devtest. **No deploy/release stage exists in either repo** — deployment is outside the repo (gap).
- **Skills:** `ci-cd-pipeline`, `pipeline-security-scanning`, `deployment-release-management`, `environment-deployment-standards`.

### OPS-03 PR governance · VERIFIED · E1
- `.github/workflows/validate-pr.yml` calls the org reusable workflow `iNextLabs/github-workflows/.github/workflows/validate-azure-boards-pr.yml@main` on PRs to `devtest|staging|main` (links PRs to Azure Boards work items). B adds `ci.yml`.
- **Skills:** `code-review`, `ci-cd-pipeline`.

### OPS-04 Kubernetes / rollback / runbooks · E0 (GENERIC)
- No Kubernetes manifests. Dockerfile comment targets Azure Container Apps / ACI / App Service. Rollback = redeploy previous immutable image tag (GENERIC; requires SHA-tagged images — present). No runbooks beyond B's `LOCAL-DEV-STACK.md` and functional-test guides.
- **Skills:** `kubernetes-deployment`, `rollback-strategy`, `operational-runbooks`.

---

## Standards → skills quick index
Every ID above lists its skills. The authoritative cross-map (standard → repo → file → skill) is `governance/standards-evidence-matrix.md`; skill → standards is generated into `inventory/category-mapping.md`.
