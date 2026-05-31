# Phase 5: Verification And Smoke Plan

Status: pending

## Goal

Run final automated verification and browser smoke for importer request creation, validation, ownership, and list/detail behavior.

## Scope

- Final automated verification.
- Browser smoke against local app when environment permits.
- Final phase report.
- Final initiative report.
- State updates required by execution skill.

Allowed file changes during execution:

- `.ai/initiatives/shipment-request-wizard/phases/phase-5-verification-and-smoke-plan.md`
- `.ai/initiatives/shipment-request-wizard/reports/*`
- `.ai/initiatives/shipment-request-wizard/00-overview.md` for lifecycle metadata only
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- New feature implementation unless repairing a failure from prior allowed scope.
- Forwarder browsing.
- Quotes.
- Messaging.
- File storage.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Phase 4 report.
- Local Clerk/importer test environment.
- Local database environment.

## Tasks

- Run final automated commands in order.
- Start local app only if needed for browser smoke.
- Smoke importer request creation.
- Smoke invalid request basis rejection.
- Smoke unauthenticated redirect.
- Smoke forwarder cannot create importer request.
- Smoke created request appears in list/detail.
- Create `reports/final-report.md`.
- Update required state files according to execution skill.

## Verification Commands

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

## Browser Smoke Cases

- Importer can create request.
- Forwarder cannot create importer request.
- Unauthenticated user redirects.
- Invalid request basis is rejected.
- Created request appears in importer list.
- Created request opens in importer detail.

## Expected Evidence

- Automated commands pass or exact failures/skips are recorded.
- Browser smoke records account type, route, expected result, and observed result.
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

- Clerk/browser environment is unavailable.
- Failure requires product decisions about request domain/status.
- Failure requires forwarder browsing, quote, messaging, or storage scope.
- Same failure persists after three repair attempts.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
