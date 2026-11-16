---
name: api-versioning
description: Use when introducing a new API version, retiring an old one, or deciding whether a change is breaking. Applies path-segment versioning, one live version per surface, legacy-traffic measurement and recorded sunset dates.
---

# API Versioning

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `api-versioning` |
| Category | 02 — API Development & Design |
| Scope | Version strategy and lifecycle of API surfaces. |
| Applicability | HTTP APIs. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (API-08) |
| Governing standards | `API-08`, `API-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `deprecation-sunset-management`, `api-compatibility-review`, `breaking-change-review`, `api-design-standards` |

## Purpose
Evolve contracts without stranding callers or accumulating unbounded dual-run versions.

## When to use
- A change would break existing callers.
- Planning removal of a legacy surface.

## Organizational standards
- **MANDATORY:** Version is a path prefix (`/api/v2/...`); do not version through headers or query.
- **MANDATORY:** Before removing a legacy surface, measure traffic: log a warn and emit a telemetry trace on every legacy request (`legacyAccessMiddleware`) and require zero usage.
- **MANDATORY:** Record a sunset date before shipping the next version; retired routes answer 410 with deprecation headers (`deprecation-sunset-management`).
- **Verified convention:** Additive changes (new optional fields/endpoints) do not require a new version; removals/renames/semantic changes do.
- **Verified convention:** Product-prefixed surfaces (`/api/v2/<product>/...`) coexist with platform surfaces.

_Source of truth: `API-08`, `API-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Classify the change with `api-compatibility-review`.
2. If breaking, create the new version surface and add legacy-access logging to the old one.
3. Document the migration and sunset date in the README/ADR.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Legacy access instrumentation (pattern)**

```ts
export function legacyAccessMiddleware(req: Request, _res: Response, next: NextFunction) {
  logger.warn({ path: req.originalUrl, method: req.method }, "Legacy route accessed");
  trackTrace("warn", "legacy_route_accessed", { path: req.originalUrl, method: req.method });
  next();
}
```

## Error and failure handling
- Calls to a retired version return 410 in the standard envelope with `useInstead`.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- Both versions respond; legacy instrumentation fires; 410 after sunset.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- Unbounded v1/v2 dual-run (the reference's own worst outcome).
- Breaking a version in place.

## Implementation checklist
- [ ] Breaking change -> new version; legacy measured; sunset recorded.

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
- Version is a path prefix (`/api/v2/...`); do not version through headers or query.
- Before removing a legacy surface, measure traffic: log a warn and emit a telemetry trace on every legacy request (`legacyAccessMiddleware`) and require zero usage.
- Record a sunset date before shipping the next version; retired routes answer 410 with deprecation headers (`deprecation-sunset-management`).

## Related skills
- `deprecation-sunset-management` — Deprecation & Sunset Management
- `api-compatibility-review` — API Compatibility Review
- `breaking-change-review` — Breaking Change Review
- `api-design-standards` — API Design Standards
