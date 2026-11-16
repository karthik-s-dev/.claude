---
name: request-header-management
description: Use when reading, validating, setting or propagating HTTP headers - correlation, idempotency key, internal API key and caller, authorization, client/bot IDs, retry-after, deprecation/sunset - inbound, outbound and in CORS configuration.
---

# Request Header Management

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `request-header-management` |
| Category | 02 — API Development & Design |
| Scope | Header names, parsing, propagation and CORS exposure. |
| Applicability | HTTP services. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (API-04, CTX-02) |
| Governing standards | `API-04`, `CTX-01`, `CTX-02`, `CTX-03`, `SEC-03`, `SEC-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `correlation-id-management`, `idempotency-management`, `service-to-service-authentication`, `internal-api-key-authentication`, `cors-policy`, `http-client-management` |

## Purpose
Single place for header names and rules so propagation never drifts.

## When to use
- Adding a header-driven behaviour.
- Making an outbound internal call.
- Changing CORS `allowedHeaders`/`exposedHeaders`.

## Organizational standards
- **MANDATORY:** Use the service's single `HEADERS` constants module (lowercase): `x-correlation-id`, `idempotency-key`, `x-internal-api-key`, `x-internal-api-caller`, `client-id`, `bot-id`, `authorization`, `retry-after`, `deprecation`, `sunset`, `link`. Do not hard-code literals in handlers (one constants module per service; no duplicated copies).
- **MANDATORY:** Outbound internal calls send `x-correlation-id`, `x-internal-api-key`, `x-internal-api-caller: <this-service>` (CTX-02); calls to Entra-protected APIs add `Authorization: Bearer <token>`.
- **MANDATORY:** Read headers case-insensitively; take the first value of array headers; trim.
- **MANDATORY:** CORS `allowedHeaders` lists every custom request header and `exposedHeaders` includes `x-correlation-id`.
- **MANDATORY:** Correlation and idempotency rules come from their canonical skills; do not re-implement them here.
- **Verified convention:** Retired routes emit `Deprecation`, `Sunset`, `Link` (`deprecation-sunset-management`).

_Source of truth: `API-04`, `CTX-01`, `CTX-02`, `CTX-03`, `SEC-03`, `SEC-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Import `HEADERS` from the repo's single constants module (create it if missing).
2. Build outbound headers in one helper per integration.
3. Update CORS when adding a header.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Outbound internal call headers**

```ts
const headers = {
  "Content-Type": "application/json",
  [HEADERS.INTERNAL_API_KEY]: apiKey,
  [HEADERS.INTERNAL_API_CALLER]: "my-service",
  ...(getCorrelationId() ? { [HEADERS.CORRELATION_ID]: getCorrelationId()! } : {}),
};
```

## Error and failure handling
- Missing optional header -> proceed with documented default; missing required header -> 400 validation error.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Never log `authorization` or `x-internal-api-key` values (log masked suffix only).
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- Header case-insensitivity; propagation on outbound; CORS preflight allows the header.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- `req.headers["X-Correlation-Id"]` literals scattered.
- Forwarding all inbound headers downstream.
- Trusting `x-forwarded-*` without configuration.

## Implementation checklist
- [ ] Constants used; propagation; CORS updated; no secret logging.

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
- Use the service's single `HEADERS` constants module (lowercase): `x-correlation-id`, `idempotency-key`, `x-internal-api-key`, `x-internal-api-caller`, `client-id`, `bot-id`, `authorization`, `retry-after`, `deprecation`, `sunset`, `link`. Do not hard-code literals in handlers (one constants module per service; no duplicated copies).
- Outbound internal calls send `x-correlation-id`, `x-internal-api-key`, `x-internal-api-caller: <this-service>` (CTX-02); calls to Entra-protected APIs add `Authorization: Bearer <token>`.
- Read headers case-insensitively; take the first value of array headers; trim.
- CORS `allowedHeaders` lists every custom request header and `exposedHeaders` includes `x-correlation-id`.
- Correlation and idempotency rules come from their canonical skills; do not re-implement them here.

## Related skills
- `correlation-id-management` — Correlation ID Management
- `idempotency-management` — Idempotency Management
- `service-to-service-authentication` — Service-to-Service Authentication
- `internal-api-key-authentication` — Internal API Key Authentication
- `cors-policy` — CORS Policy
- `http-client-management` — HTTP Client Management
