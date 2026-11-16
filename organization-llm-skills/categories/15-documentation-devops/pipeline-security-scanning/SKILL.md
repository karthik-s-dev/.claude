---
name: pipeline-security-scanning
description: Use when creating or modifying production pipelines - required scan stages and their order (SecretScan, SonarQubeScan with quality gate, SnykScan, Build, TrivyScan, Push), report publication and gating of the image push.
---

# Pipeline Security Scanning

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `pipeline-security-scanning` |
| Category | 15 — Documentation & DevOps |
| Scope | Pipeline scan stages. |
| Applicability | Azure DevOps. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (OPS-02) |
| Governing standards | `OPS-02`, `SEC-06`, `PKG-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `ci-cd-pipeline`, `dependency-review`, `secrets-management`, `docker-containerization`, `security-testing` |

## Purpose
No unscanned image reaches the registry.

## When to use
- Pipeline edits for staging/prod.

## Organizational standards
- **Verified convention stage order in `azure-pipeline-prod.yaml`:** `SecretScan` (TruffleHog report published) -> `SonarQubeScan` (quality gate) -> `SnykScan` (SCA, summary) -> `Build` -> `TrivyScan` (JSON + HTML report published, ACR login) -> `Push`.
- **MANDATORY:** Push depends on all scans; reports published as artifacts; Snyk installs dependencies with `AuthToken`; Node installed in scan jobs.
- **Known gap (not a standard):** devtest pipelines lack scans and a unit-test stage in the enforcement repo - note as risk, do not copy.

_Source of truth: `OPS-02`, `SEC-06`, `PKG-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Reuse the prod pipeline stage templates.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Gate (pattern)**

```yaml
- stage: Push
  dependsOn: [SecretScan, SonarQubeScan, SnykScan, Build, TrivyScan]
```

## Error and failure handling
- Scan failure blocks push; findings tracked.
- A failed stage stops the pipeline; no image is pushed unless tests and scans pass (OPS-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Scan tokens in variable groups.
- Documentation and pipelines never contain secrets; registry tokens come from `AuthToken`/variable groups and are removed from image layers.

## Testing guidelines
- Seed a fake secret in a branch to confirm detection (without real secrets).
- Validate pipelines and Dockerfiles in CI (build, scan, test stages gate the push).

## Anti-patterns
- Allowing push on scan failure.

## Implementation checklist
- [ ] Order; gating; reports.

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
- Push depends on all scans; reports published as artifacts; Snyk installs dependencies with `AuthToken`; Node installed in scan jobs.

## Related skills
- `ci-cd-pipeline` — CI/CD Pipeline
- `dependency-review` — Dependency Review
- `secrets-management` — Secrets Management
- `docker-containerization` — Docker & Containerization
- `security-testing` — Security Testing
