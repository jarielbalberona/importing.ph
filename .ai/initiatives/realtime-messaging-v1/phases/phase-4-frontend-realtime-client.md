# Phase 4: Frontend Realtime Client

Status: passed

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Objective

Add a small authenticated realtime client/provider and hooks for conversation-level subscriptions.

## Files Likely Involved

- App shell/provider files identified in Phase 0.
- New client/provider under `components/**`, `lib/**`, or `hooks/**` following existing repo patterns.
- Conversation message UI under importer and forwarder message routes.
- Existing fetch/cache hooks if present.

## Implementation Notes

- Connect only after auth is available.
- Disconnect on logout/unmount.
- Reconnect with backoff.
- After reconnect, refetch current conversation, conversation list, and unread counts.
- Add a conversation-level subscription hook.
- Use current cache/fetch pattern. If React Query is already present, update or invalidate relevant queries. If not present, do not introduce it without a Phase 0 decision.
- Deduplicate messages by message ID.
- Keep send actions request/response based.

## Acceptance Criteria

- Realtime client lifecycle is centralized.
- Conversation subscription hook is scoped to allowed conversation IDs.
- Client handles connect, disconnect, reconnect, and error states.
- Cache update/invalidation deduplicates messages.
- REST behavior remains the fallback.
- No global client state framework is added without explicit justification.

## Verification Commands

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`

## Risks

- Client-side subscriptions can expose guessed conversation IDs if server checks are weak.
- Reconnect loops can spam the server without backoff.
- Cache mutation can create duplicate or out-of-order messages.

## Rollback Notes

Remove provider/hooks and route wiring. Existing REST-rendered or fetch-based messaging must remain usable.

## Completion Notes

Added centralized `RealtimeProvider` and hooks in `components/realtime-provider.tsx`. The client mints a short-lived token through `/api/realtime/token`, connects to `/api/realtime/ws`, tracks connection status, supports subscribe/unsubscribe, reconnects with exponential backoff, and calls `router.refresh()` after reconnect for canonical recovery.

The frontend does not use React Query or a new global state framework. Message views are derived from server-rendered data plus socket-delivered deltas, deduplicated by `message.id`.

Verification:

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`: pass.
