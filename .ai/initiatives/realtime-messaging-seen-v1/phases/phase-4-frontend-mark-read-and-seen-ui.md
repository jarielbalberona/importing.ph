# Phase 4: Frontend Mark-Read And Seen UI

Status: passed

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Objective

Mark conversations read from detail views and show subtle `Seen` only under the current user's latest outgoing message.

## Acceptance Criteria

- Mark-read runs when detail opens and when incoming message arrives in the open conversation.
- Seen is based on backend read state or realtime read-state event.
- Seen appears only under latest outgoing message covered by another user's read state.
- No React Query or global state framework is added.

## Execution Notes

- Importer and forwarder message detail views call authenticated mark-read actions for incoming latest messages.
- Both clients merge server-rendered read states with realtime read-state patches.
- `Seen` is rendered only for the current user's latest outgoing message covered by another user profile's read state.
- Existing sent check mark icon remains on every chat entry.

## Verification Commands

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`

## Risks

- UI must not imply per-message read receipts.

## Rollback Notes

Remove mark-read calls and seen display.
