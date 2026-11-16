# Organizational Compliance Report

Generated 2026-11-14.

## Compliance-section coverage

| Item | Count |
|---|---|
| Skills | 195 |
| Skills with the "Organizational Compliance Rules" section (15 rules) | 195 |
| Skills carrying skill-specific MANDATORY rules | 193 |
| Skills explicitly labelled GENERIC baseline (E0) | 27 |
| Skills built on partial/defective evidence (E3) | 10 |

## Cross-cutting checks (task §15 B–F)

| Check | Method | Result |
|---|---|---|
| `@inextlabs/logger` named in skills | grep | 21 skills |
| Competing logger mentioned without prohibition/qualifier | grep (winston/pino/bunyan) | none |
| `console.*` recommended anywhere | grep | none (only prohibitions) |
| Error-code composition stated identically | grep `PLATFORM_CODE + SERVICE_CODE + MODULE_NUM` | 2 skills (canonical: `error-code-standards`; others reference it) |
| Legacy code schemes presented as acceptable | grep `50xxx`/`INXT50` | none (only labelled legacy) |
| Unresolved items presented as mandatory | Manual: every UNRESOLVED tag is rendered "do not enforce; report"; conflicts C-01..C-22 in `conflicts-and-open-decisions.md` | 30 skills carry UNRESOLVED notes, none tagged MANDATORY on the contested point |
| Skills depend on a reference repo path/namespace | hard check | 0 violations |

## Standards usage

| Standard | Governing skills |
|---|---|
| `PKG-01` | 14 |
| `ARCH-01` | 7 |
| `ARCH-02` | 12 |
| `ARCH-03` | 11 |
| `ARCH-04` | 11 |
| `ARCH-05` | 8 |
| `ARCH-06` | 5 |
| `ARCH-07` | 6 |
| `API-01` | 2 |
| `API-02` | 7 |
| `API-03` | 9 |
| `API-04` | 6 |
| `API-05` | 9 |
| `API-06` | 6 |
| `API-07` | 6 |
| `API-08` | 11 |
| `API-09` | 5 |
| `API-10` | 13 |
| `CTX-01` | 13 |
| `CTX-02` | 9 |
| `CTX-03` | 6 |
| `CTX-04` | 11 |
| `CTX-05` | 4 |
| `ERR-01` | 3 |
| `ERR-02` | 15 |
| `ERR-03` | 6 |
| `ERR-04` | 2 |
| `ERR-05` | 7 |
| `ERR-06` | 6 |
| `ERR-07` | 5 |
| `ERR-08` | 4 |
| `ERR-09` | 15 |
| `CFG-01` | 15 |
| `CFG-02` | 10 |
| `CFG-03` | 6 |
| `CFG-04` | 14 |
| `CFG-05` | 14 |
| `CFG-06` | 10 |
| `CFG-07` | 9 |
| `OBS-01` | 12 |
| `OBS-02` | 7 |
| `OBS-03` | 12 |
| `OBS-04` | 9 |
| `OBS-05` | 5 |
| `OBS-06` | 4 |
| `OBS-07` | 2 |
| `DB-01` | 3 |
| `DB-02` | 4 |
| `DB-03` | 4 |
| `DB-04` | 7 |
| `DB-05` | 9 |
| `DB-06` | 3 |
| `DB-07` | 3 |
| `MSG-01` | 7 |
| `MSG-02` | 4 |
| `MSG-03` | 13 |
| `MSG-04` | 8 |
| `MSG-05` | 7 |
| `MSG-06` | 6 |
| `MSG-07` | 6 |
| `INT-01` | 11 |
| `INT-02` | 8 |
| `INT-03` | 4 |
| `INT-04` | 1 |
| `INT-05` | 3 |
| `INT-06` | 7 |
| `SEC-01` | 10 |
| `SEC-02` | 10 |
| `SEC-03` | 10 |
| `SEC-04` | 3 |
| `SEC-05` | 5 |
| `SEC-06` | 10 |
| `SEC-07` | 2 |
| `SEC-08` | 2 |
| `SEC-09` | 3 |
| `RES-01` | 9 |
| `RES-02` | 13 |
| `RES-03` | 7 |
| `RES-04` | 3 |
| `RES-05` | 3 |
| `RES-06` | 4 |
| `RES-07` | 3 |
| `RES-08` | 1 |
| `LLM-01` | 9 |
| `LLM-02` | 2 |
| `LLM-03` | 3 |
| `TEST-01` | 7 |
| `TEST-02` | 6 |
| `TEST-03` | 7 |
| `TEST-04` | 4 |
| `TEST-05` | 2 |
| `DOC-01` | 8 |
| `OPS-01` | 5 |
| `OPS-02` | 9 |
| `OPS-03` | 2 |
| `OPS-04` | 4 |

## Classification of skills (first token of classification)

- VERIFIED: 131
- GENERIC: 30
- MANDATED: 10
- TECH: 10
- PARTIAL: 9
- UNRESOLVED: 2
- derived: 2
- GENERIC;: 1

## Known compliance limits (honest)

- Skills instruct assistants to enforce standards; compliance of a future implementation cannot be proven by this repository — only by running the skills' checklists and the `code-review` family against real diffs.
- 23 open conflicts/decisions (see governance) mean some contract details (error MODULE_NUM policy, success envelope `message`, pagination shape, idempotency store, correlation trust policy, APM stack) are intentionally **not** enforced as rules.
