---
name: file-upload-download
description: Use when an API accepts or serves files. No upload/download endpoints exist in the reference repositories; this is a generic baseline layered on validation, security and error standards.
---

# File Upload & Download

> ⚠ **GENERIC BASELINE (evidence E0).** No organizational implementation of this concern exists in the reference repositories. Everything marked GENERIC is a provisional recommendation pending architectural approval and is **not** an organizational standard. The skill still inherits the standards listed in *Related skills* (logging, errors, configuration, security).

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `file-upload-download` |
| Category | 09 — Cloud Storage & External Integrations |
| Scope | File transfer endpoints. |
| Applicability | Express + blob storage. |
| Evidence | E0 — no organizational evidence (generic baseline) |
| Classification | GENERIC (no organizational evidence) |
| Governing standards | `INT-05`, `SEC-06`, `API-05` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `azure-blob-storage-client`, `file-streaming`, `request-validation`, `api-security`, `security-review` |

## Purpose
Safe file handling.

## When to use
- Adding upload/download.

## Organizational standards
- **Generic baseline (provisional):** Enforce max size and allowed MIME types/extensions (validate magic bytes), generate server-side file names, store outside the web root/in private blob containers, stream (don't buffer), scan for malware, return signed short-lived download URLs or stream through an authenticated route.
- **MANDATORY:** Authenticate/authorize per tenant; log metadata (name hash, size), not content; errors via the catalog (`FILE_TOO_LARGE` 413, `UNSUPPORTED_MEDIA_TYPE` 415 - new catalog entries via `error-catalog-management`).
- **MANDATORY:** Configure `express.json({ limit })` and multipart limits explicitly (no body-size limit exists in the reference - gap).

_Source of truth: `INT-05`, `SEC-06`, `API-05`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Use a multipart parser with limits; stream to storage; add contract tests.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**Catalog additions (GENERIC)**

```text
FILE_TOO_LARGE 413 | UNSUPPORTED_MEDIA_TYPE 415
```

## Error and failure handling
- Partial upload cleanup.
- Distinguish confirmed absence from unavailability; never treat an unavailable dependency as empty data (ERR-09).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Path traversal, zip bombs, content sniffing.
- Outbound calls carry only the identity and correlation headers defined in CTX-02; validate any client-supplied URL with the SSRF guard (INT-03).

## Testing guidelines
- Oversize, wrong type, auth.
- Mock the HTTP/SDK client; cover 2xx, confirmed-absent (404), 4xx, 5xx, timeout and token-acquisition failure.

## Anti-patterns
- Client-supplied paths.

## Implementation checklist
- [ ] Limits; storage; auth; errors.

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
- Authenticate/authorize per tenant; log metadata (name hash, size), not content; errors via the catalog (`FILE_TOO_LARGE` 413, `UNSUPPORTED_MEDIA_TYPE` 415 - new catalog entries via `error-catalog-management`).
- Configure `express.json({ limit })` and multipart limits explicitly (no body-size limit exists in the reference - gap).

## Related skills
- `azure-blob-storage-client` — Azure Blob Storage Client
- `file-streaming` — File Streaming
- `request-validation` — Request Validation
- `api-security` — API Security
- `security-review` — Security Review
