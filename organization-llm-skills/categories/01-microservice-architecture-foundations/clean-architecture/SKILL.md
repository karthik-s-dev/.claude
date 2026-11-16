---
name: clean-architecture
description: Use when deciding where business rules live relative to frameworks and datastores, or when a service's domain logic is entangled with Express, Mongoose or SDK types. Applies the organization's pragmatic clean-architecture interpretation without introducing new frameworks.
---

# Clean Architecture

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `clean-architecture` |
| Category | 01 — Microservice Architecture & Foundations |
| Scope | Dependency rule between domain logic, application services and infrastructure. |
| Applicability | Any service; examples in TypeScript. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (ARCH-02), GENERIC for stricter ports/adapters |
| Governing standards | `ARCH-02`, `ARCH-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `layered-architecture`, `dependency-injection`, `solid-principles`, `design-patterns` |

## Purpose
Keeps domain/business logic independent from transport and infrastructure so it can be tested in isolation and survive framework or datastore changes.

## When to use
- Writing or refactoring business rules (limits, pricing, entitlement decisions).
- Reviewing code where services import `express`, SDK clients or ORM models directly.

## Organizational standards
- **Verified convention:** The organization applies a pragmatic layered form: pure functions/classes for rules (for example `plan-limits`, `ai-credits-calculator`, `threshold-dedup`), collaborators injected through constructors, infrastructure behind `get*`/repository modules (ARCH-02, ARCH-04).
- **MANDATORY:** Services contain no `Request`/`Response` types; transport objects are mapped to plain inputs in controllers (`request-dto-mapping`).
- **MANDATORY:** No new DI/clean-architecture framework (no `inversify`, `tsyringe`, hexagonal scaffolding) without approval (ARCH-04).
- **Generic baseline (provisional):** Define small interfaces (ports) for outbound dependencies when you need substitution in tests (for example `ConfigSubscriptionFetcher`); this is the only port style evidenced.

_Source of truth: `ARCH-02`, `ARCH-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Separate pure decision logic from I/O: compute decisions in pure functions; perform reads/writes in the caller.
2. Pass dependencies as constructor/function parameters; default them to the production implementation.
3. Keep mapping between transport DTOs, domain types and persistence documents in explicit mapper functions.
4. Verify the dependency direction: domain -> nothing; services -> domain + ports; infra -> ports.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Injected fetcher with a production default (pattern from the reference)**

```ts
type Fetcher = (clientId: string, appId: string) => Promise<Subscription | null>;

export class SubscriptionService {
  constructor(
    private readonly fetchSubscription: Fetcher = getSubscriptionFromRemote,
    private readonly source: string = "v2"
  ) {}
  async resolve(clientId: string, appId: string) {
    const sub = await this.fetchSubscription(clientId, appId); // null = confirmed absent; throws = unavailable
    return sub ? toEntry(sub) : null;
  }
}
```

## Error and failure handling
- Domain functions throw typed catalog errors; infrastructure errors are translated at the boundary (`exception-to-error-mapping`).
- Bootstrap failures must stop the process with a non-zero exit and a secret-free log (ARCH-03).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Never place secrets, tokens or connection strings in source, logs, examples or fixtures (CFG-07, OBS-03).

## Testing guidelines
- Unit-test pure rules with no mocks; test services with a fake fetcher/repository.
- Where import-boundary/lint tooling exists, enforce layer rules in CI; otherwise add an architecture test or review-checklist item for each rule.

## Anti-patterns
- Services reading `process.env` directly.
- ORM documents leaking into API responses.
- Introducing an abstract "UseCase" hierarchy that no repo uses.

## Implementation checklist
- [ ] Business rules testable without Express/DB.
- [ ] Collaborators injected; defaults wired at the composition root.
- [ ] No new architecture framework added.

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
- Services contain no `Request`/`Response` types; transport objects are mapped to plain inputs in controllers (`request-dto-mapping`).
- No new DI/clean-architecture framework (no `inversify`, `tsyringe`, hexagonal scaffolding) without approval (ARCH-04).

## Related skills
- `layered-architecture` — Layered Architecture
- `dependency-injection` — Dependency Injection
- `solid-principles` — SOLID Principles
- `design-patterns` — Design Patterns
