# Assumptions and Limitations

## Method and scope
1. Evidence is limited to two repositories (`inflow-config-service-repo`, `inflow-usage-enforcement-service`) and the **installed** `@inextlabs/*` packages in their `node_modules` (declarations, README, small sources). Other repositories in `D:\DEV` were not analysed. "Organization-wide" claims therefore rest on two services; single-repo findings are marked E2/E3 rather than organization-wide.
2. Neither reference repository was modified. Files exist only under `D:\DEV\.claude\organization-llm-skills`.
3. `.env` files exist in both working trees and were deliberately **not opened**; only `.env.example` was read. No secret value appears in this output. If a real secret is present in any working file it should be rotated — location only is reported here (`.env` in both repos, git-ignored).
4. Package behaviour was read from the versions installed (`logger` 1.0.4, `platform-errors` 1.0.1, `azure-oauth` 1.0.7) plus `inflow-usage-utils` 1.3.0 (read as evidence only; excluded from the ecosystem by owner decision 2026-11-16). Later versions may change APIs.
5. The config repo's `docs/ENGINEERING_STANDARDS_MATRIX.md` (an earlier analysis of the same repo) was used as a lead and every cited claim that was used was re-verified in source; two corrections were made (outbox backoff is **linear**; `safe*` cache wrappers exist as `const` exports).

## What is treated as "organization-mandated"
Only (a) the task brief (internal logger, error-code composition, data-fetching/propagation pattern), (b) `ARCH-LLD-003` and `ADR-004` as cited in source comments (the documents themselves were not available), (c) the "Organisation standards (ADR defaults)" sections of the repos' own skills (correlation ID, idempotency). The ADR documents ARCH-LLD-003, ADR-004, LLD-002 and the "API/LOGGING/ERROR_HANDLING_STANDARDS.md" documents referenced from the shared package live in other repositories and were **not read**; where they might refine a rule, that is flagged as an assumption in the relevant standard.

## Not verified at runtime
- Whether Service Bus topics have duplicate detection enabled; which Azure hosting service runs the images; how secrets are injected in production; real Redis/Mongo tiers (transactions support).
- No tests, builds or pipelines were executed.
- Behaviour of `@inextlabs/azure-oauth` was read from `src`, not exercised.

## Limits of the generated skills
- Skills encode conventions and checklists; they cannot guarantee a model's output. Their strength depends on the host loading the right skills (see README "Using the skills").
- 195 skills in a nested layout are not auto-discovered by tools that expect a flat `.claude/skills/<name>/SKILL.md`; `tools/install-skills.ps1` flattens them on demand.
- 27 of 195 skills (14 %) are GENERIC baselines (E0) with no organizational implementation; they are labelled and must not be cited as standards.
- Stack coverage: Node.js/TypeScript/Express only (Layer B). Layer C adapters for other stacks are intentionally *not* invented.
- Domain-specific logic of the reference services (subscriptions, entitlements, usage thresholds, pricing data) is out of scope except where it demonstrates a reusable pattern.
- Examples are condensed from reference patterns and rewritten generically; they are illustrative, not compiled.

## Assumptions
- A = `config`, B = `enforcement` are representative of the estate's Node services; the older `v1` surface of A is legacy.
- "devtest, staging, main" branches map to environments as the pipelines indicate.
- `ADR-004`'s 8-digit scheme `P(1)+SS(2)+MM(2)+EEE(3)` is correct as implemented in the shared registry; the user's formula `PLATFORM_CODE + SERVICE_CODE + MODULE_NUM + "001"` is its sequence-one instance.
