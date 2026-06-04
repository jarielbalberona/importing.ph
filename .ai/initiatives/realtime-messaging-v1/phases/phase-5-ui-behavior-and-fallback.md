# Phase 5: UI Behavior And Fallback

Status: passed_with_issues

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Objective

Wire realtime events into the existing conversation UI, conversation list, and unread refresh behavior while preserving REST fallback.

## Files Likely Involved

- Importer message routes/components under `app/app/requests/messages/**`.
- Forwarder message routes/components under `app/app/forwarder/messages/**`.
- Notification/unread UI under `app/app/notifications/**` or shared shell components.
- Realtime hooks/client from Phase 4.

## Implementation Notes

- Conversation window should show new messages without manual refresh when connected.
- Conversation list should update or invalidate when a new message arrives.
- Unread count should update or invalidate according to current unread source.
- Show disconnected/reconnecting state only if useful and not noisy.
- Sending must still work through existing REST/action behavior when realtime is down.
- Avoid elaborate chat UI redesign. This is operational software.

## Acceptance Criteria

- Importer receives forwarder messages in an open conversation without manual refresh.
- Forwarder receives importer messages in an open conversation without manual refresh.
- Conversation list reflects latest message/order after event or invalidation.
- Unread state refreshes or invalidates after event.
- Disconnect does not block REST message send/list.
- Reconnect refetches missed state.

## Verification Commands

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`

## Risks

- UI may imply delivery guarantees realtime does not provide.
- Too much disconnected UI can distract users.
- Updating unread counts locally can drift from DB truth; invalidation is safer for V1.

## Rollback Notes

Remove UI subscriptions and realtime state display. Existing conversation routes and REST/message actions must remain.

## Completion Notes

Wired realtime subscriptions into importer and forwarder messaging UI.

Implemented behavior:

- Importer conversation detail appends `conversation.message.created` events for the active conversation without manual refresh.
- Importer conversation list subscribes to visible conversation IDs and patches latest preview/date while also refreshing server state.
- Forwarder conversation detail appends active conversation messages without manual refresh.
- Forwarder conversation list subscribes to visible conversation IDs and uses `router.refresh()` on `conversation.updated`.
- Reconnect recovery refreshes canonical server-rendered state.
- Existing server action message forms remain the only write path and continue to work if the socket is disconnected.

Unread was not locally faked. Current unread truth is notification-level `notifications.read_at`; V1 realtime message events refresh affected server-rendered state rather than inventing read receipts or conversation unread counters.

Issue accepted: no full authenticated two-browser smoke was completed in this execution turn, so browser-proven realtime UX remains pending even though static checks and custom-server probes passed.

Verification:

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`: pass.
