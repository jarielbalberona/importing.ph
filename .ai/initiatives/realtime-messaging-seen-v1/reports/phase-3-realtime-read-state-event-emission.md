# Phase 3 Report: Realtime Read-State Event Emission

Verdict: PASS

Added read-state realtime delivery without adding socket writes.

## Event

`conversation.read_state.updated`

Payload:

```ts
{
  type: "conversation.read_state.updated";
  conversationId: string;
  readerUserProfileId: string;
  lastReadMessageId: string;
  lastReadAt: string;
}
```

## Behavior

- Events emit only after the read-state transaction succeeds.
- Events are not emitted when the cursor does not advance.
- Existing subscription-scoped fanout is reused.
- Sender and reader clients can receive the canonical state update.

## Verification

- `npm run type-check`: passed.
- `npm run lint`: passed.

## Risks

Realtime event loss is still acceptable because refresh reloads canonical read state from PostgreSQL.
