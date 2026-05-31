# Verification Plan

## Dependency Verification

Before execution:

- Confirm `local-db-migration-proof` has a final passing or explicitly accepted report.
- Confirm `auth-onboarding-roles` has a final passing or explicitly accepted report.
- Confirm `shipment-request-wizard` has a final passing or explicitly accepted report.
- Confirm `forwarder-open-requests` has a final passing or explicitly accepted report.
- Confirm `quote-submission-privacy` has a final passing or explicitly accepted report.

If any dependency is incomplete and not accepted, stop before Phase 1 execution.

## Phase 1 Verification

Commands:

- `git status --short`
- `test -f db/schema.ts`
- `test -d drizzle`
- `test -f lib/authz.ts`
- `test -d app/app/requests`
- `test -d app/app/forwarder/requests`

Expected evidence:

- Current importer request detail route truth is documented.
- Current quote schema/actions/status truth is documented.
- Current privacy helpers are documented.
- No application code changes in audit phase.

## Phase 2 Verification

Commands:

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`

Expected evidence:

- Any required quote/request status schema changes are generated and applied.
- Accept/reject state transition rules are documented.
- Transaction/concurrency strategy is documented.

Hard stop:

- Ambiguous quote/request status mapping.
- Product decision required for auto-reject or expired quote acceptance.

## Phase 3 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence:

- Importer comparison UI/action compiles.
- Empty/no-quotes state exists.
- Expired/already-selected states are handled.
- Accept/reject actions are guarded.

## Phase 4 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence:

- Importer owner quote visibility is ownership-guarded.
- Non-owner importer quote visibility is blocked.
- Forwarder own-quote visibility is preserved.
- Competitor forwarder quote details remain blocked.
- Direct URL/action abuse cases are handled.

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

- Importer sees all quotes on own request.
- Non-owner importer cannot see quotes.
- Submitting forwarder sees own quote only.
- Competitor forwarder cannot see quote details.
- Importer accepts one quote.
- Importer rejects one quote.
- Status transitions are correct.

Browser smoke can be skipped only if auth/browser environment or required fixtures are unavailable. If skipped, record impact clearly; do not call the initiative fully proven.

## Done Criteria

- All phases reach `passed` or `passed_with_issues`.
- `reports/final-report.md` exists.
- Automated verification evidence is recorded.
- Privacy smoke result or explicit skip impact is recorded.
- No messaging, notification, payment, escrow, tracking, admin, or public SEO scope was added.

## Database Target And Isolation Rules

Development database is acceptable for read-only schema inspection and non-destructive checks:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Do not assume port `5432`; local development PostgreSQL uses host port `55432`.

Use a dedicated test database for repeatable quote comparison and decision smoke:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_importer_quote_comparison_test
```

Requirements:

- Run migrations against the test database: `DATABASE_URL=<test-url> npm run db:migrate`.
- Run schema validation: `DATABASE_URL=<test-url> npm run db:check`.
- Seed Importer A, Forwarder A, Forwarder B, one posted request, and at least two submitted quotes through real flows where available.
- Clean up quote decisions, quotes, requests, and seeded profile/company rows by exact smoke prefix or test account ids.
- Never run destructive reset or smoke cleanup against non-local databases.

## Dedicated Quote Privacy Smoke Matrix

### Setup

1. Account/role: Importer A, completed importer profile.
2. Account/role: Forwarder A, completed forwarder company membership.
3. Account/role: Forwarder B, separate completed forwarder company membership.
4. Account/role: Admin, only if admin safety exists and is explicitly included.
5. Route/action: Importer A owns one posted request; Forwarder A and Forwarder B each submit quotes.
6. Expected database state: two quote rows tied to the same request and different forwarder companies.

### Importer A Compare And Decide

1. Account/role: Importer A.
2. Route: `/app/requests/[requestId]`.
3. Action: view quotes, accept Forwarder A quote, reject Forwarder B quote if that flow is implemented.
4. Expected UI result: all quote comparison fields visible; accepted/rejected statuses update.
5. Expected database state: selected quote/request status transitions match the approved status model.
6. Pass/fail: pass only if actions are transactional and visible only to authorized viewers.

### Forwarder A Own Quote After Decision

1. Account/role: Forwarder A.
2. Route: `/app/forwarder/requests/[requestId]`.
3. Action: view own quote after acceptance.
4. Expected UI result: Forwarder A sees only its own quote details and own decision status.
5. Expected forbidden behavior: Forwarder A cannot see Forwarder B quote details.
6. Pass/fail: pass only if own quote visibility is preserved without competitor leakage.

### Forwarder B Competitor Privacy And Direct Abuse

1. Account/role: Forwarder B.
2. Route: `/app/forwarder/requests/[requestId]`.
3. Action: view request and attempt direct URL/action access to Forwarder A quote/decision details.
4. Expected UI result: allowed request and aggregate metadata only.
5. Expected forbidden behavior: no Forwarder A identity, amount, transit range, inclusions, exclusions, notes, messages, or quote version details.
6. Expected database state: no unauthorized mutation.
7. Pass/fail: pass only if direct URL/action attempts are blocked server-side.
