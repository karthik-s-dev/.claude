---
name: llm-retry-timeout
description: Use when configuring timeouts and retries for model calls - per-call timeout, retry on 429/5xx with backoff and Retry-After, no retry on 4xx content errors, total budget. Generic baseline inheriting the organization's timeout and retry rules.
---

# LLM Retry & Timeout

> ⚠ **GENERIC BASELINE (evidence E0).** No organizational implementation of this concern exists in the reference repositories. Everything marked GENERIC is a provisional recommendation pending architectural approval and is **not** an organizational standard. The skill still inherits the standards listed in *Related skills* (logging, errors, configuration, security).

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `llm-retry-timeout` |
| Category | 12 — LLM & AI Integration |
| Scope | LLM call resilience. |
| Applicability | Node. |
| Evidence | E0 — no organizational evidence (generic baseline) |
| Classification | GENERIC built on RES-02/RES-03 (E2/E3) |
| Governing standards | `RES-02`, `RES-03`, `INT-01`, `LLM-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `llm-api-call`, `retry-policy`, `timeout-management`, `exponential-backoff`, `circuit-breaker` |

## Purpose
Bounded latency and cost.

## When to use
- Calling models.

## Organizational standards
- **MANDATORY:** Timeout from env (`LLM_TIMEOUT_MS`), shorter than the caller's request budget (`timeout-management`).
- **Generic baseline (provisional):** Retry 429/503/timeout up to 2 times honouring `Retry-After` using `withRetry`; never retry content-filter or validation errors; cap total tokens spent on retries.

_Source of truth: `RES-02`, `RES-03`, `INT-01`, `LLM-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Wrap via `withRetry`; log attempts.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**GENERIC**

```ts
await withRetry(() => callModel(req), { maxAttempts: 3, delayMs: 500, backoffMultiplier: 2, maxDelayMs: 4000 });
```

## Error and failure handling
- Exhausted -> `LLM_UNAVAILABLE`.
- LLM failures map to catalogued errors (ERR-02) and follow the resilience standards (RES-02, RES-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Model keys and endpoints are secrets (mask `key`, `endpoint`); never log prompts or completions containing PII; treat model output as untrusted input.

## Testing guidelines
- 429 then success; content filter not retried.
- Mock the model client; cover malformed output, refusal, timeout, rate-limit and token-limit paths.

## Anti-patterns
- Retrying forever.

## Implementation checklist
- [ ] Timeouts; retry classes.

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
- Timeout from env (`LLM_TIMEOUT_MS`), shorter than the caller's request budget (`timeout-management`).

## Related skills
- `llm-api-call` — LLM API Call
- `retry-policy` — Retry Policy
- `timeout-management` — Timeout Management
- `exponential-backoff` — Exponential Backoff
- `circuit-breaker` — Circuit Breaker
