# Domain Model

## New Entity

`conversation_read_states` records one user's read cursor for one conversation.

Fields:

- `conversation_id`
- `user_profile_id`
- `last_read_message_id`
- `last_read_at`
- timestamps

## Meaning

`Seen` means another authorized participant user profile has read up to the current user's latest outgoing message.

Forwarder read state is per user profile, not company-wide.

## Source Of Truth

PostgreSQL is source of truth. Realtime read-state events are delivery hints.

## Non-Domain

- No per-message receipt list.
- No presence.
- No typing.
- No socket writes.

