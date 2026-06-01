# Phase 5: Verification And Privacy Smoke Plan

Status: passed_with_issues

## Goal

Run final automated verification and browser/manual smoke for forwarder open request browsing and privacy boundaries.

## Scope

- Final automated verification.
- Browser/manual smoke against local app when environment permits.
- Final phase report.
- Final initiative report.
- State updates required by execution skill.

Allowed file changes during execution:

- `.ai/initiatives/forwarder-open-requests/phases/phase-5-verification-and-privacy-smoke-plan.md`
- `.ai/initiatives/forwarder-open-requests/reports/*`
- `.ai/initiatives/forwarder-open-requests/00-overview.md` for lifecycle metadata only
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- New feature implementation unless repairing a failure from prior allowed scope.
- Quote submission.
- Messaging.
- Notifications.
- File storage.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Phase 4 report.
- Local forwarder and importer test accounts.
- Posted/open request fixture from shipment-request flow.

## Tasks

- Run final automated commands in order.
- Start local app only if needed for browser smoke.
- Smoke forwarder can see posted request.
- Smoke importer cannot access forwarder route.
- Smoke unauthenticated user redirects.
- Smoke draft/closed/cancelled requests are not exposed.
- Smoke quote count behavior if implemented.
- Inspect rendered output/query boundary for forbidden competitor quote fields.
- Create `reports/final-report.md`.
- Update required state files according to execution skill.

## Verification Commands

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

## Browser / Manual Smoke Cases

- Forwarder can see posted request.
- Importer cannot access forwarder open request route.
- Unauthenticated user redirects.
- Draft requests are not exposed.
- Closed/cancelled requests are not exposed if statuses exist.
- Quote count is allowed if safely implemented.
- Competitor quote details are not exposed.

## Expected Evidence

- Automated commands pass or exact failures/skips are recorded.
- Browser/manual smoke records account type, route, expected result, and observed result.
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

- Required request fixtures or auth environment are unavailable.
- Failure requires quote submission, messaging, notifications, or storage scope.
- Failure requires product decisions about suspended forwarders or request visibility.
- Same failure persists after three repair attempts.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
