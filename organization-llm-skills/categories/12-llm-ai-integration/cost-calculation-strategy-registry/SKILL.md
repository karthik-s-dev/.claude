---
name: cost-calculation-strategy-registry
description: Use when computing usage cost or credits across billing units (tokens, OCR pages, characters, voice minutes, images, transactions) - register a strategy per billing unit, resolve product override then global, wrap with decorators, and cover with table tests.
---

# Cost Calculation Strategy Registry

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `cost-calculation-strategy-registry` |
| Category | 12 — LLM & AI Integration |
| Scope | Pricing calculation architecture. |
| Applicability | Node usage services. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (ARCH-06, LLM-03) |
| Governing standards | `ARCH-06`, `LLM-03`, `DB-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `design-patterns`, `token-cost-optimization`, `token-management`, `solid-principles`, `caching-strategy` |

## Purpose
Extensible cost computation without switch statements.

## When to use
- Adding a billing unit, product pricing rule or discount.

## Organizational standards
- **MANDATORY:** `ICostCalculatorStrategy { strategyId; canHandle(billingUnit); calculate(input, pricingEntry) }`; `CostCalculatorRegistry.registerGlobal(unit, strategy)` and `registerProductOverride(productLine, unit, strategy)`; `resolve(unit, productLine)` order: product override (by key, then `canHandle`) -> global -> `null` (zero cost logged).
- **Verified convention strategies:** `llm-token`, `ocr-page`, `image-analysis`, `transaction`, `translation-character`, `voice-minute`; decorators `free-tier`, `margin`, `minimum-charge`; registrations in `product-calculator-registrations.ts`.
- **MANDATORY:** Pricing data comes from the pricing collection through the cache tiers; no hard-coded prices.
- **MANDATORY:** Result includes components (USD, credits) and a reason; unresolved strategy logs and yields zero rather than throwing.

_Source of truth: `ARCH-06`, `LLM-03`, `DB-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Implement strategy + test; register in the registrations module; never edit the registry for a new unit.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Register**

```ts
registry.registerGlobal("per_million_tokens", new LlmTokenStrategy())
        .registerProductOverride("<product>", "per_page", new OcrPageStrategy());
```

## Error and failure handling
- `null` strategy -> zero cost + `warn`.
- LLM failures map to catalogued errors (ERR-02) and follow the resilience standards (RES-02, RES-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Model keys and endpoints are secrets (mask `key`, `endpoint`); never log prompts or completions containing PII; treat model output as untrusted input.

## Testing guidelines
- Per strategy; override precedence; decorator chain.
- Mock the model client; cover malformed output, refusal, timeout, rate-limit and token-limit paths.

## Anti-patterns
- `switch(billingUnit)`.
- Prices in code.

## Implementation checklist
- [ ] Strategy; registration; tests.

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
- `ICostCalculatorStrategy { strategyId; canHandle(billingUnit); calculate(input, pricingEntry) }`; `CostCalculatorRegistry.registerGlobal(unit, strategy)` and `registerProductOverride(productLine, unit, strategy)`; `resolve(unit, productLine)` order: product override (by key, then `canHandle`) -> global -> `null` (zero cost logged).
- Pricing data comes from the pricing collection through the cache tiers; no hard-coded prices.
- Result includes components (USD, credits) and a reason; unresolved strategy logs and yields zero rather than throwing.

## Related skills
- `design-patterns` — Design Patterns
- `token-cost-optimization` — Token & Cost Optimization
- `token-management` — Token Management
- `solid-principles` — SOLID Principles
- `caching-strategy` — Caching Strategy
