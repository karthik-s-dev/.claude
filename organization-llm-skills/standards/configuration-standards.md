# Configuration Standards (domain view)

IDs: CFG-01..07.

1. **Source:** environment variables; `dotenv` loads `.env`; `.env`/`.env.*` ignored; `.env.example` committed with every variable, default and `REQUIRED` marker.
2. **Validation:** single declarative source (Zod `env.schema.ts` + `validateEnv()` in bootstrap **before** importing `app`; or a `config.ts` with typed `getEnv*` helpers) — aggregated, secret-free errors; startup dependency checks separate (`validateStartup()`, exit 1).
3. **Environment names:** `local, development, devtest, staging, customerdev, production`; `APP_ENV` / `DEPLOYMENT_ENV`; **unset ⇒ production**; strictness via one helper (`isLocalOrDevEnv`).
4. **Secrets fail closed:** absent outside local/dev ⇒ stop/reject. No new relax flags (C-12).
5. **Defaults:** safe, in code and `.env.example`; none for secrets; timeouts/TTL/batch/attempts always configurable; booleans parsed strictly.
6. **Precedence:** process env > `.env.local` > `.env` > code default; alias chains documented (`REDIS_HOST_NAME` → `AZURE_CACHE_FOR_REDIS_HOST_NAME` → `localhost`); keep old names working with a `warn`.
7. **Toggles:** env booleans default off, one accessor each (`FEATURE_DUAL_READ`, `*_ENABLED`, `*_WORKER_ENABLED`, `ENFORCEMENT_DEFAULT=enforce|record_only`).
8. **Secret sources:** environment only (no Key Vault code yet); Managed Identity for Entra-protected HTTP; connection strings for Service Bus/Queue/Redis/Mongo today (C-13); registry token via `${AuthToken}`.

## Variable naming groups (reference)
`PORT, NODE_ENV, LOG_LEVEL, SERVICE_NAME, APP_ENV|DEPLOYMENT_ENV` · `MONGO_*`/`USAGE_MONGO_*` · `REDIS_*`/`AZURE_CACHE_FOR_REDIS_*` · `<DEP>_BASE_URL/_TIMEOUT_MS` · `AZURE_SERVICE_OAUTH_*`/`ENTRA_*` · `INTERNAL_API_KEY_<CALLER>` · `SERVICE_BUS_*` · `AZURE_QUEUE_*` · `*_OUTBOX_*` · `WEBHOOK_*` · `NOTIFICATION_*` · `RATE_LIMIT_*` · `CORS_ALLOWED_ORIGINS` · `OTEL_*`/`APPLICATIONINSIGHTS_CONNECTION_STRING` · `AZURE_EVENTHUB_*`.

Known defects to avoid: three divergent env lists (schema vs health vs `.env.example`), commented-out boot guard, literal fallbacks for code constants, hard-coded Redis timeouts/breaker constants, unvalidated `parseInt`.

Skills: `configuration-management`, `required-environment-variables`, `optional-environment-variables`, `configuration-validation`, `configuration-defaults`, `configuration-precedence`, `environment-specific-configuration`, `feature-flag-management`, `configuration-security`, `startup-dependency-validation`.
