# Phase 5: Verification And Smoke Plan

Status: passed_with_issues

## Goal

Run final automated verification and manual smoke for basic admin safety.

## Scope

- Final automated verification.
- Manual smoke against local app when environment permits.
- Final phase report.
- Final initiative report.
- State updates required by execution skill.

Allowed file changes during execution:

- `.ai/initiatives/basic-admin-safety/phases/phase-5-verification-and-smoke-plan.md`
- `.ai/initiatives/basic-admin-safety/reports/*`
- `.ai/initiatives/basic-admin-safety/00-overview.md` for lifecycle metadata only
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- New feature implementation unless repairing a failure from prior allowed scope.
- Full CRM/support dashboard.
- Document verification.
- Payments, escrow, tracking, reviews, analytics, subscriptions.
- Queues, Redis, WebSockets, microservices, Prisma, Express, AWS, Terraform.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Phase 4 report.
- Local admin account.
- Local non-admin account.
- Local forwarder account.
- Posted request fixture.
- Quote submission fixture.

## Tasks

- Run final automated commands in order.
- Start local app only if needed for manual smoke.
- Smoke non-admin cannot access admin routes.
- Smoke admin can view users.
- Smoke admin can view requests.
- Smoke admin can view quotes.
- Smoke admin can suspend forwarder.
- Smoke suspended forwarder cannot submit quote.
- Smoke normal forwarder can still submit quote.
- Create `reports/final-report.md`.
- Update required state files according to execution skill.

## Verification Commands

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

## Manual Smoke Cases

- Non-admin cannot access admin routes.
- Admin can view users.
- Admin can view requests.
- Admin can view quotes.
- Admin can suspend forwarder.
- Suspended forwarder cannot submit quote.
- Normal forwarder can still submit quote.

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

- Required admin/request/quote/auth fixtures are unavailable.
- Failure requires CRM, document verification, payments, escrow, tracking, reviews, analytics, subscriptions, public SEO, queue, Redis, WebSocket, microservice, Prisma, Express, AWS, or Terraform scope.
- Failure requires product decisions about suspension target, signed-in suspended users, admin visibility, or report workflow.
- Same failure persists after three repair attempts.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.

## Completion Notes

Final automated verification passed. Browser smoke passed for admin access, read views, forwarder-company suspension, suspended quote blocking, normal forwarder quote submission, non-admin admin-route denial, and exact fixture cleanup.

The phase is `passed_with_issues` because the first suspension smoke attempt targeted the wrong forwarder company due multiple admin forms. The fixture was reset by exact local IDs, the admin UI action was rerun with a scoped Forwarder A article locator, and the full smoke passed.
