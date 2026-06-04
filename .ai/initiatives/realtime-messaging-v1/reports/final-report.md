# Final Report: Realtime Messaging V1

Final verdict: `PASS WITH ISSUES`

## Summary

Realtime messaging V1 is implemented as a WebSocket delivery layer on the same Node/Next.js Render service.

The implementation preserves the critical business rule: message creation remains REST/server-action/API-first and PostgreSQL remains the source of truth. WebSocket is used only for post-commit delivery events.

## Phases Completed

- Phase 2 Backend Transport Foundation: `passed_with_issues`
- Phase 3 Backend Message Event Emission: `passed`
- Phase 4 Frontend Realtime Client: `passed`
- Phase 5 UI Behavior And Fallback: `passed_with_issues`
- Phase 6 Verification And Hardening: `passed_with_issues`

## Capabilities Implemented

- Custom root `server.mjs` preserving normal Next.js HTTP behavior.
- WebSocket upgrade handling for `/api/realtime/ws`.
- Short-lived first-party realtime token endpoint at `/api/realtime/token`.
- Token validation and PostgreSQL `user_profiles` re-resolution during handshake.
- In-memory connection and subscription registries.
- Server-side subscription authorization for importer ownership and forwarder company membership.
- Client subscribe/unsubscribe events.
- Server connected/error/subscribed/unsubscribed events.
- Post-commit `conversation.message.created` and `conversation.updated` events.
- Central frontend realtime provider with reconnect/backoff.
- Importer and forwarder conversation detail realtime message append.
- Importer and forwarder conversation list refresh/update behavior.
- REST/server-rendered reconnect recovery.

## Guardrail Status

- Same Render service only: kept.
- No socket writes: kept.
- No Redis/pubsub: kept.
- No React Query: kept.
- No third-party realtime provider: kept.
- PostgreSQL source of truth: kept.
- Events post-commit only: kept.
- No typing indicators/read receipts/presence/reactions/attachments/push: kept.

## Verification Results

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm test`: pass, 10 tests.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build`: pass.
- `git diff --check`: pass.
- `node tools/ai-runner/index.mjs realtime-messaging-v1 --check-only`: pass.
- custom server boot on alternate local port `3101`: pass.
- normal HTTP route through custom server: pass.
- invalid WebSocket path rejection: pass.
- unauthenticated realtime path rejection: pass.

## Focused Authenticated Browser Smoke

Status: `PASS`

Runtime:

- App was served through `node server.mjs` on `http://localhost:3001`.
- In-app browser was used for the importer session.
- Isolated Chrome profile with CDP was used for the forwarder session because the in-app browser reported `singleTab` mode and cannot hold two isolated sessions.

Users:

- Importer: `a1+clerk_test@clerk.com`, Clerk user id `user_3EV8BU6ymuownGqzYo2Dq5bYYhV`.
- Forwarder: `a2+clerk_test@clerk.com`, Clerk user id `user_3EV8hKwD0R7E7cH4n5XIZsrNLqM`.

Conversation:

- Conversation id: `cf68b210-6a61-4e76-80bd-c91178c51cf8`.
- Shipment request id: `4c1cf13a-868f-454a-9780-7e2133237c83`.
- Shipment: `Smoke shipment fixed mpv403zq`.
- Forwarder company: `Smoke Forwarder Logistics`.

Messages:

- Importer sent: `Importer realtime rt-smoke-1780588596674`.
- Forwarder received without manual refresh: pass, message body count `1`.
- Forwarder sent: `Forwarder realtime rt-smoke-1780588638679`.
- Importer received without manual refresh: pass, message body count `1`.
- Refresh recovery on importer: pass, both smoke message bodies remained count `1`.
- Refresh recovery on forwarder: pass, both smoke message bodies remained count `1`.

Security checks:

- Authenticated `/api/realtime/token` from forwarder context: pass, `200`.
- Unauthenticated `/api/realtime/token`: pass, `401`.
- Unauthenticated `/api/realtime/ws`: pass, `401`.
- Invalid WebSocket path: pass, `404`.
- Normal HTTP route `/`: pass, `200`.
- Authenticated unauthorized subscription to unrelated conversation `d56a7bc6-1ef2-4cbb-9741-70684a1e766b`: pass, server returned `realtime.error` with `code: "forbidden"`.

Screenshots:

- Forwarder before realtime receive: `/tmp/realtime-forwarder-before.png`.
- Forwarder after importer realtime message: `/tmp/realtime-forwarder-after-importer.png`.
- Forwarder after sending reply: `/tmp/realtime-forwarder-after-send.png`.
- Importer after receiving forwarder reply: `/tmp/realtime-importer-after-forwarder.png`.
- Importer after refresh recovery: `/tmp/realtime-importer-after-refresh.png`.
- Forwarder after refresh recovery: `/tmp/realtime-forwarder-after-refresh.png`.

## Accepted Issues

- Production correctness of in-memory fanout depends on confirmed single-instance deployment.
- Production should set a dedicated `REALTIME_TOKEN_SECRET`.
- Deployed Render smoke remains unproven until target URL, target DB, and Clerk target configuration are operator-confirmed.

## Next Recommended Follow-Up

Run deployed realtime smoke after target environment confirmation:

```text
Confirm Render URL, target DB, Clerk target config, and instance count. Then repeat the importer/forwarder realtime smoke against the deployed service.
```
