---
name: middleware-request-pipeline
description: Use when adding, ordering or reviewing Express middleware - CORS, body parsing/raw body, rate limiting, correlation, authentication, internal-key and webhook checks, validation, error middleware. Fixes the organization's mandatory order.
---

# Middleware & Request Pipeline

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `middleware-request-pipeline` |
| Category | 01 — Microservice Architecture & Foundations |
| Scope | Order and responsibilities of middleware on each API surface. |
| Applicability | Express (reference); pipeline order applies to any HTTP framework. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (ARCH-05) |
| Governing standards | `ARCH-05`, `CTX-01`, `SEC-05`, `API-09`, `ERR-06`, `MSG-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `correlation-id-management`, `request-validation`, `authentication`, `global-exception-handling`, `api-rate-limiting`, `cors-policy`, `webhook-signature-verification` |

## Purpose
A request must pass correlation -> auth -> validation before reaching a handler and every error must leave through one formatter; order mistakes silently remove those guarantees.

## When to use
- Adding a middleware or router.
- Adding a webhook endpoint (raw body).
- Debugging missing correlation IDs in error responses or unauthenticated routes.

## Organizational standards
- **MANDATORY:** Order: CORS (allow-list) -> body parser (capture raw bytes where signatures are verified) -> rate limiter -> correlation/request-context -> per-router token auth -> internal-key check (internal routers) -> signature check (webhook routers) -> `validate(schema, segment)` -> controller -> error middleware **last** per surface.
- **MANDATORY:** Correlation middleware runs before authentication and error handling so 401/403 and error envelopes carry the ID.
- **MANDATORY:** Probe endpoints (`/health*`) are mounted without auth and rate limiting and are not logged at `info` per request (OBS-04).
- **MANDATORY:** Static route paths are mounted before parameterized ones; internal routers before public ones in the same prefix.
- **Verified convention:** One error middleware per versioned surface (`/api/v2` then global).

_Source of truth: `ARCH-05`, `CTX-01`, `SEC-05`, `API-09`, `ERR-06`, `MSG-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Find the app's composition root and the existing router mounts.
2. Insert new middleware at the correct position relative to the list above.
3. For signature verification set `express.json({ verify: (req, _res, buf) => { req.rawBody = Buffer.from(buf); } })`.
4. Add the error middleware only once; never `app.use` a second formatter.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Composition root (condensed)**

```ts
app.use(cors(corsOptions));                               // allow-list, typed rejection
app.use(express.json({ verify: (req: any, _r, buf) => { req.rawBody = Buffer.from(buf); } }));
app.use(standardRateLimiter);
app.get("/health/live", live); app.get("/health/ready", ready);   // before auth
app.use("/api/v2/<feature>", correlationIdMiddleware, featureRoutes); // routes add validateAuthToken(), validate()
app.use("/api/v2", errorMiddleware);                      // last
```

## Error and failure handling
- CORS rejection is a typed error mapped to a catalogued 403 (never a hand-built body).
- Bootstrap failures must stop the process with a non-zero exit and a secret-free log (ARCH-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- A route that bypasses auth must be listed and justified in the PR.
- Never place secrets, tokens or connection strings in source, logs, examples or fixtures (CFG-07, OBS-03).

## Testing guidelines
- Supertest-style route tests assert 401 without token, correlation header present on errors, and 400 on invalid input.
- Where import-boundary/lint tooling exists, enforce layer rules in CI; otherwise add an architecture test or review-checklist item for each rule.

## Anti-patterns
- Auth before correlation.
- Rate limiter after expensive middleware.
- Multiple error handlers for one surface.
- Parsing the body twice (breaks raw-body signatures).

## Implementation checklist
- [ ] Order verified; error middleware last; probes unauthenticated; raw body captured where needed.

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
- Order: CORS (allow-list) -> body parser (capture raw bytes where signatures are verified) -> rate limiter -> correlation/request-context -> per-router token auth -> internal-key check (internal routers) -> signature check (webhook routers) -> `validate(schema, segment)` -> controller -> error middleware **last** per surface.
- Correlation middleware runs before authentication and error handling so 401/403 and error envelopes carry the ID.
- Probe endpoints (`/health*`) are mounted without auth and rate limiting and are not logged at `info` per request (OBS-04).
- Static route paths are mounted before parameterized ones; internal routers before public ones in the same prefix.

## Related skills
- `correlation-id-management` — Correlation ID Management
- `request-validation` — Request Validation
- `authentication` — Authentication
- `global-exception-handling` — Global Exception Handling
- `api-rate-limiting` — API Rate Limiting
- `cors-policy` — CORS Policy
- `webhook-signature-verification` — Webhook Signature Verification
