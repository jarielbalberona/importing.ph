# Phase 2: Backend Transport Foundation

Status: passed_with_issues

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Objective

Add the minimal authenticated WebSocket endpoint and connection registry without changing message persistence.

## Files Likely Involved

- WebSocket route/handler under `app/api/**` or the runtime-appropriate location verified in Phase 0.
- Realtime helper under `lib/**`.
- Existing auth helpers in `lib/authz.ts` or adjacent modules.
- Existing messaging participant helpers in `lib/messages.ts`.
- `package.json` only if Phase 0 proves a small transport dependency is required.
- `render.yaml` only if Phase 0 explicitly proves a safe config-only adjustment is required.

## Implementation Notes

- Implement WebSocket for V1 delivery/events.
- Do not implement SSE unless Phase 0 proves WebSocket persistent connections cannot run without unapproved infrastructure and a human explicitly approves fallback.
- Authenticate every connection.
- Resolve authenticated user to PostgreSQL `user_profiles`.
- Track connected users/conversations in memory only for local/single-instance V1.
- Implement subscribe/unsubscribe over WebSocket if needed.
- Clean up connection state on disconnect/error.
- Do not add Redis, queues, event buses, or external providers in this phase unless Phase 0 proves they are unavoidable and the human approves scope expansion.

## Acceptance Criteria

- WebSocket endpoint accepts authenticated connections.
- WebSocket endpoint rejects unauthenticated connections.
- User binding uses current auth/session and PostgreSQL profile truth.
- Authorized subscription checks reuse existing conversation access logic.
- Disconnect cleanup removes connection/subscription state.
- Single-instance limitation is documented if in-memory fanout is used.
- Existing message creation/listing behavior is untouched.

## Verification Commands

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`

## Risks

- Next.js route handlers may not support WebSocket upgrades in the current deployment shape.
- Long-lived WebSocket connections can hit hosting timeout/proxy limits.
- In-memory registries break under multiple instances.
- Auth cookies/tokens may not be available in the same form for realtime endpoints.

## Rollback Notes

Remove the WebSocket endpoint/helper and any transport dependency/config added in this phase. Existing messaging must continue to work because persistence was not touched.

## Completion Notes

Implemented root `server.mjs` custom Node server using the same deployable process and port. Normal HTTP requests are delegated to Next.js; only `/api/realtime/ws` upgrade requests are handled by the WebSocket server. Invalid upgrade paths are rejected.

Added short-lived first-party realtime tokens minted by authenticated Clerk/Next context at `/api/realtime/token`, validated during WebSocket handshake, and re-resolved to PostgreSQL `user_profiles` before socket acceptance.

Added in-memory connection and subscription registries for V1. Subscriptions are authorized server-side against importer profile ownership or forwarder company membership; client-sent role/company IDs are not trusted. Disconnect cleanup removes socket subscriptions.

Issue accepted: V1 fanout is in-memory and therefore only correct for local or confirmed single-instance deployment. Multi-instance Render deployment needs Redis/pubsub or equivalent later.

Verification:

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`: pass.
- Production-style custom server boot: pass on alternate local port `3101` after default `3001` was already occupied.
- Normal HTTP route through custom server: `curl -I http://localhost:3101/` returned `200`.
- Invalid WebSocket path: `ws://localhost:3101/not-realtime` returned `404`.
- Realtime path without token: `ws://localhost:3101/api/realtime/ws` returned `401`.
