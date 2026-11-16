---
name: llm-api-call
description: Use when code must call a large language model. The reference repositories contain only AI configuration storage and token cost accounting, no model invocation, so this skill is a clearly labeled generic baseline that applies the organization's external-call, security and error standards. It is not an organizational standard.
---

# LLM API Call

> ⚠ **GENERIC BASELINE (evidence E0).** No organizational implementation of this concern exists in the reference repositories. Everything marked GENERIC is a provisional recommendation pending architectural approval and is **not** an organizational standard. The skill still inherits the standards listed in *Related skills* (logging, errors, configuration, security).

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `llm-api-call` |
| Category | 12 — LLM & AI Integration |
| Scope | Calling an LLM endpoint. |
| Applicability | Azure OpenAI / hosted models from Node. |
| Evidence | E0 — no organizational evidence (generic baseline) |
| Classification | GENERIC (no LLM invocation exists in the reference repositories) |
| Governing standards | `LLM-01`, `INT-01`, `RES-02`, `ERR-09`, `SEC-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `llm-client-management`, `llm-retry-timeout`, `llm-error-handling`, `external-api-client`, `structured-llm-output`, `ai-guardrails` |

## Purpose
Safe, bounded, observable model calls.

## When to use
- Adding any LLM call.

## Organizational standards
- **Generic baseline (provisional):** Treat the model endpoint as an external dependency: use `external-api-client` rules - one client per model deployment, timeout from env (`LLM_TIMEOUT_MS`), Managed Identity where the provider supports it (`azure-managed-identity`) else key from env, correlation ID propagated, typed unavailable error, no secret logging.
- **Generic baseline (provisional):** Record `model/deployment key, input/output/cached/reasoning tokens, latency` in structured logs and usage events (`token-management`); never log prompts/completions containing PII.
- **MANDATORY:** Model keys and endpoints are secrets (mask `key`, `endpoint`) (`LLM-02`); any new SDK dependency requires approval (PKG-01 principle: no silent substitution of internal tooling).
- **MANDATORY:** Report in the PR that no organizational LLM standard exists and list assumptions.

_Source of truth: `LLM-01`, `INT-01`, `RES-02`, `ERR-09`, `SEC-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Build the client module (`llm-client-management`), the call wrapper with retries/timeouts (`llm-retry-timeout`), output validation (`llm-response-validation`), error mapping (`llm-error-handling`).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**GENERIC call wrapper**

```ts
const res = await withTimeout(client.complete({ model: deployment, messages, maxTokens }), config.llm.timeoutMs);
logger.info({ model: deployment, inputTokens: res.usage.input, outputTokens: res.usage.output, latencyMs }, "LLM call completed");
```

## Error and failure handling
- Map to catalog entries (`LLM_UNAVAILABLE` 503, `LLM_TIMEOUT` 504, `LLM_RATE_LIMITED` 429->503, `LLM_INVALID_OUTPUT` 502) via `error-catalog-management`.
- LLM failures map to catalogued errors (ERR-02) and follow the resilience standards (RES-02, RES-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Prompt injection: never place untrusted text in privileged instructions; validate outputs; do not execute model output.
- Model keys and endpoints are secrets (mask `key`, `endpoint`); never log prompts or completions containing PII; treat model output as untrusted input.

## Testing guidelines
- Mock the model client; timeouts; malformed output; token accounting.
- Mock the model client; cover malformed output, refusal, timeout, rate-limit and token-limit paths.

## Anti-patterns
- Logging prompts.
- Unbounded retries.
- Calling models without timeouts.

## Implementation checklist
- [ ] Baseline labeled; client; timeout; masking; mapping.

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
- Model keys and endpoints are secrets (mask `key`, `endpoint`) (`LLM-02`); any new SDK dependency requires approval (PKG-01 principle: no silent substitution of internal tooling).
- Report in the PR that no organizational LLM standard exists and list assumptions.

## Related skills
- `llm-client-management` — LLM Client Management
- `llm-retry-timeout` — LLM Retry & Timeout
- `llm-error-handling` — LLM Error Handling
- `external-api-client` — External API Client
- `structured-llm-output` — Structured LLM Output
- `ai-guardrails` — AI Guardrails
