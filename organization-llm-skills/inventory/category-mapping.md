# Category Mapping

_Generated._ Maps categories to skills, skills to governing standards, and standards to skills.

## Categories

| Cat | Title | Folder | Skills | Predefined | Additional | GENERIC (E0) |
|---|---|---|---|---|---|---|
| 10 | Security & Identity Management | `categories/10-security-identity/` | 18 | 14 | 4 | 2 |
| 11 | Resilience & Reliability | `categories/11-resilience-reliability/` | 15 | 12 | 3 | 1 |
| 12 | LLM & AI Integration | `categories/12-llm-ai-integration/` | 13 | 12 | 1 | 9 |
| 13 | Testing & Quality Engineering | `categories/13-testing-quality/` | 15 | 13 | 2 | 2 |
| 14 | Code Review & Engineering Governance | `categories/14-code-review-governance/` | 12 | 12 | 0 | 0 |
| 15 | Documentation & DevOps | `categories/15-documentation-devops/` | 15 | 14 | 1 | 3 |
| 01 | Microservice Architecture & Foundations | `categories/01-microservice-architecture-foundations/` | 11 | 10 | 1 | 0 |
| 02 | API Development & Design | `categories/02-api-development-design/` | 19 | 18 | 1 | 0 |
| 03 | Request Context & Idempotency | `categories/03-request-context-idempotency/` | 7 | 6 | 1 | 0 |
| 04 | Error & Exception Management | `categories/04-error-exception-management/` | 9 | 9 | 0 | 0 |
| 05 | Configuration & Environment Management | `categories/05-configuration-environment/` | 10 | 9 | 1 | 0 |
| 06 | Observability & Health Management | `categories/06-observability-health/` | 12 | 11 | 1 | 2 |
| 07 | Database & Caching Management | `categories/07-database-caching/` | 11 | 11 | 0 | 1 |
| 08 | Messaging & Event-Driven Architecture | `categories/08-messaging-event-driven/` | 18 | 15 | 3 | 4 |
| 09 | Cloud Storage & External Integrations | `categories/09-cloud-storage-integrations/` | 10 | 10 | 0 | 3 |

## Skill → governing standards

| Skill | Standards |
|---|---|
| `microservice-architecture-standards` | `ARCH-01`, `ARCH-02`, `ARCH-03`, `ARCH-05`, `ARCH-07`, `PKG-01` |
| `project-structure` | `ARCH-01`, `ARCH-02` |
| `clean-architecture` | `ARCH-02`, `ARCH-04` |
| `layered-architecture` | `ARCH-02`, `ARCH-05`, `ERR-08` |
| `solid-principles` | `ARCH-02`, `ARCH-04`, `ARCH-06` |
| `dependency-injection` | `ARCH-04` |
| `service-registration-lifecycle` | `ARCH-03`, `RES-04`, `CFG-02`, `OBS-01` |
| `middleware-request-pipeline` | `ARCH-05`, `CTX-01`, `SEC-05`, `API-09`, `ERR-06`, `MSG-05` |
| `service-boundary-responsibility` | `ARCH-07`, `CTX-02`, `SEC-03`, `SEC-02` |
| `design-patterns` | `ARCH-06`, `MSG-03`, `DB-05` |
| `internal-package-management` | `PKG-01` |
| `api-design-standards` | `API-01`, `API-02`, `API-03`, `API-04`, `API-10` |
| `api-request-structure` | `API-04`, `API-05`, `CTX-01`, `CTX-03` |
| `api-response-structure` | `API-02`, `API-03`, `API-06`, `CTX-01` |
| `api-error-response` | `API-03`, `ERR-01`, `ERR-02`, `ERR-05`, `ERR-06`, `ERR-07`, `API-10` |
| `http-status-codes` | `API-10`, `ERR-02` |
| `request-validation` | `API-05`, `ERR-02` |
| `request-dto-mapping` | `ARCH-02`, `API-05` |
| `response-dto-mapping` | `API-02`, `ARCH-02`, `OBS-03` |
| `request-header-management` | `API-04`, `CTX-01`, `CTX-02`, `CTX-03`, `SEC-03`, `SEC-05` |
| `query-parameter-management` | `API-05`, `API-06` |
| `api-pagination` | `API-06` |
| `api-filtering-sorting` | `API-06`, `API-05` |
| `response-serialization` | `API-02`, `OBS-03` |
| `swagger-openapi` | `API-07` |
| `api-versioning` | `API-08`, `API-01` |
| `api-contract-testing` | `TEST-03`, `API-02`, `API-03`, `API-07` |
| `api-compatibility-review` | `API-08`, `API-02`, `API-03`, `ERR-03` |
| `api-rate-limiting` | `API-09`, `API-03`, `API-10` |
| `deprecation-sunset-management` | `API-08`, `API-04`, `API-10` |
| `correlation-id-management` | `CTX-01`, `CTX-02`, `API-04`, `OBS-01` |
| `request-context-propagation` | `CTX-01`, `CTX-02`, `OBS-02` |
| `idempotency-management` | `CTX-03`, `CTX-04`, `API-10`, `RES-02` |
| `request-deduplication` | `CTX-03`, `CTX-04`, `MSG-05` |
| `distributed-request-tracking` | `CTX-01`, `CTX-05`, `OBS-05`, `CTX-02` |
| `trace-context-propagation` | `CTX-05`, `OBS-05` |
| `usage-event-identity` | `CTX-04`, `MSG-01`, `MSG-04` |
| `error-catalog-management` | `ERR-01`, `ERR-02`, `ERR-03`, `ERR-04`, `ERR-05`, `ERR-09`, `PKG-01` |
| `error-code-standards` | `ERR-03`, `ERR-04` |
| `exception-handling` | `ERR-01`, `ERR-02`, `ERR-05`, `ERR-08` |
| `global-exception-handling` | `ERR-05`, `ERR-06`, `ERR-07`, `API-03`, `ARCH-05` |
| `exception-to-error-mapping` | `ERR-05`, `ERR-09`, `ERR-02` |
| `business-exception-handling` | `ERR-02`, `API-10` |
| `technical-exception-handling` | `ERR-09`, `RES-01`, `INT-02`, `ERR-05` |
| `error-logging` | `OBS-01`, `OBS-02`, `OBS-03`, `ERR-06`, `ERR-07` |
| `error-propagation` | `ERR-07`, `ERR-08`, `ERR-09`, `CTX-01`, `INT-01` |
| `required-environment-variables` | `CFG-01`, `CFG-02`, `CFG-04`, `CFG-07` |
| `optional-environment-variables` | `CFG-05`, `CFG-06`, `CFG-01` |
| `configuration-management` | `CFG-01`, `CFG-02`, `CFG-03`, `CFG-05`, `CFG-06`, `CFG-07` |
| `configuration-validation` | `CFG-02`, `CFG-04`, `CFG-05` |
| `configuration-defaults` | `CFG-05`, `CFG-03` |
| `configuration-precedence` | `CFG-01`, `CFG-03`, `CFG-05` |
| `environment-specific-configuration` | `CFG-03`, `CFG-04`, `CFG-06` |
| `feature-flag-management` | `CFG-06`, `CFG-05`, `API-08` |
| `configuration-security` | `CFG-04`, `CFG-07`, `SEC-06`, `OBS-03` |
| `startup-dependency-validation` | `CFG-02`, `ARCH-03`, `OBS-04` |
| `structured-logging` | `OBS-01`, `OBS-02`, `OBS-03`, `CTX-01`, `ERR-06`, `PKG-01` |
| `logger-initialization` | `OBS-01`, `ARCH-03`, `CFG-05`, `ERR-03` |
| `log-level-standards` | `OBS-01`, `OBS-02` |
| `health-endpoint-implementation` | `OBS-04`, `ARCH-05`, `API-10` |
| `liveness-readiness-checks` | `OBS-04`, `ARCH-03`, `RES-05` |
| `distributed-tracing` | `CTX-05`, `OBS-05`, `CTX-01` |
| `opentelemetry-integration` | `CTX-05`, `OBS-05`, `PKG-01` |
| `metrics-collection` | `OBS-06` |
| `application-monitoring` | `OBS-02`, `OBS-05`, `OBS-04`, `API-08` |
| `alerting-standards` | `OBS-06` |
| `sensitive-data-masking-in-logs` | `OBS-03`, `OBS-01`, `SEC-06` |
| `audit-logging` | `OBS-07`, `OBS-03`, `DB-04` |
| `mongodb-client` | `DB-01`, `DB-03`, `CFG-01`, `OBS-03`, `ERR-09` |
| `redis-client` | `DB-02`, `RES-01`, `CFG-01`, `CFG-05`, `DB-06` |
| `database-repository-pattern` | `DB-03`, `ARCH-02`, `DB-04`, `ARCH-04` |
| `database-connection-management` | `DB-01`, `DB-02`, `ARCH-03`, `ARCH-04`, `RES-05` |
| `database-transaction-management` | `DB-07`, `MSG-03` |
| `database-indexing` | `DB-04`, `DB-03` |
| `database-migration` | `DB-07`, `CFG-06`, `API-08` |
| `query-optimization` | `DB-04`, `DB-05`, `API-06` |
| `caching-strategy` | `DB-05`, `DB-02`, `RES-01`, `ERR-09` |
| `cache-invalidation` | `DB-05`, `ARCH-07`, `MSG-05`, `CTX-02` |
| `distributed-locking` | `DB-06`, `RES-01`, `ERR-02` |
| `azure-queue-storage-client` | `MSG-02`, `INT-06`, `CFG-01`, `ERR-09` |
| `azure-service-bus-client` | `MSG-01`, `CTX-04`, `MSG-03`, `INT-06`, `CFG-01` |
| `message-producer` | `MSG-01`, `MSG-02`, `MSG-03`, `MSG-04`, `CTX-04`, `CTX-01` |
| `message-consumer` | `MSG-02`, `MSG-07`, `MSG-06`, `CTX-01` |
| `event-publishing` | `MSG-01`, `MSG-03`, `MSG-04`, `CTX-04` |
| `event-consumption` | `MSG-06`, `MSG-07` |
| `message-structure-contracts` | `MSG-04`, `CTX-04`, `CTX-01` |
| `message-versioning` | `MSG-04`, `API-08` |
| `message-retry-strategy` | `MSG-03`, `RES-03`, `CFG-05` |
| `dead-letter-queue-handling` | `MSG-03`, `MSG-06` |
| `message-deduplication` | `CTX-04`, `MSG-01`, `MSG-06` |
| `message-idempotency` | `CTX-03`, `CTX-04`, `MSG-06` |
| `outbox-pattern` | `MSG-03`, `DB-04`, `CFG-06`, `RES-03` |
| `inbox-pattern` | `MSG-06` |
| `event-driven-architecture` | `ARCH-07`, `MSG-01`, `MSG-03`, `MSG-05`, `CTX-04` |
| `webhook-delivery` | `MSG-05`, `INT-03`, `SEC-04`, `RES-02`, `RES-06` |
| `background-worker-processing` | `MSG-07`, `ARCH-03`, `CFG-06`, `RES-03` |
| `scheduled-job-reconciliation` | `DB-06`, `MSG-07`, `CFG-05` |
| `azure-blob-storage-client` | `INT-05`, `INT-06`, `SEC-02`, `CFG-01` |
| `azure-sdk-client-management` | `INT-06`, `ARCH-04`, `CFG-01`, `ARCH-03` |
| `azure-service-connection-management` | `INT-06`, `CFG-07`, `SEC-02`, `CFG-02` |
| `external-api-client` | `INT-01`, `INT-02`, `CTX-02`, `ERR-09`, `RES-02`, `SEC-02`, `OBS-02` |
| `http-client-management` | `INT-01`, `CFG-05`, `ARCH-04` |
| `third-party-service-integration` | `INT-04`, `INT-03`, `MSG-05`, `CFG-06`, `CFG-01` |
| `file-upload-download` | `INT-05`, `SEC-06`, `API-05` |
| `file-streaming` | `INT-05`, `RES-02` |
| `external-dependency-configuration` | `CFG-01`, `CFG-02`, `CFG-05`, `INT-01`, `RES-02` |
| `integration-error-handling` | `ERR-09`, `INT-01`, `INT-02`, `ERR-05`, `API-10` |
| `machine-authentication` | `SEC-01`, `SEC-02`, `SEC-03`, `PKG-01` |
| `service-to-service-authentication` | `SEC-02`, `SEC-03`, `CTX-02`, `INT-01`, `CFG-04` |
| `oauth-2-0` | `SEC-01`, `SEC-02`, `PKG-01` |
| `client-credentials-flow` | `SEC-02`, `CFG-07`, `INT-01` |
| `azure-managed-identity` | `SEC-02`, `CFG-07`, `INT-06` |
| `jwt-validation` | `SEC-01`, `ERR-02`, `API-10` |
| `authentication` | `SEC-01`, `SEC-03`, `ARCH-05`, `CFG-04`, `API-03` |
| `authorization` | `SEC-01`, `SEC-07`, `API-10` |
| `role-based-access-control` | `SEC-07`, `SEC-01` |
| `secrets-management` | `CFG-07`, `CFG-04`, `SEC-06`, `OBS-03` |
| `certificate-management` | `SEC-08` |
| `mutual-tls` | `SEC-08`, `SEC-03` |
| `data-protection` | `SEC-06`, `OBS-03`, `DB-02`, `OBS-07` |
| `api-security` | `SEC-01`, `SEC-03`, `SEC-05`, `SEC-09`, `API-09`, `ERR-07` |
| `internal-api-key-authentication` | `SEC-03`, `CFG-04`, `CTX-02`, `ERR-02` |
| `webhook-signature-verification` | `MSG-05`, `SEC-04`, `ARCH-05`, `CFG-04` |
| `ssrf-protection` | `INT-03`, `SEC-09`, `API-05`, `CFG-04` |
| `cors-policy` | `SEC-05`, `API-04`, `ERR-06` |
| `retry-policy` | `RES-03`, `INT-01`, `MSG-03` |
| `exponential-backoff` | `RES-03`, `MSG-03` |
| `timeout-management` | `RES-02`, `CFG-05`, `ERR-02`, `API-10` |
| `circuit-breaker` | `RES-01`, `RES-02`, `INT-02` |
| `bulkhead-pattern` | `RES-06`, `RES-07` |
| `fallback-mechanism` | `RES-01`, `INT-02`, `DB-05`, `ERR-09` |
| `graceful-degradation` | `RES-01`, `RES-07`, `INT-02`, `OBS-04` |
| `fault-isolation` | `RES-07`, `MSG-07` |
| `rate-limiting` | `RES-08`, `API-09` |
| `dependency-failure-handling` | `INT-02`, `ERR-09`, `RES-01`, `RES-02`, `OBS-04` |
| `graceful-shutdown` | `ARCH-03`, `RES-04`, `MSG-07`, `OBS-01` |
| `resilient-http-communication` | `INT-01`, `RES-02`, `RES-03`, `RES-01`, `ERR-09` |
| `bounded-concurrency` | `RES-06`, `CFG-05` |
| `fail-open-fail-closed-policy` | `INT-02`, `CFG-03`, `CFG-04`, `ERR-09`, `CTX-03` |
| `fatal-error-process-policy` | `RES-04`, `OBS-01`, `ARCH-03` |
| `llm-api-call` | `LLM-01`, `INT-01`, `RES-02`, `ERR-09`, `SEC-02` |
| `llm-client-management` | `LLM-01`, `LLM-02`, `INT-06`, `ARCH-04`, `CFG-01` |
| `prompt-management` | `LLM-01`, `DOC-01` |
| `prompt-versioning` | `LLM-01`, `API-08` |
| `token-management` | `LLM-03`, `CTX-04`, `MSG-04` |
| `token-cost-optimization` | `LLM-03`, `DB-05`, `ARCH-06` |
| `structured-llm-output` | `LLM-01`, `API-05` |
| `llm-response-validation` | `LLM-01`, `API-05`, `ERR-02` |
| `llm-retry-timeout` | `RES-02`, `RES-03`, `INT-01`, `LLM-01` |
| `ai-guardrails` | `LLM-01`, `SEC-06`, `OBS-03` |
| `model-configuration` | `LLM-02`, `OBS-03`, `DB-05`, `SEC-06` |
| `llm-error-handling` | `ERR-02`, `ERR-09`, `LLM-01`, `API-10` |
| `cost-calculation-strategy-registry` | `ARCH-06`, `LLM-03`, `DB-05` |
| `unit-testing` | `TEST-01`, `TEST-02`, `TEST-04` |
| `integration-testing` | `TEST-01`, `TEST-02`, `DB-01` |
| `end-to-end-testing` | `TEST-01`, `TEST-03`, `TEST-04` |
| `api-testing` | `TEST-03`, `API-02`, `API-03` |
| `contract-testing` | `TEST-03`, `MSG-04`, `API-07` |
| `database-testing` | `TEST-02`, `DB-03`, `DB-04` |
| `message-processing-testing` | `TEST-02`, `MSG-01`, `MSG-02`, `MSG-03` |
| `mocking-test-doubles` | `TEST-02`, `ARCH-04`, `OBS-01` |
| `test-data-management` | `TEST-01`, `TEST-03`, `SEC-06` |
| `performance-testing` | `TEST-05`, `RES-02` |
| `load-testing` | `TEST-05`, `API-09` |
| `security-testing` | `SEC-01`, `SEC-03`, `OPS-02`, `INT-03` |
| `test-coverage-standards` | `TEST-01`, `TEST-04` |
| `in-memory-test-harness` | `TEST-02`, `ARCH-04` |
| `postman-functional-testing` | `TEST-03`, `API-07` |
| `code-review` | `OPS-03`, `PKG-01`, `ERR-02`, `OBS-01`, `SEC-01` |
| `architecture-review` | `ARCH-01`, `ARCH-02`, `ARCH-03`, `ARCH-05`, `ARCH-07`, `MSG-03` |
| `security-review` | `SEC-01`, `SEC-03`, `SEC-04`, `SEC-05`, `SEC-06`, `SEC-09`, `CFG-04` |
| `performance-review` | `DB-04`, `DB-05`, `RES-02`, `RES-06`, `API-06` |
| `production-readiness-review` | `OBS-04`, `CFG-02`, `CFG-04`, `OPS-02`, `RES-05`, `OBS-06` |
| `clean-code-review` | `ARCH-02`, `ERR-08`, `OBS-02` |
| `refactoring` | `ARCH-02`, `API-08`, `TEST-01` |
| `solid-compliance-review` | `ARCH-02`, `ARCH-04`, `ARCH-06` |
| `coding-standards-review` | `ARCH-01`, `PKG-01`, `OBS-01`, `ERR-02`, `CFG-02` |
| `technical-debt-assessment` | `ARCH-01`, `ERR-03`, `CFG-02`, `OPS-01`, `TEST-01` |
| `dependency-review` | `PKG-01`, `OPS-02`, `CFG-07` |
| `breaking-change-review` | `API-08`, `ERR-03`, `MSG-04`, `DB-07` |
| `readme-documentation` | `DOC-01`, `CFG-01`, `OPS-01` |
| `technical-documentation` | `DOC-01`, `API-07` |
| `architecture-documentation` | `DOC-01`, `ARCH-01`, `ARCH-07` |
| `architecture-decision-records` | `DOC-01`, `ARCH-01` |
| `api-documentation` | `API-07`, `TEST-03`, `DOC-01` |
| `deployment-documentation` | `OPS-01`, `OPS-02`, `OPS-04`, `DOC-01` |
| `operational-runbooks` | `OPS-04`, `OBS-06` |
| `developer-onboarding-documentation` | `DOC-01`, `PKG-01`, `CFG-01` |
| `docker-containerization` | `OPS-01`, `PKG-01`, `CFG-07`, `OBS-04` |
| `kubernetes-deployment` | `OPS-04`, `OBS-04` |
| `ci-cd-pipeline` | `OPS-02`, `OPS-03`, `TEST-04`, `PKG-01` |
| `deployment-release-management` | `OPS-02`, `API-08`, `CFG-06` |
| `rollback-strategy` | `OPS-04`, `OPS-02`, `CFG-06` |
| `environment-deployment-standards` | `CFG-03`, `OPS-02`, `CFG-04`, `OPS-01` |
| `pipeline-security-scanning` | `OPS-02`, `SEC-06`, `PKG-01` |

## Standard → skills

| Standard | Skills |
|---|---|
| `API-01` | `api-design-standards`, `api-versioning` |
| `API-02` | `api-design-standards`, `api-response-structure`, `response-dto-mapping`, `response-serialization`, `api-contract-testing`, `api-compatibility-review`, `api-testing` |
| `API-03` | `api-design-standards`, `api-response-structure`, `api-error-response`, `api-contract-testing`, `api-compatibility-review`, `api-rate-limiting`, `global-exception-handling`, `authentication`, `api-testing` |
| `API-04` | `api-design-standards`, `api-request-structure`, `request-header-management`, `deprecation-sunset-management`, `correlation-id-management`, `cors-policy` |
| `API-05` | `api-request-structure`, `request-validation`, `request-dto-mapping`, `query-parameter-management`, `api-filtering-sorting`, `file-upload-download`, `ssrf-protection`, `structured-llm-output`, `llm-response-validation` |
| `API-06` | `api-response-structure`, `query-parameter-management`, `api-pagination`, `api-filtering-sorting`, `query-optimization`, `performance-review` |
| `API-07` | `swagger-openapi`, `api-contract-testing`, `contract-testing`, `postman-functional-testing`, `technical-documentation`, `api-documentation` |
| `API-08` | `api-versioning`, `api-compatibility-review`, `deprecation-sunset-management`, `feature-flag-management`, `application-monitoring`, `database-migration`, `message-versioning`, `prompt-versioning`, `refactoring`, `breaking-change-review`, `deployment-release-management` |
| `API-09` | `middleware-request-pipeline`, `api-rate-limiting`, `api-security`, `rate-limiting`, `load-testing` |
| `API-10` | `api-design-standards`, `api-error-response`, `http-status-codes`, `api-rate-limiting`, `deprecation-sunset-management`, `idempotency-management`, `business-exception-handling`, `health-endpoint-implementation`, `integration-error-handling`, `jwt-validation`, `authorization`, `timeout-management`, `llm-error-handling` |
| `ARCH-01` | `microservice-architecture-standards`, `project-structure`, `architecture-review`, `coding-standards-review`, `technical-debt-assessment`, `architecture-documentation`, `architecture-decision-records` |
| `ARCH-02` | `microservice-architecture-standards`, `project-structure`, `clean-architecture`, `layered-architecture`, `solid-principles`, `request-dto-mapping`, `response-dto-mapping`, `database-repository-pattern`, `architecture-review`, `clean-code-review`, `refactoring`, `solid-compliance-review` |
| `ARCH-03` | `microservice-architecture-standards`, `service-registration-lifecycle`, `startup-dependency-validation`, `logger-initialization`, `liveness-readiness-checks`, `database-connection-management`, `background-worker-processing`, `azure-sdk-client-management`, `graceful-shutdown`, `fatal-error-process-policy`, `architecture-review` |
| `ARCH-04` | `clean-architecture`, `solid-principles`, `dependency-injection`, `database-repository-pattern`, `database-connection-management`, `azure-sdk-client-management`, `http-client-management`, `llm-client-management`, `mocking-test-doubles`, `in-memory-test-harness`, `solid-compliance-review` |
| `ARCH-05` | `microservice-architecture-standards`, `layered-architecture`, `middleware-request-pipeline`, `global-exception-handling`, `health-endpoint-implementation`, `authentication`, `webhook-signature-verification`, `architecture-review` |
| `ARCH-06` | `solid-principles`, `design-patterns`, `token-cost-optimization`, `cost-calculation-strategy-registry`, `solid-compliance-review` |
| `ARCH-07` | `microservice-architecture-standards`, `service-boundary-responsibility`, `cache-invalidation`, `event-driven-architecture`, `architecture-review`, `architecture-documentation` |
| `CFG-01` | `required-environment-variables`, `optional-environment-variables`, `configuration-management`, `configuration-precedence`, `mongodb-client`, `redis-client`, `azure-queue-storage-client`, `azure-service-bus-client`, `azure-blob-storage-client`, `azure-sdk-client-management`, `third-party-service-integration`, `external-dependency-configuration`, `llm-client-management`, `readme-documentation`, `developer-onboarding-documentation` |
| `CFG-02` | `service-registration-lifecycle`, `required-environment-variables`, `configuration-management`, `configuration-validation`, `startup-dependency-validation`, `azure-service-connection-management`, `external-dependency-configuration`, `production-readiness-review`, `coding-standards-review`, `technical-debt-assessment` |
| `CFG-03` | `configuration-management`, `configuration-defaults`, `configuration-precedence`, `environment-specific-configuration`, `fail-open-fail-closed-policy`, `environment-deployment-standards` |
| `CFG-04` | `required-environment-variables`, `configuration-validation`, `environment-specific-configuration`, `configuration-security`, `service-to-service-authentication`, `authentication`, `secrets-management`, `internal-api-key-authentication`, `webhook-signature-verification`, `ssrf-protection`, `fail-open-fail-closed-policy`, `security-review`, `production-readiness-review`, `environment-deployment-standards` |
| `CFG-05` | `optional-environment-variables`, `configuration-management`, `configuration-validation`, `configuration-defaults`, `configuration-precedence`, `feature-flag-management`, `logger-initialization`, `redis-client`, `message-retry-strategy`, `scheduled-job-reconciliation`, `http-client-management`, `external-dependency-configuration`, `timeout-management`, `bounded-concurrency` |
| `CFG-06` | `optional-environment-variables`, `configuration-management`, `environment-specific-configuration`, `feature-flag-management`, `database-migration`, `outbox-pattern`, `background-worker-processing`, `third-party-service-integration`, `deployment-release-management`, `rollback-strategy` |
| `CFG-07` | `required-environment-variables`, `configuration-management`, `configuration-security`, `azure-service-connection-management`, `client-credentials-flow`, `azure-managed-identity`, `secrets-management`, `dependency-review`, `docker-containerization` |
| `CTX-01` | `middleware-request-pipeline`, `api-request-structure`, `api-response-structure`, `request-header-management`, `correlation-id-management`, `request-context-propagation`, `distributed-request-tracking`, `error-propagation`, `structured-logging`, `distributed-tracing`, `message-producer`, `message-consumer`, `message-structure-contracts` |
| `CTX-02` | `service-boundary-responsibility`, `request-header-management`, `correlation-id-management`, `request-context-propagation`, `distributed-request-tracking`, `cache-invalidation`, `external-api-client`, `service-to-service-authentication`, `internal-api-key-authentication` |
| `CTX-03` | `api-request-structure`, `request-header-management`, `idempotency-management`, `request-deduplication`, `message-idempotency`, `fail-open-fail-closed-policy` |
| `CTX-04` | `idempotency-management`, `request-deduplication`, `usage-event-identity`, `azure-service-bus-client`, `message-producer`, `event-publishing`, `message-structure-contracts`, `message-deduplication`, `message-idempotency`, `event-driven-architecture`, `token-management` |
| `CTX-05` | `distributed-request-tracking`, `trace-context-propagation`, `distributed-tracing`, `opentelemetry-integration` |
| `DB-01` | `mongodb-client`, `database-connection-management`, `integration-testing` |
| `DB-02` | `redis-client`, `database-connection-management`, `caching-strategy`, `data-protection` |
| `DB-03` | `mongodb-client`, `database-repository-pattern`, `database-indexing`, `database-testing` |
| `DB-04` | `audit-logging`, `database-repository-pattern`, `database-indexing`, `query-optimization`, `outbox-pattern`, `database-testing`, `performance-review` |
| `DB-05` | `design-patterns`, `query-optimization`, `caching-strategy`, `cache-invalidation`, `fallback-mechanism`, `token-cost-optimization`, `model-configuration`, `cost-calculation-strategy-registry`, `performance-review` |
| `DB-06` | `redis-client`, `distributed-locking`, `scheduled-job-reconciliation` |
| `DB-07` | `database-transaction-management`, `database-migration`, `breaking-change-review` |
| `DOC-01` | `prompt-management`, `readme-documentation`, `technical-documentation`, `architecture-documentation`, `architecture-decision-records`, `api-documentation`, `deployment-documentation`, `developer-onboarding-documentation` |
| `ERR-01` | `api-error-response`, `error-catalog-management`, `exception-handling` |
| `ERR-02` | `api-error-response`, `http-status-codes`, `request-validation`, `error-catalog-management`, `exception-handling`, `exception-to-error-mapping`, `business-exception-handling`, `distributed-locking`, `jwt-validation`, `internal-api-key-authentication`, `timeout-management`, `llm-response-validation`, `llm-error-handling`, `code-review`, `coding-standards-review` |
| `ERR-03` | `api-compatibility-review`, `error-catalog-management`, `error-code-standards`, `logger-initialization`, `technical-debt-assessment`, `breaking-change-review` |
| `ERR-04` | `error-catalog-management`, `error-code-standards` |
| `ERR-05` | `api-error-response`, `error-catalog-management`, `exception-handling`, `global-exception-handling`, `exception-to-error-mapping`, `technical-exception-handling`, `integration-error-handling` |
| `ERR-06` | `middleware-request-pipeline`, `api-error-response`, `global-exception-handling`, `error-logging`, `structured-logging`, `cors-policy` |
| `ERR-07` | `api-error-response`, `global-exception-handling`, `error-logging`, `error-propagation`, `api-security` |
| `ERR-08` | `layered-architecture`, `exception-handling`, `error-propagation`, `clean-code-review` |
| `ERR-09` | `error-catalog-management`, `exception-to-error-mapping`, `technical-exception-handling`, `error-propagation`, `mongodb-client`, `caching-strategy`, `azure-queue-storage-client`, `external-api-client`, `integration-error-handling`, `fallback-mechanism`, `dependency-failure-handling`, `resilient-http-communication`, `fail-open-fail-closed-policy`, `llm-api-call`, `llm-error-handling` |
| `INT-01` | `error-propagation`, `external-api-client`, `http-client-management`, `external-dependency-configuration`, `integration-error-handling`, `service-to-service-authentication`, `client-credentials-flow`, `retry-policy`, `resilient-http-communication`, `llm-api-call`, `llm-retry-timeout` |
| `INT-02` | `technical-exception-handling`, `external-api-client`, `integration-error-handling`, `circuit-breaker`, `fallback-mechanism`, `graceful-degradation`, `dependency-failure-handling`, `fail-open-fail-closed-policy` |
| `INT-03` | `webhook-delivery`, `third-party-service-integration`, `ssrf-protection`, `security-testing` |
| `INT-04` | `third-party-service-integration` |
| `INT-05` | `azure-blob-storage-client`, `file-upload-download`, `file-streaming` |
| `INT-06` | `azure-queue-storage-client`, `azure-service-bus-client`, `azure-blob-storage-client`, `azure-sdk-client-management`, `azure-service-connection-management`, `azure-managed-identity`, `llm-client-management` |
| `LLM-01` | `llm-api-call`, `llm-client-management`, `prompt-management`, `prompt-versioning`, `structured-llm-output`, `llm-response-validation`, `llm-retry-timeout`, `ai-guardrails`, `llm-error-handling` |
| `LLM-02` | `llm-client-management`, `model-configuration` |
| `LLM-03` | `token-management`, `token-cost-optimization`, `cost-calculation-strategy-registry` |
| `MSG-01` | `usage-event-identity`, `azure-service-bus-client`, `message-producer`, `event-publishing`, `message-deduplication`, `event-driven-architecture`, `message-processing-testing` |
| `MSG-02` | `azure-queue-storage-client`, `message-producer`, `message-consumer`, `message-processing-testing` |
| `MSG-03` | `design-patterns`, `database-transaction-management`, `azure-service-bus-client`, `message-producer`, `event-publishing`, `message-retry-strategy`, `dead-letter-queue-handling`, `outbox-pattern`, `event-driven-architecture`, `retry-policy`, `exponential-backoff`, `message-processing-testing`, `architecture-review` |
| `MSG-04` | `usage-event-identity`, `message-producer`, `event-publishing`, `message-structure-contracts`, `message-versioning`, `token-management`, `contract-testing`, `breaking-change-review` |
| `MSG-05` | `middleware-request-pipeline`, `request-deduplication`, `cache-invalidation`, `event-driven-architecture`, `webhook-delivery`, `third-party-service-integration`, `webhook-signature-verification` |
| `MSG-06` | `message-consumer`, `event-consumption`, `dead-letter-queue-handling`, `message-deduplication`, `message-idempotency`, `inbox-pattern` |
| `MSG-07` | `message-consumer`, `event-consumption`, `background-worker-processing`, `scheduled-job-reconciliation`, `fault-isolation`, `graceful-shutdown` |
| `OBS-01` | `service-registration-lifecycle`, `correlation-id-management`, `error-logging`, `structured-logging`, `logger-initialization`, `log-level-standards`, `sensitive-data-masking-in-logs`, `graceful-shutdown`, `fatal-error-process-policy`, `mocking-test-doubles`, `code-review`, `coding-standards-review` |
| `OBS-02` | `request-context-propagation`, `error-logging`, `structured-logging`, `log-level-standards`, `application-monitoring`, `external-api-client`, `clean-code-review` |
| `OBS-03` | `response-dto-mapping`, `response-serialization`, `error-logging`, `configuration-security`, `structured-logging`, `sensitive-data-masking-in-logs`, `audit-logging`, `mongodb-client`, `secrets-management`, `data-protection`, `ai-guardrails`, `model-configuration` |
| `OBS-04` | `startup-dependency-validation`, `health-endpoint-implementation`, `liveness-readiness-checks`, `application-monitoring`, `graceful-degradation`, `dependency-failure-handling`, `production-readiness-review`, `docker-containerization`, `kubernetes-deployment` |
| `OBS-05` | `distributed-request-tracking`, `trace-context-propagation`, `distributed-tracing`, `opentelemetry-integration`, `application-monitoring` |
| `OBS-06` | `metrics-collection`, `alerting-standards`, `production-readiness-review`, `operational-runbooks` |
| `OBS-07` | `audit-logging`, `data-protection` |
| `OPS-01` | `technical-debt-assessment`, `readme-documentation`, `deployment-documentation`, `docker-containerization`, `environment-deployment-standards` |
| `OPS-02` | `security-testing`, `production-readiness-review`, `dependency-review`, `deployment-documentation`, `ci-cd-pipeline`, `deployment-release-management`, `rollback-strategy`, `environment-deployment-standards`, `pipeline-security-scanning` |
| `OPS-03` | `code-review`, `ci-cd-pipeline` |
| `OPS-04` | `deployment-documentation`, `operational-runbooks`, `kubernetes-deployment`, `rollback-strategy` |
| `PKG-01` | `microservice-architecture-standards`, `internal-package-management`, `error-catalog-management`, `structured-logging`, `opentelemetry-integration`, `machine-authentication`, `oauth-2-0`, `code-review`, `coding-standards-review`, `dependency-review`, `developer-onboarding-documentation`, `docker-containerization`, `ci-cd-pipeline`, `pipeline-security-scanning` |
| `RES-01` | `technical-exception-handling`, `redis-client`, `caching-strategy`, `distributed-locking`, `circuit-breaker`, `fallback-mechanism`, `graceful-degradation`, `dependency-failure-handling`, `resilient-http-communication` |
| `RES-02` | `idempotency-management`, `webhook-delivery`, `external-api-client`, `file-streaming`, `external-dependency-configuration`, `timeout-management`, `circuit-breaker`, `dependency-failure-handling`, `resilient-http-communication`, `llm-api-call`, `llm-retry-timeout`, `performance-testing`, `performance-review` |
| `RES-03` | `message-retry-strategy`, `outbox-pattern`, `background-worker-processing`, `retry-policy`, `exponential-backoff`, `resilient-http-communication`, `llm-retry-timeout` |
| `RES-04` | `service-registration-lifecycle`, `graceful-shutdown`, `fatal-error-process-policy` |
| `RES-05` | `liveness-readiness-checks`, `database-connection-management`, `production-readiness-review` |
| `RES-06` | `webhook-delivery`, `bulkhead-pattern`, `bounded-concurrency`, `performance-review` |
| `RES-07` | `bulkhead-pattern`, `graceful-degradation`, `fault-isolation` |
| `RES-08` | `rate-limiting` |
| `SEC-01` | `machine-authentication`, `oauth-2-0`, `jwt-validation`, `authentication`, `authorization`, `role-based-access-control`, `api-security`, `security-testing`, `code-review`, `security-review` |
| `SEC-02` | `service-boundary-responsibility`, `azure-blob-storage-client`, `azure-service-connection-management`, `external-api-client`, `machine-authentication`, `service-to-service-authentication`, `oauth-2-0`, `client-credentials-flow`, `azure-managed-identity`, `llm-api-call` |
| `SEC-03` | `service-boundary-responsibility`, `request-header-management`, `machine-authentication`, `service-to-service-authentication`, `authentication`, `mutual-tls`, `api-security`, `internal-api-key-authentication`, `security-testing`, `security-review` |
| `SEC-04` | `webhook-delivery`, `webhook-signature-verification`, `security-review` |
| `SEC-05` | `middleware-request-pipeline`, `request-header-management`, `api-security`, `cors-policy`, `security-review` |
| `SEC-06` | `configuration-security`, `sensitive-data-masking-in-logs`, `file-upload-download`, `secrets-management`, `data-protection`, `ai-guardrails`, `model-configuration`, `test-data-management`, `security-review`, `pipeline-security-scanning` |
| `SEC-07` | `authorization`, `role-based-access-control` |
| `SEC-08` | `certificate-management`, `mutual-tls` |
| `SEC-09` | `api-security`, `ssrf-protection`, `security-review` |
| `TEST-01` | `unit-testing`, `integration-testing`, `end-to-end-testing`, `test-data-management`, `test-coverage-standards`, `refactoring`, `technical-debt-assessment` |
| `TEST-02` | `unit-testing`, `integration-testing`, `database-testing`, `message-processing-testing`, `mocking-test-doubles`, `in-memory-test-harness` |
| `TEST-03` | `api-contract-testing`, `end-to-end-testing`, `api-testing`, `contract-testing`, `test-data-management`, `postman-functional-testing`, `api-documentation` |
| `TEST-04` | `unit-testing`, `end-to-end-testing`, `test-coverage-standards`, `ci-cd-pipeline` |
| `TEST-05` | `performance-testing`, `load-testing` |
