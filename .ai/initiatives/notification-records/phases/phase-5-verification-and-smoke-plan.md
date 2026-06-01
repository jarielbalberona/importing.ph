# Phase 5: Verification And Smoke Plan

Status: passed_with_issues

## Goal

Run final automated verification and manual smoke for DB-backed notification records.

## Scope

- Final automated verification.
- Manual smoke against local app when environment permits.
- Final phase report.
- Final initiative report.
- State updates required by execution skill.

Allowed file changes during execution:

- `.ai/initiatives/notification-records/phases/phase-5-verification-and-smoke-plan.md`
- `.ai/initiatives/notification-records/reports/*`
- `.ai/initiatives/notification-records/00-overview.md` for lifecycle metadata only
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- New feature implementation unless repairing a failure from prior allowed scope.
- Email delivery.
- Push notifications.
- Queues, workers, cron, event buses, or Redis.
- Admin tooling.
- Analytics.
- Payments, tracking, escrow, reviews, or public SEO.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Phase 4 report.
- Local importer account.
- Local forwarder account.
- Posted request fixture.
- Quote fixture.
- Conversation/message fixture.

## Tasks

- Run final automated commands in order.
- Start local app only if needed for manual smoke.
- Smoke quote submission creates importer notification.
- Smoke message reply creates recipient notification.
- Smoke quote acceptance/rejection creates forwarder notification.
- Smoke users cannot read others' notifications.
- Smoke read/unread behavior if implemented.
- Create `reports/final-report.md`.
- Update required state files according to execution skill.

## Verification Commands

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

## Manual Smoke Cases

- Quote submission creates importer notification.
- Message reply creates recipient notification.
- Quote acceptance/rejection creates forwarder notification.
- Users cannot read others' notifications.
- Read/unread behavior works if implemented.

## Expected Evidence

- Automated commands pass or exact failures/skips are recorded.
- Smoke records account/profile, route/action, expected result, and observed result.
- Final report states `PASS`, `PASS WITH ISSUES`, or `FAIL`.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Build failures.
- Missing imports.
- Formatting issues.
- Minor contract mismatches inside this initiative.

Hard-stop instead of repairing when:

- Required request/quote/message/auth fixtures are unavailable.
- Failure requires email delivery, push notifications, queues, workers, cron, event bus, admin tooling, analytics, payment, escrow, tracking, reviews, or public SEO scope.
- Failure requires product decisions about matching, expiration, recipient fanout, or notification failure policy.
- Same failure persists after three repair attempts.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.

## Completion Notes

Executed on 2026-06-01.

- Final automated verification passed: `db:migrate`, `db:check`, `type-check`, `lint`, and `build`.
- Runner check-only passed.
- Browser smoke proved quote submission creates importer notification, mark-read works, quote acceptance creates forwarder notification, message send creates forwarder notification, and forwarder cannot see importer-only notification.
- Database smoke confirmed three notification rows with deterministic dedupe keys and expected read state before cleanup.
- Smoke request cleanup removed request, quote, conversation, and notification rows by exact request id.
- Accepted issues: dev server restart was required after a stale server-action overlay, and browser text fill required keypress fallback.
