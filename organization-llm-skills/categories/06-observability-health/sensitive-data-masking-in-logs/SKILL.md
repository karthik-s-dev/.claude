---
name: sensitive-data-masking-in-logs
description: Use when logs, telemetry or audit records may contain PII or secrets - configure MASK_CONFIG on @inextlabs/logger, reuse the same mask for telemetry and audit, mask URIs and API keys, and never log bodies.
---

# Sensitive Data Masking in Logs

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `sensitive-data-masking-in-logs` |
| Category | 06 — Observability & Health Management |
| Scope | Masking policy and implementation. |
| Applicability | Services using `@inextlabs/logger`. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (OBS-03) |
| Governing standards | `OBS-03`, `OBS-01`, `SEC-06` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `structured-logging`, `logger-initialization`, `audit-logging`, `configuration-security`, `data-protection` |

## Purpose
Sensitive data never reaches log sinks.

## When to use
- Logging objects with user/tenant/secret fields.
- Adding a model with new sensitive fields.

## Organizational standards
- **MANDATORY:** Define one `MASK_CONFIG: MaskConfig` per service extending the package defaults and reuse it for the logger, telemetry export (`createMasker(MASK_CONFIG)`) and audit entries.
- **MANDATORY:** Package defaults (19): `email`, `phone`, `mobile` (partial); `password`, `passcode`, `otp`, `token`, `cookie`, `set-cookie`, `refreshToken`, `accessToken`, `apiKey`, `secret`, `clientSecret`, `cvv`, `ssn` (full); `jwt`, `authorization`, `creditCard` (partial). Strategies: `partial` | `full` | function.
- **MANDATORY:** Extend with the service's actual field names (reference: `emailId`, `phoneNumber` partial; `key`, `endpoint`, `connectionString`, `connectionstring`, `conn_str` full). Re-audit when schemas change.
- **MANDATORY:** Use `maskConnectionUri(uri, 60)` for URIs and `maskApiKeyForLog(key)` (last 4) for keys; `sanitizeLogMeta` from the shared package where available.
- **MANDATORY:** Never log request/response bodies, `req.headers`, or `process.env`.

_Source of truth: `OBS-03`, `OBS-01`, `SEC-06`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Grep the models for sensitive field names; add them to `MASK_CONFIG`.
2. Verify with a test that logs a sample object and inspects output.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Mask config (reference)**

```ts
export const MASK_CONFIG: MaskConfig = {
  emailId: "partial", phoneNumber: "partial",
  key: "full", endpoint: "full", connectionString: "full", connectionstring: "full", conn_str: "full",
};
```

## Error and failure handling
- Masker handles circular/Map/Set; do not pre-stringify objects before logging.
- Observability code must never throw into the request path; failures degrade to no-op with a warning (OBS-05).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask sensitive fields with the shared mask configuration before logging or exporting telemetry (OBS-03); never log request bodies on the error path.

## Testing guidelines
- Assert masked output for each configured field; no raw secret in captured logs.
- Mock `@inextlabs/logger` per the shared test-double pattern (TEST-02) and assert level, message and structured fields; assert no secret/PII values are emitted.

## Anti-patterns
- Relying on defaults for domain-specific names.
- `JSON.stringify(body)` in logs.

## Implementation checklist
- [ ] One mask config; reused; audited; tested.

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
- Define one `MASK_CONFIG: MaskConfig` per service extending the package defaults and reuse it for the logger, telemetry export (`createMasker(MASK_CONFIG)`) and audit entries.
- Package defaults (19): `email`, `phone`, `mobile` (partial); `password`, `passcode`, `otp`, `token`, `cookie`, `set-cookie`, `refreshToken`, `accessToken`, `apiKey`, `secret`, `clientSecret`, `cvv`, `ssn` (full); `jwt`, `authorization`, `creditCard` (partial). Strategies: `partial` | `full` | function.
- Extend with the service's actual field names (reference: `emailId`, `phoneNumber` partial; `key`, `endpoint`, `connectionString`, `connectionstring`, `conn_str` full). Re-audit when schemas change.
- Use `maskConnectionUri(uri, 60)` for URIs and `maskApiKeyForLog(key)` (last 4) for keys; `sanitizeLogMeta` from the shared package where available.
- Never log request/response bodies, `req.headers`, or `process.env`.

## Related skills
- `structured-logging` — Structured Logging
- `logger-initialization` — Logger Initialization
- `audit-logging` — Audit Logging
- `configuration-security` — Configuration Security
- `data-protection` — Data Protection
