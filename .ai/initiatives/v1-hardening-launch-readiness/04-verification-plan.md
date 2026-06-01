# Verification Plan

## Dependency Verification

Before execution, confirm all dependency final reports exist and have `PASS` or accepted `PASS WITH ISSUES`:

- `local-db-migration-proof`
- `auth-onboarding-roles`
- `shipment-request-wizard`
- `forwarder-open-requests`
- `quote-submission-privacy`
- `importer-quote-comparison`
- `quote-gated-messaging`
- `notification-records`
- `basic-admin-safety`

Stop if any dependency is missing, blocked, failed, or contradicted by current repo state.

## Database Target

Use local development database for non-destructive verification:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Do not assume port `5432`.

Never run destructive reset/drop/truncate operations against this database unless a phase explicitly permits exact fixture cleanup and confirms the target is local.

For repeatable destructive or isolated launch smoke, create and document a dedicated local test database first:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_v1_hardening_test
```

If a required test DB setup script does not exist, plan it in the relevant phase; do not fake results.

## PATH Prefix

Use:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH
```

## Baseline Automated Commands

Use these commands when code, schema, or production-readiness behavior is touched:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build
```

Use runner preflight:

```bash
node tools/ai-runner/index.mjs v1-hardening-launch-readiness --check-only
```

## Required Browser Smoke Matrix

### Signed-Out Redirects

1. Account/role: none.
2. Routes:
   - `/app/requests`
   - `/app/forwarder/requests`
   - `/admin`
3. Action: visit each route directly.
4. Expected UI/result: redirected to Clerk sign-in or equivalent protected route behavior.
5. Expected forbidden behavior: no protected marketplace/admin data visible.
6. Pass/fail: pass only if protected data is not exposed.

### Importer Onboarding And Session

1. Account/role: disposable Clerk importer account.
2. Route: `/onboarding`.
3. Action: complete importer onboarding or verify existing importer profile.
4. Expected UI/result: importer lands in `/app/requests`.
5. Expected DB state: one `user_profiles` row with `role = importer` and one `importer_profiles` row.
6. Pass/fail: pass only if duplicate/retry behavior does not create duplicate profiles.

### Forwarder Onboarding And Session

1. Account/role: disposable Clerk forwarder account.
2. Route: `/onboarding`.
3. Action: complete forwarder onboarding or verify existing forwarder profile.
4. Expected UI/result: forwarder lands in `/app/forwarder/requests`.
5. Expected DB state: one `user_profiles` row with `role = forwarder`, one `forwarder_companies` row, and one owner `forwarder_members` row.
6. Pass/fail: pass only if duplicate/retry behavior does not create duplicate memberships.

### Wrong-Role Route Access

1. Account/role: importer.
2. Route: `/app/forwarder/requests` and `/admin`.
3. Expected result: blocked or redirected according to hardened rule; no forwarder/admin data visible.

1. Account/role: forwarder.
2. Route: `/app/requests` and `/admin`.
3. Expected result: blocked or redirected according to hardened rule; no importer/admin data visible.

Pass/fail: pass only if role guard behavior is deterministic and documented.

### Quote Privacy Matrix

Use at least:

- Importer A.
- Forwarder A.
- Forwarder B.
- Admin only for admin-route checks.

Prove:

- Importer A can see all quote details on their own request.
- Forwarder A can see only its own submitted quote details.
- Forwarder B can see the request and allowed aggregate metadata only.
- Forwarder B cannot see Forwarder A identity, amount, transit range, inclusions, exclusions, notes, messages, or quote version details.
- Direct URL/action attempts by Forwarder B are blocked.

Pass/fail: any competitor quote detail exposure is a hard fail.

### Messaging Gate

1. Account/role: Forwarder B without quote.
2. Route/action: request detail and direct conversation URL attempt.
3. Expected result: no messaging access.

1. Account/role: Importer A and Forwarder A after Forwarder A quote.
2. Route/action: open conversation and exchange messages.
3. Expected result: only participants can read/write.

Pass/fail: any non-participant message visibility is a hard fail.

### Notification Creation

1. Event: Forwarder submits quote.
2. Expected result: importer notification exists and is visible only to importer.

1. Event: importer accepts/rejects quote.
2. Expected result: submitting forwarder notification exists.

1. Event: participant sends message.
2. Expected result: recipient notification exists.

Pass/fail: notification recipient scoping must hold.

### Admin Access And Forwarder Suspension

1. Account/role: admin.
2. Route: `/admin`.
3. Expected result: users, requests, and quotes render.

1. Account/role: non-admin.
2. Route: `/admin`.
3. Expected result: no admin data visible.

1. Account/role: admin.
2. Action: suspend Forwarder A company.
3. Expected DB state: forwarder company suspension fields persist.

1. Account/role: suspended Forwarder A.
2. Action: submit quote.
3. Expected result: blocked server-side; no quote row inserted.

1. Account/role: normal Forwarder B.
2. Action: submit quote.
3. Expected result: quote succeeds.

## Render Production Smoke Checklist

Execution must document:

- Render service build command and start command from repo/deployment config.
- Required environment variables without printing secrets.
- Production `DATABASE_URL` target classification before running any DB command.
- Migration strategy and rollback stance.
- Clerk production/dev key separation.
- Resend key/domain readiness if email is enabled.
- Manual non-destructive smoke sequence after deploy.

Do not run destructive commands against production.

## Final Done Criteria

- All phases reach `passed` or `passed_with_issues`.
- Final report exists.
- Automated commands pass in the final phase.
- Browser smoke covers auth, quote privacy, messaging gate, notifications, and admin suspension.
- Launch-critical limitations are documented.
- Deferred scope remains deferred.
