# Conflicts, Gaps and Open Decisions (Deliverable 6)

**Status update 2026-11-16 — owner approved the recommendations ("ok with recommendation") and excluded `@inextlabs/inflow-usage-utils` from the ecosystem.** Approved items are listed with their outcome in §E; skills render them as **DECIDED (C-xx)**. Items marked *still open* keep the earlier behaviour: follow the target repository's existing implementation, report the deviation, never silently choose a side. The usage-utils exclusion changes recommendations that relied on it: shared helpers (error-code builder, retry, event IDs, correlation helpers, URI masking, header constants, OTEL init) are now **local helpers in each service**; its winston `createLogger`, `buildSuccessResponse` shape and vendored-copy concern (C-02, C-06, C-08, C-09, C-16) are moot as references.

Legend — Nature: **T** technology/framework · **A** architectural · **L** legacy/evolution · **I** inconsistency · **R** risk (security/reliability).

## A. Conflicting implementations

| ID | Topic | Repo A (config) | Repo B (enforcement) | Nature | Newer / wider? | Impact of choosing | Recommendation | Approval |
|---|---|---|---|---|---|---|---|---|
| C-01 | **Error code MODULE_NUM semantics** and legacy schemes | `MM="00"` hard-coded; sequences banded by HTTP category (001–010 validation …); `PLATFORM_CODE`/`SERVICE_CODE` from env with fallbacks (`"1"`,`"02"`); logger gets `"102"` | `MM` = source file/area (01–07), per-file sequences from 001, no category banding; `SS=3` constant; `makeErrorCode()` from shared pkg. Also **legacy** `error-codes.ts` (`50`+HTTP) and vendored `HttpError` (`INXT50`+HTTP) still emitted by v1 routes/internal auth | A (policy) | B's is documented as ADR-004 and uses the shared helper → newer; A pre-dates | Banding aids triage by number; file-MM aids ownership but couples codes to file layout (renames break meaning) | Keep the mandated `P+SS+MM+EEE` 8-digit format (via `makeErrorCode`); decide MM = *functional module* (not file) and whether category banding is required; migrate legacy `50xxx`/`INXT50xxx` | **Approved 2026-11-16** (MM = functional module; banding optional - confirm) |
| C-01b | Stray-error wrapping | `toAppError()` wraps unknown → `UNHANDLED_ERROR` (cause on `Error.cause`) | `v2ErrorMiddleware` passes raw error to `formatError` → `UNKNOWN_ERROR`/`"0"` (not a catalog code) | I | A | Uncatalogued code in prod responses | Adopt A's wrapper in B-style repos | **Approved 2026-11-16** |
| C-02 | **Logger initialization/call shape** | default singleton + `configureLogger()` before app import; wrapper `(obj\|Error\|msg, msg?)` auto-adds `correlationId`; `closeLogger()` on shutdown | `createLogger({service, level, eventHub?})` instance + `FlexibleLogger` accepting legacy `(msg, meta)` Winston-order; no auto correlation; `winston` in `package.json` unused; `@inextlabs/inflow-usage-utils` also exports a **winston** `createLogger` | T/L | Package README documents `configureLogger` + Pino order | Mixed argument order makes log fields inconsistent; third logger path risks competing implementations | `@inextlabs/logger` only; `configureLogger()` before imports (or `createLogger` for isolated instances); new calls `(obj, msg)`; remove unused `winston`; never use usage-utils' winston logger | **Approved 2026-11-16** |
| C-03 | **Config validation** | Zod schema + memoized `validateEnv()` before app import | hand-rolled `getEnv/getEnvInt` + `validateStartup()` (dependency pings) | T/A | A is the declarative approach | B-style defaults can mask misconfiguration; A-style lists diverge from health/`.env.example` (A defect) | Declarative schema as single source; startup dependency checks as separate step | **Approved 2026-11-16** |
| C-04 | **Test framework & seams** | Jest + ts-jest, `test/` tree, `jest.mock` | Vitest, colocated tests, `__set*ForTests` hooks, in-memory doubles | T | — | Two runners in estate | Follow target repo; do not mix | Approved (follow target repo; no change) |
| C-05 | **JWT validation** | `validateAuthToken()` (`@inextlabs/azure-oauth`) | custom `jose` middleware with client-claim binding & allowed app IDs/roles | T/A | B stricter (tenant binding) | Package emits non-catalog error bodies, logs tenant ID, builds JWKS URL from an unverified claim | Prefer the package where present; request that the package adopt platform-errors envelope + client binding; do not hand-roll in new services without approval | **Approved 2026-11-16** |
| C-06 | **Success envelope** | `{success,message,data,metadata}` | raw payload | A | A (+ shared `buildSuccessResponse` w/o `message`) | Mixed shapes force client special-casing | Envelope everywhere; decide on `message` field | **Approved 2026-11-16** |
| C-07 | **Idempotency store/contract** | none | Redis `SET NX` + Lua CAS; body+header key; codes `IDEMPOTENCY_KEY_CONFLICT`/`…_REQUEST_IN_PROGRESS` | A/L | ADR default says relational DB, header-only, `IDEMPOTENCY_KEY_REUSED`/`IDEMPOTENCY_IN_PROGRESS`, fail-closed 503 | Redis eviction/failover can lose keys; effect-level dedupe (deterministic IDs) compensates | Keep ADR default as the target; treat B as a documented deviation; effect-level dedupe mandatory | **Approved 2026-11-16** |
| C-08 | **Correlation trust & fallback** | accepts any inbound value + `x-request-id`; own ALS | same; vendored copy of shared helpers in `v2/platform.ts` "until published"; ALS duplicated | I/R | ADR default: no fallback, regenerate for untrusted | Log-injection/forgery of IDs; two ALS stores | Implement ADR default (validated charset/length, trusted-caller policy); consume shared helpers; one ALS per service | **Approved 2026-11-16** |
| C-09 | **Pagination shape** | `pagination:{page,limit,totalItems,totalPages,hasNextPage}` in `data` (partial adoption) | `pagination:{page,pageSize,totalItems,totalPages}` | A | shared pkg: `metadata.pagination:{limit,offset,total,hasMore}` | Three shapes | Pick one per estate | **Approved 2026-11-16** (shape = `data.pagination {page, limit, totalItems, totalPages, hasNextPage}` - confirm) |
| C-10 | **Telemetry stack** | `applicationinsights` SDK, W3C | OTEL (`initOtelLogging` spike; SDK wiring per service) | T | OTEL is the shared-lib direction | Duplicate instrumentation if both | Decide estate APM; skills describe both as TECH | **Still open** (APM stack not chosen) |
| C-11 | **Mongo client & Redis profile** | mongoose + schema-models; per-tenant connection map; fail-fast Redis (150 ms, 1 retry, no offline queue) | native driver singletons; resilient Redis (5 retries, offline queue, keyPrefix); lock release by expiry only | T | — | Behaviour differs under outage | Keep per-repo; mandate bounded timeouts; locks use token+compare-delete (A) | Approved (follow target repo; no change) |
| C-12 | **Security-relax flags** | `isLocalOrDevEnv` conditional strictness | `SECURITY_RELAXED_FOR_DEVNDEMO`, `AUTH_FAIL_OPEN`, implicit relax when no keys on non-Azure host | R | — | A mis-set flag disables auth/SSRF | Do not add more; flag existing; require explicit prod guard | **Approved 2026-11-16** |
| C-13 | **Azure messaging auth** | n/a | Service Bus/Queue via connection strings | R | Identity-based (`DefaultAzureCredential`) is already used for HTTP | Secret sprawl | Plan migration to Managed Identity; skills keep connection-string contract and label adapter as pending | **Approved 2026-11-16** |
| C-14 | **Route naming** | resource-oriented, plural nouns, nested | action endpoints (`/check`, `/check-and-record`) | A | — | Inconsistent public contract | Follow target repo; resource-oriented for new CRUD-like APIs | **Approved 2026-11-16** |
| C-15 | **Health endpoints** | `/health/live`, `/health/ready`, legacy `/config/v1/health` | `/health`, `/v2/health` (ok/degraded/unavailable) | A/T | A matches orchestrator probes | Orchestrator misconfig | Live/ready split; flag B's single endpoint | **Approved 2026-11-16** |
| C-16 | **Outbound HTTP resilience** | per-call axios, 10 s timeout, swallow failures (+outbox) | shared axios instance, 5 s timeout, MI token interceptor, typed unavailable error | I | B | No retry/breaker/cancellation either side; `withRetry` unused | Adopt B's client shape; add retry/breaker as GENERIC | **Approved 2026-11-16** |
| C-17 | **File naming & layout** | `camelCase.role.ts`, aliases, zones | `kebab-case.ts`, relative imports, flat | I | — | Style drift | Follow target repo | **Approved 2026-11-16** |
| C-18 | **OpenAPI mechanism & exposure** | typed TS object, unauthenticated docs | `openapi.json` + swagger-ui, spec test | T | — | Docs exposure | Spec-as-test; gate non-public docs | **Approved 2026-11-16** |
| C-19 | **Shared-cache coupling** | owns subscription keys | reads A's Redis keys directly | A/R | — | Hidden coupling; key format change breaks B | Replace with API/event contract | **Approved 2026-11-16** |
| C-20 | **Dockerfile** | single copy-all runtime, root, node20, no HEALTHCHECK | multi-stage, prune, non-root, dumb-init, HEALTHCHECK, node22 | I | B better | Image hygiene, token leakage, Node version drift | B's pattern; align Node LTS | **Approved 2026-11-16** (Node LTS to align on: still open) |
| C-21 | **Pipelines & package manager** | `packageManager: pnpm` but npm lockfile; devtest tags `latest`; test stage gates build | npm; no unit stage in Azure (GitHub `ci.yml` does it); `latest` tag | I | — | Non-deterministic installs; unpinned deploys | Pick one manager; immutable SHA tags; tests gate build | **Approved 2026-11-16** (package manager: still open) |
| C-22 | **Graceful shutdown order** | closes deps then `server.close()` | stops workers, `server.close()` un-awaited, closes clients, `exit(0)` | I | — | Dropped in-flight requests | stop workers → drain HTTP (bounded) → close deps → flush logger | **Approved 2026-11-16** |

## B. Unclear conventions
- Whether `MM` is a module number or a file code (C-01).
- Whether `message` belongs in the success envelope (C-06).
- Which header is authoritative when both `x-correlation-id` and `x-request-id` arrive (ADR default: only `x-correlation-id`; both repos accept both).
- Retention and TTL policy values (`AUDIT_LOG_TTL_DAYS`, outbox TTL) are per-service and undocumented as org policy.
- The role of `@inextlabs/message-service`, `shared-bot-state`, `lg-template` (installed, not imported) — unknown.

## C. Missing standards (no organizational evidence; skills carry GENERIC baselines)
Dead-letter handling · inbox pattern · message versioning · Blob storage · transactions · metrics · operational alerting · mTLS/certificates · Kubernetes · rollback · runbooks beyond local dev · LLM invocation, prompts, guardrails · retry with jitter / circuit breaker for outbound HTTP · bulkheads · performance/load/security test practice · coverage thresholds · lint/format tooling · release/deploy stage.

## D. Technology gaps
- Target stacks other than Node/TypeScript/Express (Python, .NET, Java) have **no approved adapters**; skills state the organizational contract and mark adapters "requires approval".
- Identity-based auth for Service Bus / Queue Storage (C-13) not implemented anywhere.
- `@inextlabs/azure-oauth` defects (console logging, non-catalog error body) require a package-owner decision.

## E. Decisions (consolidated) — approved 2026-11-16 unless marked open
1. C-01 MM policy, banding, legacy-code migration. 2. C-05 JWT validation implementation owner. 3. C-06/C-09 envelope & pagination shapes. 4. C-07 idempotency store and code names. 5. C-08 trusted-caller correlation policy. 6. C-10 APM/OTEL stack. 7. C-12 removal/guarding of relax-flags. 8. C-13 Managed Identity for messaging. 9. C-14 route naming. 10. C-15 health endpoint contract. 11. C-19 shared Redis coupling. 12. C-20/C-21 Node version, package manager, immutable tags, deploy stage. 13. C-02 removal of unused `winston`.

**Outcomes adopted (recommendation accepted):**
| # | Decision |
|---|---|
| 1 | C-01: 8-digit `P+SS+MM+EEE` format kept; MM = functional module; migrate legacy `50xxx`/`INXT50xxx`. *Assumption to confirm:* category banding of sequences is optional. |
| 2 | C-05: prefer `@inextlabs/azure-oauth`; request catalogued error bodies, no console logging, client-claim binding from its owner. |
| 3 | C-06/C-09: success envelope `{ success, message, data, metadata:{correlationId, timestamp} }`; pagination `data.pagination { page, limit, totalItems, totalPages, hasNextPage }`. *Pagination shape chosen to match the envelope - confirm.* |
| 4 | C-07: ADR default is the target (header-only `Idempotency-Key`, relational store for new services, `IDEMPOTENCY_KEY_REUSED` / `IDEMPOTENCY_IN_PROGRESS`); Redis implementation is a documented deviation. |
| 5 | C-08: ADR default for correlation (validated IDs, trusted-caller policy, no `x-request-id` fallback); one implementation per service. |
| 6 | C-10: **still open** - APM/OTEL stack. |
| 7 | C-12: no new relax flags; existing ones guarded against production. |
| 8 | C-13: plan Managed Identity for messaging; connection strings until adapters are approved. |
| 9 | C-14: follow target repo; resource-oriented for new CRUD-like APIs. |
| 10 | C-15: new services expose `/health/live` + `/health/ready`. |
| 11 | C-19: replace cross-service cache reads with an API/event contract. |
| 12 | C-20/C-21: B's Dockerfile pattern; immutable SHA tags; tests gate build. *Still open:* Node LTS version, package manager. |
| 13 | C-02: `@inextlabs/logger` only; remove unused `winston`. |
| 14 | Package scope: `@inextlabs/inflow-usage-utils` excluded; helpers are local. |

## F. Observed insecure/defective patterns (documented, **not** promoted)
Fail-open internal auth in A's legacy v1 middleware; internal-config routes without key middleware; commented-out webhook-secret boot guard; unauthenticated Swagger; `AUTH_FAIL_OPEN`/relax flags; Map-based API-key lookup; non-constant-time; actor `undefined` in audit; business errors mapped to 500; 429 outside catalog; raw `res.json({error})` in a few A controllers; `console.log` of tenant ID inside `@inextlabs/azure-oauth`; `.env` files present in working trees (not read; git-ignored); outbox without backoff/claim in B; index creation failures only warned.
