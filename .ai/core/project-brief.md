# Project Brief

## Observed From Repo

`importing.ph` is a Philippines-first importer-forwarder shipment quotation marketplace built as a single Next.js App Router application.

The implemented V1 marketplace loop is locally smoke-proven:

```text
Importer creates a posted shipment request
-> Forwarder browses posted/open requests
-> Forwarder submits one private quote per company per request
-> Importer compares quotes and accepts/rejects
-> Quote-gated messaging opens between importer and quoting forwarder
-> DB-backed in-app notifications are created
-> Admin can inspect marketplace activity and suspend forwarder companies
```

Repository evidence:

- `app/app/requests/**`: importer request list, detail, and creation.
- `app/app/forwarder/requests/**`: forwarder open request list, detail, and quote submission.
- `app/app/requests/messages/**` and `app/app/forwarder/messages/**`: quote-gated messaging surfaces.
- `app/app/notifications/**`: in-app notification list and mark-read behavior.
- `app/admin/**`: admin read overview and forwarder-company suspension actions.
- `db/schema.ts`: V1 marketplace tables and enums.
- `lib/*`: authz, request, quote, messaging, notification, and admin helpers.
- `drizzle/0000_*` through `drizzle/0007_*`: additive schema history for onboarding, requests, quote privacy, quote comparison, messaging, notifications, and admin suspension.
- `render.yaml`: Render-oriented web service plus PostgreSQL config.
- `.ai/initiatives/*/reports/final-report.md`: local execution and smoke evidence.

## Product Context

Importing.ph helps importers and cargo forwarders coordinate China-to-Philippines importing requests and quotes in one place.

The core problem remains fragmented coordination. Importers often compare forwarders through chat apps, social platforms, referrals, and private contacts. That makes pricing, response tracking, and communication opaque.

Primary users:

- Importers.
- Cargo forwarders.
- Admins for minimal marketplace safety/control.

## Current Product Status

Status: local V1 validation-ready, not production-hard.

Implemented locally:

- Clerk sign-in/sign-up.
- PostgreSQL-backed onboarding for importer and forwarder profiles.
- PostgreSQL-backed business role guards.
- Wrong-role route access redirects to `/unauthorized`.
- Importer-owned posted shipment request creation/list/detail.
- Forwarder posted request browse/list/detail with filters.
- Private forwarder quote submission.
- Importer quote comparison and accept/reject.
- Quote-gated participant messaging.
- In-app DB notification records.
- Admin read overview and forwarder-company suspension.
- Suspended forwarder companies cannot submit quotes.

Not production-hard yet:

- Production deployment runbook and production smoke are pending.
- Production admin seed/provisioning process is pending.
- `.ai/core/*` was realigned after V1 hardening; keep it current after future execution.

## Explicit Non-Goals For V1

Do not turn this into a logistics operating system.

Out of scope unless explicitly approved:

- Public forwarder profile SEO or route/lane SEO pages.
- Shipment tracking.
- Freight operations management.
- Warehouse management.
- ERP-style forwarder tooling.
- Escrow or payments.
- Subscriptions or billing.
- Ratings and reviews.
- Analytics dashboards.
- AI recommendations.
- Report/moderation platform.
- User-level suspension or Clerk account disabling.
- Email delivery.
- Microservices, queues, Redis, WebSockets, event buses, or separate backend services.

## Accepted Limitations

- Request creation is posted-only in the UI; `draft` exists in schema only.
- Attachments are notes-only; no file storage exists.
- Quote versions do not exist.
- Messaging is request/response only; no realtime, read receipts, or attachments.
- Notifications are in-app DB records only; email/Resend is deferred.
- Admin provisioning is manual/seeded; onboarding must not create admins.
- Reports are deferred.
- Public forwarder profile SEO remains deferred.

## Open Gaps

- Production deployment and smoke checklist still need execution.
- Production admin provisioning needs an operator-controlled runbook.
- Public SEO initiative remains deferred until the marketplace loop is validated with real users.
- Future product decisions are needed before adding report workflows, user suspension, email delivery, quote revisions, file storage, or public directory/SEO pages.
