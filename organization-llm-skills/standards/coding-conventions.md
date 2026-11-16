# Coding Conventions (domain view)

Evidence-based only. No lint/format configuration (`eslint`, `prettier`, `editorconfig`) exists in either reference repo (E0) — do not claim lint rules; recommend adding with approval.

## TypeScript / Node
- TypeScript 5.x, `strict: true` (aliased reference; flag repos with `strict: false`), CommonJS, target ES2020+ (reference A) / repo default (B). Node 20 (A) vs 22 (B) — C-20.
- Aliases (`@general/*`, `@servicesv2/*`, …) declared in `tsconfig.json`, mirrored in the test runner and resolved at build (`tsc-alias`). Repos without aliases use relative imports. Follow the repo.
- File naming: `camelCase.role.ts` (A) vs `kebab-case.ts` (B) — C-17; follow the repo. Roles: `.controller`, `.service`, `.repository`, `.routes`, `.middleware`, `.schema`.
- Catalogs and constants are `as const`; types derived with `keyof typeof`.
- Test-only exports start with `__` (`__setRedisForTests`).
- Comments explain *why* and cite finding IDs (`// SEC-02:`, `// DAT-01:`, `R-0xx`); no commented-out code (reference defects: commented webhook boot guard).
- No `console.*`; no `process.env` reads outside config/env modules (reference exceptions are defects).
- No `any` in new code without a justification comment.
- Fire-and-forget promises: `void fn().catch(logError)`.

## Naming
- Env vars `UPPER_SNAKE_CASE` with unit suffix `_MS|_SECONDS|_DAYS` and integration prefix (CFG-01).
- Error keys `UPPER_SNAKE_CASE` semantic (`CLIENT_CONFIG_NOT_FOUND`); numeric code per ERR-03.
- Redis keys `<domain>:<scope>:<id>` built by a key-builder module.
- Headers lowercase constants (`HEADERS`).
- Queue/outbox statuses: `pending | published | failed`.
- Metric/type constants hyphenated canonical values (`USAGE-ALERT`) — never reuse deprecated spellings.

## Idioms
Controller: `try { … sendSuccess(...) } catch (err) { next(toAppError(err)); }`.
Logger: `logger.level({ fields }, "message")`.
Throw: `throwXError("KEY", safeDetails)` / `throw appErr(EC.KEY, details)`.
Absent vs unavailable: `null` vs typed `…UnavailableError`.

Skills: `coding-standards-review`, `clean-code-review`, `project-structure`, `structured-logging`, `error-catalog-management`.
