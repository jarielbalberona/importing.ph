# Phase 5: Verification And Smoke Plan

Status: passed_with_issues

## Goal

Run final automated verification and browser/manual smoke for quote-gated messaging.

## Scope

- Final automated verification.
- Browser/manual smoke against local app when environment permits.
- Final phase report.
- Final initiative report.
- State updates required by execution skill.

Allowed file changes during execution:

- `.ai/initiatives/quote-gated-messaging/phases/phase-5-verification-and-smoke-plan.md`
- `.ai/initiatives/quote-gated-messaging/reports/*`
- `.ai/initiatives/quote-gated-messaging/00-overview.md` for lifecycle metadata only
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- New feature implementation unless repairing a failure from prior allowed scope.
- Realtime messaging.
- Notifications.
- Attachments.
- Payments.
- Tracking.
- Admin inspection.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Phase 4 report.
- Local importer account.
- At least two local forwarder company accounts.
- Posted request fixture.
- Quote fixture from Forwarder A.
- No-quote case for Forwarder B or equivalent competitor fixture.

## Tasks

- Run final automated commands in order.
- Start local app only if needed for browser smoke.
- Smoke messaging blocked before quote.
- Smoke messaging opens after quote.
- Smoke importer sends message to quoting forwarder.
- Smoke quoting forwarder sends message to importer.
- Smoke competitor forwarder cannot access conversation.
- Smoke unrelated importer cannot access conversation.
- Create `reports/final-report.md`.
- Update required state files according to execution skill.

## Verification Commands

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

## Browser / Manual Smoke Cases

- Messaging blocked before quote.
- Messaging opens after quote.
- Importer can message quoting forwarder.
- Quoting forwarder can message importer.
- Competitor forwarder cannot access conversation.
- Unrelated importer cannot access conversation.

## Expected Evidence

- Automated commands pass or exact failures/skips are recorded.
- Smoke records account/company, route, expected result, and observed result.
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

- Required request/quote/auth fixtures are unavailable.
- Failure requires realtime messaging, notifications, attachments, admin inspection, payment, escrow, or tracking scope.
- Failure requires product decisions about quote gate, participant access, or admin visibility.
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
- Browser smoke proved no-quote messaging is blocked, messaging opens after quote, importer can message quoting forwarder, quoting forwarder can reply, competitor forwarder cannot read messages, and unrelated importer cannot read messages.
- Smoke fixture used local development database only and was cleaned up by exact request/user/company identifiers.
- Accepted issue: in-app browser navigation timing caused one premature URL assertion and one route navigation timeout even though the page rendered correctly after settling.
