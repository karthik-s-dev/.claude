---
name: liveness-readiness-checks
description: Use when defining what makes a service alive vs ready, wiring container/orchestrator probes, and flipping readiness during shutdown. Complements health-endpoint-implementation with probe semantics.
---

# Liveness & Readiness Checks

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `liveness-readiness-checks` |
| Category | 06 — Observability & Health Management |
| Scope | Probe semantics and orchestration wiring. |
| Applicability | Containerized services on Azure (Container Apps/App Service/ACI) or Kubernetes. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | VERIFIED (OBS-04) |
| Governing standards | `OBS-04`, `ARCH-03`, `RES-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `health-endpoint-implementation`, `graceful-shutdown`, `docker-containerization`, `kubernetes-deployment`, `startup-dependency-validation` |

## Purpose
Correct restart and traffic decisions.

## When to use
- Configuring Docker HEALTHCHECK or platform probes.
- Designing shutdown behaviour.

## Organizational standards
- **MANDATORY:** Liveness = the process can respond (no dependency checks); readiness = can serve requests now (critical dependencies reachable); a failing dependency must never fail liveness.
- **Verified convention:** Dockerfile `HEALTHCHECK --interval=60s --timeout=10s --start-period=40s --retries=3` with a `node -e http.get` one-liner (reference service B). Align the path with the service's live endpoint.
- **Generic baseline (provisional) (no Kubernetes manifests exist):** start-up probe for slow starts; on SIGTERM set a `shuttingDown` flag so readiness returns 503 before draining.
- **MANDATORY:** Platform probe paths are listed in deployment documentation (`deployment-documentation`).

_Source of truth: `OBS-04`, `ARCH-03`, `RES-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Choose probe paths/timeouts; set start period >= worst-case boot including dependency validation.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Dockerfile**

```text
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||3000)+'/health/live',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
```

## Error and failure handling
- Failing readiness removes the instance from rotation without restarting it.
- Observability code must never throw into the request path; failures degrade to no-op with a warning (OBS-05).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Mask sensitive fields with the shared mask configuration before logging or exporting telemetry (OBS-03); never log request bodies on the error path.

## Testing guidelines
- Simulate dependency failure and verify ready 503 / live 200.
- Mock `@inextlabs/logger` per the shared test-double pattern (TEST-02) and assert level, message and structured fields; assert no secret/PII values are emitted.

## Anti-patterns
- Liveness hitting the database.
- Probe interval shorter than dependency timeouts.

## Implementation checklist
- [ ] Semantics, timings, docs.

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
- Liveness = the process can respond (no dependency checks); readiness = can serve requests now (critical dependencies reachable); a failing dependency must never fail liveness.
- Platform probe paths are listed in deployment documentation (`deployment-documentation`).

## Related skills
- `health-endpoint-implementation` — Health Endpoint Implementation
- `graceful-shutdown` — Graceful Shutdown
- `docker-containerization` — Docker & Containerization
- `kubernetes-deployment` — Kubernetes Deployment
- `startup-dependency-validation` — Startup Dependency Validation
