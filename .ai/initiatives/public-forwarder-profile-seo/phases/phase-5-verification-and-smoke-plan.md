# Phase 5: Verification And Smoke Plan

Status: pending

## Goal

Run final automated verification and manual smoke if public profile/SEO implementation proceeds.

## Scope

- Final automated verification.
- Manual smoke if routes are implemented.
- Final phase report.
- Final initiative report if executed.
- State updates required by execution skill.

Allowed file changes during execution:

- `.ai/initiatives/public-forwarder-profile-seo/phases/phase-5-verification-and-smoke-plan.md`
- `.ai/initiatives/public-forwarder-profile-seo/reports/*`
- `.ai/initiatives/public-forwarder-profile-seo/00-overview.md` for lifecycle metadata only
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- New feature implementation unless repairing a failure from prior approved scope.
- CMS.
- Articles.
- Reviews/ratings.
- Private marketplace data.
- Payments, tracking, escrow, analytics, ERP, subscriptions.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Phase 4 report.
- Public visible forwarder fixture if implementation proceeds.
- Suspended/hidden forwarder fixture if implementation proceeds.

## Tasks

- Confirm whether initiative remained deferred or implementation proceeded.
- If deferred, record deferral reason and do not run app verification.
- If implemented, run final automated commands in order.
- If implemented, smoke public profile public-safe rendering.
- If implemented, smoke private data absence.
- If implemented, smoke suspended forwarder behavior.
- If implemented, smoke metadata rendering.
- Create `reports/final-report.md` only if execution proceeds through completion.
- Update required state files according to execution skill.

## Verification Commands

- `npm run type-check`
- `npm run lint`
- `npm run build`

## Manual Smoke Cases

- Public profile renders only public-safe data.
- Private marketplace data is not exposed.
- Suspended forwarder behavior matches product rules.
- Metadata renders correctly if implemented.

## Expected Evidence

- If deferred, report clearly states no implementation was performed.
- If implemented, automated commands pass or exact failures/skips are recorded.
- If implemented, smoke records route, expected result, and observed result.
- If implemented, final report states `PASS`, `PASS WITH ISSUES`, or `FAIL`.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Build failures.
- Missing imports.
- Formatting issues.
- Minor contract mismatches inside this initiative.

Hard-stop instead of repairing when:

- Marketplace loop dependencies are unavailable.
- Public profile fixture or slug/visibility data is unavailable.
- Failure requires CMS, articles, reviews/ratings, private marketplace exposure, payments, tracking, escrow, analytics, ERP, subscriptions, queue, Redis, WebSocket, microservice, Prisma, Express, AWS, or Terraform.
- Same failure persists after three repair attempts.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- If implementation proceeds and needs fixture public profiles, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed public-visible and hidden/suspended forwarder profile fixtures with deterministic slugs/prefixes. If a needed fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic slug prefix or test account id. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, public-safe fields, slug uniqueness, visibility controls, suspended-forwarder behavior, or private marketplace data exposure.

## Completion Notes

Filled by the execution skill or runner.
