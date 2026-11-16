---
name: distributed-request-tracking
description: Use when following one business operation across services, queues and workers - ensuring the correlation ID reaches every hop, appears in logs and messages, and is searchable; includes how to diagnose gaps.
---

# Distributed Request Tracking

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `distributed-request-tracking` |
| Category | 03 — Request Context & Idempotency |
| Scope | End-to-end traceability design and diagnosis. |
| Applicability | Multi-service flows. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (CTX-01, CTX-05) |
| Governing standards | `CTX-01`, `CTX-05`, `OBS-05`, `CTX-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `correlation-id-management`, `trace-context-propagation`, `distributed-tracing`, `structured-logging`, `application-monitoring` |

## Purpose
A support engineer can reconstruct a request across all services from one ID.

## When to use
- Designing a flow that crosses services/queues.
- Investigating a cross-service incident.

## Organizational standards
- **MANDATORY:** Every hop propagates `x-correlation-id` (HTTP) or `applicationProperties.correlationId` (Service Bus) / the job payload field (queue); consumers rebind it with `runWithCorrelationId`.
- **MANDATORY:** Logs include `correlationId` automatically (logger wrapper) so a single search spans services.
- **Verified convention:** The usage event payload carries `correlationId` and `usageEventId` end to end; outbox rows keep the payload including the ID.
- **Generic baseline (provisional):** Add the trace ID next to the correlation ID in logs once distributed tracing is enabled (`trace-context-propagation`).

_Source of truth: `CTX-01`, `CTX-05`, `OBS-05`, `CTX-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Draw the hop list; for each, name how the ID enters and leaves.
2. Add the ID to queue job payloads.
3. Verify with a test that publishes and consumes.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Message carrying correlation**

```ts
await sender.sendMessages({ body, messageId: eventId,
  applicationProperties: { correlationId: getCorrelationId(), productLine, clientId } });
```

## Error and failure handling
- Missing upstream ID: generate and log "correlation generated at <hop>" at debug, continue.
- Context helpers never throw when context is missing; they return a documented fallback (`unknown`) and the request continues (CTX-01).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Treat inbound identifiers as untrusted input: validate charset/length; never let body or query override context (CTX-01).

## Testing guidelines
- Publish->consume test asserts same ID in consumer logs.
- Test with and without inbound identifiers, with malformed values, across async boundaries (ALS), and on outbound calls/messages.

## Anti-patterns
- Generating a new ID mid-flow.
- Different header names per hop.

## Implementation checklist
- [ ] Hop table; propagation tests.

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
- Every hop propagates `x-correlation-id` (HTTP) or `applicationProperties.correlationId` (Service Bus) / the job payload field (queue); consumers rebind it with `runWithCorrelationId`.
- Logs include `correlationId` automatically (logger wrapper) so a single search spans services.

## Related skills
- `correlation-id-management` — Correlation ID Management
- `trace-context-propagation` — Trace Context Propagation
- `distributed-tracing` — Distributed Tracing
- `structured-logging` — Structured Logging
- `application-monitoring` — Application Monitoring
