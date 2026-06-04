# Phase Report: Backend Transport Foundation

Final status: `passed_with_issues`

## Executive Summary

Phase 2 implemented the minimal WebSocket transport foundation for V1 realtime messaging.

The implementation keeps the app as one Next.js deployable on the same Render web service. A root `server.mjs` custom Node server delegates normal HTTP traffic to Next.js and handles only WebSocket upgrades for `/api/realtime/ws`.

Accepted issue: V1 uses in-memory connection/subscription tracking. That is acceptable only for local or confirmed single-instance deployment. Multi-instance fanout still requires Redis/pubsub or equivalent later.

## Files Changed

- `server.mjs`
- `app/api/realtime/token/route.ts`
- `lib/realtime-token.ts`
- `lib/realtime-events.ts`
- `package.json`
- `package-lock.json`

## Implementation Summary

- Added `ws` transport dependency and `@types/ws`.
- Changed production start script to `NODE_ENV=production node server.mjs`.
- Added short-lived first-party realtime token minting from Clerk-authenticated Next context.
- Validated realtime token during WebSocket handshake.
- Re-resolved socket identity to PostgreSQL `user_profiles`.
- Added in-memory connection and subscription registries.
- Implemented client events:
  - `conversation.subscribe`
  - `conversation.unsubscribe`
- Implemented server events:
  - `realtime.connected`
  - `realtime.error`
  - `conversation.subscribed`
  - `conversation.unsubscribed`
- Rejected invalid upgrade paths.
- Cleaned up connections and subscriptions on disconnect.

## Auth And Authorization

Socket auth uses a short-lived signed token minted by `/api/realtime/token`. The token is not business truth. The custom server validates the signature and expiry, then confirms the matching `user_profiles` row before accepting the socket.

Subscription authorization is server-side:

- importer sockets may subscribe only when the conversation belongs to the user's importer profile.
- forwarder sockets may subscribe only when the conversation belongs to the user's forwarder company membership.
- client-sent role, company id, and importer profile id are ignored.

## Verification

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`: pass.
- `PORT=3101 NODE_ENV=production node server.mjs`: pass.
- `curl -I http://localhost:3101/`: pass, returned `200`.
- invalid WebSocket path: pass, returned `404`.
- realtime WebSocket path without token: pass, returned `401`.

## Risks

- In-memory fanout does not work across multiple app instances.
- Production must run the custom server start command; `next start` will not attach the WebSocket upgrade handler.
- Realtime tokens depend on `REALTIME_TOKEN_SECRET` or `CLERK_SECRET_KEY`; production should set a dedicated `REALTIME_TOKEN_SECRET`.

