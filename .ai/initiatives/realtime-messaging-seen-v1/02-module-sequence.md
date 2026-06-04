# Module Sequence

## Phase 0

Audit current notification unread and messaging UI.

## Phase 1

Design read-state schema and event contract.

## Phase 2

Persist read state through server actions and existing authorization.

## Phase 3

Emit `conversation.read_state.updated` after durable DB write.

## Phase 4

Mark read from conversation detail views and show `Seen` only under latest outgoing covered message.

## Phase 5

Run static verification and two-session browser smoke.

