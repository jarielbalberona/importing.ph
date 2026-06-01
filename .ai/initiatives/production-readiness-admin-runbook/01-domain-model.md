# Domain Model: Production Readiness Admin Runbook

## Implemented Domain Inputs

This initiative does not create new product entities. It documents operational handling for the implemented V1 model.

Implemented application entities that production smoke must cover:

- `user_profiles`: PostgreSQL business role source of truth.
- `importer_profiles`: importer business profile.
- `forwarder_companies`: forwarder company and suspension state.
- `forwarder_members`: user membership in a forwarder company.
- `shipment_requests`: importer-owned posted requests.
- `quotes`: private forwarder-company quotes.
- `conversations`: quote-gated request/forwarder conversations.
- `messages`: participant-scoped conversation messages.
- `notifications`: recipient-scoped in-app notification records.

## Operational Terms

### Target Deployment

The deployed environment under test. Current repo evidence points to Render through `render.yaml`, but execution must confirm the actual URL, service, and database target before migration or smoke.

### Staging Environment

A non-production deployment intended for destructive-free smoke testing with disposable accounts and cleanup. If staging does not exist, execution must document the gap and require a human decision before using production for smoke.

### Production Environment

The real deployment that will hold real user data. Production smoke must be non-destructive, use explicit disposable accounts, and clean up exact smoke records.

### Admin Provisioning

Operator-controlled creation of a PostgreSQL `user_profiles` row with role `admin` for an authenticated Clerk user.

Rules:

- Ordinary onboarding must not create admins.
- Admin role must remain PostgreSQL-owned.
- Clerk metadata must not become business-role source of truth.
- The runbook must include removal/rollback for accidental admin provisioning.

### Deployed Smoke User

A disposable Clerk user created for staging/production smoke.

Rules:

- Must not use personal emails.
- Must not use real importer/forwarder customers.
- Must be easy to identify and clean up.
- Must be paired with exact DB cleanup by ID or deterministic prefix where cleanup is permitted.

### Deployed Smoke Data

Temporary request, quote, conversation, message, notification, and suspension rows created to prove the deployed V1 loop.

Rules:

- Must be scoped to disposable users.
- Must not alter real customer records.
- Must have exact cleanup criteria.
- Must be safe to leave temporarily if cleanup fails, but cleanup failure is a hard stop before launch-readiness claims.

### Launch Status

Operational readiness category:

- `local validation only`: local checks passed; target deployment not proven.
- `staging smoke passed`: deployed staging smoke passed with cleanup.
- `controlled beta ready`: production smoke passed and operator runbook is complete for limited invited users.
- `public launch ready`: controlled beta risks are addressed and public-facing operational gaps are closed.

## Deferred Concepts

- Email/Resend delivery.
- Public forwarder profile SEO.
- Reports/moderation workflow.
- User-level suspension or Clerk account disabling.
- Realtime messaging or notification infrastructure.
- Payments, tracking, escrow, reviews, analytics, ERP, warehouse, or forwarder operations tooling.

