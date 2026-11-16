---
name: api-rate-limiting
description: Use when protecting HTTP endpoints from abuse or accidental overload - standard and strict tiers, 429 responses, headers and storage. Canonical for API-level limiting; dependency/service-level limiting is in `rate-limiting`.
---

# API Rate Limiting

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `api-rate-limiting` |
| Category | 02 — API Development & Design |
| Scope | Inbound request rate limits at the API tier. |
| Applicability | Express with `express-rate-limit`. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (API-09, A only) |
| Governing standards | `API-09`, `API-03`, `API-10` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `rate-limiting`, `middleware-request-pipeline`, `api-error-response`, `http-status-codes`, `bounded-concurrency` |

## Purpose
Prevents self-DoS and amplification (for example a fan-out refresh route) while keeping the error contract.

## When to use
- Exposing publicly reachable, abusable or expensive endpoints.
- Adding admin/fan-out operations.

## Organizational standards
- **MANDATORY:** Tiered limiters - global standard limiter (reference default 300/min via `RATE_LIMIT_STANDARD_PER_MIN`) and a strict limiter (default 5/min via `RATE_LIMIT_ADMIN_PER_MIN`) on expensive/fan-out routes; both env-configurable; `standardHeaders: true`, `legacyHeaders: false`.
- **MANDATORY:** The 429 response uses the standard error envelope with a **catalogued** code (reference defect: hand-built body with a non-catalog `RATE_LIMITED` code and the `UNHANDLED_ERROR` number - add a proper catalog entry).
- **MANDATORY:** Probe endpoints are excluded from limiting.
- **Verified convention:** Store is in-memory (per instance) and keyed on `req.ip`; multi-replica deployments need a shared store (Redis) wrapped fail-open, and keying on the authenticated principal behind a load balancer (generic; not implemented).
- **Verified convention:** Reference service B has no API rate limiting; its 429 means **quota exceeded** (`USAGE_LIMIT_EXCEEDED`) - different semantics, same envelope.

_Source of truth: `API-09`, `API-03`, `API-10`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Define limiter constants from env with defaults.
2. Mount standard limiter early; apply strict limiter per route.
3. Throw/send the catalogued 429 through the error path.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Tiered limiters (reference)**

```ts
export const standardRateLimiter = rateLimit({ windowMs: 60_000, limit: Number(process.env.RATE_LIMIT_STANDARD_PER_MIN ?? 300), standardHeaders: true, legacyHeaders: false, handler: rejectWithCataloguedRateLimit });
export const adminRateLimiter = rateLimit({ windowMs: 60_000, limit: Number(process.env.RATE_LIMIT_ADMIN_PER_MIN ?? 5), standardHeaders: true, legacyHeaders: false, handler: rejectWithCataloguedRateLimit });
router.post("/configs/refresh", adminRateLimiter, validateAuthToken(), refreshAll);
```

## Error and failure handling
- Limiter store failure must fail open (do not block traffic) and be logged.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Do not rely on IP alone behind proxies without configuring `trust proxy`.
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- Exceeding the limit returns catalogued 429 with `RateLimit-*` headers; probes unaffected.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- No limiter on fan-out routes.
- Per-instance limits assumed to be global.
- Hand-built 429 bodies.

## Implementation checklist
- [ ] Tiers; catalogued 429; env config; probes excluded.

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
- Tiered limiters - global standard limiter (reference default 300/min via `RATE_LIMIT_STANDARD_PER_MIN`) and a strict limiter (default 5/min via `RATE_LIMIT_ADMIN_PER_MIN`) on expensive/fan-out routes; both env-configurable; `standardHeaders: true`, `legacyHeaders: false`.
- The 429 response uses the standard error envelope with a **catalogued** code (reference defect: hand-built body with a non-catalog `RATE_LIMITED` code and the `UNHANDLED_ERROR` number - add a proper catalog entry).
- Probe endpoints are excluded from limiting.

## Related skills
- `rate-limiting` — Rate Limiting (Service & Dependency Level)
- `middleware-request-pipeline` — Middleware & Request Pipeline
- `api-error-response` — API Error Response
- `http-status-codes` — HTTP Status Codes
- `bounded-concurrency` — Bounded Concurrency
