---
name: azure-sdk-client-management
description: Use when creating or reviewing any Azure SDK client in Node (Service Bus, Queue Storage, Identity, Blob) - lazy module singleton, cached senders/clients, env configuration, configured-check, readiness probe, close on shutdown, test override.
---

# Azure SDK Client Management

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `azure-sdk-client-management` |
| Category | 09 — Cloud Storage & External Integrations |
| Scope | Lifecycle of Azure SDK clients. |
| Applicability | Node.js Azure SDKs. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (INT-06) |
| Governing standards | `INT-06`, `ARCH-04`, `CFG-01`, `ARCH-03` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `azure-service-connection-management`, `azure-service-bus-client`, `azure-queue-storage-client`, `dependency-injection`, `mocking-test-doubles` |

## Purpose
One client per resource, correctly closed and testable.

## When to use
- Adding an Azure SDK dependency.

## Organizational standards
- **MANDATORY:** Client is a lazy singleton returned by `getX()` that returns `null` (optional integration) or throws a catalogued config error (mandatory) when configuration is absent; cached child objects (senders) in a `Map`.
- **MANDATORY:** Provide `isXConfigured()`, a lightweight health check proving credentials (e.g., create sender), and `closeX()` closing children then the client.
- **MANDATORY:** Provide a test seam (`__setXForTests`) or rely on module mocking per repo.
- **MANDATORY:** Configuration from environment (`SERVICE_BUS_CONNECTION_STRING`, `AZURE_QUEUE_STORAGE_CONNECTION_STRING`, `AZURE_SERVICE_OAUTH_SCOPE`) via the config module.
- **Verified convention:** Token acquisition uses `generateAuthToken()` from `@inextlabs/azure-oauth` (wraps `DefaultAzureCredential`); do not construct credentials ad hoc elsewhere.

_Source of truth: `INT-06`, `ARCH-04`, `CFG-01`, `ARCH-03`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Follow the module template; wire close into shutdown.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Template**

```ts
let client: ServiceBusClient | null = null; const senders = new Map<string, ServiceBusSender>();
export const isConfigured = () => Boolean(config.serviceBus.connectionString?.trim());
async function getClient() { if (!isConfigured()) return null; return (client ??= new ServiceBusClient(config.serviceBus.connectionString)); }
export async function closeServiceBus() { for (const s of senders.values()) await s.close().catch(() => undefined); senders.clear(); await client?.close(); client = null; }
```

## Error and failure handling
- Missing mandatory config -> startup validation failure.
- Distinguish confirmed absence from unavailability; never treat an unavailable dependency as empty data (ERR-09).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Outbound calls carry only the identity and correlation headers defined in CTX-02; validate any client-supplied URL with the SSRF guard (INT-03).

## Testing guidelines
- Configured/unconfigured paths; close idempotent.
- Mock the HTTP/SDK client; cover 2xx, confirmed-absent (404), 4xx, 5xx, timeout and token-acquisition failure.

## Anti-patterns
- Clients in request handlers.
- Never closing.

## Implementation checklist
- [ ] Singleton; configured-check; health; close; seam.

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
- Client is a lazy singleton returned by `getX()` that returns `null` (optional integration) or throws a catalogued config error (mandatory) when configuration is absent; cached child objects (senders) in a `Map`.
- Provide `isXConfigured()`, a lightweight health check proving credentials (e.g., create sender), and `closeX()` closing children then the client.
- Provide a test seam (`__setXForTests`) or rely on module mocking per repo.
- Configuration from environment (`SERVICE_BUS_CONNECTION_STRING`, `AZURE_QUEUE_STORAGE_CONNECTION_STRING`, `AZURE_SERVICE_OAUTH_SCOPE`) via the config module.

## Related skills
- `azure-service-connection-management` — Azure Service Connection Management
- `azure-service-bus-client` — Azure Service Bus Client
- `azure-queue-storage-client` — Azure Queue Storage Client
- `dependency-injection` — Dependency Injection
- `mocking-test-doubles` — Mocking & Test Doubles
