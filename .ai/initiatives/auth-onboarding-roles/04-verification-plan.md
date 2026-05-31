# Verification Plan

## Verification Philosophy

Auth work is not done because the route compiles. It is done when first-login, onboarding, idempotency, redirects, and wrong-role access are proven.

Do not claim browser smoke success unless the exact account type, route, expected outcome, and observed outcome are recorded.

## Dependency Verification

Before Phase 1 execution:

- Confirm `local-db-migration-proof` has a final report with a passing or explicitly accepted result.
- If not, stop before executing and ask the human whether to complete or accept that dependency.

## Phase 1 Verification

Commands:

- `git status --short`
- `test -f proxy.ts`
- `test -f app/after-auth/page.tsx`
- `test -f app/onboarding/page.tsx`
- `test -f app/onboarding/actions.ts`
- `test -f lib/authz.ts`
- `test -f lib/onboarding.ts`
- `test -f lib/routes.ts`
- `test -f db/schema.ts`
- `test -f scripts/prove-onboarding.ts`

Expected evidence:

- Current auth/onboarding surfaces exist.
- Phase report documents current implementation truth and gaps.
- No application behavior changes are made in Phase 1.

## Phase 2 Verification

Commands:

- `npm run db:prove-onboarding`
- `npm run type-check`

Expected evidence:

- Importer path creates and reads `user_profiles` and `importer_profiles`.
- Retry/idempotency behavior is verified or a narrow gap is documented and fixed.
- Importer redirect expectation is documented as `/app/requests`.

## Phase 3 Verification

Commands:

- `npm run db:prove-onboarding`
- `npm run type-check`

Expected evidence:

- Forwarder path creates and reads `user_profiles`, `forwarder_companies`, and `forwarder_members`.
- Forwarder membership is owner-scoped according to current schema.
- Retry/idempotency behavior is verified or a narrow gap is documented and fixed.
- Forwarder trust status is documented as not currently modeled.
- Forwarder redirect expectation is documented as `/app/forwarder/requests`.

## Phase 4 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence:

- Importer route is guarded by `requireRole(["importer"])`.
- Forwarder route is guarded by `requireRole(["forwarder"])`.
- Admin route is guarded by `requireRole(["admin"])`.
- `/after-auth` sends profile-less users to `/onboarding`.
- Wrong-role behavior is documented and verified.
- Admin provisioning remains out of scope.

## Phase 5 Automated Verification

Commands:

- `npm run db:migrate`
- `npm run db:check`
- `npm run db:prove-onboarding`
- `npm run type-check`
- `npm run lint`
- `npm run build`

Expected evidence:

- Every command exits `0`, or skipped/failed commands are documented with exact reason and impact.
- Final report states whether auth/onboarding/role truth is ready for marketplace feature work.

## Phase 5 Browser Smoke

Smoke cases:

- Signed-out user visits `/after-auth`; expected: Clerk sign-in protection.
- Signed-in test user with no PostgreSQL profile visits `/after-auth`; expected: redirect to `/onboarding`.
- New importer test user submits onboarding; expected: redirect to `/app/requests`.
- New forwarder test user submits onboarding; expected: redirect to `/app/forwarder/requests`.
- Importer test user visits `/app/forwarder/requests`; expected: cannot access forwarder page and is redirected according to current guard behavior.
- Forwarder test user visits `/app/requests`; expected: cannot access importer page and is redirected according to current guard behavior.
- Existing onboarded test user visits `/onboarding`; expected: redirect to their role destination.
- Admin route `/admin`; expected: only a database role of `admin` can access it, but admin provisioning is not implemented by onboarding.

Browser smoke can be skipped only if Clerk test credentials or browser environment are unavailable. If skipped, record impact clearly; do not call the initiative fully proven.

## Done Criteria

- All phases are `passed` or `passed_with_issues`.
- `reports/final-report.md` exists.
- Dependency status is recorded.
- Exact automated command results are recorded.
- Browser smoke results or explicit skip impact are recorded.
- State files are updated during execution according to the execution skill.

## Database Target And Isolation Rules

Development database is acceptable for read-only inspection and non-destructive local checks:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Do not assume port `5432`; local development PostgreSQL uses host port `55432`.

Use a dedicated test database for destructive, repeatable, or isolated auth/onboarding smoke:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_auth_onboarding_roles_test
```

Requirements:

- Run migrations against the active target before smoke: `DATABASE_URL=<target> npm run db:migrate`.
- Run schema check after migrations: `DATABASE_URL=<target> npm run db:check`.
- Seed test users with clearly prefixed Clerk ids such as `smoke_importer_auth_roles_*` and `smoke_forwarder_auth_roles_*`.
- Clean up seeded rows by exact Clerk id prefix after smoke, including `user_profiles`, `importer_profiles`, `forwarder_members`, and `forwarder_companies`.
- Never run destructive reset, fixture cleanup, or generated smoke data against a non-local database.

## Dedicated Step-By-Step Smoke Tests

### Importer Onboarding Smoke

1. Account/role: new Clerk test user intended to become importer.
2. Route: `/onboarding`.
3. Action: submit importer onboarding with full name and company name.
4. Expected UI result: redirect to `/app/requests`.
5. Expected database state: one `user_profiles` row with role `importer`; one `importer_profiles` row for that user profile.
6. Expected forbidden behavior: no `forwarder_companies` or `forwarder_members` row for this user.
7. Pass/fail: pass only if UI redirect and database rows both match.

### Forwarder Onboarding Smoke

1. Account/role: new Clerk test user intended to become forwarder.
2. Route: `/onboarding`.
3. Action: submit forwarder onboarding with full name and company name.
4. Expected UI result: redirect to `/app/forwarder/requests`.
5. Expected database state: one `user_profiles` row with role `forwarder`; one `forwarder_companies` row; one `forwarder_members` row linking the user profile to the company.
6. Expected forbidden behavior: no `importer_profiles` row for this user.
7. Pass/fail: pass only if UI redirect and database rows both match.

### Role Guard Smoke

1. Account/role: importer test account.
2. Route: `/app/forwarder/requests`.
3. Action: visit route directly.
4. Expected UI result: importer cannot view forwarder page and is redirected according to current guard behavior.
5. Expected database state: no role/profile mutation.
6. Pass/fail: pass only if protected page content is not exposed.

1. Account/role: forwarder test account.
2. Route: `/app/requests`.
3. Action: visit route directly.
4. Expected UI result: forwarder cannot view importer page and is redirected according to current guard behavior.
5. Expected database state: no role/profile mutation.
6. Pass/fail: pass only if protected page content is not exposed.
