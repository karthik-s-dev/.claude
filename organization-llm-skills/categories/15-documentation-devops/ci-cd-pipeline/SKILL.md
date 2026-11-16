---
name: ci-cd-pipeline
description: Use when creating or changing build/test/release pipelines - Azure DevOps YAML per environment, branch triggers (devtest/staging/main), UnitTest gating Build, image tagged with the 8-char git SHA, AuthToken injection, GitHub Actions CI (tsc + tests) and Azure Boards PR validation.
---

# CI/CD Pipeline

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `ci-cd-pipeline` |
| Category | 15 — Documentation & DevOps |
| Scope | Pipelines. |
| Applicability | Azure DevOps + GitHub Actions. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (OPS-02, OPS-03, TEST-04) |
| Governing standards | `OPS-02`, `OPS-03`, `TEST-04`, `PKG-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `pipeline-security-scanning`, `deployment-release-management`, `docker-containerization`, `internal-package-management`, `unit-testing` |

## Purpose
Consistent, gated builds.

## When to use
- Pipeline edits.

## Organizational standards
- **Verified convention:** `azure-pipeline-devtest.yaml`/`-stg.yaml`/`-prod.yaml`; `trigger: branches: include: [<env branch>]`; `pr: exclude *`; variable group `iNextLabs-DevTest-Variables`; agent pool `$(AgentName)`; `SHORT_SHA=$(git rev-parse --short=8 HEAD)` -> `##vso[build.updatebuildnumber]`; Docker@2 build with `--build-arg AuthToken=$(AuthToken)`, push with tag `$(commitId)`.
- **Verified convention:** GitHub `ci.yml`: PRs to `devtest|staging|main`; Node 22; `npm ci`; `npx tsc --noEmit`; `npm test`; `permissions: contents: read, packages: read`; concurrency cancel-in-progress; `AuthToken: secrets.PACKAGES_TOKEN || secrets.GITHUB_TOKEN`. `validate-pr.yml` calls `iNextLabs/github-workflows/.github/workflows/validate-azure-boards-pr.yml@main`.
- **MANDATORY:** Test stage gates Build/Push (config repo UnitTest -> Build); publish JUnit/Cobertura.
- **MANDATORY:** Tag images with the SHA only for deployment; do not rely on `latest` (devtest pipelines push `latest` too - defect, C-21).
- **Known gap (not a standard):** No deploy/release stage exists in either repo; do not invent one without platform input (`deployment-release-management`).

_Source of truth: `OPS-02`, `OPS-03`, `TEST-04`, `PKG-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Keep stages aligned across environments; prod adds scans (`pipeline-security-scanning`).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Build step (reference)**

```yaml
- task: Docker@2
  inputs: { command: build, repository: $(imageRepository), dockerfile: $(dockerfilePath), containerRegistry: $(dockerRegistryServiceConnection), buildContext: $(buildContext), arguments: "--build-arg AuthToken=$(AuthToken)", tags: "$(commitId)" }
```

## Error and failure handling
- Failed stage stops the pipeline.
- A failed stage stops the pipeline; no image is pushed unless tests and scans pass (OPS-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Secrets only via variable groups.
- Documentation and pipelines never contain secrets; registry tokens come from `AuthToken`/variable groups and are removed from image layers.

## Testing guidelines
- Dry-run on a branch.
- Validate pipelines and Dockerfiles in CI (build, scan, test stages gate the push).

## Anti-patterns
- Divergent build-arg names per pipeline (`AuthToken` vs `AUTHTOKEN`).

## Implementation checklist
- [ ] Gates; tags; token handling.

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
- Test stage gates Build/Push (config repo UnitTest -> Build); publish JUnit/Cobertura.
- Tag images with the SHA only for deployment; do not rely on `latest` (devtest pipelines push `latest` too - defect, C-21).

## Related skills
- `pipeline-security-scanning` — Pipeline Security Scanning
- `deployment-release-management` — Deployment & Release Management
- `docker-containerization` — Docker & Containerization
- `internal-package-management` — Internal Package Management
- `unit-testing` — Unit Testing
