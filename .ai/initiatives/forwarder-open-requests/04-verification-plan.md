# Verification Plan

## Dependency Verification

Before execution:

- Confirm `local-db-migration-proof` has a final passing or explicitly accepted report.
- Confirm `auth-onboarding-roles` has a final passing or explicitly accepted report.
- Confirm `shipment-request-wizard` has a final passing or explicitly accepted report.

If any dependency is incomplete and not accepted, stop before Phase 1 execution.

## Phase 1 Verification

Commands:

- `git status --short`
- `test -f app/app/forwarder/requests/page.tsx`
- `test -f db/schema.ts`
- `test -d drizzle`
- `test -f lib/authz.ts`
- `test -f lib/routes.ts`

Expected evidence:

- Current forwarder proof route is documented.
- Available request fields from dependency are documented.
- Missing filter support is documented.
- No application code changes in audit phase.

## Phase 2 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence:

- Forwarder-safe list/detail field map is implemented or documented.
- Forbidden quote fields are absent from DTO/query shape.
- Any quote count behavior is aggregate-only.

## Phase 3 Verification

Commands:

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`

Expected evidence:

- Forwarder list/detail compiles.
- Filters work for available fields.
- Indexes exist or are documented as unnecessary for the current data size.
- Draft/closed/cancelled requests are excluded.

## Phase 4 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence:

- Forwarder role guard exists.
- Importer access is rejected or redirected.
- Unauthenticated access is Clerk-protected.
- Suspended-forwarder behavior is implemented if a suspension state exists, or documented as not applicable.

## Phase 5 Automated Verification

Commands:

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

Expected evidence:

- Every command exits `0`, or exact failure/skip reason and impact is recorded.

## Phase 5 Browser / Manual Smoke

Smoke cases:

- Forwarder can see posted request.
- Importer cannot access forwarder open request route.
- Unauthenticated user redirects.
- Draft requests are not exposed.
- Closed/cancelled requests are not exposed if those statuses exist.
- Quote count is shown only if safely implemented.
- Competitor quote details are not exposed.

Browser smoke can be skipped only if auth/browser environment or seeded posted requests are unavailable. If skipped, record impact clearly; do not call the initiative fully proven.

## Done Criteria

- All phases reach `passed` or `passed_with_issues`.
- `reports/final-report.md` exists.
- Privacy field map is recorded.
- Automated verification evidence is recorded.
- Browser/manual privacy smoke result or explicit skip impact is recorded.

## Database Target And Isolation Rules

Development database is acceptable for read-only schema inspection and non-destructive checks:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Do not assume port `5432`; local development PostgreSQL uses host port `55432`.

Use a dedicated test database for repeatable forwarder open-request and privacy smoke:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_forwarder_open_requests_test
```

Requirements:

- Run migrations against the test database: `DATABASE_URL=<test-url> npm run db:migrate`.
- Run schema validation: `DATABASE_URL=<test-url> npm run db:check`.
- Seed Importer A, Forwarder A, and Forwarder B through completed onboarding fixtures.
- Seed posted, draft, closed, and cancelled request fixtures if statuses exist.
- Seed quotes only if quote aggregate behavior is implemented.
- Clean up requests, quotes, and seeded profile/company rows by exact smoke prefix or test account ids.
- Never run destructive reset or smoke cleanup against a non-local database.

## Dedicated Quote Privacy Smoke Matrix

### Setup

1. Account/role: Importer A owns one posted request.
2. Account/role: Forwarder A is an eligible forwarder.
3. Account/role: Forwarder B is a separate eligible forwarder.
4. Account/role: Admin only if admin safety exists and is explicitly included.
5. Expected database state: posted request exists; optional quote count data exists only if quote schema is already implemented.

### Forwarder Open Request Visibility

1. Account/role: Forwarder A.
2. Route: `/app/forwarder/requests` and `/app/forwarder/requests/[requestId]`.
3. Action: browse and filter posted/open requests.
4. Expected UI result: Forwarder A sees the posted request and allowed request fields.
5. Expected forbidden behavior: draft, closed, and cancelled requests are not exposed.
6. Pass/fail: pass only if visibility matches request status rules.

### Competitor Quote Privacy

1. Account/role: Forwarder B.
2. Route: `/app/forwarder/requests/[requestId]`.
3. Action: view request and attempt direct URL/action access to any quote details discovered during implementation.
4. Expected UI result: request and allowed aggregate metadata only.
5. Expected forbidden behavior: no Forwarder A identity, amount, transit range, inclusions, exclusions, notes, messages, or quote version details.
6. Expected database state: no mutation from forbidden attempts.
7. Pass/fail: pass only if direct URL/action attempts are blocked server-side.

### Importer And Unauthenticated Access

1. Account/role: Importer A.
2. Route: `/app/forwarder/requests`.
3. Action: visit directly.
4. Expected UI result: blocked or redirected according to role guard.
5. Pass/fail: pass only if importer cannot access forwarder browsing.

1. Account/role: signed-out visitor.
2. Route: `/app/forwarder/requests`.
3. Action: visit directly.
4. Expected UI result: Clerk sign-in protection.
5. Pass/fail: pass only if protected content is not exposed.
