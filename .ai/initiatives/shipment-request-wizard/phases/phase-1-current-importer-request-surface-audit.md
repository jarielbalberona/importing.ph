# Phase 1: Current Importer Request Surface Audit

Status: passed

## Goal

Document current importer route, schema, migration, action, UI, and validation baseline before implementing request creation.

## Scope

- Inspect importer route.
- Inspect schema and migration structure.
- Inspect server action and validation conventions.
- Inspect UI primitives and form conventions.
- Identify gaps for shipment request work.

Allowed file changes during execution:

- `.ai/initiatives/shipment-request-wizard/phases/phase-1-current-importer-request-surface-audit.md`
- `.ai/initiatives/shipment-request-wizard/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Application code changes.
- Schema changes.
- Migration generation.
- Wizard implementation.
- Browser smoke.

## Inputs

- Completed or accepted dependency reports.
- `app/app/requests/page.tsx`
- `db/schema.ts`
- `drizzle/`
- `app/onboarding/actions.ts`
- `lib/onboarding.ts`
- `lib/authz.ts`
- `lib/routes.ts`
- `components/ui/*`
- `package.json`

## Tasks

- Confirm dependencies are complete or explicitly accepted.
- Record current importer route behavior.
- Record current absence of request schema/actions.
- Record current validation and server action patterns.
- Record current UI primitives available.
- Identify exact implementation gaps for later phases.

## Verification Commands

- `git status --short`
- `test -f app/app/requests/page.tsx`
- `test -f db/schema.ts`
- `test -d drizzle`
- `test -f lib/authz.ts`
- `test -f lib/routes.ts`
- `test -f components/ui/button.tsx`
- `test -f components/ui/input.tsx`
- `test -f components/ui/label.tsx`

## Expected Evidence

- Phase report documents baseline and gaps.
- No application code changed.

## Repair Policy

Allowed repairs:

- Initiative/report wording only.

Hard-stop instead of repairing when:

- Dependencies are incomplete and not explicitly accepted.
- Current repo truth contradicts this initiative objective.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
