---
name: token-cost-optimization
description: Use when reducing or accounting for LLM cost - pricing resolution with L1/L2 caches, credits conversion, decorators for free tier/margin/minimum charge, and (generic) prompt/caching levers.
---

# Token & Cost Optimization

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `token-cost-optimization` |
| Category | 12 — LLM & AI Integration |
| Scope | Cost computation and reduction. |
| Applicability | Node. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (LLM-03) pricing side / GENERIC levers |
| Governing standards | `LLM-03`, `DB-05`, `ARCH-06` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `token-management`, `cost-calculation-strategy-registry`, `caching-strategy`, `llm-api-call`, `performance-review` |

## Purpose
Correct, cheap cost accounting.

## When to use
- Changing pricing or cost logic.

## Organizational standards
- **Verified convention:** Pricing documents `llm_model_pricing` resolved L1 in-process (1 h) -> L2 Redis (`pricing:{llmKey}:{provider}:{region}`, 3600 s) -> Mongo; `usdToCredits` with `USD_PER_CREDIT`; missing pricing -> credits skipped with a log (not an exception).
- **Verified convention:** Cost via `CostCalculatorRegistry` strategies (`cost-calculation-strategy-registry`).
- **Generic baseline (provisional) levers (not organizational):** shorter prompts, response length caps (`maxTokens`), provider prompt caching, model tiering, batching.

_Source of truth: `LLM-03`, `DB-05`, `ARCH-06`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add pricing changes through the pricing collection and tests; never hard-code prices.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Flow**

```text
llmKey -> PricingCache(L1->L2->Mongo) -> strategy.calculate(tokens) -> decorators -> usdToCredits -> aiCredits event
```

## Error and failure handling
- Missing pricing logged; zero cost.
- LLM failures map to catalogued errors (ERR-02) and follow the resilience standards (RES-02, RES-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Model keys and endpoints are secrets (mask `key`, `endpoint`); never log prompts or completions containing PII; treat model output as untrusted input.

## Testing guidelines
- Each token kind price; decorators; cache tiers.
- Mock the model client; cover malformed output, refusal, timeout, rate-limit and token-limit paths.

## Anti-patterns
- Hard-coded prices.

## Implementation checklist
- [ ] Source; caches; tests.

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


## Related skills
- `token-management` — Token Management
- `cost-calculation-strategy-registry` — Cost Calculation Strategy Registry
- `caching-strategy` — Caching Strategy
- `llm-api-call` — LLM API Call
- `performance-review` — Performance Review
