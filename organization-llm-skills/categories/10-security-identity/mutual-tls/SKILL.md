---
name: mutual-tls
description: Use when considering mutual TLS between services. The organization authenticates services with Entra tokens and internal API keys; no mTLS exists in the reference repositories. Generic baseline requiring architectural approval.
---

# Mutual TLS

> ⚠ **GENERIC BASELINE (evidence E0).** No organizational implementation of this concern exists in the reference repositories. Everything marked GENERIC is a provisional recommendation pending architectural approval and is **not** an organizational standard. The skill still inherits the standards listed in *Related skills* (logging, errors, configuration, security).

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `mutual-tls` |
| Category | 10 — Security & Identity Management |
| Scope | mTLS. |
| Applicability | Azure networking/gateway. |
| Evidence | E0 — no organizational evidence (generic baseline) |
| Classification | GENERIC (no organizational evidence) |
| Governing standards | `SEC-08`, `SEC-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `certificate-management`, `service-to-service-authentication`, `api-security` |

## Purpose
Avoid an unapproved auth mechanism.

## When to use
- Asked to add mTLS.

## Organizational standards
- **Generic baseline (provisional):** mTLS, if approved, belongs at the platform/gateway layer, not in application code; it complements, not replaces, token + internal-key authentication.
- **MANDATORY:** Do not implement client-certificate verification in services without approval (`SEC-03`/`SEC-01` are the standards).

_Source of truth: `SEC-08`, `SEC-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Raise an ADR proposal.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Decision record needed**

```text
Context / options (gateway mTLS vs tokens) / decision owner
```

## Error and failure handling
- N/A.
- Authentication failures return 401, authorization failures 403, both in the standard error envelope; log the reason, not the credential.
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Fail closed: a missing or invalid credential rejects the request or stops startup, never opens the endpoint (CFG-04). Use constant-time comparison for secrets.

## Testing guidelines
- N/A until approved.
- Test valid, missing, malformed, expired and wrong-audience/role credentials; test fail-closed behaviour when configuration is absent outside local/dev.

## Anti-patterns
- Custom cert parsing in handlers.

## Implementation checklist
- [ ] ADR approved.

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
- Do not implement client-certificate verification in services without approval (`SEC-03`/`SEC-01` are the standards).

## Related skills
- `certificate-management` — Certificate Management
- `service-to-service-authentication` — Service-to-Service Authentication
- `api-security` — API Security
