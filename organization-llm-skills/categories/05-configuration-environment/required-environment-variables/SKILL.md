---
name: required-environment-variables
description: Use when adding configuration the service cannot run without (datastore URIs, auth tenant/audience/role, secrets, upstream URLs) - declare it in the single env schema, fail fast at startup with aggregated secret-free errors, and apply stricter rules outside local/dev.
---

# Required Environment Variables

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `required-environment-variables` |
| Category | 05 — Configuration & Environment Management |
| Scope | Mandatory environment variables. |
| Applicability | Node services with `dotenv`; Zod schema (aliased reference) or explicit config module (flat reference). |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (CFG-01, CFG-02, CFG-04) |
| Governing standards | `CFG-01`, `CFG-02`, `CFG-04`, `CFG-07` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `configuration-validation`, `configuration-management`, `optional-environment-variables`, `configuration-security`, `startup-dependency-validation` |

## Purpose
A misconfigured service must refuse to start rather than run in an undefined or insecure state.

## When to use
- Adding a dependency that needs a URL/credential.
- Adding an auth setting.
- Reviewing `process.env.X!` usages.

## Organizational standards
- **MANDATORY:** Every required variable is declared once in the service's env schema (`env.schema.ts` with `.min(1, "X is required")`) and validated by `validateEnv()` in the bootstrap **before** the app is imported; failures throw one aggregated message (`path: message` lines) and the process exits non-zero.
- **MANDATORY:** Reference required set (reference service A): `AZURE_SERVICE_OAUTH_TENANT_IDS`, `AZURE_SERVICE_OAUTH_AUDIENCE`, `AZURE_SERVICE_OAUTH_APP_ROLE`, `MONGO_DB_CONNECTION_STRING`, `MONGO_PLATFORM_ADMIN_DB_NAME`, `MONGO_DB_USER`, `MONGO_DB_PASSWORD`, `AZURE_CACHE_FOR_REDIS_HOST_NAME`, `AZURE_CACHE_FOR_REDIS_ACCESS_KEY`. Reference service B: `CONFIG_SERVICE_BASE_URL` (+ Mongo/Redis/auth by environment; marked REQUIRED in `.env.example`).
- **MANDATORY:** Secrets that may only be absent in local/dev (internal API key, webhook HMAC secret) are required whenever `APP_ENV`/`DEPLOYMENT_ENV` is not in the local/dev set (CFG-04).
- **MANDATORY:** Mirror every required variable in `.env.example` with a `REQUIRED` marker and a placeholder, never a real value; derive health/readiness env checks from the same schema.
- **UNRESOLVED — do not enforce; report:** Reference repos name Redis variables differently (`AZURE_CACHE_FOR_REDIS_*` vs `REDIS_HOST_NAME`/`REDIS_ACCESS_KEY` with fallbacks) (C-03/C-11). Follow the target repo; do not rename existing variables.

_Source of truth: `CFG-01`, `CFG-02`, `CFG-04`, `CFG-07`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add the key to the schema (with message), `.env.example`, README table and the test setup file.
2. Read it only through the validated config object (or `process.env` after validation in legacy files).
3. Add a test for the missing/blank case.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Schema excerpt (reference)**

```ts
const baseSchema = z.object({
  APP_ENV: z.string().optional().default("production"),
  AZURE_SERVICE_OAUTH_AUDIENCE: z.string().min(1, "AZURE_SERVICE_OAUTH_AUDIENCE is required"),
  MONGO_DB_CONNECTION_STRING: z.string().min(1, "MONGO_DB_CONNECTION_STRING is required"),
});
export function validateEnv(env = process.env) {
  const r = baseSchema.safeParse(env);
  if (!r.success) throw new Error("Invalid/missing environment configuration:\n - " + r.error.issues.map((i) => i.path.join(".") + ": " + i.message).join("\n - "));
  return r.data;
}
```

## Error and failure handling
- Missing required variable -> throw before listening; message names keys only.
- Invalid required configuration stops startup with an aggregated, secret-free message (CFG-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Secrets only from environment/secret store; never log values; fail closed when a required secret is missing outside local/dev (CFG-04).

## Testing guidelines
- Each required key missing/blank; production vs local rules; memoization reset hook.
- Test valid, missing, malformed and environment-specific configurations; reset any memoized config between tests.

## Anti-patterns
- `process.env.X!` non-null assertions.
- Defaults for secrets.
- Different required lists in schema, health check and `.env.example`.

## Implementation checklist
- [ ] Schema + `.env.example` + README + tests; fail-fast; env-aware strictness.

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
- Every required variable is declared once in the service's env schema (`env.schema.ts` with `.min(1, "X is required")`) and validated by `validateEnv()` in the bootstrap **before** the app is imported; failures throw one aggregated message (`path: message` lines) and the process exits non-zero.
- Reference required set (reference service A): `AZURE_SERVICE_OAUTH_TENANT_IDS`, `AZURE_SERVICE_OAUTH_AUDIENCE`, `AZURE_SERVICE_OAUTH_APP_ROLE`, `MONGO_DB_CONNECTION_STRING`, `MONGO_PLATFORM_ADMIN_DB_NAME`, `MONGO_DB_USER`, `MONGO_DB_PASSWORD`, `AZURE_CACHE_FOR_REDIS_HOST_NAME`, `AZURE_CACHE_FOR_REDIS_ACCESS_KEY`. Reference service B: `CONFIG_SERVICE_BASE_URL` (+ Mongo/Redis/auth by environment; marked REQUIRED in `.env.example`).
- Secrets that may only be absent in local/dev (internal API key, webhook HMAC secret) are required whenever `APP_ENV`/`DEPLOYMENT_ENV` is not in the local/dev set (CFG-04).
- Mirror every required variable in `.env.example` with a `REQUIRED` marker and a placeholder, never a real value; derive health/readiness env checks from the same schema.

## Related skills
- `configuration-validation` — Configuration Validation
- `configuration-management` — Configuration Management
- `optional-environment-variables` — Optional Environment Variables
- `configuration-security` — Configuration Security
- `startup-dependency-validation` — Startup Dependency Validation
