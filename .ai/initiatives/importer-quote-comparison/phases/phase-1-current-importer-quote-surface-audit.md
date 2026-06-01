# Phase 1: Current Importer Quote Surface Audit

Status: passed

## Goal

Document current importer request detail, quote schema/actions, status model, and visibility rules before implementing comparison and decisions.

## Scope

- Inspect completed dependency reports and artifacts.
- Inspect importer request detail routes.
- Inspect quote schema/actions/helpers.
- Inspect authz helpers.
- Inspect forwarder own-quote visibility.
- Record baseline and gaps.

Allowed file changes during execution:

- `.ai/initiatives/importer-quote-comparison/phases/phase-1-current-importer-quote-surface-audit.md`
- `.ai/initiatives/importer-quote-comparison/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Application code changes.
- Schema changes.
- Accept/reject implementation.
- Browser smoke.

## Inputs

- Completed dependency reports.
- `db/schema.ts`
- `drizzle/`
- `lib/authz.ts`
- importer request detail route.
- forwarder request/quote routes.
- quote submission and visibility helpers.

## Tasks

- Confirm dependencies are complete or explicitly accepted.
- Record current quote schema and statuses.
- Record current request status model.
- Record current importer visibility behavior.
- Record current forwarder own-quote and competitor visibility behavior.
- Identify gaps for accept/reject.

## Verification Commands

- `git status --short`
- `test -f db/schema.ts`
- `test -d drizzle`
- `test -f lib/authz.ts`
- `test -d app/app/requests`
- `test -d app/app/forwarder/requests`

## Expected Evidence

- Phase report documents baseline and gaps.
- No application code changed.

## Repair Policy

Allowed repairs:

- Initiative/report wording only.

Hard-stop instead of repairing when:

- Dependencies are incomplete and not explicitly accepted.
- Quote schema is absent.
- Importer request detail route is absent.
- Current repo truth contradicts this initiative objective.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
