# Architecture Standards (domain view)

Authoritative IDs live in `organization-engineering-standards.md` (ARCH-01..07, API-01..10, CTX-01..05). This view orders them as an engineer would apply them.

## 1. Service anatomy (ARCH-01/02)
```
server.ts (bootstrap) -> app.ts (composition root)
general/  : logger, correlation, telemetry, cache, db, health, response/error helpers   (imports no feature code)
<feature>/: routes -> controllers -> services -> {repositories, integrations}; schemas; utils(errorCatalog, env.schema); docs
```
Dependency direction is one-way. Controllers: parse, call one service, respond or `next(toAppError(err))`. Services: no `express`. Repositories own datastore access; integrations own outbound HTTP.

## 2. Lifecycle (ARCH-03)
validate env → configure logger → fatal handlers → telemetry → connect → start workers → listen → on signal: stop workers → drain HTTP (bounded) → close dependencies → flush logger → exit. **Both reference services close dependencies before draining (C-22).**

## 3. Request pipeline (ARCH-05)
CORS(allow-list) → body parser (raw bytes if signatures) → rate limiter → correlation → auth → internal-key / webhook signature → `validate(schema, segment)` → controller → error middleware (last).

## 4. Dependency wiring (ARCH-04)
Manual constructor injection with production defaults; lazy module singletons with `getX()/closeX()`; test seams prefixed `__`. No DI container.

## 5. Patterns (ARCH-06)
Strategy+Registry+Decorator, factory helpers (`appErr`, `throwXError`), outbox, adapter/normalizer, LRU+tiered cache, lazy singleton.

## 6. Boundaries (ARCH-07)
Owner exposes API/events; consumers never read the owner's datastore/cache (C-19). Internal calls: `x-internal-api-key`, `x-internal-api-caller`, `x-correlation-id`; Entra bearer where protected.

## 7. Unresolved
C-14 route naming · C-15 health endpoints · C-17 file naming · C-22 shutdown defects.

Skills: `microservice-architecture-standards`, `project-structure`, `layered-architecture`, `clean-architecture`, `service-registration-lifecycle`, `middleware-request-pipeline`, `service-boundary-responsibility`, `design-patterns`, `dependency-injection`, `solid-principles`.
