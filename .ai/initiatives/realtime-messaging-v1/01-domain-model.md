# Domain Model

## Existing Concepts To Preserve

- Shipment request: importer-owned business request.
- Quote: forwarder-company submission that opens the messaging gate.
- Conversation: private thread for one shipment request and one quoting forwarder company.
- Message: persisted business communication row in PostgreSQL.
- Participant: importer owner or authorized member of the quoting forwarder company.
- Notification: DB-backed recipient record, separate from realtime delivery.

## New Realtime Concepts

- Realtime connection: authenticated browser connection bound to one current user profile.
- Subscription: server-side authorization grant for one connection to receive events for one conversation.
- Realtime event: delivery update emitted after the database write has succeeded.
- Reconciliation: REST refetch after connect/reconnect/error to recover missed state.
- Fanout registry: V1 in-memory mapping of connected users/conversations to open connections, if Phase 0 proves single-instance deployment is acceptable.

## Event Names

- `realtime.connected`
- `realtime.error`
- `conversation.subscribe`
- `conversation.unsubscribe`
- `conversation.subscribed`
- `conversation.unsubscribed`
- `conversation.message.created`
- `conversation.updated`
- `conversation.unread.changed` is deferred for V1 unless Phase 2 finds a safe notification-level invalidation event. Current repo has notification `read_at`, not conversation unread state.

## Payload Principles

- Include stable IDs and timestamps.
- Include enough message fields for immediate UI insertion when safe.
- Never include competitor quote details.
- Never include conversation data for unauthorized users.
- Allow clients to ignore payload details and refetch through REST.
- Include event versioning if payload shape is not trivial.

## Source Of Truth

PostgreSQL is the business source of truth. Realtime payloads are cache hints and delivery updates only.

If realtime event state and REST state disagree, REST wins.

## Authorization Model

- Connection authentication uses the current Clerk/session mechanism.
- User binding resolves to PostgreSQL `user_profiles`.
- Conversation subscription repeats server-side participant checks.
- Importer access requires request ownership.
- Forwarder access requires active forwarder company membership and quote-gated conversation access.
- Suspended forwarder behavior must match current messaging rules found in Phase 0; do not invent stricter or weaker behavior silently.
- Unauthorized subscription attempts return `realtime.error` or are rejected without leaking existence/details.

## Delivery Semantics

- At-least-once client delivery is acceptable.
- Exactly-once delivery is not required.
- Client deduplication by message ID is required.
- Missed messages are recovered by REST refetch.
- Connection loss must not corrupt message state.
- WebSocket messages cannot create database rows in V1.
- Client-to-server events are limited to subscribe, unsubscribe, and protocol health messages if needed.

## Explicit Non-Domain

- Typing state is not a domain concept in V1.
- Presence is not a domain concept in V1.
- Read receipts are not a domain concept in V1.
- Message delivery acknowledgements are not a business source of truth in V1.
