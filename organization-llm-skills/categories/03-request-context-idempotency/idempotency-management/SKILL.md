---
name: idempotency-management
description: Use when building or reviewing retryable write operations - Idempotency-Key header, scope, canonical request fingerprint, atomic claim, in-progress handling, replay, conflict, release on failure, retention and fail-open/closed policy. Applies the organization's ADR defaults and documents the reference Redis implementation's deviations.
---

# Idempotency Management

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `idempotency-management` |
| Category | 03 — Request Context & Idempotency |
| Scope | Idempotent API write operations and their stores. |
| Applicability | HTTP write APIs; Redis (reference) or relational store (ADR default). |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | MANDATED (ADR defaults) / implementation UNRESOLVED (C-07) |
| Governing standards | `CTX-03`, `CTX-04`, `API-10`, `RES-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `request-deduplication`, `message-idempotency`, `usage-event-identity`, `api-request-structure`, `api-error-response`, `distributed-locking` |

## Purpose
Safe client retries without double effects.

## When to use
- Adding a write endpoint that clients may retry.
- Reviewing idempotency handling in payments/usage/order-like flows.

## Organizational standards
- **MANDATORY (ADR default):** `Idempotency-Key` HTTP header is the only key source (no body fallback); mandatory on externally exposed writes - missing/invalid key -> 400; validated format and length.
- **MANDATORY:** Key scope = authenticated tenant + operation + key. Fingerprint = SHA-256 of canonical JSON (sorted keys).
- **MANDATORY:** Atomic claim (insert-if-absent / `SET NX`); on duplicate: completed -> replay the stored response; same key + different fingerprint -> **409 `IDEMPOTENCY_KEY_REUSED`**; still running -> wait at most 1 s then **409 `IDEMPOTENCY_IN_PROGRESS`** with `Retry-After`.
- **MANDATORY:** Transient failures **release** the claim; the result is stored only after the operation is verified; a timed-out write releases the key and returns 504.
- **MANDATORY:** Effect-level dedupe (deterministic event IDs, `usage-event-identity`) in addition, even when the store is healthy.
- **MANDATORY:** Store outage on writes fails **closed** (503 + `Retry-After`); fail open only per operation with written approval naming the downstream dedupe.
- **MANDATORY:** Retention 72 h standard; 7 days or more for financial/high-value; always longer than the client retry window.
- **UNRESOLVED — do not enforce; report (C-07):** Reference implementation uses a Redis store (`SET key EX ttl NX`, Lua compare-and-swap takeover), also reads a body key, and names conflicts `IDEMPOTENCY_KEY_CONFLICT` / `IDEMPOTENCY_REQUEST_IN_PROGRESS`; fail-open answers are replayed for 30 s / max 3 replays. ADR default prefers a relational store with a unique constraint. Follow the target repo's existing store; for **new** services use the ADR default or request approval for Redis; always use the ADR error codes in new code or add aliases.

_Source of truth: `CTX-03`, `CTX-04`, `API-10`, `RES-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Resolve key from the header; validate; compute fingerprint over the validated body.
2. Acquire: `new` -> process; `duplicate` -> replay stored summary; `in_progress` -> bounded wait/409; `conflict` -> 409.
3. On success store `{bodyHash, resultSummary, recordedAt}`; on failure release.
4. Add TTL/retention config per operation and a cleanup/expiry mechanism.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Claim with fingerprint (reference pattern, Redis)**

```ts
const ok = await redis.set(key, JSON.stringify(record), "EX", ttlSeconds, "NX");
if (ok === "OK") return { status: "new" };
const existing = JSON.parse((await redis.get(key)) ?? "null");
if (existing && existing.bodyHash !== bodyHash) return { status: "conflict" };      // -> 409 IDEMPOTENCY_KEY_REUSED
return existing?.resultSummary === undefined ? { status: "in_progress" } : { status: "duplicate", resultSummary: existing.resultSummary };
```

## Error and failure handling
- Store errors are surfaced (503), logged and alerted; never swallowed.
- Fail-open answers are marked and replayed only briefly and a bounded number of times.
- Context helpers never throw when context is missing; they return a documented fallback (`unknown`) and the request continues (CTX-01).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Key scoped by tenant so keys cannot collide across tenants; fingerprint excludes secrets from logs.
- Treat inbound identifiers as untrusted input: validate charset/length; never let body or query override context (CTX-01).

## Testing guidelines
- New, duplicate (replay), conflict, in-progress, timeout releases key, store outage 503, tenant isolation, concurrent duplicates.
- Test with and without inbound identifiers, with malformed values, across async boundaries (ALS), and on outbound calls/messages.

## Anti-patterns
- Key from body.
- Storing success before verification.
- Cache-only store with eviction and no effect-level dedupe.
- Global (unscoped) keys.

## Implementation checklist
- [ ] Header-only key; scope; fingerprint; atomic claim; 409 codes; release on failure; retention; effect-level dedupe; outage policy.

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
- `Idempotency-Key` HTTP header is the only key source (no body fallback); mandatory on externally exposed writes - missing/invalid key -> 400; validated format and length.
- Key scope = authenticated tenant + operation + key. Fingerprint = SHA-256 of canonical JSON (sorted keys).
- Atomic claim (insert-if-absent / `SET NX`); on duplicate: completed -> replay the stored response; same key + different fingerprint -> **409 `IDEMPOTENCY_KEY_REUSED`**; still running -> wait at most 1 s then **409 `IDEMPOTENCY_IN_PROGRESS`** with `Retry-After`.
- Transient failures **release** the claim; the result is stored only after the operation is verified; a timed-out write releases the key and returns 504.
- Effect-level dedupe (deterministic event IDs, `usage-event-identity`) in addition, even when the store is healthy.
- Store outage on writes fails **closed** (503 + `Retry-After`); fail open only per operation with written approval naming the downstream dedupe.
- Retention 72 h standard; 7 days or more for financial/high-value; always longer than the client retry window.

## Related skills
- `request-deduplication` — Request Deduplication
- `message-idempotency` — Message Idempotency
- `usage-event-identity` — Usage / Metered Event Identity
- `api-request-structure` — API Request Structure
- `api-error-response` — API Error Response
- `distributed-locking` — Distributed Locking
