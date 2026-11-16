---
name: third-party-service-integration
description: Use when integrating third-party providers (billing webhooks, push notification, email via Logic App/HTTP, chat channels) - isolate behind a module, enable by flag, verify inbound signatures, validate outbound URLs, store credentials in env, and fail safely.
---

# Third-Party Service Integration

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `third-party-service-integration` |
| Category | 09 — Cloud Storage & External Integrations |
| Scope | Third-party integrations. |
| Applicability | Node services. |
| Evidence | E2 — single repository, repeated and/or tested |
| Classification | VERIFIED (INT-04, INT-03) |
| Governing standards | `INT-04`, `INT-03`, `MSG-05`, `CFG-06`, `CFG-01` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `external-api-client`, `webhook-signature-verification`, `ssrf-protection`, `feature-flag-management`, `integration-error-handling` |

## Purpose
Contain vendor specifics and risks.

## When to use
- Adding a vendor integration.

## Organizational standards
- **MANDATORY:** One module per vendor (for example a push-notification module and a channel dispatcher); channel enabled by `NOTIFICATION_<CHANNEL>_ENABLED`; credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `LOGIC_APP_EMAIL_URL`, `<PROVIDER>_WEBHOOK_SECRET`) only from env; private keys handle newline escapes; none logged.
- **MANDATORY:** Inbound vendor webhooks verified by signature over the raw body (`webhook-signature-verification`); outbound calls follow `external-api-client`.
- **MANDATORY:** Vendor failures never fail the primary operation unless contractually required; log and rely on retry/outbox.
- **MANDATORY:** Isolate vendor payload shapes with an adapter/normalizer (`config-subscription-normalizer` style) so domain code is vendor-neutral.

_Source of truth: `INT-04`, `INT-03`, `MSG-05`, `CFG-06`, `CFG-01`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Add module, flag, env docs, adapter, tests with a stub.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Channel gate**

```ts
if (!config.notifications.portalEnabled) { logger.debug("Portal notifications disabled"); return { sent: false, reason: "disabled" }; }
```

## Error and failure handling
- Provider failure -> `warn`, queue retry.
- Distinguish confirmed absence from unavailability; never treat an unavailable dependency as empty data (ERR-09).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Secrets; least privilege service account; validate callback hosts.
- Outbound calls carry only the identity and correlation headers defined in CTX-02; validate any client-supplied URL with the SSRF guard (INT-03).

## Testing guidelines
- Stub vendor client; disabled channel; failure path.
- Mock the HTTP/SDK client; cover 2xx, confirmed-absent (404), 4xx, 5xx, timeout and token-acquisition failure.

## Anti-patterns
- Vendor SDK calls from controllers.
- Logging vendor payloads.

## Implementation checklist
- [ ] Module; flag; adapter; verified inbound.

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
- One module per vendor (for example a push-notification module and a channel dispatcher); channel enabled by `NOTIFICATION_<CHANNEL>_ENABLED`; credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `LOGIC_APP_EMAIL_URL`, `<PROVIDER>_WEBHOOK_SECRET`) only from env; private keys handle newline escapes; none logged.
- Inbound vendor webhooks verified by signature over the raw body (`webhook-signature-verification`); outbound calls follow `external-api-client`.
- Vendor failures never fail the primary operation unless contractually required; log and rely on retry/outbox.
- Isolate vendor payload shapes with an adapter/normalizer (`config-subscription-normalizer` style) so domain code is vendor-neutral.

## Related skills
- `external-api-client` — External API Client
- `webhook-signature-verification` — Webhook Signature Verification
- `ssrf-protection` — SSRF Protection
- `feature-flag-management` — Feature Flag Management
- `integration-error-handling` — Integration Error Handling
