# Verification Plan

## Dependency Verification

Before execution:

- Confirm `local-db-migration-proof` has a final passing or explicitly accepted report.
- Confirm `auth-onboarding-roles` has a final passing or explicitly accepted report.

If either is incomplete and not accepted, stop before Phase 1 execution.

## Phase 1 Verification

Commands:

- `git status --short`
- `test -f app/app/requests/page.tsx`
- `test -f db/schema.ts`
- `test -d drizzle`
- `test -f lib/authz.ts`
- `test -f lib/routes.ts`
- `test -f components/ui/button.tsx`
- `test -f components/ui/input.tsx`
- `test -f components/ui/label.tsx`

Expected evidence:

- Current importer proof route is documented.
- Current absence of shipment request schema/actions is documented.
- No application code changes in audit phase.

## Phase 2 Verification

Commands:

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`

Expected evidence:

- Migration is generated for request schema.
- Migration applies locally.
- Drizzle check passes.
- Type-check passes.

Hard stop:

- Any destructive migration requirement.
- Any product dispute over fields/enums/statuses.

## Phase 3 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence:

- Wizard route/action compiles.
- Validation rejects missing quoting basis.
- Importer-only route/action guard exists.
- Draft-vs-post behavior is documented in implementation report.

## Phase 4 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence:

- Importer list renders owned requests only.
- Detail view loads owned request only.
- Empty state exists.
- Non-owned or missing request behavior is handled.

## Phase 5 Automated Verification

Commands:

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

Expected evidence:

- Every command exits `0`, or exact failure/skip reason and impact is recorded.

## Phase 5 Browser Smoke

Smoke cases:

- Importer can create a request.
- Forwarder cannot create importer request.
- Unauthenticated user redirects.
- Invalid request basis is rejected.
- Created request appears in importer list.
- Created request opens in importer detail.

Browser smoke can be skipped only if Clerk/browser environment is unavailable. If skipped, record impact clearly; do not call the initiative fully proven.

## Done Criteria

- All phases reach `passed` or `passed_with_issues`.
- `reports/final-report.md` exists.
- Migration/schema verification evidence is recorded.
- Browser smoke result or explicit skip impact is recorded.
- No forwarder browsing, quote, messaging, or file storage scope was added.

## Database Target And Isolation Rules

Development database is acceptable for read-only schema inspection and non-destructive local checks:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Do not assume port `5432`; local development PostgreSQL uses host port `55432`.

Use a dedicated test database for repeatable shipment request smoke:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_shipment_request_wizard_test
```

Requirements:

- Run migrations against the test database: `DATABASE_URL=<test-url> npm run db:migrate`.
- Run schema validation: `DATABASE_URL=<test-url> npm run db:check`.
- Seed importer and forwarder accounts only through completed onboarding fixtures or scripts.
- Seed shipment requests with an initiative-specific prefix such as `smoke_request_wizard_*`.
- Clean up smoke shipment requests and related rows by exact test prefix or test owner ids.
- Never run destructive reset or cleanup against non-local databases.

## Dedicated Step-By-Step Smoke Tests

### Importer Creates Minimal Quoteable Request

1. Account/role: Importer A with completed importer profile.
2. Route: `/app/requests/new` or the final route chosen by implementation.
3. Action: complete the wizard with cargo description, quoting basis, pickup/destination, shipping preference, and review/post.
4. Expected UI result: redirect to importer-owned request detail or list showing the created request.
5. Expected database state: one shipment request row owned by Importer A with status `posted` or approved V1 status; required fields persisted.
6. Expected forbidden behavior: no request is created for another importer; unauthenticated users cannot create a request.
7. Pass/fail: pass only if UI and database state match.

### Invalid Quoting Basis Rejected

1. Account/role: Importer A.
2. Route: request wizard route.
3. Action: submit without total CBM, total weight, or dimensions plus package/carton count.
4. Expected UI result: validation error and no success redirect.
5. Expected database state: no shipment request row created.
6. Pass/fail: pass only if invalid data is rejected server-side.

### Role Authorization Smoke

1. Account/role: Forwarder A.
2. Route: importer request creation route.
3. Action: visit or submit directly.
4. Expected UI result: blocked or redirected according to role guard.
5. Expected database state: no shipment request row created.
6. Pass/fail: pass only if forwarder cannot create importer request.
