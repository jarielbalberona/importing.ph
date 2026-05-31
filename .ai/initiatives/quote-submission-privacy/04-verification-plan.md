# Verification Plan

## Dependency Verification

Before execution:

- Confirm `local-db-migration-proof` has a final passing or explicitly accepted report.
- Confirm `auth-onboarding-roles` has a final passing or explicitly accepted report.
- Confirm `shipment-request-wizard` has a final passing or explicitly accepted report.
- Confirm `forwarder-open-requests` has a final passing or explicitly accepted report.

If any dependency is incomplete and not accepted, stop before Phase 1 execution.

## Phase 1 Verification

Commands:

- `git status --short`
- `test -f db/schema.ts`
- `test -d drizzle`
- `test -f lib/authz.ts`
- `test -f app/app/forwarder/requests/page.tsx`
- `test -f app/app/requests/page.tsx`

Expected evidence:

- Current request schema and forwarder route truth are documented.
- Current quote placeholder/table absence or presence is documented.
- Suspended-forwarder state is documented.
- No application code changes in audit phase.

## Phase 2 Verification

Commands:

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`

Expected evidence:

- Quote schema exists.
- Migration is generated and applies locally.
- Constraints/indexes enforce request/company lookup needs.
- Privacy DTO boundaries are defined.

Hard stop:

- Destructive migration requirement.
- Unresolved decision about revisions or multiple active quotes.

## Phase 3 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence:

- Quote submission route/form/action compiles.
- Validation rejects invalid amount, currency, transit range, and valid-until values.
- Request eligibility is enforced.
- Duplicate/revision rule is enforced.
- Suspended-forwarder rule is enforced if state exists.

## Phase 4 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence:

- Importer owner visibility works through ownership checks.
- Submitting forwarder own-quote visibility works through company checks.
- Competitor forwarder query/DTO excludes forbidden fields.
- Quote count is aggregate-only.

## Phase 5 Automated Verification

Commands:

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

Expected evidence:

- Every command exits `0`, or exact failure/skip reason and impact is recorded.

## Phase 5 Privacy Smoke

Smoke cases:

- Forwarder A submits quote.
- Importer sees Forwarder A quote details.
- Forwarder A sees own quote details.
- Forwarder B sees request and quote count only.
- Forwarder B cannot see Forwarder A identity, amount, transit time, inclusions, exclusions, or notes.
- Suspended forwarder cannot submit quote if suspension state exists.

Browser smoke can be skipped only if auth/browser environment or required fixtures are unavailable. If skipped, record impact clearly; do not call privacy fully proven.

## Done Criteria

- All phases reach `passed` or `passed_with_issues`.
- `reports/final-report.md` exists.
- Automated verification evidence is recorded.
- Privacy smoke result or explicit skip impact is recorded.
- No quote acceptance/rejection, messaging, notification, payment, tracking, ERP, or public SEO scope was added.

## Database Target And Isolation Rules

Development database is acceptable for read-only schema inspection and non-destructive checks:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Do not assume port `5432`; local development PostgreSQL uses host port `55432`.

Use a dedicated test database for repeatable quote privacy smoke:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_quote_submission_privacy_test
```

Requirements:

- Run migrations against the test database: `DATABASE_URL=<test-url> npm run db:migrate`.
- Run schema validation: `DATABASE_URL=<test-url> npm run db:check`.
- Seed Importer A, Forwarder A, and Forwarder B through completed onboarding fixtures.
- Seed one posted request owned by Importer A.
- Seed quotes through the real quote submission action, not direct table inserts, unless the phase is only preparing fixtures and documents why.
- Clean up quotes, requests, and seeded profile/company rows by exact smoke prefix or test account ids.
- Never run destructive reset or smoke cleanup against a non-local database.

## Dedicated Quote Privacy Smoke Matrix

### Setup

1. Account/role: Importer A, completed importer profile.
2. Account/role: Forwarder A, completed forwarder company membership.
3. Account/role: Forwarder B, separate completed forwarder company membership.
4. Route/action: Importer A creates or owns one posted request.
5. Action: Forwarder A submits one quote on Importer A's request.
6. Expected database state: one quote row tied to the request and Forwarder A company.

### Importer A Visibility

1. Account/role: Importer A.
2. Route: `/app/requests/[requestId]`.
3. Action: view request quote section.
4. Expected UI result: Importer A can see all quote details for its own request, including Forwarder A identity, amount, currency, transit range, inclusions, exclusions, notes, and valid-until/status.
5. Expected database state: no mutation.
6. Pass/fail: pass only if all own-request quote details are visible to Importer A.

### Forwarder A Own Quote Visibility

1. Account/role: Forwarder A.
2. Route: `/app/forwarder/requests/[requestId]`.
3. Action: view submitted quote area.
4. Expected UI result: Forwarder A can see only its own submitted quote details.
5. Expected database state: no mutation.
6. Pass/fail: pass only if Forwarder A sees own quote and no competitor quote details.

### Forwarder B Competitor Privacy

1. Account/role: Forwarder B.
2. Route: `/app/forwarder/requests/[requestId]`.
3. Action: view request detail and attempt any direct quote detail URL/action discovered during implementation.
4. Expected UI result: Forwarder B can see request and allowed aggregate metadata only.
5. Expected forbidden behavior: Forwarder B cannot see Forwarder A identity, amount, transit range, inclusions, exclusions, notes, messages, or quote version details.
6. Expected database state: no mutation from forbidden attempts.
7. Pass/fail: pass only if direct URL/action attempts are blocked server-side.

### Admin Visibility

Admin is not part of this initiative unless an admin dependency has been completed and explicitly included. If admin is included, admin route smoke must stay admin-only and must not weaken importer/forwarder privacy DTOs.
