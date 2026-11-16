# Cross-Repository Comparison

A = `inflow-config-service-repo`, B = `inflow-usage-enforcement-service`. ✔ = implemented · ◐ = partial/defective · ✘ = absent. Conflict IDs refer to `conflicts-and-open-decisions.md`.

## Common conventions (E1 — candidates for default organizational pattern)
| Area | Common behaviour |
|---|---|
| Stack | Node + TypeScript + Express 4, CommonJS, `ioredis`, `axios`, Azure-hosted |
| Internal packages | `@inextlabs/logger@1.0.4`, `platform-errors@1.0.1`, `azure-oauth@1.0.7` pinned/consistent; GitHub Packages registry with `${AuthToken}` |
| Error contract | `AppError` + `formatError` envelope `{success:false,error:{code,numericCode,message,details?},metadata:{correlationId,timestamp}}`; one error middleware; catalog as typed const map; 8-digit numeric codes |
| Correlation | `x-correlation-id`, AsyncLocalStorage, echoed, propagated outbound (both accept `x-request-id`, C-08) |
| Auth | Entra JWT for public/service surfaces; internal API key + caller header for internal; Managed Identity for outbound |
| Config | `.env` + committed `.env.example`; env-driven toggles; production default when env unset |
| Resilience | bounded timeouts; fail-open vs fail-closed decided explicitly; Mongo outbox; SSRF guard on client URLs |
| Cache | Redis with Azure TLS; in-process maps/LRU; explicit invalidation |
| Delivery | Azure DevOps YAML per env branch (`devtest`/`staging`/`main`), ACR image tagged short SHA, PR validation against Azure Boards |

## Shared architecture patterns
Lazy module singletons for clients with `close*()`; fire-and-forget index creation; worker `start/stop`; test overrides prefixed `__`; webhook HMAC with `timingSafeEqual` where verified; `// <Finding-ID>:` comments documenting security/reliability rationale (A: `SEC-xx`, `DAT-xx`, `RES-xx`; B: `R-0xx`).

## Differences
| Concern | A | B | Cause |
|---|---|---|---|
| Layout | zones + aliases | flat + relative | evolution (A restructured under ADR-002 pattern) |
| Validation | Zod | manual | framework choice |
| Mongo | mongoose, per-tenant connections | native driver | A multi-tenant models; B document collections |
| Messaging | none (webhooks + outbox) | Service Bus + Queue Storage + outbox | service responsibility |
| Idempotency | ✘ | ✔ (Redis) | B's write API is retry-prone |
| API rate limiting | ✔ (in-memory) | ✘ | A exposes admin/fan-out routes |
| Health | live/ready | single health | A newer |
| Telemetry | App Insights SDK | OTEL | tooling choice (C-10) |
| Tests | Jest | Vitest | framework choice |
| Success envelope | ✔ | ✘ | C-06 |
| Docker | weaker | stronger | C-20 |
| Global fatal handlers | ✔ | ✘ | gap in B |
| Startup dependency check | ✘ (env only) | ✔ | B added `validateStartup` |
| Fail-open policy model | cache fail-open | `record_only`/`enforce` + fail-open marker | domain |

## Evidence of evolution / legacy
A: `v1` frozen with `legacyAccessMiddleware`, stale duplicate logger modules (`src/v1/utils/logger.ts`, `src/v2/utils/logger.ts`), parallel request-id system (`requestTelemetry.middleware.ts`). B: v1 router + v1 `error-codes.ts` + `createErrorResponse` beside v2 catalog; `v2/platform.ts` "temporarily vendored" copy of shared-lib helpers; deprecated route 410s with `Sunset: 2026-07-01`.

## Skill existing in the repos (pre-existing organizational skills — preserved and extended)
A `.claude/skills`: `error-catalog-management`, `health-endpoint-implementation`, `optional-environment-variables`, `required-environment-variables`, `structured-logging` (generic, with "reference implementation lessons"). B: `correlation-id-management`, `idempotency-management` (generic + **"Organisation standards (ADR defaults)"** — treated as MANDATED decisions). The new ecosystem keeps their names where categories match, makes organizational rules primary, and keeps their generic depth by reference (`Related skills`) rather than copying it.
