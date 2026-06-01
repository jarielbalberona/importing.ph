# Phase 3: Suspension Safety Action Plan

Status: passed

## Goal

Implement minimal suspension state and enforce it on forwarder quote submission.

## Scope

- Suspension model for forwarder company and/or user profile.
- Admin suspend action.
- Optional unsuspend action only if needed for verification.
- Quote submission suspension check.
- Suspended signed-in user behavior.
- Minimal audit fields for safety action.

Allowed file changes during execution, only if needed:

- `db/schema.ts`
- `drizzle/**`
- `app/admin/**`
- quote submission action/helper files from dependencies
- `lib/**` for suspension/admin helpers
- `.ai/initiatives/basic-admin-safety/phases/phase-3-suspension-safety-action-plan.md`
- `.ai/initiatives/basic-admin-safety/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Document verification.
- Manual approval pipeline.
- Clerk account disabling.
- Full audit log unless required.
- CRM/support tooling.
- Payments, escrow, tracking, reviews, analytics.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Quote submission implementation from dependency.
- Current profile and forwarder company schema.

## Tasks

- Decide whether to model forwarder-company suspension, user suspension, or both.
- Add suspension fields or table.
- Add minimal action reason and admin actor fields.
- Add admin suspend action.
- Add unsuspend only if needed for smoke and still simple.
- Add quote submission suspension check.
- Define signed-in suspended user behavior.
- Generate and apply migration if schema changed.

## Verification Commands

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Suspension schema exists if needed.
- Migration applies if schema changed.
- Admin suspend action is admin-only.
- Suspended forwarder cannot submit quote.
- Normal forwarder can still submit quote.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Drizzle schema/migration generation drift.
- Missing imports.
- Minor query/action mismatch inside suspension scope.

Hard-stop instead of repairing when:

- Suspension target is ambiguous.
- Product requires disabling Clerk accounts.
- Migration would be destructive.
- Quote submission enforcement cannot be made server-side.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.

## Completion Notes

Executed on 2026-06-01.

- Added forwarder-company suspension fields.
- Added admin-only suspend and unsuspend actions.
- Added suspension controls to `/admin`.
- Added server-side quote-submission block for suspended forwarder companies.
- Chose not to disable Clerk accounts; suspended users can sign in but suspended forwarder companies cannot quote.
- Generated and applied additive migration `drizzle/0007_dry_firebird.sql`.
