# Phase 2: Notification Domain Schema Plan

Status: passed

## Goal

Define and implement durable notification records with recipient ownership, typed source references, read state, dedupe, and indexes.

## Scope

- Notification type model.
- Notification table.
- Recipient and actor references.
- Source entity references.
- Read/unread state.
- Dedupe/idempotency constraint.
- Recipient list/read indexes.
- Migration generation and local migration proof.

Allowed file changes during execution, only if needed:

- `db/schema.ts`
- `drizzle/**`
- `lib/**` for notification model/query helpers
- `.ai/initiatives/notification-records/phases/phase-2-notification-domain-schema-plan.md`
- `.ai/initiatives/notification-records/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Event integration.
- Notification UI.
- Email sending.
- Queues, workers, cron, or event bus.
- Push notifications.
- Analytics.

## Inputs

- Phase 1 report.
- Completed dependency schemas.
- Current Drizzle schema/migrations.
- Product privacy rules.

## Tasks

- Define allowed notification types.
- Define `notifications` table.
- Add recipient user profile reference.
- Add actor user profile reference where needed.
- Add typed source references.
- Add `read_at`.
- Add deterministic `dedupe_key` unique constraint.
- Add recipient/read indexes.
- Generate and apply migration.

## Verification Commands

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`

## Expected Evidence

- Notification schema exists.
- Migration applies.
- Drizzle check passes.
- Type-check passes.
- Phase report documents dedupe and index strategy.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Drizzle schema/migration generation drift.
- Minor enum/constraint/index mismatch inside notification scope.

Hard-stop instead of repairing when:

- Recipient ownership cannot be represented safely.
- Source references are ambiguous.
- Destructive migration is required.
- Product asks for email delivery, push, analytics, queues, workers, cron, or event bus scope.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.

## Completion Notes

Executed on 2026-06-01.

- Added `notification_type` enum with currently implementable V1 events.
- Added `notifications` table with recipient, optional actor, typed source references, read state, dedupe key, and indexes.
- Generated and applied additive migration `drizzle/0006_legal_azazel.sql`.
- `npm run db:migrate`, `npm run db:check`, and `npm run type-check` passed against the confirmed local development database target.
- PostgreSQL emitted one identifier truncation notice for a generated FK name; Drizzle check passed and no repair was required.
