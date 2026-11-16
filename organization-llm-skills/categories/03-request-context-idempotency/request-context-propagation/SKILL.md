---
name: request-context-propagation
description: Use when request-scoped data (correlation ID, principal, tenant) must be available to services, repositories, loggers and outbound calls without parameter threading, including background jobs and callbacks that lose async context.
---

# Request Context Propagation

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `request-context-propagation` |
| Category | 03 — Request Context & Idempotency |
| Scope | Async-context storage and propagation inside and across processes. |
| Applicability | Node.js (`AsyncLocalStorage`); the contract applies to any runtime. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (CTX-01, CTX-02) |
| Governing standards | `CTX-01`, `CTX-02`, `OBS-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `correlation-id-management`, `distributed-request-tracking`, `structured-logging`, `http-client-management`, `message-producer` |

## Purpose
Makes context ambient and safe, and keeps one store per concern.

## When to use
- Reading the correlation ID in a service/repo/logger.
- Starting background work from a request.
- Adding an EventEmitter/callback boundary.

## Organizational standards
- **MANDATORY:** One `AsyncLocalStorage` per service for correlation (`runWithCorrelationId` / `getCorrelationId`); do not create a second store for the same data (C-08).
- **MANDATORY:** Background jobs generate and bind their own ID (`job:<id>` or UUID) with `runWithCorrelationId`.
- **Verified convention:** Telemetry keeps a separate store for request telemetry context (method/path/body-masked); it must not duplicate correlation.
- **MANDATORY:** Outbound calls and messages read the ambient ID (CTX-02).

_Source of truth: `CTX-01`, `CTX-02`, `OBS-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Wrap entry points (HTTP, worker tick, queue message) with `runWithCorrelationId`.
2. Do not store request/response objects in the store; store primitives.
3. Re-bind explicitly at `EventEmitter` boundaries.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Worker tick with its own context**

```ts
async function tick() {
  await runWithCorrelationId("outbox-" + randomUUID(), async () => { await processBatch(); });
}
```

## Error and failure handling
- Lost context yields `undefined`; helpers return `unknown`, never throw.
- Context helpers never throw when context is missing; they return a documented fallback (`unknown`) and the request continues (CTX-01).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Treat inbound identifiers as untrusted input: validate charset/length; never let body or query override context (CTX-01).

## Testing guidelines
- Context visible after `await`, `setTimeout`, promise chains; absent outside `run`.
- Test with and without inbound identifiers, with malformed values, across async boundaries (ALS), and on outbound calls/messages.

## Anti-patterns
- Global mutable "currentRequest".
- Parallel ALS stores.

## Implementation checklist
- [ ] One store; entry points bound; outbound reads ambient ID.

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
- One `AsyncLocalStorage` per service for correlation (`runWithCorrelationId` / `getCorrelationId`); do not create a second store for the same data (C-08).
- Background jobs generate and bind their own ID (`job:<id>` or UUID) with `runWithCorrelationId`.
- Outbound calls and messages read the ambient ID (CTX-02).

## Related skills
- `correlation-id-management` — Correlation ID Management
- `distributed-request-tracking` — Distributed Request Tracking
- `structured-logging` — Structured Logging
- `http-client-management` — HTTP Client Management
- `message-producer` — Message Producer
