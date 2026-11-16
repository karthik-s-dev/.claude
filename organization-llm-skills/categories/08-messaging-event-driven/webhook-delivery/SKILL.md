---
name: webhook-delivery
description: Use when a service delivers callbacks to subscriber-supplied URLs - registration with validation, SSRF checks, HMAC-signed payloads with timestamp, delivery timeout, attempt limits, queue-backed worker, inline delivery concurrency and idempotency.
---

# Webhook Delivery (Outbound)

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `webhook-delivery` |
| Category | 08 — Messaging & Event-Driven Architecture |
| Scope | Outbound webhook subscription and delivery. |
| Applicability | Node services. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (MSG-05, INT-03) |
| Governing standards | `MSG-05`, `INT-03`, `SEC-04`, `RES-02`, `RES-06` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `webhook-signature-verification`, `ssrf-protection`, `background-worker-processing`, `azure-queue-storage-client`, `request-deduplication`, `bounded-concurrency` |

## Purpose
Safe, reliable callbacks to untrusted endpoints.

## When to use
- Adding subscriptions/notifications to external callbacks.

## Organizational standards
- **MANDATORY:** Validate callback URL at registration and at delivery: https, no loopback/private/link-local/metadata hosts, optional allow-list (`WEBHOOK_CALLBACK_URL_ALLOWLIST`); relaxed only locally (`ssrf-protection`).
- **MANDATORY:** Sign every delivery: headers `X-Webhook-Timestamp` (unix seconds) and `X-Webhook-Signature: sha256=<hex HMAC-SHA256(secret, "<timestamp>.<body>")>`; secret `WEBHOOK_HMAC_SECRET`.
- **MANDATORY:** Bounded: `WEBHOOK_DELIVERY_TIMEOUT_MS`, `WEBHOOK_DELIVERY_MAX_ATTEMPTS`, worker poll/batch, `WEBHOOK_INLINE_DELIVERY_CONCURRENCY`.
- **MANDATORY:** Delivery jobs go through a queue/outbox with `attempt` counters; failures logged with subscription ID and status only; use delivery idempotency key (`webhook-idempotency`).
- **MANDATORY:** Do not follow redirects to internal addresses; do not send secrets in URLs.

_Source of truth: `MSG-05`, `INT-03`, `SEC-04`, `RES-02`, `RES-06`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Subscription service validates + stores; dispatcher enqueues; worker delivers with signature and records result.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Signature headers (reference)**

```ts
export function buildWebhookSignatureHeaders(secret: string | undefined, body: string): Record<string, string> {
  if (!secret) return {};
  const ts = Math.floor(Date.now() / 1000).toString();
  const sig = createHmac("sha256", secret).update(ts + "." + body).digest("hex");
  return { "X-Webhook-Timestamp": ts, "X-Webhook-Signature": "sha256=" + sig };
}
```

## Error and failure handling
- Non-2xx/timeout -> retry until max attempts then mark failed; never block the originating request.
- A failed publish must never be silent: persist to the outbox or report it to the caller (MSG-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- SSRF, secret handling, signature, no PII beyond need.
- Connection strings only from environment; never log message bodies containing PII; validate message type/shape before processing.

## Testing guidelines
- Signature vector; SSRF rejections; retry counts; timeouts.
- Use in-memory doubles for the broker (TEST-02); cover publish failure, malformed message, duplicate delivery and poison-message paths.

## Anti-patterns
- Unsigned callbacks.
- Following user-supplied hosts without validation.

## Implementation checklist
- [ ] Validate; sign; bounds; queue; idempotency.

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
- Validate callback URL at registration and at delivery: https, no loopback/private/link-local/metadata hosts, optional allow-list (`WEBHOOK_CALLBACK_URL_ALLOWLIST`); relaxed only locally (`ssrf-protection`).
- Sign every delivery: headers `X-Webhook-Timestamp` (unix seconds) and `X-Webhook-Signature: sha256=<hex HMAC-SHA256(secret, "<timestamp>.<body>")>`; secret `WEBHOOK_HMAC_SECRET`.
- Bounded: `WEBHOOK_DELIVERY_TIMEOUT_MS`, `WEBHOOK_DELIVERY_MAX_ATTEMPTS`, worker poll/batch, `WEBHOOK_INLINE_DELIVERY_CONCURRENCY`.
- Delivery jobs go through a queue/outbox with `attempt` counters; failures logged with subscription ID and status only; use delivery idempotency key (`webhook-idempotency`).
- Do not follow redirects to internal addresses; do not send secrets in URLs.

## Related skills
- `webhook-signature-verification` — Webhook Signature Verification
- `ssrf-protection` — SSRF Protection
- `background-worker-processing` — Background Worker Processing
- `azure-queue-storage-client` — Azure Queue Storage Client
- `request-deduplication` — Request Deduplication
- `bounded-concurrency` — Bounded Concurrency
