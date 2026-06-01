# Phase 5: Automated And Browser Verification

Status: passed_with_issues

## Goal

Run final automated verification and privacy smoke for quote submission and quote visibility.

## Scope

- Final automated verification.
- Browser/manual privacy smoke against local app when environment permits.
- Final phase report.
- Final initiative report.
- State updates required by execution skill.

Allowed file changes during execution:

- `.ai/initiatives/quote-submission-privacy/phases/phase-5-automated-and-browser-verification.md`
- `.ai/initiatives/quote-submission-privacy/reports/*`
- `.ai/initiatives/quote-submission-privacy/00-overview.md` for lifecycle metadata only
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- New feature implementation unless repairing a failure from prior allowed scope.
- Quote acceptance/rejection.
- Messaging.
- Notifications.
- Payments.
- Tracking.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Phase 4 report.
- Local importer account.
- Two local forwarder company accounts.
- Posted request fixture.
- Suspended forwarder fixture only if suspension state exists.

## Tasks

- Run final automated commands in order.
- Start local app only if needed for browser smoke.
- Smoke Forwarder A submits quote.
- Smoke importer sees Forwarder A quote details.
- Smoke Forwarder A sees own quote details.
- Smoke Forwarder B sees request and quote count only.
- Smoke Forwarder B cannot see forbidden quote details.
- Smoke suspended forwarder cannot submit if state exists.
- Create `reports/final-report.md`.
- Update required state files according to execution skill.

## Verification Commands

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

## Privacy Smoke Cases

- Forwarder A submits quote.
- Importer sees Forwarder A quote details.
- Forwarder A sees own quote details.
- Forwarder B sees request and quote count only.
- Forwarder B cannot see Forwarder A identity, amount, transit time, inclusions, exclusions, or notes.
- Suspended forwarder cannot submit quote if suspension state exists.

## Expected Evidence

- Automated commands pass or exact failures/skips are recorded.
- Privacy smoke records account/company, route, expected result, and observed result.
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
- Failure requires quote acceptance/rejection, messaging, notification, payment, or tracking scope.
- Failure requires product decisions about revisions, suspension, or competitor visibility.
- Same failure persists after three repair attempts.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
