# Verification Plan

## Dependency Verification

Before execution:

- Confirm `auth-onboarding-roles` has a final passing or explicitly accepted report.
- Confirm `shipment-request-wizard` has a final passing or explicitly accepted report.
- Confirm `forwarder-open-requests` has a final passing or explicitly accepted report.
- Confirm `quote-submission-privacy` has a final passing or explicitly accepted report.
- Confirm `importer-quote-comparison` has a final passing or explicitly accepted report.
- Confirm `quote-gated-messaging` has a final passing or explicitly accepted report.

If any dependency is incomplete and not accepted, stop before Phase 1 execution.

## Phase 1 Verification

Commands:

- `git status --short`
- `test -f db/schema.ts`
- `test -d drizzle`
- `test -f lib/authz.ts`
- `test -f lib/routes.ts`
- `rg -n "notification|notify|event|resend|email|mail" app db lib components scripts package.json`
- `rg -n "quote|message|conversation|shipment|request" app db lib components scripts`

Expected evidence:

- Notification placeholder absence or presence is documented.
- Actual request/quote/message event sources are documented.
- Missing event sources are documented.
- No application code changes in audit phase.

## Phase 2 Verification

Commands:

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`

Expected evidence:

- Notification schema exists.
- Dedupe constraint exists.
- Recipient/read indexes exist.
- Migration applies locally.
- Drizzle check passes.

Hard stop:

- Recipient ownership cannot be represented safely.
- Typed source references cannot align with dependency schemas.
- Destructive migration is required.

## Phase 3 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence:

- Quote submission creates importer notification.
- Message creation creates recipient notification.
- Quote accepted/rejected creates forwarder notification.
- New matching request notification is implemented only if safe matching exists.
- Quote-expiring-soon is implemented only if no async infrastructure is needed.
- Notification failure behavior is documented.

## Phase 4 Verification

Commands:

- `npm run type-check`
- `npm run lint`

Expected evidence:

- Notification list is recipient-scoped.
- Mark-read action repeats recipient check.
- Unread/read display exists if read behavior is implemented.
- Links route to protected pages that re-check authorization.

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

- Quote submission creates importer notification.
- Message reply creates recipient notification.
- Quote acceptance/rejection creates forwarder notification.
- Users cannot read others' notifications.
- Read/unread behavior works if implemented.

Manual smoke can be skipped only if auth/browser environment or required fixtures are unavailable. If skipped, record impact clearly; do not call notifications fully proven.

## Done Criteria

- All phases reach `passed` or `passed_with_issues`.
- `reports/final-report.md` exists.
- Automated verification evidence is recorded.
- Manual smoke result or explicit skip impact is recorded.
- No email delivery, push notification, analytics, admin tooling, queue, Redis, worker, cron-heavy scheduler, event bus, microservice, Prisma, Express, AWS, Terraform, payment, tracking, escrow, review, or public SEO scope was added.

## Database Target And Isolation Rules

Development database is acceptable for read-only schema inspection and non-destructive checks:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Do not assume port `5432`; local development PostgreSQL uses host port `55432`.

Use a dedicated test database for repeatable notification smoke:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_notification_records_test
```

Requirements:

- Run migrations against the test database: `DATABASE_URL=<test-url> npm run db:migrate`.
- Run schema validation: `DATABASE_URL=<test-url> npm run db:check`.
- Seed accounts and marketplace fixtures through completed request, quote, comparison, and messaging flows.
- Seed notification-producing events through real actions, not direct notification inserts, except when a phase is testing schema only and documents why.
- Clean up notifications and related smoke data by deterministic dedupe key prefix or test account ids.
- Never run destructive reset or smoke cleanup against non-local databases.

## Dedicated Step-By-Step Notification Smoke Tests

### Quote Submission Notification

1. Account/role: Forwarder A submits quote on Importer A request.
2. Route/action: final quote submission route/action.
3. Expected UI result: quote submission succeeds.
4. Expected database state: one notification for Importer A with type `new_quote_received` or approved equivalent; dedupe key is deterministic.
5. Expected forbidden behavior: Forwarder B receives no private quote notification.
6. Pass/fail: pass only if recipient and dedupe state are correct.

### Message Reply Notification

1. Account/role: Importer A and Forwarder A with an existing quote-gated conversation.
2. Route/action: conversation detail message submit.
3. Expected UI result: message appears in conversation.
4. Expected database state: recipient gets one message notification; sender does not get a self-notification unless explicitly approved.
5. Pass/fail: pass only if notification recipient matches the opposite participant.

### Quote Decision Notification

1. Account/role: Importer A accepts or rejects Forwarder A quote.
2. Route/action: importer quote comparison decision action.
3. Expected UI result: decision succeeds.
4. Expected database state: Forwarder A member recipient(s) get quote accepted/rejected notification; Forwarder B does not receive private decision detail.
5. Pass/fail: pass only if private quote decision notification is recipient-scoped.

### Notification Access Control

1. Account/role: User A with notification.
2. Route: notification list route.
3. Action: view and mark own notification read.
4. Expected UI result: read/unread state updates.
5. Expected database state: `read_at` set only for User A notification.
6. Forbidden behavior: User B direct URL/action cannot read or mutate User A notification.
7. Pass/fail: pass only if recipient scoping is enforced server-side.
