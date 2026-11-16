---
name: correlation-id-management
description: Use when adding or reviewing request tracing - accepting or generating the x-correlation-id at the edge, binding it to async context, echoing it in responses/errors/logs, and propagating it over HTTP and messages. Applies the organization's ADR defaults and flags the reference implementations' known gaps.
---

# Correlation ID Management

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `correlation-id-management` |
| Category | 03 — Request Context & Idempotency |
| Scope | Generation, validation, propagation and use of the correlation ID. |
| Applicability | HTTP services and message flows; Node implementation with AsyncLocalStorage. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | MANDATED (ADR defaults) + VERIFIED implementation; deviation C-08 |
| Governing standards | `CTX-01`, `CTX-02`, `API-04`, `OBS-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `request-context-propagation`, `structured-logging`, `request-header-management`, `distributed-request-tracking`, `trace-context-propagation`, `api-error-response` |

## Purpose
One ID follows a business request across services, logs, errors and async work.

## When to use
- Creating middleware or a new service.
- Making outbound HTTP calls or publishing messages.
- Debugging missing/unlinked logs.

## Organizational standards
- **MANDATORY:** Header is `x-correlation-id` (case-insensitive). Resolve-or-generate (`randomUUID()`) **before** auth and error handling; bind to `AsyncLocalStorage`; echo it as a response header, in every envelope `metadata.correlationId`, in every log line, on every outbound call and in message `applicationProperties.correlationId`. Never fatal when missing (`"unknown"`).
- **MANDATORY (ADR default):** Public/untrusted callers' values are ignored and regenerated; a supplied value is kept only from a trusted internal caller; accepted IDs are validated (strict charset, max length); invalid ones are regenerated (no 400); **no** `x-request-id` fallback; the body/query can never set it; correlation, request ID and trace ID are three different identifiers.
- **DECIDED (C-08, approved 2026-11-16):** Approved: ADR default for new/modified code - validated IDs, trusted-caller policy, no x-request-id fallback, one implementation per service. _Earlier note (superseded where it conflicts):_ Both reference implementations accept any non-empty inbound value and fall back to `x-request-id`, validate nothing, and have no trusted-caller mechanism. For new or modified code implement the ADR default if a trust mechanism is available; otherwise keep existing behaviour, add the validation (charset/length), and report the gap. Never widen acceptance.
- **MANDATORY:** Exactly one correlation mechanism per service; do not run a parallel request-id system (reference defect `requestTelemetry.middleware`).
- **MANDATORY:** Implement correlation helpers (`getOrCreateCorrelationId`, `runWithCorrelationId`, `getCorrelationId`) once in the service's shared-infra zone and reuse them everywhere (no duplicate copies, C-08).

_Source of truth: `CTX-01`, `CTX-02`, `API-04`, `OBS-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Mount the correlation middleware at the top of each router (before auth).
2. Read `getCorrelationId()` in the logger wrapper, error middleware, outbound client builders and message producers.
3. Validate inbound IDs against `^[A-Za-z0-9._:-]{8,128}$` (or the repo's rule) and regenerate otherwise.
4. Wrap handlers mounted outside routers with `withCorrelationId`.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Middleware with validation (extends the reference with the ADR validation rule)**

```ts
const ID_RE = /^[A-Za-z0-9._:-]{8,128}$/;
export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const raw = req.headers["x-correlation-id"];
  const supplied = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  const id = supplied && ID_RE.test(supplied) && isTrustedCaller(req) ? supplied : randomUUID();
  req.correlationId = id;
  res.setHeader("x-correlation-id", id);
  runWithCorrelationId(id, () => next());
}
```

## Error and failure handling
- Missing/invalid ID never fails the request; missing context yields `"unknown"` in envelopes and logs.
- Context helpers never throw when context is missing; they return a documented fallback (`unknown`) and the request continues (CTX-01).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Treat the header as untrusted input (log injection, cardinality); never reflect unvalidated values.
- Treat inbound identifiers as untrusted input: validate charset/length; never let body or query override context (CTX-01).

## Testing guidelines
- Untrusted valid ID regenerated; trusted valid kept; trusted invalid regenerated; body field ignored; ID present on 401/500 responses; present on outbound call.
- Test with and without inbound identifiers, with malformed values, across async boundaries (ALS), and on outbound calls/messages.

## Anti-patterns
- Trusting any caller's ID.
- `x-request-id` fallback.
- Passing the ID manually through every function signature.
- Reading from body.

## Implementation checklist
- [ ] Middleware before auth; ALS bound; header/envelope/log/outbound/message propagation; validation; tests.

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
- Header is `x-correlation-id` (case-insensitive). Resolve-or-generate (`randomUUID()`) **before** auth and error handling; bind to `AsyncLocalStorage`; echo it as a response header, in every envelope `metadata.correlationId`, in every log line, on every outbound call and in message `applicationProperties.correlationId`. Never fatal when missing (`"unknown"`).
- Public/untrusted callers' values are ignored and regenerated; a supplied value is kept only from a trusted internal caller; accepted IDs are validated (strict charset, max length); invalid ones are regenerated (no 400); **no** `x-request-id` fallback; the body/query can never set it; correlation, request ID and trace ID are three different identifiers.
- Exactly one correlation mechanism per service; do not run a parallel request-id system (reference defect `requestTelemetry.middleware`).
- Implement correlation helpers (`getOrCreateCorrelationId`, `runWithCorrelationId`, `getCorrelationId`) once in the service's shared-infra zone and reuse them everywhere (no duplicate copies, C-08).

## Related skills
- `request-context-propagation` — Request Context Propagation
- `structured-logging` — Structured Logging
- `request-header-management` — Request Header Management
- `distributed-request-tracking` — Distributed Request Tracking
- `trace-context-propagation` — Trace Context Propagation
- `api-error-response` — API Error Response
