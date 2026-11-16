---
name: external-api-client
description: Use whenever code fetches data from or calls another service or external HTTP API - client creation, headers, Managed-Identity auth, correlation propagation, timeouts, response parsing, 404-as-absent vs unavailable, error transformation, logging, caching, cancellation and tests. This is the canonical data-fetching and failure-propagation pattern.
---

# External API Client

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `external-api-client` |
| Category | 09 — Cloud Storage & External Integrations |
| Scope | Outbound HTTP calls to services and APIs. |
| Applicability | Node.js `axios` (reference); contract applies to any HTTP client. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (INT-01, INT-02, CTX-02, ERR-09) - the organization's data-fetching pattern |
| Governing standards | `INT-01`, `INT-02`, `CTX-02`, `ERR-09`, `RES-02`, `SEC-02`, `OBS-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `http-client-management`, `integration-error-handling`, `resilient-http-communication`, `service-to-service-authentication`, `dependency-failure-handling`, `retry-policy` |

## Purpose
Every outbound call is bounded, authenticated, traceable, and reports failures in a way callers cannot misread.

## When to use
- Adding any outbound HTTP call.
- Reviewing code that treats HTTP errors as empty results.

## Organizational standards
- **MANDATORY **client**:** one lazily created client per dependency (`axios.create({ baseURL, timeout: <DEP>_TIMEOUT_MS (default 5000), headers: { "Content-Type": "application/json" } })`) in an integration module (`<dependency>-http.ts`); base URL and timeout from config; test reset hook (`__resetXClientForTests`).
- **MANDATORY **auth**:** when `AZURE_SERVICE_OAUTH_SCOPE` is set, a request interceptor adds `Authorization: Bearer <generateAuthToken()>`; **if the scope is set and the token cannot be obtained, abort the request** with a typed unavailable error (status 401) - never call the dependency unauthenticated; when the scope is unset (local/dev) requests go without a token. Internal key services use `x-internal-api-key` + `x-internal-api-caller`.
- **MANDATORY **correlation**:** send `x-correlation-id` from the ambient context on every call (`CTX-02`); never fatal if absent.
- **MANDATORY **response contract**:** functions return typed data or `null`: **`null` = the dependency answered 404 / confirmed absence**; **any other failure throws a typed `XUnavailableError(message, status?)`** (timeout, network, 5xx, auth failure, other 4xx). Callers must never convert the throw into "empty/unlimited" (`ERR-09`).
- **MANDATORY **logging**:** info for confirmed absence (with ids), `error` for failures with context (ids, URL path, status, message) and a remediation `hint`; never log tokens/bodies.
- **MANDATORY **timeouts**:** always set; no unbounded waits; write-path budget `CHECK_AND_RECORD_TIMEOUT_MS` style where the API defines one.
- **MANDATORY **upstream effect**:** failures map to 502/503/504 catalog entries at the edge (`error-propagation`); the downstream's raw body/status is not forwarded.
- **MANDATORY **best-effort calls** (notifications):** skip with a log when URL/key unset, catch+log failures (`warn` + `serializeError`), and use the outbox when loss is harmful (`outbox-pattern`).
- **Generic baseline (provisional) (not evidenced):** retries with backoff and jitter, circuit breaker and `AbortController` cancellation are not implemented in the reference; see `retry-policy`, `circuit-breaker`, `timeout-management`. The shared `withRetry` is exported but unused.
- **MANDATORY:** Caching of results follows `caching-strategy` including a stale window.

_Source of truth: `INT-01`, `INT-02`, `CTX-02`, `ERR-09`, `RES-02`, `SEC-02`, `OBS-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Create the integration module with `getClient()`, one function per operation, and the error mapper.
2. Write the mapper: 404 -> `null`; else log + throw typed error.
3. Wire the typed error to a catalog entry in the error middleware / service.
4. Add tests (below).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Client + mapper (reference pattern)**

```ts
let client: AxiosInstance | null = null;
export function getDependencyClient(): AxiosInstance {
  if (!client) {
    client = axios.create({ baseURL: config.dep.baseUrl, timeout: config.dep.timeoutMs, headers: { "Content-Type": "application/json" } });
    client.interceptors.request.use(async (req) => {
      if (!process.env.AZURE_SERVICE_OAUTH_SCOPE) return req;
      try { req.headers["Authorization"] = "Bearer " + (await generateAuthToken()); const cid = getCorrelationId(); if (cid) req.headers["x-correlation-id"] = cid; return req; }
      catch (err) { logger.error({ err: serializeError(err) }, "Token acquisition failed - aborting request"); throw new DependencyUnavailableError("Token acquisition failed", 401); }
    });
  }
  return client;
}
export function mapRequestError(err: unknown, ctx: { id: string; url: string }): null {
  const status = axios.isAxiosError(err) ? err.response?.status : undefined;
  if (status === 404) { logger.info({ id: ctx.id }, "Dependency reports no record"); return null; }
  logger.error({ ...ctx, status, err: serializeError(err), hint: "Check DEP_BASE_URL and that the service is running" }, "Dependency call failed");
  throw new DependencyUnavailableError("Failed to call dependency: " + (err instanceof Error ? err.message : String(err)), status);
}
```

## Error and failure handling
- Absent -> `null`; unavailable -> typed error -> 503/502; request budget exceeded -> 504; never silent empty.
- Distinguish confirmed absence from unavailability; never treat an unavailable dependency as empty data (ERR-09).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Tokens never logged; base URL from config only; for client-supplied URLs use the SSRF guard (`ssrf-protection`).
- Outbound calls carry only the identity and correlation headers defined in CTX-02; validate any client-supplied URL with the SSRF guard (INT-03).

## Testing guidelines
- Mock axios: 200, 404 (-> null), 500/timeout/network (-> typed error), token failure (no request sent), correlation header present, cache-stale behaviour.
- Mock the HTTP/SDK client; cover 2xx, confirmed-absent (404), 4xx, 5xx, timeout and token-acquisition failure.

## Anti-patterns
- `catch { return [] }`.
- Per-call `axios.get` without timeout.
- Logging response bodies.
- Retrying non-idempotent calls without idempotency keys.

## Implementation checklist
- [ ] Timeout; auth; correlation; null/throw contract; mapping; tests.

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
- one lazily created client per dependency (`axios.create({ baseURL, timeout: <DEP>_TIMEOUT_MS (default 5000), headers: { "Content-Type": "application/json" } })`) in an integration module (`<dependency>-http.ts`); base URL and timeout from config; test reset hook (`__resetXClientForTests`).
- when `AZURE_SERVICE_OAUTH_SCOPE` is set, a request interceptor adds `Authorization: Bearer <generateAuthToken()>`; **if the scope is set and the token cannot be obtained, abort the request** with a typed unavailable error (status 401) - never call the dependency unauthenticated; when the scope is unset (local/dev) requests go without a token. Internal key services use `x-internal-api-key` + `x-internal-api-caller`.
- send `x-correlation-id` from the ambient context on every call (`CTX-02`); never fatal if absent.
- functions return typed data or `null`: **`null` = the dependency answered 404 / confirmed absence**; **any other failure throws a typed `XUnavailableError(message, status?)`** (timeout, network, 5xx, auth failure, other 4xx). Callers must never convert the throw into "empty/unlimited" (`ERR-09`).
- info for confirmed absence (with ids), `error` for failures with context (ids, URL path, status, message) and a remediation `hint`; never log tokens/bodies.
- always set; no unbounded waits; write-path budget `CHECK_AND_RECORD_TIMEOUT_MS` style where the API defines one.
- failures map to 502/503/504 catalog entries at the edge (`error-propagation`); the downstream's raw body/status is not forwarded.
- skip with a log when URL/key unset, catch+log failures (`warn` + `serializeError`), and use the outbox when loss is harmful (`outbox-pattern`).
- Caching of results follows `caching-strategy` including a stale window.

## Related skills
- `http-client-management` — HTTP Client Management
- `integration-error-handling` — Integration Error Handling
- `resilient-http-communication` — Resilient HTTP Communication
- `service-to-service-authentication` — Service-to-Service Authentication
- `dependency-failure-handling` — Dependency Failure Handling
- `retry-policy` — Retry Policy
