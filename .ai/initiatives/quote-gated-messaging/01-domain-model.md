# Domain Model

## Terms Expected From Dependencies

### Shipment Request

Expected from `shipment-request-wizard`.

Required for this initiative:

- Durable request table.
- Importer ownership.
- Request detail routes or helpers.
- Request identifier stable enough to attach conversations.

### Quote

Expected from `quote-submission-privacy`.

Required for this initiative:

- Durable quote table.
- Relationship to shipment request.
- Relationship to forwarder company.
- Submitted status or equivalent.
- Privacy boundary proving competitors cannot see quote details.

### Importer Profile

Implemented today as `importer_profiles`, but request ownership is expected from `shipment-request-wizard`.

For messaging, the importer participant should be derived from the shipment request owner, not manually duplicated as free-form participant data.

### Forwarder Company

Implemented today as `forwarder_companies`.

For messaging, the forwarder participant is the company that submitted the quote. Individual users may access messages only through valid `forwarder_members` membership.

## New Terms For This Initiative

### Conversation

Private thread scoped to one shipment request and one forwarder company.

Required properties:

- `shipment_request_id`
- `importer_profile_id` if useful for indexing, derived from the request owner
- `forwarder_company_id`
- `opened_by_quote_id`
- optional `opened_by_quote_version_id` if quote versions exist
- timestamps

Recommended constraint:

- Unique conversation per `shipment_request_id` plus `forwarder_company_id`.

### Message

Single text message inside a conversation.

Required properties:

- `conversation_id`
- sender user profile id
- sender role or sender type if needed for display
- body text
- created timestamp

Optional properties:

- `quote_id`
- `quote_version_id`
- `read_at` or per-participant read tracking only if V1 explicitly needs unread state.

### Participant

A viewer allowed to read or write in a conversation.

Allowed participants:

- Importer owner of the shipment request.
- User profile that is a member of the quoted forwarder company.

Forbidden:

- Other importers.
- Other forwarder companies.
- Public users.
- Admin users unless an explicit future admin inspection rule is approved.

### Quote Gate

Server-side access rule requiring an existing quote for the request and forwarder company before a conversation can exist or a message can be created.

Important: route guard alone is insufficient. Every read and write must verify the quote gate and participant membership.

### Conversation Identity

The unique business identity of a conversation is:

```text
shipment_request_id + forwarder_company_id
```

The importer side is derived from the shipment request owner. Duplicating importer identity is acceptable for query performance only if it is kept consistent with request ownership.

## Proposed Status / Lifecycle Model

Conversation lifecycle for V1:

- no row before quote, unless lazily created at first message after quote.
- active after quote submission.
- closed only if a later product decision defines closure.

Message lifecycle for V1:

- created.
- no edits/deletes unless explicitly approved.

Read behavior for V1:

- chronological messages.
- page refresh or form submit updates.
- no realtime delivery.
- no typing state.
- no delivery receipts.

## Privacy Rules

- Importer owner can see messages for conversations on its own request.
- Forwarder company members can see messages for conversations opened by their company's quote.
- Competitor forwarders cannot see conversation existence, message content, message IDs, sender names, or route-valid identifiers for other companies.
- Unrelated importers cannot see conversation existence or messages.
- Quote count visibility must not imply message access.

## Out-Of-Scope Terms

- Notification.
- Realtime channel.
- Attachment.
- Admin inspection.
- Public message page.
- Payment/escrow communication.
- Shipment tracking event.
- Support ticket.
