# Domain Model

## Terms Expected From Dependencies

### Shipment Request

Expected from `shipment-request-wizard`.

Required for this initiative:

- Durable request table.
- Importer ownership.
- Posted/open status truth.
- Forwarder visibility or matching behavior from `forwarder-open-requests`.

### Quote

Expected from `quote-submission-privacy`.

Required for this initiative:

- Durable quote table.
- Quote creation action.
- Request relationship.
- Forwarder company ownership.
- Expiration data if quote-expiring-soon notifications are attempted.

### Quote Decision

Expected from `importer-quote-comparison`.

Required for this initiative:

- Quote accepted/rejected actions.
- Selected/rejected quote status truth.
- Forwarder company recipient derivation.

### Conversation / Message

Expected from `quote-gated-messaging`.

Required for this initiative:

- Durable conversation and message tables.
- Message creation action.
- Participant access rules.
- Recipient derivation for importer and forwarder messages.

## New Terms For This Initiative

### Notification

Durable in-app record that tells one user profile about a marketplace event they are allowed to know about.

Recommended fields:

- `id`
- `recipient_user_profile_id`
- `recipient_role`
- `type`
- `title`
- `body`
- `href`
- `actor_user_profile_id`
- source entity references as nullable typed columns
- `dedupe_key`
- `read_at`
- timestamps

### Notification Type

Controlled set of event categories. Recommended V1 types:

- `new_matching_request`
- `new_quote_received`
- `importer_replied`
- `forwarder_replied`
- `quote_accepted`
- `quote_rejected`
- `quote_expiring_soon`

Only implement types with real event sources. Document skipped types in the phase report.

### Recipient

The user profile that can read and mark the notification.

Rules:

- Importer notifications target importer user profiles tied to request ownership.
- Forwarder notifications target user profiles tied to the relevant forwarder company membership.
- Admin recipients are out of scope unless explicitly approved.

### Actor

The user profile or system action that caused the notification.

Examples:

- Forwarder user submits quote.
- Importer user sends message.
- Forwarder user sends message.
- Importer user accepts/rejects quote.
- System computes expiring quote only if no async infrastructure is required.

### Source Entity

The business object the notification points to.

Possible references:

- shipment request id
- quote id
- quote version id if implemented
- conversation id
- message id
- forwarder company id

Prefer typed nullable columns over unstructured JSON for core references.

### Dedupe Key

Deterministic idempotency key that prevents duplicate notifications during retries.

Examples:

- `quote:<quoteId>:created:recipient:<profileId>`
- `message:<messageId>:recipient:<profileId>`
- `quote:<quoteId>:accepted:recipient:<profileId>`
- `quote:<quoteId>:rejected:recipient:<profileId>`

## Proposed Schema Model

Recommended table: `notifications`.

Recommended constraints and indexes:

- Unique index on `dedupe_key`.
- Index on `recipient_user_profile_id, read_at, created_at`.
- Index on `recipient_user_profile_id, created_at`.
- Foreign key to `user_profiles` for recipient.
- Foreign key to `user_profiles` for actor when actor exists.
- Optional foreign keys to request, quote, conversation, and message tables once dependency schemas exist.

Use a small metadata field only if needed for display hints that are not authorization-sensitive. Do not hide core relationships in JSON.

## Privacy Rules

- A notification is readable only by its `recipient_user_profile_id`.
- A notification must not expose competitor quote amount, notes, transit time, inclusions, exclusions, or message content to unauthorized users.
- Notification list DTOs must be recipient-scoped by query, not filtered only in UI.
- Notification links must route through normal protected pages that re-check authorization.

## Out-Of-Scope Terms

- Email send job.
- Push notification token.
- Background worker.
- Queue event.
- Analytics event.
- Admin audit console.
- Public notification.
