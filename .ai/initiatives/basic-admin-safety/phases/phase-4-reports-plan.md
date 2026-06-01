# Phase 4: Reports Plan

Status: passed_with_issues

## Goal

Define and implement minimal safety reports only if they are still needed and can stay small.

## Scope

- Report model if absent and approved.
- Report subject types.
- Report creation for safe existing subjects.
- Admin report list/detail.
- Basic report status.

Allowed file changes during execution, only if needed:

- `db/schema.ts`
- `drizzle/**`
- report creation routes/actions if justified
- `app/admin/**`
- `lib/**` for report helpers
- `.ai/initiatives/basic-admin-safety/phases/phase-4-reports-plan.md`
- `.ai/initiatives/basic-admin-safety/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Advanced report workflows.
- Assignment queues.
- SLA/status automation.
- Admin moderation platform.
- Public report pages.
- Message reports unless messaging is complete.
- Attachments.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Current request/quote schema.
- Messaging schema only if message reports are included.

## Tasks

- Confirm whether reports already exist.
- Decide whether reports are required for this initiative or can be deferred.
- If implemented, define report subject types.
- Add minimal report schema and migration.
- Add report creation only for subjects the reporter is allowed to see.
- Add admin report list/detail.
- Document skipped subject types and reasons.

## Verification Commands

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Reports are either implemented minimally or explicitly deferred with reason.
- Report subject authorization is enforced if implemented.
- Admin report view is guarded if implemented.
- Migration applies if schema changed.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Drizzle schema/migration generation drift.
- Missing imports.
- Minor query/action mismatch inside report scope.

Hard-stop instead of repairing when:

- Report subject authorization is unclear.
- Message reports are requested before messaging exists.
- Scope expands into moderation workflow or support dashboard.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.

## Completion Notes

Reports were explicitly deferred for V1. No report schema, report routes, or moderation workflow were added because current product memory does not require reporting to prove the marketplace loop or admin suspension safety, and adding report subjects would expand the scope into a moderation workflow.

Verification passed with no schema changes generated.
