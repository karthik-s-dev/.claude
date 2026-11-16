---
name: api-response-structure
description: Use when writing or reviewing success responses of an API - the success envelope, metadata with correlation ID and timestamp, lists, partial-success (207) and headers - and when a controller is about to write a raw body.
---

# API Response Structure

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `api-response-structure` |
| Category | 02 — API Development & Design |
| Scope | Success response contract. |
| Applicability | JSON/HTTP APIs. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | UNRESOLVED (C-06) with VERIFIED parts |
| Governing standards | `API-02`, `API-03`, `API-06`, `CTX-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `api-error-response`, `response-dto-mapping`, `response-serialization`, `api-pagination`, `http-status-codes` |

## Purpose
One predictable success shape symmetrical with the error envelope so clients and logs can be cross-referenced by correlation ID.

## When to use
- Adding any response.
- Seeing `res.json(...)` in a controller.

## Organizational standards
- **MANDATORY:** Success responses carry `success: true`, `data`, and `metadata.correlationId` + `metadata.timestamp`; they are produced by a shared helper (`sendSuccess`), never hand-built in controllers (API-02).
- **MANDATORY:** Do not mix enveloped and raw responses within one API surface.
- **DECIDED (C-06, approved 2026-11-16):** Approved: every success response uses the envelope { success, message, data, metadata:{ correlationId, timestamp } }. _Earlier note (superseded where it conflicts):_ Whether `message` is included (reference helper includes it; decided in C-06) and the pagination placement (C-06, C-09). Follow the target service's helper; do not invent a third shape.
- **Verified convention:** **207 Multi-Status** is used when the main operation succeeded but an auxiliary step (audit/event publish) failed; the body flags it (`auditPublished: false`) (API-10).
- **Verified convention:** `x-correlation-id` echoed as a response header.

_Source of truth: `API-02`, `API-03`, `API-06`, `CTX-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Use the target service's success helper; add one if the service has none, mirroring the envelope above.
2. Map domain results to response DTOs first (`response-dto-mapping`).
3. For partial success return 207 and set the flag; never hide the failure.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Success helper (reference)**

```ts
export function sendSuccess<T>(req: Request, res: Response, data: T, message = "Request completed successfully", statusCode = 200): void {
  res.status(statusCode).json({
    success: true, message, data,
    metadata: { correlationId: req.correlationId ?? getCorrelationId() ?? "unknown", timestamp: new Date().toISOString() },
  });
}
```

## Error and failure handling
- Failures never use this helper; they flow to the error middleware (`api-error-response`).
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- Assert `success`, `data`, `metadata.correlationId`, `metadata.timestamp`, header.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- Bare arrays/objects as responses.
- Different success shapes per controller.
- Returning 200 when a durable step failed.

## Implementation checklist
- [ ] Helper used everywhere; metadata present; 207 semantics for partial success.

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
- Success responses carry `success: true`, `data`, and `metadata.correlationId` + `metadata.timestamp`; they are produced by a shared helper (`sendSuccess`), never hand-built in controllers (API-02).
- Do not mix enveloped and raw responses within one API surface.

## Related skills
- `api-error-response` — API Error Response
- `response-dto-mapping` — Response DTO Mapping
- `response-serialization` — Response Serialization
- `api-pagination` — API Pagination
- `http-status-codes` — HTTP Status Codes
