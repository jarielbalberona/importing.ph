# Phase 3: Realtime Read-State Event Emission

Status: passed

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Objective

Emit read-state events after durable DB writes.

## Acceptance Criteria

- Emits `conversation.read_state.updated`.
- Event is post-write only.
- Fanout remains subscription-scoped.
- No socket write path is added.

## Execution Notes

- Added `conversation.read_state.updated` to the realtime event contract.
- Mark-read writes emit only after the database transaction succeeds and the state actually advances.
- Fanout uses the existing subscription-scoped realtime registry.
- No raw WebSocket read/write mutation path was added.

## Verification Commands

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`

## Risks

- Realtime event loss must be recoverable by refresh.

## Rollback Notes

Remove event type and publish call.
