# Domain Model

## Implemented Entities

### `user_profiles`

Application profile linked to Clerk identity.

Fields:

- `id`
- `clerk_user_id`
- `role`
- `full_name`
- `created_at`
- `updated_at`

Constraints:

- Unique `clerk_user_id`.

Rules:

- PostgreSQL role is the business authorization source of truth.
- Clerk metadata must not become the source of business role/profile truth.

### `user_role`

PostgreSQL enum and Drizzle enum.

Values:

- `importer`
- `forwarder`
- `admin`

### `importer_profiles`

Business profile for an importer user.

Fields:

- `id`
- `user_profile_id`
- `company_name`
- timestamps

Constraints:

- One importer profile per user profile.

### `forwarder_companies`

Forwarder company record.

Fields:

- `id`
- `name`
- `is_suspended`
- `suspended_at`
- `suspended_reason`
- `suspended_by_user_profile_id`
- timestamps

Rules:

- Company-level suspension blocks quote submission.
- Admin actor may be recorded through `suspended_by_user_profile_id`.
- User-level suspension and Clerk account disabling are not implemented.

### `forwarder_members`

Membership linking a user profile to a forwarder company.

Fields:

- `id`
- `user_profile_id`
- `forwarder_company_id`
- `member_role`
- timestamps

Constraints:

- One forwarder membership per user profile.

Current default:

- `member_role = owner`

### `shipment_requests`

Importer-owned request for a quoteable shipment/import.

Fields:

- `id`
- `importer_profile_id`
- `status`
- `cargo_description`
- `cargo_type`
- `total_cbm`
- `total_weight_kg`
- `package_count`
- `length_cm`
- `width_cm`
- `height_cm`
- `declared_value`
- `origin`
- `destination`
- `delivery_preference`
- `shipping_preference`
- `notes`
- `attachment_notes`
- timestamps

Statuses:

- `draft`
- `posted`
- `quote_selected`
- `cancelled`

Rules:

- Importer owns requests through `importer_profile_id`.
- Current UI creates posted requests only.
- Draft is schema-only.
- Attachments are notes-only.
- Forwarder open-request list/detail exposes posted quoteable request data.

### `cargo_type`

PostgreSQL enum.

Values:

- `general_goods`
- `electronics`
- `apparel`
- `machinery`
- `furniture`
- `food_or_beverage`
- `cosmetics`
- `other`

### `delivery_preference`

PostgreSQL enum.

Values:

- `door_to_door`
- `port_to_door`
- `door_to_port`
- `port_to_port`
- `not_sure`

### `shipping_preference`

PostgreSQL enum.

Values:

- `lowest_cost`
- `fastest`
- `balanced`
- `not_sure`

### `quotes`

Private commercial quote submitted by a forwarder company for a shipment request.

Fields:

- `id`
- `shipment_request_id`
- `forwarder_company_id`
- `submitted_by_forwarder_member_id`
- `status`
- `quote_amount`
- `currency`
- `service_offered`
- `estimated_transit_min_days`
- `estimated_transit_max_days`
- `inclusions`
- `exclusions`
- `notes`
- `valid_until`
- timestamps

Statuses:

- `submitted`
- `accepted`
- `rejected`
- `withdrawn`

Constraints:

- Unique one quote per shipment request plus forwarder company.

Rules:

- Importer owner can see all quote details for owned request.
- Submitting forwarder/company can see its own quote details.
- Competitor forwarders can see allowed aggregate metadata such as quote count only.
- Competitor forwarders must not see identity, amount, transit, service, inclusions, exclusions, notes, messages, or quote version details.
- Quote versions do not exist.
- Currency is currently PHP.

### `conversations`

Quote-gated conversation between the importer and one forwarder company for one shipment request.

Fields:

- `id`
- `shipment_request_id`
- `importer_profile_id`
- `forwarder_company_id`
- `opened_by_quote_id`
- timestamps

Constraints:

- Unique one conversation per shipment request plus forwarder company.

Rules:

- No quote means no conversation.
- Importer must own the request.
- Forwarder company must have a qualifying quote on the request.

### `messages`

Message inside a participant-scoped conversation.

Fields:

- `id`
- `conversation_id`
- `sender_user_profile_id`
- `body`
- timestamps

Rules:

- Only importer owner and quoting forwarder company members can read/write.
- V1 has no realtime delivery, read receipts, or attachments.

### `notifications`

Recipient-owned in-app notification record.

Fields:

- `id`
- `recipient_user_profile_id`
- `actor_user_profile_id`
- `type`
- `title`
- `body`
- `link_href`
- `source_shipment_request_id`
- `source_quote_id`
- `source_conversation_id`
- `source_message_id`
- `dedupe_key`
- `read_at`
- timestamps

Types:

- `new_quote_received`
- `quote_accepted`
- `quote_rejected`
- `message_received`

Constraints:

- Unique `dedupe_key`.

Rules:

- Notification reads and mark-read updates are scoped to the current recipient user profile.
- Notification writes are best-effort.
- Email delivery is not implemented.

## Implemented Route Concepts

- `/onboarding`: importer/forwarder onboarding.
- `/after-auth`: role-based post-auth redirect.
- `/unauthorized`: deterministic wrong-role destination.
- `/app/requests`: importer request list.
- `/app/requests/new`: importer request creation.
- `/app/requests/[requestId]`: importer-owned request detail and quote comparison.
- `/app/forwarder/requests`: forwarder open request list.
- `/app/forwarder/requests/[requestId]`: forwarder request detail and quote submission/own quote view.
- `/app/requests/messages/**`: importer messaging.
- `/app/forwarder/messages/**`: forwarder messaging.
- `/app/notifications`: notification inbox.
- `/admin`: admin read overview and forwarder-company suspension.

## Deferred / Schema-Only Concepts

- Request draft UI: deferred; `draft` status exists only in schema.
- File attachments: deferred; `attachment_notes` only.
- Quote versions: not implemented.
- Realtime messaging/read receipts: not implemented.
- Email/Resend delivery: deferred.
- Report/moderation tables and workflows: deferred.
- User-level suspension and Clerk disabling: deferred.
- Public forwarder profile SEO and route/lane SEO pages: deferred.

## Source-Of-Truth Rules

- Clerk is identity only.
- PostgreSQL owns roles, profiles, companies, membership, requests, quotes, conversations, messages, notifications, and suspension state.
- Drizzle schema owns current database structure.
- Final reports and `.ai/state/*` contain execution evidence; keep `.ai/core/*` aligned after future implementation.
