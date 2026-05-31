# Verification Plan

## Dependency Verification

Before execution:

- Confirm `local-db-migration-proof` has a final passing or explicitly accepted report.
- Confirm `auth-onboarding-roles` has a final passing or explicitly accepted report.
- Confirm `shipment-request-wizard` has a final passing or explicitly accepted report.
- Confirm `forwarder-open-requests` has a final passing or explicitly accepted report.
- Confirm `quote-submission-privacy` has a final passing or explicitly accepted report.
- Confirm `importer-quote-comparison` has a final passing or explicitly accepted report.

If any hard dependency is incomplete and not accepted, stop before Phase 1 execution.

## Phase 1 Verification

Commands:

- `git status --short`
- `test -f db/schema.ts`
- `test -d drizzle`
- `test -f lib/authz.ts`
- `test -f lib/routes.ts`
- `test -d app/app/requests`
- `test -d app/app/forwarder/requests`
- `rg -n "conversation|message|messages|quote" app db lib components scripts`

Expected evidence:

- Current request schema and ownership truth is documented.
- Current quote schema/status truth is documented.
- Current messaging absence or placeholder truth is documented.
- No application code changes in audit phase.

## Phase 2 Verification

Commands:

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`

Expected evidence:

- Conversation/message schema exists.
- Unique request plus forwarder company constraint exists.
- Required indexes exist for list/detail/message chronology.
- Migration applies locally.
- Drizzle check passes.

Hard stop:

- Quote schema cannot identify request plus forwarder company.
- Request ownership cannot be linked to importer.
- Destructive migration is required.

## Phase 3 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence:

- Importer participant checks are server-side.
- Forwarder company participant checks are server-side.
- Quote gate blocks no-quote access.
- Direct action calls repeat route access checks.

## Phase 4 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence:

- Importer list/detail routes compile.
- Forwarder list/detail routes compile.
- Message compose action validates body and participant access.
- Empty/error states exist.
- No realtime, queue, Redis, or WebSocket dependency was added.

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

- Messaging blocked before quote.
- Messaging opens after quote.
- Importer can message quoting forwarder.
- Quoting forwarder can message importer.
- Competitor forwarder cannot access conversation.
- Unrelated importer cannot access conversation.

Browser smoke can be skipped only if auth/browser environment or required fixtures are unavailable. If skipped, record impact clearly; do not call messaging fully proven.

## Done Criteria

- All phases reach `passed` or `passed_with_issues`.
- `reports/final-report.md` exists.
- Automated verification evidence is recorded.
- Browser/manual smoke result or explicit skip impact is recorded.
- No realtime messaging, notification, attachment, payment, escrow, tracking, admin inspection, public SEO, queue, Redis, WebSocket, microservice, Prisma, Express, AWS, or Terraform scope was added.

## Database Target And Isolation Rules

Development database is acceptable for read-only schema inspection and non-destructive checks:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Do not assume port `5432`; local development PostgreSQL uses host port `55432`.

Use a dedicated test database for repeatable messaging smoke:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_quote_gated_messaging_test
```

Requirements:

- Run migrations against the test database: `DATABASE_URL=<test-url> npm run db:migrate`.
- Run schema validation: `DATABASE_URL=<test-url> npm run db:check`.
- Seed Importer A, Forwarder A, Forwarder B, one posted request, and a submitted quote from Forwarder A.
- Use real message creation actions for smoke data.
- Clean up messages, conversations, quotes, requests, and seeded profile/company rows by exact smoke prefix or test account ids.
- Never run destructive reset or smoke cleanup against non-local databases.

## Dedicated Step-By-Step Messaging Smoke Tests

### Messaging Blocked Before Quote

1. Account/role: Importer A and Forwarder B, no quote from Forwarder B.
2. Route: final conversation route for request/forwarder pair.
3. Action: attempt to open or create conversation.
4. Expected UI result: not found, unauthorized, or redirect according to implemented guard; no conversation UI.
5. Expected database state: no conversation or message row for Forwarder B.
6. Pass/fail: pass only if no-quote messaging is blocked server-side.

### Messaging Opens After Quote

1. Account/role: Forwarder A submits quote on Importer A request.
2. Route: importer and forwarder conversation routes.
3. Action: Importer A sends message; Forwarder A replies.
4. Expected UI result: both participants see chronological messages.
5. Expected database state: one conversation for request plus Forwarder A company; two message rows with correct sender ids.
6. Pass/fail: pass only if participant messages persist and render.

### Competitor And Unrelated Importer Blocked

1. Account/role: Forwarder B.
2. Route/action: attempt direct conversation URL/action for Forwarder A conversation.
3. Expected UI result: blocked.
4. Expected forbidden behavior: no message content, sender identity, quote details, or conversation metadata from Forwarder A.
5. Expected database state: no mutation.
6. Pass/fail: pass only if direct access is blocked.

1. Account/role: unrelated Importer B if fixture exists.
2. Route/action: attempt direct conversation URL/action for Importer A request.
3. Expected UI result: blocked.
4. Expected database state: no mutation.
5. Pass/fail: pass only if unrelated importer cannot read or write.
