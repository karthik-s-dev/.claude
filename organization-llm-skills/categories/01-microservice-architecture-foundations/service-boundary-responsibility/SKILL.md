---
name: service-boundary-responsibility
description: Use when deciding which service owns data or behaviour, adding a cross-service call or event, or reviewing coupling between services. Applies the organization's ownership model and service-to-service contract.
---

# Service Boundary & Responsibility

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `service-boundary-responsibility` |
| Category | 01 — Microservice Architecture & Foundations |
| Scope | Ownership, contracts and coupling between services. |
| Applicability | Any distributed system of the organization's services. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (ARCH-07), risk C-19 |
| Governing standards | `ARCH-07`, `CTX-02`, `SEC-03`, `SEC-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `microservice-architecture-standards`, `service-to-service-authentication`, `event-driven-architecture`, `external-api-client`, `architecture-review` |

## Purpose
Prevents shared-database/shared-cache coupling and unclear ownership, and keeps inter-service contracts explicit, authenticated and traceable.

## When to use
- Adding an endpoint that another service will call.
- Calling another service or reading its data.
- Splitting or merging services.

## Organizational standards
- **MANDATORY:** A service owns its data; others access it through its API or events, never its datastore or cache keys. The reference reference service A owns subscription/configuration data; reference service B consumes it over HTTP and a change webhook.
- **MANDATORY:** Internal calls carry `x-internal-api-key`, `x-internal-api-caller`, `x-correlation-id`; calls to Entra-protected APIs carry a Managed-Identity bearer (CTX-02, SEC-02).
- **MANDATORY:** Internal endpoints live in a separate namespace and are authenticated fail-closed (SEC-03).
- **UNRESOLVED — do not enforce; report:** One reference service reads another's Redis keys without a prefix (C-19) - do not replicate; propose an API/event contract.
- **Verified convention:** Change propagation uses a subscription webhook plus cache invalidation, not polling the owner's database.

_Source of truth: `ARCH-07`, `CTX-02`, `SEC-03`, `SEC-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Write down: owner, consumers, contract (path, headers, schema, error codes), failure policy (fail-open or closed), freshness (cache TTL/stale window).
2. Add an integration module in the consumer (`external-api-client`) and an internal route in the owner.
3. Add contract tests (`api-contract-testing`).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Boundary note to include in the PR/ADR**

```text
Owner: service-a (subscriptions). Consumer: service-b (reads via GET /api/v2/internal/..., Managed Identity).
Failure policy: unavailable => fail closed when blocking enabled (typed Unavailable error); absent (404) => null.
Freshness: consumer cache TTL 30 s, stale-max window; owner pushes subscription-changed webhook.
```

## Error and failure handling
- Owner unavailable: consumer follows the documented policy (`fail-open-fail-closed-policy`).
- Bootstrap failures must stop the process with a non-zero exit and a secret-free log (ARCH-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Never expose internal routes publicly; never share secrets across services.
- Never place secrets, tokens or connection strings in source, logs, examples or fixtures (CFG-07, OBS-03).

## Testing guidelines
- Contract tests on both sides; consumer tests for absent vs unavailable.
- Where import-boundary/lint tooling exists, enforce layer rules in CI; otherwise add an architecture test or review-checklist item for each rule.

## Anti-patterns
- Reading another service's database/cache directly.
- Sharing a database between services.
- Undocumented implicit contracts (field names inferred from code).

## Implementation checklist
- [ ] Owner and contract documented; auth headers; failure policy; contract tests.

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
- A service owns its data; others access it through its API or events, never its datastore or cache keys. The reference reference service A owns subscription/configuration data; reference service B consumes it over HTTP and a change webhook.
- Internal calls carry `x-internal-api-key`, `x-internal-api-caller`, `x-correlation-id`; calls to Entra-protected APIs carry a Managed-Identity bearer (CTX-02, SEC-02).
- Internal endpoints live in a separate namespace and are authenticated fail-closed (SEC-03).

## Related skills
- `microservice-architecture-standards` — Microservice Architecture Standards
- `service-to-service-authentication` — Service-to-Service Authentication
- `event-driven-architecture` — Event-Driven Architecture
- `external-api-client` — External API Client
- `architecture-review` — Architecture Review
