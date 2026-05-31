# Verification Plan

## Dependency Verification

Before execution:

- Confirm `auth-onboarding-roles` has a final passing or explicitly accepted report.
- Confirm `shipment-request-wizard` has a final passing or explicitly accepted report.
- Confirm `quote-submission-privacy` has a final passing or explicitly accepted report.
- If message reports are included, confirm `quote-gated-messaging` has a final passing or explicitly accepted report.

If any hard dependency is incomplete and not accepted, stop before Phase 1 execution.

## Phase 1 Verification

Commands:

- `git status --short`
- `test -f app/admin/page.tsx`
- `test -f lib/authz.ts`
- `test -f lib/routes.ts`
- `test -f db/schema.ts`
- `test -d drizzle`
- `rg -n "admin|suspend|suspended|trust|report|moderation|safety" app db lib components scripts`
- `rg -n "quote|message|conversation|shipment|request" app db lib components scripts`

Expected evidence:

- Current admin route behavior is documented.
- Current suspension/trust/report absence or presence is documented.
- Current request/quote schema availability is documented.
- No application code changes in audit phase.

## Phase 2 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence:

- Admin read-only routes compile.
- Admin user/profile view is guarded.
- Admin request view is guarded.
- Admin quote view is guarded.
- Non-admin route behavior is documented.

## Phase 3 Verification

Commands:

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`

Expected evidence:

- Suspension model exists.
- Migration applies locally if schema changed.
- Quote submission checks suspension.
- Suspended forwarder is blocked server-side.
- Normal forwarder remains unaffected.

Hard stop:

- Suspension target is ambiguous.
- Product requires Clerk account disabling.
- Migration would be destructive.

## Phase 4 Verification

Commands:

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`

Expected evidence:

- Reports are skipped with documented reason, or minimal report schema/actions compile.
- Report creation checks subject visibility.
- Admin report view is guarded.
- Message reports are not included unless messaging dependency is complete.

Hard stop:

- Report subject authorization is ambiguous.
- Report scope becomes an advanced workflow.

## Phase 5 Automated Verification

Commands:

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

Expected evidence:

- Every command exits `0`, or exact failure/skip reason and impact is recorded.

## Phase 5 Manual Smoke

Smoke cases:

- Non-admin cannot access admin routes.
- Admin can view users.
- Admin can view requests.
- Admin can view quotes.
- Admin can suspend forwarder.
- Suspended forwarder cannot submit quote.
- Normal forwarder can still submit quote.

Manual smoke can be skipped only if auth/browser environment or required fixtures are unavailable. If skipped, record impact clearly; do not call admin safety fully proven.

## Done Criteria

- All phases reach `passed` or `passed_with_issues`.
- `reports/final-report.md` exists.
- Automated verification evidence is recorded.
- Manual smoke result or explicit skip impact is recorded.
- No CRM, ERP, document verification, payment, escrow, tracking, reviews, analytics, subscriptions, public SEO, queue, Redis, WebSocket, microservice, Prisma, Express, AWS, or Terraform scope was added.

## Database Target And Isolation Rules

Development database is acceptable for read-only schema inspection and non-destructive checks:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Do not assume port `5432`; local development PostgreSQL uses host port `55432`.

Use a dedicated test database for repeatable admin safety smoke:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_basic_admin_safety_test
```

Requirements:

- Run migrations against the test database: `DATABASE_URL=<test-url> npm run db:migrate`.
- Run schema validation: `DATABASE_URL=<test-url> npm run db:check`.
- Seed Admin, Importer A, Forwarder A, and Forwarder B through approved fixtures.
- Seed posted request and quote submission fixtures through real flows where available.
- Clean up admin actions, reports, suspension fields, quotes, requests, and seeded profile/company rows by exact smoke prefix or test account ids.
- Never run destructive reset or smoke cleanup against non-local databases.

## Dedicated Step-By-Step Admin Safety Smoke Tests

### Admin Route Access

1. Account/role: Admin user profile.
2. Route: `/admin`.
3. Action: visit route.
4. Expected UI result: admin control plane renders.
5. Expected database state: no mutation.
6. Pass/fail: pass only if admin can access.

1. Account/role: Importer A or Forwarder A.
2. Route: `/admin`.
3. Action: visit route directly.
4. Expected UI result: blocked or redirected according to role guard.
5. Expected forbidden behavior: no admin data visible.
6. Pass/fail: pass only if non-admin cannot access.

### Admin Read Views

1. Account/role: Admin.
2. Route: admin users, requests, and quotes routes chosen by implementation.
3. Action: view each read-only page.
4. Expected UI result: users, requests, and quotes render in admin-only views.
5. Expected database state: no mutation.
6. Pass/fail: pass only if read views are guarded and non-mutating.

### Forwarder Suspension

1. Account/role: Admin.
2. Route/action: admin suspend Forwarder A company or user according to implemented model.
3. Expected UI result: suspension state visible in admin UI.
4. Expected database state: suspension field/table updated with actor, timestamp, and reason if modeled.
5. Pass/fail: pass only if suspension is persisted.

1. Account/role: suspended Forwarder A.
2. Route/action: quote submission route/action.
3. Expected UI result: quote submission blocked with safe error.
4. Expected database state: no new quote row.
5. Pass/fail: pass only if server-side quote submission is blocked.

1. Account/role: normal Forwarder B.
2. Route/action: quote submission route/action on an eligible request.
3. Expected UI result: quote submission succeeds.
4. Expected database state: new quote row for Forwarder B.
5. Pass/fail: pass only if normal forwarder remains unaffected.
