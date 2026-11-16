# Security Standards (domain view)

IDs: SEC-01..09, CFG-04/07, INT-03, MSG-05, OBS-03.

| Control | Rule | Evidence |
|---|---|---|
| Authenticate everything | Every non-probe route authenticated; chain visible in route file; fail-closed | SEC-01/03, ARCH-05 |
| Entra JWT | iss/aud/exp/RS256 via JWKS; tenant allow-list; app role; allowed caller app IDs; client-claim binding | `@inextlabs/azure-oauth` or jose middleware (C-05) |
| Service identity | `generateAuthToken(scope)` (`DefaultAzureCredential`); token failure aborts | SEC-02 |
| Internal API key | `x-internal-api-key` + caller; `timingSafeEqual`; fail closed outside local/dev; per-caller keys; boot guard | SEC-03 |
| Webhooks | HMAC-SHA256 over raw body, constant-time, POST only, secret required outside local/dev; outbound signed `timestamp.body` | SEC-04/MSG-05 |
| SSRF | https only; deny loopback/private/link-local/metadata; allow-list; at registration and delivery | INT-03 |
| CORS | env allow-list, fail-closed, typed rejection → catalogued 403 | SEC-05 |
| Rate limiting | tiered standard/strict; catalogued 429 | API-09 |
| Errors | `details` public-safe; cause on `Error.cause`; no stack/driver text | ERR-07 |
| Secrets | env only; `.env*` ignored; masked; `AuthToken` for registry; scrub from images | CFG-07, SEC-06 |
| Masking | one `MASK_CONFIG` for logs, telemetry, audit | OBS-03 |
| Data | TTL retention, tenant-scoped keys, DTO-only responses | SEC-06 |

## Known gaps (not standards) — SEC-09, C-12, C-13
No `helmet`, no body-size limit, unauthenticated docs (A), relax flags `SECURITY_RELAXED_FOR_DEVNDEMO` / `AUTH_FAIL_OPEN` (B), Map-based key compare (B), auth package logs tenant ID and emits non-catalog bodies, connection-string messaging auth, no Key Vault, no mTLS.

Skills: `authentication`, `jwt-validation`, `internal-api-key-authentication`, `webhook-signature-verification`, `ssrf-protection`, `cors-policy`, `api-security`, `secrets-management`, `data-protection`, `security-review`.
