---
name: bounded-concurrency
description: Use when performing N-way parallel I/O (webhook fan-out, batch lookups, notifications) - cap in-flight work with a configurable limit and return settled results in order for partial-success handling.
---

# Bounded Concurrency

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `bounded-concurrency` |
| Category | 11 — Resilience & Reliability |
| Scope | Concurrency cap helper. |
| Applicability | Node. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (RES-06) |
| Governing standards | `RES-06`, `CFG-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `webhook-delivery`, `bulkhead-pattern`, `background-worker-processing`, `rate-limiting`, `query-optimization` |

## Purpose
Avoid unbounded Promise.all.

## When to use
- Mapping async work over lists.

## Organizational standards
- **MANDATORY:** Use a concurrency-limited map (`mapWithConcurrency(items, limit, fn)`) returning `PromiseSettledResult` in input order; limit configurable (`WEBHOOK_INLINE_DELIVERY_CONCURRENCY`).
- **MANDATORY:** Handle rejected results (log, count, partial success).

_Source of truth: `RES-06`, `CFG-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Reuse the shared util; add tests.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Helper (reference-style)**

```ts
export async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (t: T, i: number) => Promise<R>): Promise<PromiseSettledResult<R>[]> {
  const out: PromiseSettledResult<R>[] = new Array(items.length); let next = 0;
  const worker = async () => { while (next < items.length) { const i = next++; try { out[i] = { status: "fulfilled", value: await fn(items[i], i) }; } catch (reason) { out[i] = { status: "rejected", reason }; } } };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}
```

## Error and failure handling
- Rejections never abort siblings.
- Decide fail-open vs fail-closed explicitly per dependency and document it (INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Resilience mechanisms must not bypass authentication or leak internal detail when degrading.

## Testing guidelines
- Max in-flight equals limit; order preserved.
- Use fake timers/forced failures to test timeout, retry exhaustion, breaker open/half-open, fallback and shutdown ordering.

## Anti-patterns
- `Promise.all(items.map(...))` on large lists.

## Implementation checklist
- [ ] Limit; ordered; rejections handled.

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
- Use a concurrency-limited map (`mapWithConcurrency(items, limit, fn)`) returning `PromiseSettledResult` in input order; limit configurable (`WEBHOOK_INLINE_DELIVERY_CONCURRENCY`).
- Handle rejected results (log, count, partial success).

## Related skills
- `webhook-delivery` — Webhook Delivery (Outbound)
- `bulkhead-pattern` — Bulkhead Pattern
- `background-worker-processing` — Background Worker Processing
- `rate-limiting` — Rate Limiting (Service & Dependency Level)
- `query-optimization` — Query Optimization
