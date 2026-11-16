---
name: fatal-error-process-policy
description: Use when configuring process-level error handlers - on uncaughtException or unhandledRejection log with the logger, give logs a short flush window, then exit(1) so the orchestrator restarts a clean instance; never resume.
---

# Fatal Error Process Policy

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `fatal-error-process-policy` |
| Category | 11 — Resilience & Reliability |
| Scope | Process-level fatal handling. |
| Applicability | Node. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (RES-04) reference service A only |
| Governing standards | `RES-04`, `OBS-01`, `ARCH-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `graceful-shutdown`, `service-registration-lifecycle`, `structured-logging`, `exception-handling` |

## Purpose
No zombie instances holding corrupt state.

## When to use
- Writing bootstrap.

## Organizational standards
- **MANDATORY:** Register both handlers early in bootstrap (after logger init): `logger.error(err instanceof Error ? err : new Error(String(err)), "Fatal <kind> - exiting"); setTimeout(() => process.exit(1), 250).unref();`.
- **MANDATORY:** Do not swallow or resume; fire-and-forget promises use `void p.catch(logError)` so expected failures do not become fatal.
- **Verified convention gap:** reference service B registers no handlers - add them.

_Source of truth: `RES-04`, `OBS-01`, `ARCH-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add to bootstrap; test with mocks.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Reference**

```ts
function crashOnFatal(kind: "uncaughtException" | "unhandledRejection", error: unknown) {
  logger.error(error instanceof Error ? error : new Error(String(error)), "Fatal " + kind + " - exiting");
  setTimeout(() => process.exit(1), 250).unref();
}
process.on("uncaughtException", (e) => crashOnFatal("uncaughtException", e));
process.on("unhandledRejection", (r) => crashOnFatal("unhandledRejection", r));
```

## Error and failure handling
- Exit code 1.
- Decide fail-open vs fail-closed explicitly per dependency and document it (INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Resilience mechanisms must not bypass authentication or leak internal detail when degrading.

## Testing guidelines
- Handler invokes logger then exit (mocked).
- Use fake timers/forced failures to test timeout, retry exhaustion, breaker open/half-open, fallback and shutdown ordering.

## Anti-patterns
- Continue after uncaughtException.

## Implementation checklist
- [ ] Both handlers; flush; exit 1.

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
- Register both handlers early in bootstrap (after logger init): `logger.error(err instanceof Error ? err : new Error(String(err)), "Fatal <kind> - exiting"); setTimeout(() => process.exit(1), 250).unref();`.
- Do not swallow or resume; fire-and-forget promises use `void p.catch(logError)` so expected failures do not become fatal.

## Related skills
- `graceful-shutdown` — Graceful Shutdown
- `service-registration-lifecycle` — Service Registration & Lifecycle
- `structured-logging` — Structured Logging
- `exception-handling` — Exception Handling
