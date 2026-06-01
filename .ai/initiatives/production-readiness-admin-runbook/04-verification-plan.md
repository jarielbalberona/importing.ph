# Verification Plan

## Local Authoring Verification

This initiative is planning-only. Initiative authoring must not run app code, migrations, or browser smoke.

Optional structure checks after authoring:

```bash
node tools/ai-runner/index.mjs production-readiness-admin-runbook --check-only
git diff --check -- .ai/initiatives/production-readiness-admin-runbook
```

Do not run project-memory-execution during authoring.

## Local Static Verification For Execution

Run these after any implementation/runbook-support changes in execution phases:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build
```

Run sequentially. Do not run `type-check` and `build` in parallel.

## Local DB Verification

Known local development target:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Allowed local DB checks when explicitly in phase scope:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:smoke
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:prove-onboarding
```

Do not assume local port `5432`.

## Target Deployment DB Verification

Before any staging/production database command:

1. Record the environment name: staging or production.
2. Record the service/deployment URL.
3. Confirm `DATABASE_URL` host, database name, and ownership source.
4. Confirm the target is the intended Render database or human-approved target.
5. Confirm there is a backup/snapshot or explicit rollback plan if available.
6. Confirm no command contains local dev credentials for target deployment.

Required target commands must be written with an explicit environment prefix or Render shell equivalent during execution. Never run:

```bash
npm run db:migrate
```

against an implicit or unconfirmed target.

## Deployed Smoke Tests

Each smoke test must record:

- account email and role.
- route visited.
- action performed.
- expected UI.
- expected DB state when applicable.
- cleanup step.
- pass/fail result.

### Smoke 1: Signed-Out Redirect

- Account: none.
- Route: `/after-auth`, `/app/requests`, `/app/forwarder/requests`, `/admin`.
- Action: visit each route signed out.
- Expected UI: Clerk sign-in redirect.
- Expected DB state: no rows created.
- Pass criteria: protected content is not visible.

### Smoke 2: Importer Onboarding And Session

- Account: disposable Importer A.
- Route: `/sign-up` or `/sign-in`, then `/onboarding`.
- Action: complete importer onboarding.
- Expected UI: redirect to `/app/requests`.
- Expected DB state: one `user_profiles` row with role `importer`, one `importer_profiles` row, no forwarder membership.
- Forbidden behavior: importer cannot access `/app/forwarder/requests` or `/admin`; wrong-role route lands on `/unauthorized`.

### Smoke 3: Forwarder Onboarding And Session

- Account: disposable Forwarder A.
- Route: `/sign-up` or `/sign-in`, then `/onboarding`.
- Action: complete forwarder onboarding.
- Expected UI: redirect to `/app/forwarder/requests`.
- Expected DB state: one `user_profiles` row with role `forwarder`, one `forwarder_companies` row, one owner `forwarder_members` row, no importer profile.
- Forbidden behavior: forwarder cannot access `/app/requests` or `/admin`; wrong-role route lands on `/unauthorized`.

### Smoke 4: Request Creation And Forwarder Browsing

- Account: Importer A creates request.
- Route: `/app/requests/new`.
- Action: create a minimal valid posted shipment request.
- Expected UI: request detail/list shows the created request.
- Expected DB state: one `shipment_requests` row with status `posted` and Importer A ownership.
- Account: Forwarder A.
- Route: `/app/forwarder/requests`.
- Action: find/open the posted request.
- Expected UI: forwarder-safe request data visible.
- Forbidden behavior: importer profile/private quote/message data is not exposed.

### Smoke 5: Quote Privacy Matrix

Accounts:

- Importer A.
- Forwarder A.
- Forwarder B.
- Admin only after admin provisioning is proven.

Steps:

1. Forwarder A submits a quote on Importer A's posted request.
2. Importer A opens owned request detail.
3. Forwarder A opens the forwarder request detail.
4. Forwarder B opens the same forwarder request detail and attempts direct/guessed URLs or query strings used by existing routes.

Expected:

- Importer A sees all quote details on their own request.
- Forwarder A sees only its own submitted quote details.
- Forwarder B sees request data and allowed aggregate metadata only.
- Forwarder B cannot see Forwarder A identity, amount, transit range, service, inclusions, exclusions, notes, messages, or quote version details.
- Direct URL/action attempts by Forwarder B are blocked.

Pass criteria: no competitor quote detail appears in UI, serialized output, direct route response, or DB query result used by the route.

### Smoke 6: Quote Comparison And Decision

- Account: Importer A.
- Route: `/app/requests/[requestId]`.
- Action: accept or reject a submitted quote.
- Expected UI: selected/rejected status displayed.
- Expected DB state: selected quote status changes, request status changes to `quote_selected` when accepted.
- Forbidden behavior: non-owner importer cannot see or decide quotes.

### Smoke 7: Quote-Gated Messaging

- Account: Forwarder B without quote.
- Route: request detail/conversation direct URL attempts.
- Expected UI: no messaging entry point and no message content.
- Account: Importer A and Forwarder A after quote.
- Action: open conversation, importer sends message, forwarder replies.
- Expected DB state: one conversation for request plus Forwarder A company; messages scoped to participants.
- Forbidden behavior: Forwarder B and unrelated importers cannot access conversation or message content.

### Smoke 8: Notification Records

- Trigger: quote submission, quote decision, and message send.
- Accounts: intended notification recipients.
- Route: `/app/notifications`.
- Action: open inbox and mark one notification read.
- Expected UI: relevant notification appears for recipient only; read state changes.
- Expected DB state: notification rows have correct `recipient_user_profile_id`, source references, and `read_at` after mark-read.
- Forbidden behavior: users cannot see or mark-read another user's notifications.

### Smoke 9: Admin Access And Suspension

- Account: provisioned Admin.
- Route: `/admin`.
- Action: view users, requests, quotes; suspend Forwarder B company.
- Expected UI: admin overview renders and suspension state changes.
- Expected DB state: Forwarder B company has `is_suspended = true`, `suspended_at`, reason, and admin actor when available.
- Action: Forwarder B attempts quote submission.
- Expected UI: quote submission blocked with suspended-forwarder behavior.
- Account: non-admin importer/forwarder.
- Expected forbidden behavior: `/admin` denied.

### Smoke 10: Smoke Cleanup

- Account: operator/agent with confirmed target DB access.
- Action: remove exact smoke rows by IDs/prefix and delete disposable Clerk users where applicable.
- Expected DB state: zero matching smoke rows remain or documented non-production leftovers accepted by human.
- Hard stop: launch-readiness cannot be claimed if cleanup is ambiguous or risks real user data.

## Hard Stops

- Missing/ambiguous target `DATABASE_URL`.
- Destructive migration drift.
- Unavailable Clerk config for deployed smoke users.
- Admin provisioning ambiguity.
- Quote privacy smoke failure.
- Messaging privacy smoke failure.
- Notification recipient scoping failure.
- Inability to clean up smoke data safely.
- Any need for out-of-scope product expansion.

