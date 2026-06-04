# Phase Report: Realtime Contract Design

Final status: `passed_with_issues`

## Executive Summary

Phase 1 designed the WebSocket contract and custom server approach for V1 realtime messaging. No application code, packages, scripts, schema, migrations, or infrastructure files were modified.

The design is viable: keep the same Render web service, replace `next start` with a minimal custom Node server entrypoint during Phase 2, let Next.js handle all normal HTTP traffic, and attach WebSocket handling to the same HTTP server via `upgrade` handling.

The biggest issue is operational, not architectural: a custom server is required because the current `next start` entrypoint does not expose the app-owned HTTP upgrade seam needed for a normal `ws` server. That is acceptable for this locked WebSocket architecture, but it must be implemented narrowly.

## No-Application-Code Confirmation

No app code, schema, migrations, packages, runtime config, or database state was modified.

Files changed by this phase:

- `.ai/initiatives/realtime-messaging-v1/00-overview.md`
- `.ai/initiatives/realtime-messaging-v1/01-domain-model.md`
- `.ai/initiatives/realtime-messaging-v1/07-implementation-plan.md`
- `.ai/initiatives/realtime-messaging-v1/phases/phase-1-realtime-contract-design.md`
- `.ai/initiatives/realtime-messaging-v1/reports/phase-1-realtime-contract-design.md`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

## Final Custom Server Recommendation

Use a minimal custom Node server entrypoint in Phase 2.

Recommended file:

- `server.mjs`

Reason:

- The current `package.json` does not set `"type": "module"`.
- A `.mjs` file can use ESM imports cleanly without changing package module mode.
- Keeping it at repo root makes Render start command simple.

Required behavior:

```text
server.mjs
-> import next
-> create HTTP server
-> pass all normal request events to Next request handler
-> listen on process.env.PORT || 3001 locally
-> attach WebSocket upgrade handling for one realtime path
-> reject all other upgrade paths with socket destroy / 404-style close
```

Normal HTTP behavior:

- Next.js must continue to own App Router pages, server actions, route handlers, static assets, and API routes.
- The custom server must not route ordinary HTTP requests itself except for handing them to Next.

WebSocket behavior:

- Only handle upgrade requests for the selected realtime path.
- Reject invalid paths.
- Authenticate before accepting a usable session.
- Bind accepted sockets to one authenticated app user profile.

Expected Phase 2 package/script changes:

```json
{
  "scripts": {
    "dev": "next dev --port=3001",
    "build": "next build",
    "start": "NODE_ENV=production node server.mjs"
  },
  "dependencies": {
    "ws": "<current stable>",
    "@types/ws": "<if needed, dev dependency>"
  }
}
```

Local dev options:

- Keep `npm run dev` as `next dev --port=3001` for ordinary app development during Phase 2 if WebSocket local dev is not needed immediately.
- Add a separate script only if needed, for example `dev:ws`, to run the custom server in development mode.
- Do not degrade the everyday Next dev workflow unless Phase 2 proves it is necessary.

Render deployment:

- Same Render web service.
- Same public port via `process.env.PORT`.
- No separate backend.
- No separate WebSocket service.
- No Redis/pubsub in V1.

Deployment risks:

- Custom server changes the production start path.
- `server.mjs` is outside normal Next compilation/bundling; it must use Node-compatible syntax and imports.
- Render instance replacement will close sockets; clients must reconnect.
- Horizontal scaling breaks in-memory fanout across instances.

## Final WebSocket Route / Path

Use:

```text
/api/realtime/ws
```

Rationale:

- It is clearly an application API endpoint.
- It avoids colliding with user-facing page routes.
- It keeps realtime under the existing `/api` namespace without creating a normal Next route handler.
- The custom server can intercept only upgrade requests for this path and let all ordinary `/api/**` HTTP requests continue to Next.

Important:

- Do not create `app/api/realtime/ws/route.ts` for the WebSocket endpoint unless Phase 2 proves a supported Next upgrade API exists. The custom server owns upgrade handling.
- Ordinary non-upgrade HTTP requests to `/api/realtime/ws` should be rejected or passed to Next as not found; do not expose a second protocol there.

## Auth Strategy

Recommended V1 auth: first-party short-lived realtime token minted by an authenticated Next route/action, then sent as a WebSocket bearer token or query token during connection.

Flow:

```text
client with Clerk session
-> authenticated route/action mints short-lived realtime token
-> client opens wss://host/api/realtime/ws?token=...
-> custom server validates token
-> server resolves user_profiles by clerk_user_id
-> socket is bound to userProfileId and role
```

Why this is safer than raw cookie auth:

- WebSocket upgrade handling in a custom Node server sits outside the normal Next server action/page helper path.
- Existing auth helpers redirect; sockets need reject/close semantics.
- A short-lived token avoids relying on redirect-oriented helpers and makes socket rejection explicit.
- Token TTL can be short, and the token can contain only `clerkUserId`, issued-at, expiry, and a nonce/signature.

Acceptable fallback:

- Cookie/session auth can be used only if Phase 2 proves Clerk can safely validate the upgrade request headers in this custom server context without relying on redirects.

Required socket auth helper:

- Non-redirecting.
- Returns `{ profile, clerkUserId }` or a structured failure.
- Never trusts client-sent role, importer profile id, or forwarder company id.
- Resolves role and business identity from PostgreSQL.

Unauthenticated behavior:

- Reject before subscription.
- Close socket with a generic unauthorized code/reason.
- Do not reveal whether any conversation exists.

## Subscription Authorization Strategy

Client-to-server subscription event:

```json
{
  "type": "conversation.subscribe",
  "requestId": "client-generated-request-id",
  "conversationId": "uuid"
}
```

Server authorization:

```text
authenticated socket
-> parse conversationId
-> resolve current user profile
-> if role importer:
     require importer profile for user
     require conversation.importer_profile_id = importerProfile.id
-> if role forwarder:
     require forwarder member for user
     require conversation.forwarder_company_id = member.forwarder_company_id
-> reject otherwise
-> register socket subscription for conversationId
```

Reuse:

- Extract non-redirecting participant checks from `lib/messages.ts` or add adjacent helpers.
- Do not call redirecting `requireImporterProfile()` or `requireForwarderMember()` directly from socket handlers.

Authorization failure:

- Return `realtime.error` with generic `forbidden` or `not_found`.
- Do not distinguish no conversation from no permission.
- Do not include quote, request, company, or participant metadata.

Fanout rules:

- Importer receives events for conversations where they own the importer profile.
- Forwarder receives events for conversations where their current company is the conversation forwarder company.
- Sender receives the event too for canonical reconciliation.
- Forwarder fanout should match current notification behavior for V1: all current members of the forwarder company except sender as recipients, plus sender if connected for reconciliation.

Open decision:

- If future product rules introduce assigned conversation participants, fanout must narrow. No assignment model exists today.

## Event Contract Summary

All events carry:

- `type`
- `version: 1`
- `eventId`
- `occurredAt`

`eventId` should be stable per emitted event. For `conversation.message.created`, use a deterministic value such as `message:<messageId>:created` if practical, otherwise use a UUID and require client dedupe by `message.id`.

### `realtime.connected`

Direction: server to client.

Payload:

```json
{
  "type": "realtime.connected",
  "version": 1,
  "eventId": "uuid",
  "occurredAt": "iso-date",
  "connectionId": "uuid",
  "userProfileId": "uuid"
}
```

Authorization rule:

- Sent only after successful socket authentication.

UI behavior:

- Mark realtime as connected.
- Do not mutate business state.

Fallback:

- If not received, client treats socket as disconnected and uses normal server-rendered behavior.

### `realtime.error`

Direction: server to client.

Payload:

```json
{
  "type": "realtime.error",
  "version": 1,
  "eventId": "uuid",
  "occurredAt": "iso-date",
  "requestId": "client-request-id-or-null",
  "code": "unauthorized|forbidden|invalid_payload|rate_limited|server_error",
  "message": "Generic safe message."
}
```

Authorization rule:

- Must never leak conversation existence or private quote/message data.

UI behavior:

- For subscription errors, keep page usable through REST/server-rendered data.
- Optionally show subtle reconnect/degraded state.

Fallback:

- Existing page refresh/list behavior.

### `conversation.subscribe`

Direction: client to server.

Payload:

```json
{
  "type": "conversation.subscribe",
  "version": 1,
  "requestId": "uuid",
  "conversationId": "uuid"
}
```

Authorization rule:

- Server must verify participant access before registering subscription.

UI behavior:

- None until ack.

Fallback:

- If subscribe fails, current page still renders from server data.

### `conversation.subscribed`

Direction: server to client.

Payload:

```json
{
  "type": "conversation.subscribed",
  "version": 1,
  "eventId": "uuid",
  "occurredAt": "iso-date",
  "requestId": "client-request-id",
  "conversationId": "uuid"
}
```

Authorization rule:

- Sent only after successful participant authorization.

UI behavior:

- Mark active conversation realtime subscription ready.

Fallback:

- If not received, client can retry with backoff or rely on REST/server refresh.

### `conversation.unsubscribe`

Direction: client to server.

Payload:

```json
{
  "type": "conversation.unsubscribe",
  "version": 1,
  "requestId": "uuid",
  "conversationId": "uuid"
}
```

Authorization rule:

- Socket can unsubscribe only its own registered subscription.

UI behavior:

- None.

Fallback:

- Disconnect cleanup removes subscriptions anyway.

### `conversation.unsubscribed`

Direction: server to client.

Payload:

```json
{
  "type": "conversation.unsubscribed",
  "version": 1,
  "eventId": "uuid",
  "occurredAt": "iso-date",
  "requestId": "client-request-id",
  "conversationId": "uuid"
}
```

Authorization rule:

- Sent only to the socket that requested unsubscribe.

UI behavior:

- Mark subscription inactive.

Fallback:

- Disconnect cleanup.

### `conversation.message.created`

Direction: server to client.

Payload:

```json
{
  "type": "conversation.message.created",
  "version": 1,
  "eventId": "message:MESSAGE_ID:created",
  "occurredAt": "iso-date",
  "conversationId": "uuid",
  "message": {
    "id": "uuid",
    "conversationId": "uuid",
    "senderUserProfileId": "uuid",
    "senderRole": "importer|forwarder|admin",
    "senderName": "string",
    "body": "string",
    "createdAt": "iso-date"
  }
}
```

Authorization rule:

- Sent only to sockets authenticated as authorized participants for the conversation.
- Sender may receive it too.

UI behavior:

- If active conversation id matches, append only if `message.id` is not already present.
- If message already exists, ignore or replace with server payload.
- Update current conversation preview locally if present.
- Trigger `router.refresh()` when simple reconciliation is safer.

Fallback:

- REST/server-rendered conversation refetch after reconnect or manual refresh.

### `conversation.updated`

Direction: server to client.

Payload:

```json
{
  "type": "conversation.updated",
  "version": 1,
  "eventId": "conversation:CONVERSATION_ID:updated:UPDATED_AT",
  "occurredAt": "iso-date",
  "conversationId": "uuid",
  "updatedAt": "iso-date",
  "latestMessageId": "uuid",
  "latestMessagePreview": "string"
}
```

Authorization rule:

- Sent only to authorized participants.

UI behavior:

- Reorder/update conversation list if it is already loaded.
- For V1, `router.refresh()` is acceptable to avoid duplicating list logic.

Fallback:

- Server-rendered list refetch.

### `conversation.unread.changed`

Status: deferred for V1 as a business event.

Reason:

- Current model has notification `read_at`, not conversation unread/read receipts.

Allowed V1 substitute:

- Use `conversation.message.created` to trigger notification/list refresh.
- Optionally define a notification-level invalidation event later, not a fake conversation unread count.

If implemented later, it must not claim read-receipt semantics.

## Explicitly Forbidden V1 Socket Events

Do not implement:

- `message.send`
- `message.create`
- `conversation.create`
- quote/request writes over WebSocket.
- notification mark-read over WebSocket.
- any database mutation over WebSocket.

V1 socket client-to-server events are limited to:

- `conversation.subscribe`
- `conversation.unsubscribe`
- optional protocol heartbeat if the selected library requires app-level health messages.

## Reconnect And Recovery

Client behavior:

```text
socket closes/errors
-> mark realtime disconnected/degraded
-> reconnect with exponential backoff and jitter
-> re-authenticate
-> resubscribe to visible active conversation ids
-> call router.refresh() for current messages/list/notifications
```

Rules:

- Do not assume missed WebSocket events are replayed.
- Do not make realtime required for correctness.
- REST/server-rendered data wins after reconnect.
- Keep send forms working through existing server actions.

Server behavior:

- Remove socket subscriptions on disconnect.
- Use ping/pong or library heartbeat to detect stale sockets.
- On process shutdown, close sockets gracefully if practical.

## Frontend State Strategy Without React Query

Do not add React Query.

Recommended V1:

- Add a small realtime provider/client under the authenticated app shell.
- Client connects after auth/session is ready.
- Active conversation component subscribes to the current conversation id.
- Maintain local message state initialized from server props for the active conversation.
- Deduplicate by `message.id`.
- Use `router.refresh()` after reconnect and after meaningful events if local patching becomes risky.
- Conversation list can either patch preview/order from `conversation.updated` or simply `router.refresh()` for V1.
- Notification/unread should refresh through `router.refresh()` because current unread state is notification-backed.

Potential Phase 2+ decision:

- Add minimal JSON read endpoints for conversation detail/list if `router.refresh()` proves too broad. This should be a deliberate implementation decision, not Phase 1 scope.

## Backend Data Integrity Plan

Phase 3 must not emit events from the current two-statement write path without tightening it.

Required refactor:

```text
db.transaction
-> insert messages row
-> update conversations.updated_at
-> return durable message payload and conversation metadata
commit
-> notifyMessageCreated best-effort
-> emit realtime events best-effort
```

If Drizzle helper boundaries make this awkward:

- Extract a lower-level `insertMessageAndTouchConversation(tx, input)` helper.
- Keep public `createMessageInConversationForCurrentImporter/Forwarder` APIs stable.
- Do not duplicate validation or participant checks in route actions.

## Required Code Changes For Later Phases

Phase 2:

- Add `server.mjs`.
- Add `ws` dependency and types if needed.
- Update production `start` script to `NODE_ENV=production node server.mjs`.
- Decide whether to add a separate local `dev:ws` script.
- Add realtime connection registry module.
- Add non-redirecting socket auth helper.
- Add non-redirecting conversation subscription authorization helper.

Phase 3:

- Wrap message insert plus conversation update in a transaction.
- Return safe message payload from persistence path.
- Emit `conversation.message.created` and `conversation.updated` after commit.

Phase 4:

- Add app-level realtime provider/client.
- Add conversation subscription hook.
- Add local message/list state dedupe.
- Add reconnect/backoff and `router.refresh()` recovery.

Phase 5:

- Wire importer and forwarder messaging UIs.
- Remove "Messages are not live" copy only after realtime behavior is proven.

## Risks And Open Questions

- Custom server is required and will change production start behavior.
- Local dev WebSocket path needs an explicit decision: keep `next dev` for normal work or add `dev:ws`.
- Clerk token validation in a custom WebSocket handshake must be proven in Phase 2.
- In-memory fanout is not safe for multi-instance production.
- Render actual instance count/autoscaling remains unknown from repo.
- Current notification model does not support conversation unread semantics.
- Forwarder fanout currently should match notification behavior, but future assignment rules could change it.

## Phase 2 Readiness Decision

Recommendation: `GO WITH ISSUES`.

Phase 2 may implement the transport foundation if it stays narrow:

- same Render service.
- minimal custom Node server.
- `/api/realtime/ws` upgrade path only.
- non-redirecting auth.
- no database writes over WebSocket.
- in-memory registry only.
- no Redis/pubsub.
- no React Query.
- no message event emission until Phase 3.

## Commands Run

- `node tools/ai-runner/index.mjs realtime-messaging-v1 --check-only`: pass.
- `git diff --check -- .ai/initiatives/realtime-messaging-v1 .ai/state`: pass.

Skipped by phase scope:

- `npm run type-check`
- `npm run lint`
- `npm run build`
- DB commands
- Browser/runtime smoke

## Next Phase

Proceed to Phase 2: `phase-2-backend-transport-foundation`.
