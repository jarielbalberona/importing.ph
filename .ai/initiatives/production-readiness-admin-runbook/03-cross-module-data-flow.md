# Cross-Module Data Flow

## Deployment Flow

```text
git/repo
-> Render build command: npm ci && npm run build
-> Render start command: npm run start
-> Next.js App Router runtime
-> Clerk authentication
-> PostgreSQL via DATABASE_URL
```

Observed Render env wiring:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: manually configured.
- `CLERK_SECRET_KEY`: manually configured.
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`.
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`.
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/after-auth`.
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/after-auth`.
- `DATABASE_URL`: from Render database `importing-ph-db`.

## Migration Flow

```text
operator confirms target DATABASE_URL
-> drizzle.config.ts loads env
-> npm run db:migrate
-> Drizzle applies SQL under drizzle/
-> npm run db:check
-> operator records migration evidence
```

Target confirmation is mandatory. A production/staging migration command without an explicit confirmed database target is a hard stop.

## Admin Provisioning Flow

```text
operator creates or identifies Clerk user
-> operator verifies Clerk user id
-> operator creates/updates PostgreSQL user_profiles row with role admin
-> admin signs in through Clerk
-> /after-auth routes to /admin
-> /admin verifies database-backed role guard
```

Rollback/removal flow:

```text
operator confirms admin user_profile id
-> demote/delete only the exact admin smoke/provisioning row as appropriate
-> verify /admin denied for that account
```

Do not use Clerk metadata as the business role source.

## Deployed Smoke Flow

```text
Disposable Importer A signs up/signs in
-> onboarding creates user_profiles + importer_profiles
-> Importer A posts shipment request
-> Disposable Forwarder A signs up/signs in
-> onboarding creates user_profiles + forwarder_companies + forwarder_members
-> Forwarder A browses posted request and submits quote
-> Disposable Forwarder B browses same request
-> Forwarder B sees aggregate metadata only
-> Importer A compares quotes and accepts/rejects
-> messaging opens only for quoting forwarder
-> notification records appear only for intended recipients
-> admin verifies overview and suspension
-> exact smoke cleanup
```

## Privacy Boundaries

Quote privacy:

- Importer owner can see all quote details for owned request.
- Submitting forwarder can see only its own quote details.
- Competitor forwarder can see request data and allowed aggregate metadata only.
- Competitor forwarder must not see identity, amount, transit, service, inclusions, exclusions, notes, messages, or quote versions.

Messaging privacy:

- No quote, no conversation.
- Only importer owner and quoting forwarder company can access conversation.
- Competitors and unrelated importers must be blocked.

Notification privacy:

- Notifications are scoped by `recipient_user_profile_id`.
- Users must not read or mark-read another user's notifications.

Admin boundary:

- `/admin` is for PostgreSQL `admin` role only.
- Ordinary importer/forwarder onboarding must not create admin users.

