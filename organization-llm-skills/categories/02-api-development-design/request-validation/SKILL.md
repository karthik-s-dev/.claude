---
name: request-validation
description: Use when validating request params, query or body, writing schemas, or reviewing endpoints with ad-hoc `if (!x)` checks. Enforces schema-per-segment validation producing the catalogued VALIDATION error.
---

# Request Validation

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `request-validation` |
| Category | 02 — API Development & Design |
| Scope | Input validation at the API boundary. |
| Applicability | Express (Zod in the reference service that uses it). |
| Evidence | E1 — consistent across both reference repositories |
| Classification | TECH (Zod in aliased repo; manual in other, C-03) |
| Governing standards | `API-05`, `ERR-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `api-request-structure`, `request-dto-mapping`, `query-parameter-management`, `api-error-response`, `error-catalog-management` |

## Purpose
Reject bad input uniformly before any business logic and give clients structured, safe details.

## When to use
- Adding or changing an endpoint input.
- Reviewing handlers that read `req.body` directly.

## Organizational standards
- **MANDATORY:** Validate every segment (`params`, `query`, `body`) with a schema; a failure throws the catalogued validation error (`VALIDATION_FAILED`/`VALIDATION_ERROR`, 400) - never an ad-hoc response.
- **MANDATORY:** Log validation failure at `warn` with `path`, `segment` and flattened issues, never the raw body.
- **MANDATORY:** Write the parsed/coerced data back (`req[segment] = result.data`) so handlers consume validated data.
- **Technology-specific:** Where the target depends on Zod, use `validate(schema, segment)` middleware; where it does not, use explicit validators that throw `V2Errors.badRequest(message, [{ field, reason }])`. Do not add Zod to a repo that lacks it without approval (C-03).
- **Verified convention:** Security-sensitive extras: https-only callback URLs plus SSRF guard (`ssrf-protection`), enumerations validated against catalog.

_Source of truth: `API-05`, `ERR-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Write the schema next to the route (`schemas/<resource>.schema.ts`).
2. Mount `validate(schema, "params")` etc. after auth and before the controller.
3. Make schemas strict for write bodies.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**validate middleware (reference)**

```ts
export function validate(schema: ZodSchema, segment: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse((req as any)[segment]);
    if (!result.success) {
      logger.warn({ path: req.originalUrl, segment, issues: result.error.flatten() }, "Request validation failed");
      throwConfigError("VALIDATION_FAILED", result.error.flatten());
    }
    (req as any)[segment] = result.data;
    next();
  };
}
```

## Error and failure handling
- Invalid input -> 400 envelope with `details`; no partial processing.
- Every failure leaves the service through the single error middleware in the standard error envelope (API-03, ERR-06).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Validate sizes and formats (max lengths, enum membership) to bound abuse; configure an explicit body size limit (generic hardening, not evidenced).
- Every non-probe route is authenticated; validate all input before use; never echo internal error detail to clients (SEC-01, ERR-07).

## Testing guidelines
- One failing test per field rule; extra fields; type coercion boundaries.
- Cover success, validation failure, unauthenticated, forbidden and unexpected-error paths; assert the envelope shape and `x-correlation-id` on every response.

## Anti-patterns
- Validation inside services after side effects.
- Trusting TypeScript types as validation.
- Logging `req.body` on failure.

## Implementation checklist
- [ ] All segments validated; errors catalogued; parsed data used.

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
- Validate every segment (`params`, `query`, `body`) with a schema; a failure throws the catalogued validation error (`VALIDATION_FAILED`/`VALIDATION_ERROR`, 400) - never an ad-hoc response.
- Log validation failure at `warn` with `path`, `segment` and flattened issues, never the raw body.
- Write the parsed/coerced data back (`req[segment] = result.data`) so handlers consume validated data.

## Related skills
- `api-request-structure` — API Request Structure
- `request-dto-mapping` — Request DTO Mapping
- `query-parameter-management` — Query Parameter Management
- `api-error-response` — API Error Response
- `error-catalog-management` — Error Catalog Management
