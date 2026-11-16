---
name: mongodb-client
description: Use when creating, configuring or using a MongoDB client - connection string/credentials from env, pool and timeout options, per-tenant databases, connection events, URI masking, closing on shutdown. Follows the target repo's driver (mongoose with shared schema models, or the native mongodb driver).
---

# MongoDB Client

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `mongodb-client` |
| Category | 07 — Database & Caching Management |
| Scope | MongoDB client initialization and access. |
| Applicability | Node.js - `mongoose` 8 + `@inextlabs/schema-models`, or `mongodb` 6. |
| Evidence | E1 — consistent across both reference repositories |
| Classification | TECH (mongoose vs native driver, C-11) + VERIFIED helpers |
| Governing standards | `DB-01`, `DB-03`, `CFG-01`, `OBS-03`, `ERR-09` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `database-connection-management`, `database-repository-pattern`, `database-indexing`, `query-optimization`, `redis-client`, `configuration-security` |

## Purpose
Consistent, safe and observable database connectivity.

## When to use
- New repository or database access.
- Connection errors, pool exhaustion, multi-tenant DB routing.

## Organizational standards
- **MANDATORY:** Connection string, user, password, DB name come from environment (`MONGO_DB_CONNECTION_STRING`, `MONGO_DB_USER`, `MONGO_DB_PASSWORD`, `MONGO_PLATFORM_ADMIN_DB_NAME`; usage services `USAGE_MONGO_URI`, `USAGE_DB_NAME`, `USAGE_MONGO_USER`, `USAGE_MONGO_PASSWORD`); never hard-coded; validated at startup (`required-environment-variables`).
- **MANDATORY:** Keep small local helpers: build the connection string so the DB name is inserted before any `?options`, `maskConnectionUri` for logs, and `formatMongoConnectionError(label, err, maskedUri)` to wrap connect failures.
- **MANDATORY (mongoose profile):** `mongoose.createConnection(uri, { dbName, user, pass, maxPoolSize: MONGO_MAX_POOL_SIZE (default 50), serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000, connectTimeoutMS: 10000, retryWrites: true, retryReads: true }).asPromise()`; cache connections per database in a `Map`; log `connected | error | disconnected` events; use shared models from `@inextlabs/schema-models`.
- **MANDATORY (native profile):** one `MongoClient` per repository module, lazy `connect()`, `client.db(name)`, typed `Collection<T>`, `ensure*Indexes()` at startup, `close()` exported and called on shutdown.
- **MANDATORY:** Multi-tenant data is addressed by a tenant-resolved database/collection (never by a client-supplied DB name); resolve through the owning config.
- **MANDATORY:** Treat driver errors via `exception-to-error-mapping`; infrastructure catalog entries (`MONGO_CONNECTION_STRING_UNDEFINED`, `DB_NAME_NOT_RESOLVED`, `CLIENT_CONNECTION_UNAVAILABLE`) for configuration/availability failures.
- **UNRESOLVED — do not enforce; report (C-11):** Two drivers coexist; follow the target repo; do not introduce the other.

_Source of truth: `DB-01`, `DB-03`, `CFG-01`, `OBS-03`, `ERR-09`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Reuse the repo's connection module; add a repository (`database-repository-pattern`); add indexes (`database-indexing`).
2. Add the new env keys everywhere (`configuration-management`).

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Native driver repository client (reference pattern)**

```ts
let client: MongoClient | null = null; let db: Db | null = null;
export async function initRepository(): Promise<void> {
  if (client) return;
  client = new MongoClient(config.mongo.uri);
  try { await client.connect(); } catch (e) { throw formatMongoConnectionError("Repository", e as Error, maskConnectionUri(config.mongo.uri)); }
  db = client.db(config.mongo.dbName);
  await db.collection("items").createIndex({ productLine: 1, tenantId: 1, appId: 1, period: 1 }, { unique: true });
}
export async function closeRepository() { await client?.close(); client = null; db = null; }
```

## Error and failure handling
- Connect failure -> startup error with masked URI; runtime operation failure -> `technical-exception-handling`.
- Optional dependencies (cache) fail open to the source of truth; correctness-critical stores surface errors (DB-02, INT-02).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Never log URIs unmasked; never interpolate user input into filter keys/operators.
- Mask connection URIs in logs (`maskConnectionUri`); credentials from environment only; scope every query by tenant identity where data is multi-tenant.

## Testing guidelines
- Use in-memory doubles or the repo's Mongo test double (`database-testing`); test connection failure formatting.
- Use the repository's in-memory/test-double pattern (TEST-02); cover connection failure, timeout, duplicate-key and empty-result paths.

## Anti-patterns
- Creating a client per request.
- Different pool settings hard-coded per file.
- Passing raw query objects from the request.

## Implementation checklist
- [ ] Env-driven; masked; pool/timeouts; events; close; indexes.

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
- Connection string, user, password, DB name come from environment (`MONGO_DB_CONNECTION_STRING`, `MONGO_DB_USER`, `MONGO_DB_PASSWORD`, `MONGO_PLATFORM_ADMIN_DB_NAME`; usage services `USAGE_MONGO_URI`, `USAGE_DB_NAME`, `USAGE_MONGO_USER`, `USAGE_MONGO_PASSWORD`); never hard-coded; validated at startup (`required-environment-variables`).
- Keep small local helpers: build the connection string so the DB name is inserted before any `?options`, `maskConnectionUri` for logs, and `formatMongoConnectionError(label, err, maskedUri)` to wrap connect failures.
- `mongoose.createConnection(uri, { dbName, user, pass, maxPoolSize: MONGO_MAX_POOL_SIZE (default 50), serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000, connectTimeoutMS: 10000, retryWrites: true, retryReads: true }).asPromise()`; cache connections per database in a `Map`; log `connected | error | disconnected` events; use shared models from `@inextlabs/schema-models`.
- one `MongoClient` per repository module, lazy `connect()`, `client.db(name)`, typed `Collection<T>`, `ensure*Indexes()` at startup, `close()` exported and called on shutdown.
- Multi-tenant data is addressed by a tenant-resolved database/collection (never by a client-supplied DB name); resolve through the owning config.
- Treat driver errors via `exception-to-error-mapping`; infrastructure catalog entries (`MONGO_CONNECTION_STRING_UNDEFINED`, `DB_NAME_NOT_RESOLVED`, `CLIENT_CONNECTION_UNAVAILABLE`) for configuration/availability failures.

## Related skills
- `database-connection-management` — Database Connection Management
- `database-repository-pattern` — Database Repository Pattern
- `database-indexing` — Database Indexing
- `query-optimization` — Query Optimization
- `redis-client` — Redis Client
- `configuration-security` — Configuration Security
