---
name: file-streaming
description: Use when moving large payloads between HTTP and storage without buffering - pipeline streams with back-pressure, timeouts, abort handling and bounded concurrency. Generic baseline (no streaming code in the reference repos).
---

# File Streaming

> ⚠ **GENERIC BASELINE (evidence E0).** No organizational implementation of this concern exists in the reference repositories. Everything marked GENERIC is a provisional recommendation pending architectural approval and is **not** an organizational standard. The skill still inherits the standards listed in *Related skills* (logging, errors, configuration, security).

## Skill metadata
| Field | Value |
|---|---|
| Skill name | `file-streaming` |
| Category | 09 — Cloud Storage & External Integrations |
| Scope | Streaming I/O. |
| Applicability | Node streams. |
| Evidence | E0 — no organizational evidence (generic baseline) |
| Classification | GENERIC (no organizational evidence) |
| Governing standards | `INT-05`, `RES-02` (defined in `standards/organization-engineering-standards.md`) |
| Related skills | `file-upload-download`, `azure-blob-storage-client`, `timeout-management`, `bounded-concurrency` |

## Purpose
Constant memory for large transfers.

## When to use
- Large files/exports.

## Organizational standards
- **Generic baseline (provisional):** Use `stream.pipeline` (promise form) with error propagation; set read/write timeouts; destroy streams on client abort (`req.on("close")`); cap concurrency (`bounded-concurrency`); never `Buffer.concat` unbounded.
- **MANDATORY:** Respect headers (`Content-Type`, `Content-Length`) and correlation; log start/end/size.

_Source of truth: `INT-05`, `RES-02`. If this section and the catalog disagree, the catalog wins — report the discrepancy. "Reference service A/B" are the two evidence services (see `governance/repository-analysis.md`); "C-xx" are open conflicts (see `governance/conflicts-and-open-decisions.md`)._

## Implementation guidelines
1. Wrap in a helper with abort handling.

## Technology-specific guidance
**Layer A — organizational contract (identical in every stack)**
- The rules tagged MANDATORY / Verified under *Organizational standards* are the contract; they hold in any language or framework.

**Layer B — approved technology implementation (Node.js / TypeScript / Express, as found in the reference repositories)**
- Use the approved internal packages and the patterns shown in *Code examples* and *Implementation guidelines*; do not substitute public packages (PKG-01).

**Layer C — adapting to another stack**
- Preserve every Layer A rule. If the target uses a different language/framework, write the smallest adapter that keeps the same contract (names, headers, codes, envelope), mark it *adapter pending approval*, and ask for approval before adopting a new library. Do not invent an approved implementation.

## Code examples
**GENERIC**

```ts
await pipeline(blobDownloadStream, res);   // errors propagate; client abort destroys both ends
```

## Error and failure handling
- Mid-stream failure: abort response; cannot send an envelope after headers - log with correlation.
- Distinguish confirmed absence from unavailability; never treat an unavailable dependency as empty data (ERR-09).
- Reuse the canonical `error-catalog-management`, `error-code-standards` and `global-exception-handling` skills; do not redefine error handling here.

## Security considerations
- Outbound calls carry only the identity and correlation headers defined in CTX-02; validate any client-supplied URL with the SSRF guard (INT-03).

## Testing guidelines
- Abort, slow consumer, large payload memory bound.
- Mock the HTTP/SDK client; cover 2xx, confirmed-absent (404), 4xx, 5xx, timeout and token-acquisition failure.

## Anti-patterns
- Reading whole file into memory.

## Implementation checklist
- [ ] Pipeline; timeouts; abort.

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
- Respect headers (`Content-Type`, `Content-Length`) and correlation; log start/end/size.

## Related skills
- `file-upload-download` — File Upload & Download
- `azure-blob-storage-client` — Azure Blob Storage Client
- `timeout-management` — Timeout Management
- `bounded-concurrency` — Bounded Concurrency
