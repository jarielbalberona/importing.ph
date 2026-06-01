# Phase 3: Event Integration Plan

Status: passed

## Goal

Create notification records from real request, quote, quote-decision, and messaging actions.

## Scope

- Notification creation helper.
- Quote-submitted notification.
- Message-replied notification.
- Quote-accepted/rejected notification.
- New-matching-request notification only if safe matching exists.
- Quote-expiring-soon notification only if no async infrastructure is required.
- Failure behavior and transaction boundaries.

Allowed file changes during execution, only if needed:

- `lib/**` for notification creation helpers
- request/quote/message action files created by dependencies
- `.ai/initiatives/notification-records/phases/phase-3-event-integration-plan.md`
- `.ai/initiatives/notification-records/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Notification UI.
- Email sending.
- Push notifications.
- Queues, workers, cron, event bus, or Redis.
- Admin tooling.
- Analytics.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Notification schema.
- Existing request, quote, quote-decision, and message action code.

## Tasks

- Add idempotent notification creation helper.
- Integrate quote-submitted notification to importer owner.
- Integrate message-created notification to opposite participant.
- Integrate quote-accepted/rejected notifications to submitting forwarder members.
- Integrate new-matching-request notification only if matching rules are available and safe.
- Integrate quote-expiring-soon only if no background scheduler is required.
- Document skipped requested events with exact reason.
- Document notification failure policy.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Event integrations compile.
- Dedupe behavior is used by each integration.
- Notification recipient derivation is server-side and ownership-aware.
- Skipped event types are documented with reasons.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Missing imports.
- Minor helper/action mismatch inside notification scope.

Hard-stop instead of repairing when:

- Event source is missing.
- Recipient derivation is ambiguous.
- Notification would leak private quote or message details.
- Failure policy requires product decision.
- Implementation needs queue, worker, cron-heavy scheduler, event bus, email delivery, or push infrastructure.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.

## Completion Notes

Executed on 2026-06-01.

- Added idempotent notification helper functions in `lib/notifications.ts`.
- Integrated quote-submitted notifications for importer owners.
- Integrated quote-accepted and quote-rejected notifications for the submitting forwarder member.
- Integrated message-received notifications for the opposite participant.
- Skipped new matching request notifications because no safe matching rules exist.
- Skipped quote-expiring-soon notifications because no scheduler/opportunistic behavior is approved.
- Notification writes are best-effort and deduped; they do not corrupt core marketplace actions.
