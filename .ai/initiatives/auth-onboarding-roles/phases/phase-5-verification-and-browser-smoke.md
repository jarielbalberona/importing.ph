# Phase 5: Verification And Browser Smoke

Status: passed

## Goal

Run final automated verification and browser smoke for auth, onboarding, redirects, and wrong-role access.

## Scope

- Automated command execution.
- Browser smoke against local app when Clerk test environment is available.
- Final phase report.
- Final initiative report.
- State updates required by execution skill.

Allowed file changes during execution:

- `.ai/initiatives/auth-onboarding-roles/phases/phase-5-verification-and-browser-smoke.md`
- `.ai/initiatives/auth-onboarding-roles/reports/*`
- `.ai/initiatives/auth-onboarding-roles/00-overview.md` for lifecycle metadata only
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Application code changes unless a previous phase left an allowed repair incomplete.
- New auth features.
- New marketplace features.
- Production Clerk or production database testing.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Phase 4 report.
- Local Clerk test environment.
- Local database environment.

## Tasks

- Run final automated commands in order.
- Start local app only if required for browser smoke and document command/URL.
- Smoke sign-in and sign-up routes.
- Smoke first-login redirect to `/onboarding`.
- Smoke importer onboarding redirect to `/app/requests`.
- Smoke forwarder onboarding redirect to `/app/forwarder/requests`.
- Smoke wrong-role route access for importer and forwarder accounts.
- Document admin route handling.
- Create `reports/final-report.md`.
- Update required state files according to the execution skill.

## Verification Commands

- `npm run db:migrate`
- `npm run db:check`
- `npm run db:prove-onboarding`
- `npm run type-check`
- `npm run lint`
- `npm run build`

## Browser Smoke Cases

- Signed-out user visits `/after-auth`; expected Clerk sign-in protection.
- Signed-in test user with no PostgreSQL profile visits `/after-auth`; expected `/onboarding`.
- New importer test user completes onboarding; expected `/app/requests`.
- New forwarder test user completes onboarding; expected `/app/forwarder/requests`.
- Importer visits `/app/forwarder/requests`; expected no access to forwarder page.
- Forwarder visits `/app/requests`; expected no access to importer page.
- Existing onboarded user visits `/onboarding`; expected role destination.
- Admin route `/admin`; expected only database `admin` role can access it; admin provisioning remains out of scope.

## Expected Evidence

- Every automated command exits `0` or is documented with exact failure/skip reason and impact.
- Browser smoke records account type, route, expected result, and observed result.
- Final report states `PASS`, `PASS WITH ISSUES`, or `FAIL`.
- Final report states whether auth/onboarding/role truth is ready for marketplace feature work.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Build failures.
- Missing imports.
- Formatting issues.
- Minor contract mismatches inside this initiative's auth/onboarding scope.

Hard-stop instead of repairing when:

- Clerk test accounts or environment are unavailable.
- Browser smoke would require production accounts/data.
- Failure requires product decisions around wrong-role UX or admin provisioning.
- Same failure persists after three repair attempts.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
