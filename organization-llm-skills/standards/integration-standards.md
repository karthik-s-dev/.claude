# Integration Standards (domain view)

IDs: INT-01..06, MSG-01..07, DB-01..07, RES-01..08, ERR-09, CTX-02/03/04.

## Outbound HTTP (INT-01) — the organization's data-fetching pattern
1. One lazy axios instance per dependency (`baseURL`, `timeout` from env, JSON header) in an integration module; reset hook for tests.
2. Request interceptor: if `AZURE_SERVICE_OAUTH_SCOPE` set → `Authorization: Bearer <generateAuthToken()>`; **token failure aborts the call** with a typed unavailable error (status 401); internal-key services send `x-internal-api-key` + `x-internal-api-caller`; always `x-correlation-id` from async context.
3. Result contract: typed data, `null` = 404/confirmed absent, **throw `XUnavailableError(message, status?)`** for everything else; callers never treat a throw as empty.
4. Log: info on absence, error on failure with ids + `hint`; never tokens/bodies.
5. Map at the edge to catalog 502/503/504; never forward the downstream body.
6. Best-effort notifications: skip-with-log when unconfigured; catch+log; use the outbox when loss is harmful.
7. Not evidenced (GENERIC): retries/jitter, HTTP circuit breaker, `AbortController`. Shared `withRetry` exists, unused.

## Messaging (MSG-*)
Service Bus: one client, one cached sender per topic, `messageId` = deterministic event ID, `applicationProperties` incl. `correlationId`, connection string auth (C-13). Storage Queue: `QueueClient` per queue, base64(JSON), ≤32 per receive, delete after success, drop malformed. Outbox: row before delivery, worker poll, attempts/max/TTL. Webhooks: HMAC (inbound raw body; outbound `timestamp.body`), SSRF guard. Not evidenced: consumers of Service Bus, DLQ, inbox, message versioning.

## Datastores (DB-*)
Mongo (mongoose+schema-models **or** native driver — C-11), Redis (ioredis, Azure TLS, bounded timeouts, key builders, fail-open wrapper + breaker, token locks), repositories per aggregate with `ensureIndexes()` and `close()`, TTL indexes for retention.

## Failure policy (INT-02, RES-*)
Security fails closed; correctness stores surface errors (503); optional features fail open and are marked; timeouts on every call; write-path budget → 504.

Skills: `external-api-client`, `http-client-management`, `integration-error-handling`, `azure-service-bus-client`, `azure-queue-storage-client`, `outbox-pattern`, `webhook-delivery`, `mongodb-client`, `redis-client`, `caching-strategy`, `fail-open-fail-closed-policy`.
