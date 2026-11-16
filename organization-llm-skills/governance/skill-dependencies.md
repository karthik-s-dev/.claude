# Skill Dependencies

_Generated._ Direct `Related skills` edges, canonical-ownership notes and an inbound-reference count.

## Canonical ownership (one skill defines; others link)

| Concern | Canonical skill | Linked from (examples) |
|---|---|---|
| Error catalog & codes | `error-catalog-management`, `error-code-standards` | api-error-response, llm-error-handling, business-exception-handling |
| Error response | `api-error-response` | http-status-codes, global-exception-handling |
| Correlation ID | `correlation-id-management` | structured-logging, request-header-management, distributed-request-tracking |
| Idempotency (request) | `idempotency-management` | request-deduplication, message-idempotency, fail-open-fail-closed-policy |
| Logging | `structured-logging` (+ `logger-initialization`) | error-logging, log-level-standards |
| Masking | `sensitive-data-masking-in-logs` | audit-logging, data-protection, configuration-security |
| API contract testing | `api-contract-testing` | contract-testing, swagger-openapi, postman-functional-testing |
| Rate limiting | `api-rate-limiting` (inbound HTTP) / `rate-limiting` (outbound/dependency) | each links the other |
| Outbound HTTP | `external-api-client` | http-client-management, resilient-http-communication, integration-error-handling |
| Fail-open/closed | `fail-open-fail-closed-policy` | dependency-failure-handling, idempotency-management |
| Shutdown | `graceful-shutdown` | service-registration-lifecycle |

## Edges

| Skill | Related skills | Inbound |
|---|---|---|
| `microservice-architecture-standards` | `project-structure`, `layered-architecture`, `service-registration-lifecycle`, `middleware-request-pipeline`, `service-boundary-responsibility`, `internal-package-management` | 4 |
| `project-structure` | `microservice-architecture-standards`, `layered-architecture`, `clean-architecture`, `service-registration-lifecycle` | 3 |
| `clean-architecture` | `layered-architecture`, `dependency-injection`, `solid-principles`, `design-patterns` | 6 |
| `layered-architecture` | `clean-architecture`, `project-structure`, `database-repository-pattern`, `external-api-client`, `request-dto-mapping` | 6 |
| `solid-principles` | `dependency-injection`, `design-patterns`, `clean-architecture`, `solid-compliance-review` | 4 |
| `dependency-injection` | `service-registration-lifecycle`, `mocking-test-doubles`, `clean-architecture`, `in-memory-test-harness` | 8 |
| `service-registration-lifecycle` | `graceful-shutdown`, `fatal-error-process-policy`, `startup-dependency-validation`, `logger-initialization`, `configuration-validation`, `background-worker-processing` | 9 |
| `middleware-request-pipeline` | `correlation-id-management`, `request-validation`, `authentication`, `global-exception-handling`, `api-rate-limiting`, `cors-policy`, `webhook-signature-verification` | 8 |
| `service-boundary-responsibility` | `microservice-architecture-standards`, `service-to-service-authentication`, `event-driven-architecture`, `external-api-client`, `architecture-review` | 5 |
| `design-patterns` | `solid-principles`, `cost-calculation-strategy-registry`, `outbox-pattern`, `caching-strategy`, `clean-architecture` | 4 |
| `internal-package-management` | `microservice-architecture-standards`, `docker-containerization`, `ci-cd-pipeline`, `dependency-review`, `structured-logging` | 7 |
| `api-design-standards` | `api-request-structure`, `api-response-structure`, `api-error-response`, `api-versioning`, `request-validation`, `swagger-openapi`, `http-status-codes` | 4 |
| `api-request-structure` | `request-validation`, `correlation-id-management`, `idempotency-management`, `api-design-standards`, `request-header-management` | 3 |
| `api-response-structure` | `api-error-response`, `response-dto-mapping`, `response-serialization`, `api-pagination`, `http-status-codes` | 5 |
| `api-error-response` | `error-catalog-management`, `error-code-standards`, `exception-to-error-mapping`, `http-status-codes`, `global-exception-handling` | 12 |
| `http-status-codes` | `api-error-response`, `error-catalog-management`, `api-response-structure`, `exception-to-error-mapping` | 5 |
| `request-validation` | `api-request-structure`, `request-dto-mapping`, `query-parameter-management`, `api-error-response`, `error-catalog-management` | 9 |
| `request-dto-mapping` | `layered-architecture`, `request-validation`, `response-dto-mapping`, `clean-architecture` | 3 |
| `response-dto-mapping` | `api-response-structure`, `request-dto-mapping`, `response-serialization`, `sensitive-data-masking-in-logs` | 4 |
| `request-header-management` | `correlation-id-management`, `idempotency-management`, `service-to-service-authentication`, `internal-api-key-authentication`, `cors-policy`, `http-client-management` | 7 |
| `query-parameter-management` | `request-validation`, `api-pagination`, `api-filtering-sorting`, `api-design-standards` | 3 |
| `api-pagination` | `api-filtering-sorting`, `query-parameter-management`, `query-optimization`, `api-response-structure`, `database-indexing` | 5 |
| `api-filtering-sorting` | `api-pagination`, `query-parameter-management`, `query-optimization`, `database-indexing` | 2 |
| `response-serialization` | `response-dto-mapping`, `api-response-structure`, `sensitive-data-masking-in-logs` | 2 |
| `swagger-openapi` | `api-documentation`, `api-contract-testing`, `api-versioning`, `api-design-standards` | 5 |
| `api-versioning` | `deprecation-sunset-management`, `api-compatibility-review`, `breaking-change-review`, `api-design-standards` | 8 |
| `api-contract-testing` | `contract-testing`, `swagger-openapi`, `postman-functional-testing`, `api-testing`, `api-compatibility-review` | 7 |
| `api-compatibility-review` | `api-versioning`, `breaking-change-review`, `api-contract-testing`, `deprecation-sunset-management`, `code-review` | 5 |
| `api-rate-limiting` | `rate-limiting`, `middleware-request-pipeline`, `api-error-response`, `http-status-codes`, `bounded-concurrency` | 4 |
| `deprecation-sunset-management` | `api-versioning`, `api-compatibility-review`, `request-header-management`, `breaking-change-review`, `structured-logging` | 3 |
| `correlation-id-management` | `request-context-propagation`, `structured-logging`, `request-header-management`, `distributed-request-tracking`, `trace-context-propagation`, `api-error-response` | 11 |
| `request-context-propagation` | `correlation-id-management`, `distributed-request-tracking`, `structured-logging`, `http-client-management`, `message-producer` | 1 |
| `idempotency-management` | `request-deduplication`, `message-idempotency`, `usage-event-identity`, `api-request-structure`, `api-error-response`, `distributed-locking` | 11 |
| `request-deduplication` | `idempotency-management`, `message-deduplication`, `usage-event-identity`, `webhook-delivery`, `outbox-pattern` | 5 |
| `distributed-request-tracking` | `correlation-id-management`, `trace-context-propagation`, `distributed-tracing`, `structured-logging`, `application-monitoring` | 3 |
| `trace-context-propagation` | `distributed-tracing`, `opentelemetry-integration`, `correlation-id-management`, `application-monitoring` | 4 |
| `usage-event-identity` | `idempotency-management`, `message-deduplication`, `message-idempotency`, `azure-service-bus-client`, `event-publishing`, `request-deduplication` | 8 |
| `error-catalog-management` | `error-code-standards`, `exception-to-error-mapping`, `global-exception-handling`, `api-error-response`, `business-exception-handling`, `technical-exception-handling` | 10 |
| `error-code-standards` | `error-catalog-management`, `exception-to-error-mapping`, `api-error-response`, `breaking-change-review`, `api-compatibility-review` | 2 |
| `exception-handling` | `error-catalog-management`, `global-exception-handling`, `error-propagation`, `business-exception-handling`, `technical-exception-handling`, `error-logging` | 3 |
| `global-exception-handling` | `error-catalog-management`, `exception-to-error-mapping`, `error-logging`, `api-error-response`, `middleware-request-pipeline` | 8 |
| `exception-to-error-mapping` | `error-catalog-management`, `integration-error-handling`, `technical-exception-handling`, `global-exception-handling`, `api-error-response` | 7 |
| `business-exception-handling` | `error-catalog-management`, `http-status-codes`, `exception-handling`, `api-error-response` | 2 |
| `technical-exception-handling` | `exception-to-error-mapping`, `dependency-failure-handling`, `integration-error-handling`, `fail-open-fail-closed-policy`, `circuit-breaker` | 5 |
| `error-logging` | `structured-logging`, `global-exception-handling`, `sensitive-data-masking-in-logs`, `log-level-standards`, `correlation-id-management` | 5 |
| `error-propagation` | `exception-handling`, `global-exception-handling`, `integration-error-handling`, `dependency-failure-handling`, `correlation-id-management` | 2 |
| `required-environment-variables` | `configuration-validation`, `configuration-management`, `optional-environment-variables`, `configuration-security`, `startup-dependency-validation` | 4 |
| `optional-environment-variables` | `configuration-defaults`, `feature-flag-management`, `configuration-validation`, `required-environment-variables` | 5 |
| `configuration-management` | `configuration-validation`, `configuration-defaults`, `configuration-precedence`, `environment-specific-configuration`, `configuration-security`, `feature-flag-management` | 4 |
| `configuration-validation` | `required-environment-variables`, `startup-dependency-validation`, `optional-environment-variables`, `service-registration-lifecycle`, `health-endpoint-implementation` | 6 |
| `configuration-defaults` | `optional-environment-variables`, `configuration-validation`, `environment-specific-configuration` | 4 |
| `configuration-precedence` | `configuration-management`, `environment-specific-configuration`, `configuration-defaults` | 1 |
| `environment-specific-configuration` | `configuration-security`, `configuration-defaults`, `environment-deployment-standards`, `fail-open-fail-closed-policy` | 6 |
| `feature-flag-management` | `optional-environment-variables`, `api-versioning`, `outbox-pattern`, `environment-specific-configuration` | 7 |
| `configuration-security` | `secrets-management`, `required-environment-variables`, `sensitive-data-masking-in-logs`, `internal-package-management`, `data-protection` | 8 |
| `startup-dependency-validation` | `configuration-validation`, `service-registration-lifecycle`, `liveness-readiness-checks`, `dependency-failure-handling`, `health-endpoint-implementation` | 9 |
| `structured-logging` | `logger-initialization`, `log-level-standards`, `correlation-id-management`, `error-logging`, `sensitive-data-masking-in-logs`, `mocking-test-doubles` | 15 |
| `logger-initialization` | `structured-logging`, `service-registration-lifecycle`, `sensitive-data-masking-in-logs`, `log-level-standards`, `application-monitoring` | 5 |
| `log-level-standards` | `structured-logging`, `error-logging`, `logger-initialization`, `application-monitoring` | 3 |
| `health-endpoint-implementation` | `liveness-readiness-checks`, `startup-dependency-validation`, `dependency-failure-handling`, `middleware-request-pipeline`, `graceful-shutdown` | 5 |
| `liveness-readiness-checks` | `health-endpoint-implementation`, `graceful-shutdown`, `docker-containerization`, `kubernetes-deployment`, `startup-dependency-validation` | 5 |
| `distributed-tracing` | `trace-context-propagation`, `opentelemetry-integration`, `application-monitoring`, `correlation-id-management`, `distributed-request-tracking` | 4 |
| `opentelemetry-integration` | `distributed-tracing`, `trace-context-propagation`, `structured-logging`, `application-monitoring` | 3 |
| `metrics-collection` | `application-monitoring`, `alerting-standards`, `opentelemetry-integration`, `performance-review` | 3 |
| `application-monitoring` | `structured-logging`, `distributed-tracing`, `alerting-standards`, `metrics-collection`, `health-endpoint-implementation` | 8 |
| `alerting-standards` | `application-monitoring`, `metrics-collection`, `operational-runbooks`, `production-readiness-review` | 5 |
| `sensitive-data-masking-in-logs` | `structured-logging`, `logger-initialization`, `audit-logging`, `configuration-security`, `data-protection` | 9 |
| `audit-logging` | `sensitive-data-masking-in-logs`, `database-indexing`, `structured-logging`, `mongodb-client`, `security-review` | 4 |
| `mongodb-client` | `database-connection-management`, `database-repository-pattern`, `database-indexing`, `query-optimization`, `redis-client`, `configuration-security` | 9 |
| `redis-client` | `caching-strategy`, `cache-invalidation`, `distributed-locking`, `circuit-breaker`, `timeout-management`, `database-connection-management` | 7 |
| `database-repository-pattern` | `mongodb-client`, `layered-architecture`, `database-indexing`, `dependency-injection`, `database-testing` | 5 |
| `database-connection-management` | `mongodb-client`, `redis-client`, `graceful-shutdown`, `startup-dependency-validation`, `azure-service-connection-management` | 3 |
| `database-transaction-management` | `outbox-pattern`, `idempotency-management`, `mongodb-client`, `database-repository-pattern` | 0 |
| `database-indexing` | `database-repository-pattern`, `query-optimization`, `mongodb-client`, `api-pagination`, `audit-logging` | 10 |
| `database-migration` | `feature-flag-management`, `mongodb-client`, `api-versioning`, `rollback-strategy`, `production-readiness-review` | 2 |
| `query-optimization` | `database-indexing`, `api-pagination`, `caching-strategy`, `performance-review`, `mongodb-client` | 7 |
| `caching-strategy` | `redis-client`, `cache-invalidation`, `circuit-breaker`, `fallback-mechanism`, `distributed-locking`, `query-optimization` | 10 |
| `cache-invalidation` | `caching-strategy`, `redis-client`, `event-driven-architecture`, `webhook-delivery`, `service-boundary-responsibility` | 2 |
| `distributed-locking` | `redis-client`, `scheduled-job-reconciliation`, `idempotency-management`, `fail-open-fail-closed-policy`, `background-worker-processing` | 4 |
| `azure-queue-storage-client` | `message-consumer`, `message-producer`, `background-worker-processing`, `azure-sdk-client-management`, `message-structure-contracts`, `dead-letter-queue-handling` | 5 |
| `azure-service-bus-client` | `message-producer`, `event-publishing`, `usage-event-identity`, `outbox-pattern`, `azure-sdk-client-management`, `azure-service-connection-management` | 6 |
| `message-producer` | `azure-service-bus-client`, `azure-queue-storage-client`, `outbox-pattern`, `message-structure-contracts`, `usage-event-identity`, `event-publishing` | 6 |
| `message-consumer` | `azure-queue-storage-client`, `background-worker-processing`, `message-idempotency`, `inbox-pattern`, `dead-letter-queue-handling`, `event-consumption` | 7 |
| `event-publishing` | `message-producer`, `event-driven-architecture`, `message-structure-contracts`, `outbox-pattern`, `usage-event-identity` | 6 |
| `event-consumption` | `message-consumer`, `message-idempotency`, `inbox-pattern`, `dead-letter-queue-handling`, `event-driven-architecture` | 3 |
| `message-structure-contracts` | `message-versioning`, `event-publishing`, `message-producer`, `api-contract-testing`, `contract-testing` | 5 |
| `message-versioning` | `message-structure-contracts`, `api-versioning`, `event-driven-architecture`, `breaking-change-review` | 3 |
| `message-retry-strategy` | `outbox-pattern`, `retry-policy`, `exponential-backoff`, `dead-letter-queue-handling`, `background-worker-processing` | 4 |
| `dead-letter-queue-handling` | `message-retry-strategy`, `message-consumer`, `azure-queue-storage-client`, `operational-runbooks`, `alerting-standards` | 5 |
| `message-deduplication` | `usage-event-identity`, `message-idempotency`, `request-deduplication`, `azure-service-bus-client`, `idempotency-management` | 3 |
| `message-idempotency` | `idempotency-management`, `message-deduplication`, `message-consumer`, `inbox-pattern`, `usage-event-identity` | 7 |
| `outbox-pattern` | `message-producer`, `azure-service-bus-client`, `message-retry-strategy`, `background-worker-processing`, `event-publishing`, `database-indexing` | 12 |
| `inbox-pattern` | `message-idempotency`, `message-consumer`, `event-consumption`, `database-indexing` | 3 |
| `event-driven-architecture` | `event-publishing`, `event-consumption`, `outbox-pattern`, `service-boundary-responsibility`, `webhook-delivery`, `message-idempotency` | 8 |
| `webhook-delivery` | `webhook-signature-verification`, `ssrf-protection`, `background-worker-processing`, `azure-queue-storage-client`, `request-deduplication`, `bounded-concurrency` | 6 |
| `background-worker-processing` | `outbox-pattern`, `message-consumer`, `scheduled-job-reconciliation`, `graceful-shutdown`, `service-registration-lifecycle`, `bounded-concurrency` | 12 |
| `scheduled-job-reconciliation` | `distributed-locking`, `background-worker-processing`, `event-driven-architecture`, `feature-flag-management`, `operational-runbooks` | 2 |
| `azure-blob-storage-client` | `azure-sdk-client-management`, `file-upload-download`, `file-streaming`, `azure-managed-identity`, `integration-error-handling` | 2 |
| `azure-sdk-client-management` | `azure-service-connection-management`, `azure-service-bus-client`, `azure-queue-storage-client`, `dependency-injection`, `mocking-test-doubles` | 6 |
| `azure-service-connection-management` | `azure-sdk-client-management`, `azure-managed-identity`, `configuration-security`, `startup-dependency-validation`, `secrets-management` | 4 |
| `external-api-client` | `http-client-management`, `integration-error-handling`, `resilient-http-communication`, `service-to-service-authentication`, `dependency-failure-handling`, `retry-policy` | 14 |
| `http-client-management` | `external-api-client`, `resilient-http-communication`, `timeout-management`, `mocking-test-doubles`, `request-header-management` | 4 |
| `third-party-service-integration` | `external-api-client`, `webhook-signature-verification`, `ssrf-protection`, `feature-flag-management`, `integration-error-handling` | 2 |
| `file-upload-download` | `azure-blob-storage-client`, `file-streaming`, `request-validation`, `api-security`, `security-review` | 2 |
| `file-streaming` | `file-upload-download`, `azure-blob-storage-client`, `timeout-management`, `bounded-concurrency` | 2 |
| `external-dependency-configuration` | `required-environment-variables`, `optional-environment-variables`, `external-api-client`, `startup-dependency-validation`, `configuration-management` | 0 |
| `integration-error-handling` | `external-api-client`, `exception-to-error-mapping`, `dependency-failure-handling`, `technical-exception-handling`, `error-propagation` | 9 |
| `machine-authentication` | `service-to-service-authentication`, `azure-managed-identity`, `client-credentials-flow`, `internal-api-key-authentication`, `jwt-validation` | 3 |
| `service-to-service-authentication` | `machine-authentication`, `azure-managed-identity`, `external-api-client`, `internal-api-key-authentication`, `request-header-management`, `correlation-id-management` | 8 |
| `oauth-2-0` | `client-credentials-flow`, `jwt-validation`, `azure-managed-identity`, `authentication`, `service-to-service-authentication` | 2 |
| `client-credentials-flow` | `azure-managed-identity`, `oauth-2-0`, `service-to-service-authentication`, `machine-authentication`, `external-api-client` | 3 |
| `azure-managed-identity` | `client-credentials-flow`, `azure-service-connection-management`, `secrets-management`, `azure-sdk-client-management` | 7 |
| `jwt-validation` | `authentication`, `authorization`, `role-based-access-control`, `oauth-2-0`, `middleware-request-pipeline` | 5 |
| `authentication` | `jwt-validation`, `internal-api-key-authentication`, `authorization`, `middleware-request-pipeline`, `api-security` | 8 |
| `authorization` | `role-based-access-control`, `jwt-validation`, `authentication`, `api-security`, `security-review` | 4 |
| `role-based-access-control` | `authorization`, `jwt-validation`, `audit-logging`, `security-review` | 2 |
| `secrets-management` | `configuration-security`, `azure-managed-identity`, `internal-package-management`, `data-protection`, `pipeline-security-scanning` | 11 |
| `certificate-management` | `mutual-tls`, `secrets-management`, `api-security`, `operational-runbooks` | 1 |
| `mutual-tls` | `certificate-management`, `service-to-service-authentication`, `api-security` | 1 |
| `data-protection` | `sensitive-data-masking-in-logs`, `secrets-management`, `audit-logging`, `response-dto-mapping`, `security-review` | 4 |
| `api-security` | `authentication`, `authorization`, `cors-policy`, `ssrf-protection`, `api-rate-limiting`, `security-review` | 9 |
| `internal-api-key-authentication` | `service-to-service-authentication`, `machine-authentication`, `secrets-management`, `request-header-management`, `authentication` | 5 |
| `webhook-signature-verification` | `webhook-delivery`, `third-party-service-integration`, `middleware-request-pipeline`, `secrets-management`, `request-deduplication` | 4 |
| `ssrf-protection` | `webhook-delivery`, `third-party-service-integration`, `request-validation`, `api-security`, `external-api-client` | 5 |
| `cors-policy` | `api-security`, `middleware-request-pipeline`, `request-header-management`, `global-exception-handling` | 4 |
| `retry-policy` | `exponential-backoff`, `resilient-http-communication`, `message-retry-strategy`, `timeout-management`, `idempotency-management`, `external-api-client` | 6 |
| `exponential-backoff` | `retry-policy`, `message-retry-strategy`, `resilient-http-communication`, `outbox-pattern` | 3 |
| `timeout-management` | `external-api-client`, `redis-client`, `mongodb-client`, `resilient-http-communication`, `idempotency-management` | 6 |
| `circuit-breaker` | `caching-strategy`, `fallback-mechanism`, `resilient-http-communication`, `graceful-degradation`, `redis-client` | 8 |
| `bulkhead-pattern` | `bounded-concurrency`, `fault-isolation`, `graceful-degradation`, `background-worker-processing` | 2 |
| `fallback-mechanism` | `caching-strategy`, `circuit-breaker`, `graceful-degradation`, `fail-open-fail-closed-policy`, `dependency-failure-handling` | 5 |
| `graceful-degradation` | `fallback-mechanism`, `fail-open-fail-closed-policy`, `circuit-breaker`, `health-endpoint-implementation`, `fault-isolation` | 6 |
| `fault-isolation` | `background-worker-processing`, `bulkhead-pattern`, `graceful-degradation`, `dependency-failure-handling` | 2 |
| `rate-limiting` | `api-rate-limiting`, `retry-policy`, `bounded-concurrency`, `external-api-client`, `circuit-breaker` | 2 |
| `dependency-failure-handling` | `fail-open-fail-closed-policy`, `integration-error-handling`, `technical-exception-handling`, `fallback-mechanism`, `graceful-degradation`, `startup-dependency-validation` | 9 |
| `graceful-shutdown` | `service-registration-lifecycle`, `background-worker-processing`, `logger-initialization`, `database-connection-management`, `liveness-readiness-checks` | 9 |
| `resilient-http-communication` | `external-api-client`, `retry-policy`, `circuit-breaker`, `timeout-management`, `http-client-management`, `integration-error-handling` | 6 |
| `bounded-concurrency` | `webhook-delivery`, `bulkhead-pattern`, `background-worker-processing`, `rate-limiting`, `query-optimization` | 7 |
| `fail-open-fail-closed-policy` | `dependency-failure-handling`, `fallback-mechanism`, `idempotency-management`, `environment-specific-configuration`, `graceful-degradation` | 6 |
| `fatal-error-process-policy` | `graceful-shutdown`, `service-registration-lifecycle`, `structured-logging`, `exception-handling` | 1 |
| `llm-api-call` | `llm-client-management`, `llm-retry-timeout`, `llm-error-handling`, `external-api-client`, `structured-llm-output`, `ai-guardrails` | 7 |
| `llm-client-management` | `model-configuration`, `azure-sdk-client-management`, `llm-api-call`, `secrets-management`, `dependency-injection` | 2 |
| `prompt-management` | `prompt-versioning`, `structured-llm-output`, `ai-guardrails`, `llm-api-call`, `architecture-decision-records` | 3 |
| `prompt-versioning` | `prompt-management`, `model-configuration`, `message-versioning`, `breaking-change-review` | 1 |
| `token-management` | `token-cost-optimization`, `cost-calculation-strategy-registry`, `usage-event-identity`, `llm-api-call`, `model-configuration` | 2 |
| `token-cost-optimization` | `token-management`, `cost-calculation-strategy-registry`, `caching-strategy`, `llm-api-call`, `performance-review` | 2 |
| `structured-llm-output` | `llm-response-validation`, `prompt-management`, `llm-api-call`, `request-validation`, `ai-guardrails` | 4 |
| `llm-response-validation` | `structured-llm-output`, `ai-guardrails`, `llm-error-handling`, `request-validation` | 3 |
| `llm-retry-timeout` | `llm-api-call`, `retry-policy`, `timeout-management`, `exponential-backoff`, `circuit-breaker` | 1 |
| `ai-guardrails` | `llm-response-validation`, `structured-llm-output`, `prompt-management`, `data-protection`, `security-review` | 4 |
| `model-configuration` | `llm-client-management`, `secrets-management`, `caching-strategy`, `sensitive-data-masking-in-logs` | 3 |
| `llm-error-handling` | `error-catalog-management`, `llm-api-call`, `llm-response-validation`, `integration-error-handling`, `error-logging` | 2 |
| `cost-calculation-strategy-registry` | `design-patterns`, `token-cost-optimization`, `token-management`, `solid-principles`, `caching-strategy` | 3 |
| `unit-testing` | `mocking-test-doubles`, `test-coverage-standards`, `in-memory-test-harness`, `integration-testing`, `test-data-management` | 6 |
| `integration-testing` | `unit-testing`, `in-memory-test-harness`, `database-testing`, `message-processing-testing`, `end-to-end-testing` | 7 |
| `end-to-end-testing` | `integration-testing`, `postman-functional-testing`, `api-testing`, `performance-testing`, `test-data-management` | 4 |
| `api-testing` | `api-contract-testing`, `postman-functional-testing`, `integration-testing`, `security-testing` | 3 |
| `contract-testing` | `api-contract-testing`, `message-structure-contracts`, `swagger-openapi`, `postman-functional-testing` | 2 |
| `database-testing` | `in-memory-test-harness`, `mongodb-client`, `database-repository-pattern`, `database-indexing`, `integration-testing` | 4 |
| `message-processing-testing` | `in-memory-test-harness`, `outbox-pattern`, `azure-service-bus-client`, `message-consumer`, `integration-testing` | 2 |
| `mocking-test-doubles` | `dependency-injection`, `in-memory-test-harness`, `unit-testing`, `structured-logging`, `integration-testing` | 6 |
| `test-data-management` | `end-to-end-testing`, `database-testing`, `postman-functional-testing`, `unit-testing` | 3 |
| `performance-testing` | `load-testing`, `performance-review`, `test-coverage-standards`, `metrics-collection` | 3 |
| `load-testing` | `performance-testing`, `api-rate-limiting`, `end-to-end-testing`, `production-readiness-review` | 1 |
| `security-testing` | `api-security`, `pipeline-security-scanning`, `authentication`, `security-review`, `ssrf-protection` | 2 |
| `test-coverage-standards` | `unit-testing`, `ci-cd-pipeline`, `code-review`, `technical-debt-assessment` | 2 |
| `in-memory-test-harness` | `mocking-test-doubles`, `database-testing`, `message-processing-testing`, `integration-testing`, `dependency-injection` | 7 |
| `postman-functional-testing` | `api-contract-testing`, `end-to-end-testing`, `api-testing`, `test-data-management`, `swagger-openapi` | 6 |
| `code-review` | `coding-standards-review`, `security-review`, `architecture-review`, `solid-compliance-review`, `breaking-change-review`, `dependency-review`, `production-readiness-review` | 4 |
| `architecture-review` | `microservice-architecture-standards`, `service-boundary-responsibility`, `layered-architecture`, `event-driven-architecture`, `architecture-decision-records` | 4 |
| `security-review` | `api-security`, `authentication`, `secrets-management`, `ssrf-protection`, `webhook-signature-verification`, `internal-api-key-authentication`, `cors-policy` | 11 |
| `performance-review` | `query-optimization`, `caching-strategy`, `bounded-concurrency`, `database-indexing`, `performance-testing` | 4 |
| `production-readiness-review` | `deployment-release-management`, `rollback-strategy`, `operational-runbooks`, `alerting-standards`, `graceful-shutdown`, `security-review` | 8 |
| `clean-code-review` | `coding-standards-review`, `refactoring`, `solid-compliance-review`, `code-review` | 3 |
| `refactoring` | `clean-code-review`, `technical-debt-assessment`, `breaking-change-review`, `unit-testing`, `solid-compliance-review` | 2 |
| `solid-compliance-review` | `solid-principles`, `clean-code-review`, `design-patterns`, `dependency-injection` | 4 |
| `coding-standards-review` | `code-review`, `clean-code-review`, `project-structure`, `structured-logging`, `error-catalog-management` | 2 |
| `technical-debt-assessment` | `refactoring`, `dependency-review`, `architecture-review`, `production-readiness-review` | 4 |
| `dependency-review` | `internal-package-management`, `pipeline-security-scanning`, `security-review`, `technical-debt-assessment` | 4 |
| `breaking-change-review` | `api-compatibility-review`, `api-versioning`, `message-versioning`, `database-migration`, `deprecation-sunset-management` | 9 |
| `readme-documentation` | `technical-documentation`, `developer-onboarding-documentation`, `deployment-documentation`, `configuration-management` | 3 |
| `technical-documentation` | `architecture-documentation`, `api-documentation`, `readme-documentation`, `operational-runbooks` | 3 |
| `architecture-documentation` | `technical-documentation`, `architecture-decision-records`, `service-boundary-responsibility`, `event-driven-architecture` | 2 |
| `architecture-decision-records` | `architecture-documentation`, `architecture-review`, `technical-debt-assessment` | 3 |
| `api-documentation` | `swagger-openapi`, `api-contract-testing`, `readme-documentation`, `postman-functional-testing` | 2 |
| `deployment-documentation` | `environment-deployment-standards`, `ci-cd-pipeline`, `docker-containerization`, `operational-runbooks`, `rollback-strategy` | 4 |
| `operational-runbooks` | `alerting-standards`, `rollback-strategy`, `dead-letter-queue-handling`, `production-readiness-review`, `deployment-documentation` | 8 |
| `developer-onboarding-documentation` | `readme-documentation`, `internal-package-management`, `in-memory-test-harness`, `technical-documentation` | 1 |
| `docker-containerization` | `internal-package-management`, `ci-cd-pipeline`, `liveness-readiness-checks`, `graceful-shutdown`, `pipeline-security-scanning` | 6 |
| `kubernetes-deployment` | `liveness-readiness-checks`, `docker-containerization`, `deployment-documentation`, `graceful-shutdown`, `environment-deployment-standards` | 1 |
| `ci-cd-pipeline` | `pipeline-security-scanning`, `deployment-release-management`, `docker-containerization`, `internal-package-management`, `unit-testing` | 7 |
| `deployment-release-management` | `ci-cd-pipeline`, `rollback-strategy`, `environment-deployment-standards`, `production-readiness-review`, `feature-flag-management`, `breaking-change-review` | 4 |
| `rollback-strategy` | `deployment-release-management`, `feature-flag-management`, `database-migration`, `operational-runbooks`, `production-readiness-review` | 5 |
| `environment-deployment-standards` | `environment-specific-configuration`, `ci-cd-pipeline`, `deployment-documentation`, `configuration-security`, `deployment-release-management` | 4 |
| `pipeline-security-scanning` | `ci-cd-pipeline`, `dependency-review`, `secrets-management`, `docker-containerization`, `security-testing` | 5 |

## Skills with no inbound reference

`database-transaction-management`, `external-dependency-configuration`
