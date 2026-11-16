# Skill Validation Report

Generated 2026-11-14 by `node tools/report.js` (automated checks; manual review notes at the end).

## Summary

| Check | Result |
|---|---|
| Skills built | 195 |
| Skills passing all hard checks | 195 |
| Skills with hard failures | 0 |
| Skills with warnings | 4 |
| Total generated size | 1342 KB |
| Evidence paths cited in the register that could not be found | 0 |

### Hard checks (each skill)
frontmatter (name == folder, description) · 14 required sections · 15 compliance rules · every `Related skill` exists · every governing standard ID exists in the catalog · E0 skills carry GENERIC labelling · no service-specific names (repo names, product names) · no secret-like patterns.

### Soft checks (warnings)
description length / activation phrase · missing mandatory/verified items · competing-library mentions lacking a qualifying negation · missing code example.

## Hard failures

None.

## Warnings

- `error-logging`: competing-lib mention without qualifier L27: - **MANDATORY:** Use `@inextlabs/logger` (via the service wrapper) - `logger.error(err, "m | competing-lib mention without qualifier L36: 1. Replace `console.error` with the logger; replace `(msg, meta)` with `(meta, msg)` in ne | competing-lib mention without qualifier L94: - Use `@inextlabs/logger` (via the service wrapper) - `logger.error(err, "message")` or `l
- `structured-logging`: competing-lib mention without qualifier L98: - `console.log`.
- `api-security`: competing-lib mention without qualifier L3: description: Use when hardening or reviewing an HTTP API - authenticate every route, valid
- `dependency-review`: competing-lib mention without qualifier L49: MAJOR package.json [PKG-01] "winston" added; logging must use @inextlabs/logger.

## Evidence path verification

Every file path cited in `tools/evidence.js` (A and B columns, excluding `node_modules` and `gap`/`declared` notes) exists in the reference repositories (wildcards matched by prefix).
