# Implementation Plan

## Execution Order

1. Audit current read/unread and messaging UI truth.
2. Add explicit read-state schema and migration.
3. Add idempotent mark-read helper and participant read-state query.
4. Add post-write realtime event.
5. Mark read from conversation views and update `Seen` UI.
6. Verify with static checks and two-session browser smoke.

## Data Model

Use `conversation_read_states`:

- `id`
- `conversation_id`
- `user_profile_id`
- `last_read_message_id`
- `last_read_at`
- `created_at`
- `updated_at`

Unique key:

- `conversation_id`
- `user_profile_id`

Read state is per user profile. Forwarder company-wide seen is out of V1.

## Event Contract

Use:

```text
conversation.read_state.updated
```

Payload:

```ts
{
  type: "conversation.read_state.updated";
  version: 1;
  eventId: string;
  occurredAt: string;
  conversationId: string;
  readerUserProfileId: string;
  lastReadMessageId: string;
  lastReadAt: string;
}
```

## Guardrails

- PostgreSQL is source of truth.
- Mark-read is API/server-action-first.
- WebSocket delivers events only.
- Events emit only after read-state write.
- Do not trust client role or company IDs.
- Do not move read state backward.
- Do not fake `Seen` if mark-read fails.

