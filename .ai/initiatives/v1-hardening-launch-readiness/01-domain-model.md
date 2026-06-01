# Domain Model

## Implemented Marketplace Terms

### User Profile

Application identity row in `user_profiles`, linked to Clerk by `clerk_user_id`.

Business role source of truth is `user_profiles.role`, not Clerk metadata.

### Roles

Implemented roles:

- `importer`
- `forwarder`
- `admin`

Launch hardening must preserve database-backed role checks.

### Importer Profile

Implemented as `importer_profiles`.

Importer-owned shipment request authorization flows through this profile.

### Forwarder Company

Implemented as `forwarder_companies`.

Forwarder quote submission and suspension are company-scoped.

### Forwarder Member

Implemented as `forwarder_members`.

Forwarder users act through a company membership. V1 currently creates owner membership during onboarding.

### Shipment Request

Implemented as `shipment_requests`.

V1 request creation is posted-only in UI. Schema includes `draft`, but draft editing/resume is not implemented.

### Quote

Implemented as `quotes`.

V1 rule: one quote per forwarder company per shipment request. Quote details are private to the importer owner and submitting forwarder company.

### Quote Decision

Implemented through quote statuses and request status:

- quote statuses include `submitted`, `accepted`, `rejected`, `withdrawn`.
- request status includes `quote_selected`.

Current V1 behavior leaves non-selected quotes as submitted unless explicitly rejected.

### Conversation

Implemented as `conversations`.

Rule: one conversation per shipment request and forwarder company, opened by a quote.

### Message

Implemented as `messages`.

Messages are private to the importer owner and the quoting forwarder company.

### Notification

Implemented as `notifications`.

Current notification types cover new quote, quote accepted/rejected, and message received. Notifications are in-app database records only.

### Admin

Admin is a `user_profiles.role = admin` user. Admin onboarding/provisioning is not productized.

### Suspension

Forwarder-company suspension is implemented on `forwarder_companies`.

Suspended forwarder companies cannot submit quotes. User-level suspension and Clerk account disabling are not implemented.

## Hardening Terms

### Launch Readiness

The minimum evidence that V1 can be safely used for public validation without obvious auth, privacy, data, or operational gaps.

Launch readiness is not full production maturity.

### Production Smoke

A checklist proving the deployed app can authenticate, route users, hit the database, preserve quote privacy, and complete the core marketplace loop without using destructive data operations.

### Privacy Regression

A repeatable check that importer-owned quote data, forwarder own-quote data, competitor quote restrictions, and messaging participant boundaries still hold after hardening.

### Admin Provisioning

The controlled process for creating or identifying admin users outside public onboarding. It must not let ordinary users self-select admin.

### Abuse Report

Potential minimal safety signal from a user about a user, request, quote, or message. Reports are not currently implemented and must not become a moderation workflow without explicit approval.

## Deferred Or Conceptual Terms

- Public forwarder profile.
- SEO route/lane pages.
- Payments or escrow.
- Shipment tracking.
- Reviews or ratings.
- Analytics.
- Realtime messaging.
- Quote versions.
- Email delivery beyond readiness assessment.
- Logistics/forwarder ERP features.

## Invariants

- Clerk is authentication only.
- PostgreSQL owns business roles and profile state.
- Competitor forwarders must never see quote details.
- Messaging requires a quote.
- Suspended forwarder companies cannot submit quotes.
- Admin scope must remain small until real operational needs justify more.
