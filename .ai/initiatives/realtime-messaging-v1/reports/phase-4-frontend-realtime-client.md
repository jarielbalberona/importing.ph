# Phase Report: Frontend Realtime Client

Final status: `passed`

## Executive Summary

Phase 4 added a small first-party realtime client/provider without React Query or a new state framework.

The provider connects after the app shell is loaded, fetches a short-lived realtime token, opens `/api/realtime/ws`, tracks lifecycle state, reconnects with backoff, and refreshes canonical server-rendered data after reconnect.

## Files Changed

- `components/realtime-provider.tsx`
- `components/app-shell.tsx`

## Implementation Summary

Added:

- `RealtimeProvider`
- `useRealtime`
- `useConversationRealtime`

Client behavior:

- fetch realtime token from `/api/realtime/token`.
- open WebSocket to `/api/realtime/ws`.
- subscribe/unsubscribe to conversation IDs.
- track `connecting`, `connected`, `reconnecting`, and `disconnected`.
- reconnect with exponential backoff.
- call `router.refresh()` after reconnect to recover missed events.

## Cache And State Strategy

There is no React Query in this repo. The frontend keeps server-rendered props as canonical UI input and merges only socket-delivered deltas in local component state. Messages are deduplicated by `message.id`.

## Verification

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`: pass.

## Risks

- Reconnect refresh is broad. That is acceptable for V1 and safer than inventing JSON read endpoints or a client cache layer.
- A full browser smoke is still needed to prove UX timing with real Clerk sessions.

