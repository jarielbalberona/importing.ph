# Product Rules

## Product Direction

Importing.ph is a Philippines-first import quotation marketplace.

The product should help importers and cargo forwarders coordinate shipment/import requests and quotes in one organized place instead of scattered chat threads, social messages, referrals, and private contact lists.

Implemented V1 validation loop:

```text
Importer posts request
-> Forwarder browses open posted requests
-> Forwarder submits a private quote
-> Importer compares and accepts/rejects quotes
-> Quote-gated messaging opens
-> DB notifications record marketplace events
-> Admin can inspect activity and suspend unsafe forwarder companies
```

Anything outside this loop is suspect until real validation proves the need.

## Implemented Business Rules

- Supported persisted roles are `importer`, `forwarder`, and `admin`.
- Clerk is authentication/identity only.
- PostgreSQL owns business roles, profiles, company membership, request ownership, quotes, messages, notifications, and suspension state.
- Importer onboarding creates `user_profiles` and `importer_profiles`.
- Forwarder onboarding creates `user_profiles`, `forwarder_companies`, and owner `forwarder_members`.
- Admin is not selectable in onboarding.
- Signed-in users without a profile go to `/onboarding`.
- Wrong-role route access redirects to `/unauthorized`.
- Importer request creation is guarded by importer profile.
- Forwarder request browsing and quote submission are guarded by forwarder role and membership.
- Admin routes/actions are guarded by `admin` role.

## Shipment Request Rules

- Importers own shipment requests through `shipment_requests.importer_profile_id`.
- Current UI creates posted requests only.
- `draft` exists in schema but has no create/edit/resume UI.
- Attachments are notes-only through `attachment_notes`; no file upload/storage exists.
- Request status enum values: `draft`, `posted`, `quote_selected`, `cancelled`.
- Forwarder open-request browsing exposes posted quoteable request data only.
- Forwarder filters currently use request fields such as origin, destination, cargo type, delivery preference, shipping preference, and MSDS/special-handling signals from notes.

## Quote Rules

- Forwarder companies submit quotes.
- One forwarder company can submit one quote per shipment request.
- Currency is currently PHP.
- Quote status enum values: `submitted`, `accepted`, `rejected`, `withdrawn`.
- Quote versions do not exist.
- Quote details are private to:
  - importer owner of the request.
  - submitting forwarder/company.
- Competitor forwarders may see allowed aggregate metadata such as quote count.
- Competitor forwarders must not see identity, amount, transit range, service, inclusions, exclusions, notes, messages, or version details for another forwarder's quote.
- Importer owner can compare submitted quote details.
- Importer owner can accept or reject quotes.
- Accepting a quote sets the selected quote to `accepted` and the request to `quote_selected`.
- Non-selected quotes are not automatically rejected unless the importer explicitly rejects them.
- Expired quotes cannot be accepted.

## Messaging Rules

- Messaging is quote-gated.
- No quote means no messaging.
- One conversation exists per shipment request plus importer plus forwarder company.
- Importer can message only forwarder companies that submitted a quote on that request.
- Forwarder can message only the importer for requests where its company submitted a quote.
- Messages are private to conversation participants.
- V1 messaging is request/response only.
- No realtime delivery, WebSockets, read receipts, attachments, or admin inspection exists.

## Notification Rules

- Notifications are in-app DB records only.
- Notification records are scoped to `recipient_user_profile_id`.
- Implemented notification types:
  - `new_quote_received`.
  - `quote_accepted`.
  - `quote_rejected`.
  - `message_received`.
- Notification writes are best-effort and must not corrupt core marketplace actions.
- Email/Resend delivery is deferred.
- New matching request notifications are deferred until matching rules exist.
- Quote-expiring-soon notifications are deferred until scheduling or opportunistic behavior is designed.

## Admin And Safety Rules

- Admins can view users/profiles, shipment requests, and quotes.
- Admins can suspend/unsuspend forwarder companies.
- Suspended forwarder companies cannot submit quotes.
- Suspension is company-level only.
- Suspended users can still sign in; action blocking is enforced in app code.
- Admin provisioning is manual/seeded for V1.
- Ordinary onboarding must never create admins.
- Reports, user-level suspension, Clerk account disabling, and admin action logs are deferred.

## Non-Goals

Do not build these for V1 unless explicitly approved:

- Public forwarder profile SEO or route/lane SEO pages.
- Logistics ERP.
- Forwarder ERP.
- Shipment tracking.
- Warehouse management.
- Customs operations management.
- Payments, escrow, billing, subscriptions.
- Ratings and reviews.
- Analytics dashboards.
- AI recommendations.
- Full moderation/report workflows.
- Realtime messaging or notification infrastructure.

## Hard Stops

Stop and ask for a product decision before implementing:

- Any competitor quote visibility change.
- Quote revision/version behavior.
- Messaging access beyond quote-gated participants.
- User-level suspension or Clerk disabling.
- Report/moderation workflows.
- Email delivery semantics.
- Public SEO/data exposure rules.
- Any payment, escrow, billing, tracking, review, analytics, or ERP behavior.
- Any destructive data behavior.

If a feature does not directly improve request creation, forwarder quoting, importer comparison, messaging, quote selection, notifications, or minimum safety, challenge it before implementation.
