---
name: llm-error-handling
description: Use when mapping model-call failures to catalogued errors - unavailable, timeout, rate-limited, content-filtered, invalid output, quota - with safe messages and logging. Generic baseline using the organization's error catalog.
---

# LLM Error Handling

> ⚠ **GENERIC BASELINE (evidence E0).** No organizational implementation of this concern exists in the reference repositories. Everything marked GENERIC is a provisional recommendation pending architectural approval and is **not** an organizational standard. The skill still inherits the standards listed in *Related skills* (logging, errors, configuration, security).

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `llm-error-handling` |
| Category | 12 — LLM & AI Integration |
| Scope | LLM failure mapping. |
| Applicability | Node. |
| Evidence | E0 — no organizational evidence (generic baseline) |
| Classification | GENERIC built on ERR standards |
| Governing standards | `ERR-02`, `ERR-09`, `LLM-01`, `API-10` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `error-catalog-management`, `llm-api-call`, `llm-response-validation`, `integration-error-handling`, `error-logging` |

## Purpose
Consistent errors from AI features.

## When to use
- Handling model failures.

## Organizational standards
- **MANDATORY:** Add catalog entries via `error-catalog-management` (never a parallel mechanism): `LLM_UNAVAILABLE` (503), `LLM_TIMEOUT` (504), `LLM_CONTENT_FILTERED` (422), `LLM_INVALID_OUTPUT` (502) - sequences per the service's MM/banding policy (`error-code-standards`).
- **MANDATORY:** Do not forward provider error bodies; log provider status and request ID.

_Source of truth: `ERR-02`, `ERR-09`, `LLM-01`, `API-10`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Map by HTTP status/type in the client module.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Mapping (GENERIC)**

```text
429/503 -> LLM_UNAVAILABLE | timeout -> LLM_TIMEOUT | 400 content_filter -> LLM_CONTENT_FILTERED | bad JSON -> LLM_INVALID_OUTPUT
```

## Error and failure handling
- As mapped.
- LLM failures map to catalogued errors (ERR-02) and follow the resilience standards (RES-02, RES-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Model keys and endpoints are secrets (mask `key`, `endpoint`); never log prompts or completions containing PII; treat model output as untrusted input.

## Testing guidelines
- Each branch.
- Mock the model client; cover malformed output, refusal, timeout, rate-limit and token-limit paths.

## Anti-patterns
- Surfacing provider messages.

## Implementation checklist
- [ ] Catalog; logs.

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
- Add catalog entries via `error-catalog-management` (never a parallel mechanism): `LLM_UNAVAILABLE` (503), `LLM_TIMEOUT` (504), `LLM_CONTENT_FILTERED` (422), `LLM_INVALID_OUTPUT` (502) - sequences per the service's MM/banding policy (`error-code-standards`).
- Do not forward provider error bodies; log provider status and request ID.

## Related skills
- `error-catalog-management` — Error Catalog Management
- `llm-api-call` — LLM API Call
- `llm-response-validation` — LLM Response Validation
- `integration-error-handling` — Integration Error Handling
- `error-logging` — Error Logging
