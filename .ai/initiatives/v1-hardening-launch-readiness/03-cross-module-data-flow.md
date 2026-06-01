# Cross-Module Data Flow

## Auth And Role Flow

```text
Clerk session
-> lib/authz.ts
-> user_profiles by clerk_user_id
-> role/profile-specific guard
-> importer / forwarder / admin workspace
```

Hardening focus:

- missing session.
- missing profile.
- wrong-role route.
- stale session.
- direct URL attempts.
- user-facing error states.

Business role truth must remain in PostgreSQL.

## Shipment Request Flow

```text
Importer page/action
-> require importer profile
-> validate request fields
-> shipment_requests
-> importer-owned list/detail
-> forwarder-safe posted request list/detail
```

Hardening focus:

- owner checks.
- posted/draft/cancelled/quote-selected visibility.
- forwarder-safe DTO boundaries.
- production smoke fixtures and cleanup.

## Quote Privacy Flow

```text
Forwarder company member
-> posted request detail
-> quote submit action
-> quotes
-> importer owner sees all quote details
-> submitting forwarder sees own quote details
-> competitor forwarder sees request and allowed aggregate only
```

Hardening focus:

- server-side visibility helpers.
- direct route/action abuse.
- serialized data boundaries.
- quote decision state transitions.
- suspended forwarder blocking.

## Messaging Flow

```text
Quote row exists
-> conversation for request + importer + forwarder company
-> importer/forwarder participant reads
-> message create
-> message notification
```

Hardening focus:

- no quote, no messaging.
- participant-only access.
- direct conversation URL abuse.
- message send error behavior.

## Notification Flow

```text
Marketplace event
-> best-effort notification helper
-> notifications table
-> recipient-scoped /app/notifications
-> mark read
```

Hardening focus:

- recipient scoping.
- dedupe/idempotency.
- safe failure behavior.
- link targets.
- whether email is required for launch validation.

## Admin Safety Flow

```text
Admin user profile
-> /admin
-> admin-only read queries
-> suspend/unsuspend forwarder company
-> quote submission checks company suspension
```

Hardening focus:

- admin provisioning.
- admin-only actions.
- audit fields.
- suspended user/company behavior.
- minimum report/abuse path.

## Operational Flow

```text
Render environment
-> Clerk env vars
-> DATABASE_URL
-> Drizzle migrations
-> Next.js build/start
-> browser smoke
-> accepted limitations document
```

Hardening focus:

- no destructive production operations.
- environment parity.
- non-local database safeguards.
- observability/logging expectations.
