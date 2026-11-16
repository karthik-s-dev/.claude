---
name: docker-containerization
description: Use when writing or reviewing Dockerfiles - multi-stage build, AuthToken build-arg with .npmrc removed, prune dev dependencies, copy only dist and production node_modules, non-root user, dumb-init, HEALTHCHECK, pinned Node LTS, .dockerignore, EXPOSE.
---

# Docker & Containerization

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `docker-containerization` |
| Category | 15 — Documentation & DevOps |
| Scope | Container images. |
| Applicability | Node on Alpine. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | TECH / UNRESOLVED (C-20) |
| Governing standards | `OPS-01`, `PKG-01`, `CFG-07`, `OBS-04` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `internal-package-management`, `ci-cd-pipeline`, `liveness-readiness-checks`, `graceful-shutdown`, `pipeline-security-scanning` |

## Purpose
Small, secure, signal-correct images.

## When to use
- New Dockerfile; image review.

## Organizational standards
- **MANDATORY (best observed pattern):** stage `builder` (`node:22-alpine`): `COPY package*.json .npmrc*`, `ARG AuthToken`/`ENV AuthToken`, `npm ci`, `rm -f .npmrc`, copy `tsconfig.json` + `src`, `npm run build`, `npm prune --omit=dev && npm cache clean --force`; stage `production`: `apk add dumb-init`, non-root user (`addgroup -g 1001 nodejs`, `adduser -S nodejs -u 1001`), `ENV NODE_ENV=production`, copy only `package*.json`, `node_modules`, `dist` (+ needed `docs`), `chown`, `USER nodejs`, `EXPOSE <PORT>`, `HEALTHCHECK`, `ENTRYPOINT ["dumb-init","--"]`, `CMD ["node","dist/index.js"]`.
- **MANDATORY:** A `.dockerignore` excludes `.env*`, `.git`, `node_modules`, tests, docs not needed.
- **MANDATORY (prohibition) (reference defects, C-20):** copying the whole build tree into the runtime stage, running as root, leaving `.npmrc`/tokens in layers, `CMD ["npm","run","start"]` (breaks signal delivery), unpinned/mismatched Node versions across services.
- **DECIDED (C-20, approved 2026-11-16):** Approved: use the multi-stage, non-root, dumb-init, HEALTHCHECK Dockerfile pattern; the Node LTS version to align on is still open. _Earlier note (superseded where it conflicts):_ Node 20 vs 22 (C-20) - follow the repo; propose alignment via ADR.

_Source of truth: `OPS-01`, `PKG-01`, `CFG-07`, `OBS-04`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Start from the template; build and run locally with a dummy token; verify image has no `.npmrc` and runs as non-root.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Runtime stage (reference)**

```dockerfile
FROM node:22-alpine AS production
RUN apk add --no-cache dumb-init && addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3001
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

## Error and failure handling
- Build fails if `AuthToken` missing (401) - fix pipeline variable.
- A failed stage stops the pipeline; no image is pushed unless tests and scans pass (OPS-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- No secrets in layers; non-root; minimal base; Trivy scan gates push.
- Documentation and pipelines never contain secrets; registry tokens come from `AuthToken`/variable groups and are removed from image layers.

## Testing guidelines
- `docker run` with env; health probe passes; `docker history` has no token.
- Validate pipelines and Dockerfiles in CI (build, scan, test stages gate the push).

## Anti-patterns
- Single-stage with dev deps.
- `latest` base tags.

## Implementation checklist
- [ ] Multi-stage; token removed; non-root; HEALTHCHECK; dumb-init.

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
- stage `builder` (`node:22-alpine`): `COPY package*.json .npmrc*`, `ARG AuthToken`/`ENV AuthToken`, `npm ci`, `rm -f .npmrc`, copy `tsconfig.json` + `src`, `npm run build`, `npm prune --omit=dev && npm cache clean --force`; stage `production`: `apk add dumb-init`, non-root user (`addgroup -g 1001 nodejs`, `adduser -S nodejs -u 1001`), `ENV NODE_ENV=production`, copy only `package*.json`, `node_modules`, `dist` (+ needed `docs`), `chown`, `USER nodejs`, `EXPOSE <PORT>`, `HEALTHCHECK`, `ENTRYPOINT ["dumb-init","--"]`, `CMD ["node","dist/index.js"]`.
- A `.dockerignore` excludes `.env*`, `.git`, `node_modules`, tests, docs not needed.
- MUST NOT: copying the whole build tree into the runtime stage, running as root, leaving `.npmrc`/tokens in layers, `CMD ["npm","run","start"]` (breaks signal delivery), unpinned/mismatched Node versions across services.

## Related skills
- `internal-package-management` — Internal Package Management
- `ci-cd-pipeline` — CI/CD Pipeline
- `liveness-readiness-checks` — Liveness & Readiness Checks
- `graceful-shutdown` — Graceful Shutdown
- `pipeline-security-scanning` — Pipeline Security Scanning
