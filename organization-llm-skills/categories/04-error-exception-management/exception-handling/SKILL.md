---
name: exception-handling
description: Use when writing try/catch, throwing errors, or reviewing how a function reports failure. Defines where to catch, where to throw catalogued AppErrors, and the controller idiom that forwards failures to the global handler.
---

# Exception Handling

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `exception-handling` |
| Category | 04 — Error & Exception Management |
| Scope | In-code exception handling rules. |
| Applicability | TypeScript/Node. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (ERR-01, ERR-08) |
| Governing standards | `ERR-01`, `ERR-02`, `ERR-05`, `ERR-08` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `error-catalog-management`, `global-exception-handling`, `error-propagation`, `business-exception-handling`, `technical-exception-handling`, `error-logging` |

## Purpose
One consistent way to raise and forward failures.

## When to use
- Writing any I/O, parsing or business-rule code.
- Reviewing swallow-and-continue catches.

## Organizational standards
- **MANDATORY:** Expected failures throw catalogued `AppError`s; unexpected failures propagate and are wrapped once at the boundary (`toAppError`).
- **MANDATORY:** Controllers: `try { ... } catch (err) { next(toAppError(err)); }` (or an `asyncHandler` wrapper); no response writing in catch blocks.
- **MANDATORY:** Catch only to (a) add safe context, (b) translate a known error, (c) implement a documented fail-open/degrade policy, (d) clean up in `finally`. Re-throw otherwise.
- **MANDATORY:** A deliberate swallow (best-effort notification, cache) logs at `warn`/`error` with context and the serialized error, and states why in a comment.
- **Verified convention:** Fire-and-forget calls use `void fn().catch(logError)` so rejections never become unhandled.

_Source of truth: `ERR-01`, `ERR-02`, `ERR-05`, `ERR-08`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. For each external call decide: confirmed-absent (`null`), unavailable (typed throw), or best-effort (log and continue).
2. Throw with the most specific catalog entry.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Best-effort side effect (reference pattern)**

```ts
void notifyDownstream(params).catch((err) =>
  logger.error({ subscriptionId: params.subscriptionId, err: serializeError(err) }, "Unhandled downstream notification error"));
```

## Error and failure handling
- An unhandled rejection is a fatal bug (`fatal-error-process-policy`).
- Catch only where you can add context or translate; otherwise let the error propagate to the global handler (ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- `AppError.details` is public; internal causes live only on `Error.cause` and in logs (ERR-07).

## Testing guidelines
- Each catch has a test proving the translation/swallow decision.
- Assert code, numericCode, HTTP status and envelope for each catalog entry touched; assert that unknown errors become `UNHANDLED_ERROR` with no leaked detail.

## Anti-patterns
- `catch (e) {}`.
- `throw new Error("not found")` for expected conditions.
- Catching and returning `{ success:false }` objects instead of throwing.

## Implementation checklist
- [ ] No empty catches; catalogued throws; controller idiom.

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
- Expected failures throw catalogued `AppError`s; unexpected failures propagate and are wrapped once at the boundary (`toAppError`).
- Controllers: `try { ... } catch (err) { next(toAppError(err)); }` (or an `asyncHandler` wrapper); no response writing in catch blocks.
- Catch only to (a) add safe context, (b) translate a known error, (c) implement a documented fail-open/degrade policy, (d) clean up in `finally`. Re-throw otherwise.
- A deliberate swallow (best-effort notification, cache) logs at `warn`/`error` with context and the serialized error, and states why in a comment.

## Related skills
- `error-catalog-management` — Error Catalog Management
- `global-exception-handling` — Global Exception Handling
- `error-propagation` — Error Propagation
- `business-exception-handling` — Business Exception Handling
- `technical-exception-handling` — Technical Exception Handling
- `error-logging` — Error Logging
