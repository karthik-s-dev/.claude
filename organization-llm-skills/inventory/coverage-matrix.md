# Coverage Matrix

## A. Predefined skills (task §7) — expected vs generated

| Cat | Title | Expected | Generated | Missing |
|---|---|---|---|---|
| 10 | Security & Identity Management | 14 | 14 | 0 |
| 11 | Resilience & Reliability | 12 | 12 | 0 |
| 12 | LLM & AI Integration | 12 | 12 | 0 |
| 13 | Testing & Quality Engineering | 13 | 13 | 0 |
| 14 | Code Review & Engineering Governance | 12 | 12 | 0 |
| 15 | Documentation & DevOps | 14 | 14 | 0 |
| 01 | Microservice Architecture & Foundations | 10 | 10 | 0 |
| 02 | API Development & Design | 18 | 18 | 0 |
| 03 | Request Context & Idempotency | 6 | 6 | 0 |
| 04 | Error & Exception Management | 9 | 9 | 0 |
| 05 | Configuration & Environment Management | 9 | 9 | 0 |
| 06 | Observability & Health Management | 11 | 11 | 0 |
| 07 | Database & Caching Management | 11 | 11 | 0 |
| 08 | Messaging & Event-Driven Architecture | 15 | 15 | 0 |
| 09 | Cloud Storage & External Integrations | 10 | 10 | 0 |
| | **Total** | **176** | **176** | **0** |

## B. Engineering areas × evidence

| Area (task §3 Objective 1) | Standard IDs | Evidence | Primary skills |
|---|---|---|---|
| Architectural conventions / structure | ARCH-01,ARCH-02,ARCH-03,ARCH-05 | E1/E2 | microservice-architecture-standards, project-structure, layered-architecture |
| Coding standards / naming | ARCH-01,PKG-01 | E2/UNRESOLVED | coding-standards-review, project-structure |
| API design / request-response | API-01..API-10 | E1/E2 (shape conflicts C-06,C-09,C-14) | api-design-standards, api-response-structure, api-error-response |
| Error handling & catalog | ERR-01..ERR-09 | E1 | error-catalog-management, error-code-standards, global-exception-handling |
| Logging | OBS-01..OBS-03 | E1 | structured-logging, logger-initialization, sensitive-data-masking-in-logs |
| Configuration | CFG-01..CFG-07 | E1 | required-environment-variables, configuration-validation |
| Database & data fetching | DB-01..DB-07, INT-01, ERR-09 | E1/E2 | mongodb-client, external-api-client, caching-strategy |
| Caching | DB-05, RES-01 | E1 | caching-strategy, cache-invalidation |
| Messaging | MSG-01..MSG-07 | E2 (consumer side E0) | azure-service-bus-client, azure-queue-storage-client, outbox-pattern |
| Authentication & authorization | SEC-01..SEC-07 | E1 (RBAC E3) | jwt-validation, internal-api-key-authentication |
| External integrations | INT-01..INT-06 | E1/E2 (Blob E0) | external-api-client, third-party-service-integration |
| Resilience & retry | RES-01..RES-08 | E2/E3 (retry/breaker for HTTP E0) | timeout-management, circuit-breaker, retry-policy |
| Testing | TEST-01..TEST-05 | E1/E2 (perf/load E0) | unit-testing, in-memory-test-harness |
| Documentation | DOC-01 | E2 | readme-documentation, architecture-decision-records |
| Deployment & CI/CD | OPS-01..OPS-04 | E1/E2 (deploy stage, K8s E0) | docker-containerization, ci-cd-pipeline |
| Security | SEC-01..SEC-09 | E1/E2 | api-security, security-review |
| Code review practice | OPS-03 | E1 (PR validation) | code-review |
| LLM integration | LLM-01..LLM-03 | E0 (invocation) / E2 (cost, config) | token-management, model-configuration, llm-api-call |

## C. Standards with no governing skill

None.

## D. Standards with no evidence-register entry

None.
