# Realtime Messaging V1

## Initiative Key

`realtime-messaging-v1`

## Dependencies

depends_on: quote-gated-messaging, notification-records, v1-hardening-launch-readiness, production-readiness-admin-runbook

Dependency rule: do not begin implementation until current messaging, quote gating, notification scoping, and deployment/runtime assumptions are audited against current repo truth. If `production-readiness-admin-runbook` target facts are still unconfirmed, local implementation may proceed only with an explicit single-instance/local limitation and no production readiness claim.

## Initiative Status

- Status: locked
- Ready for execution: yes
- Execution started: yes
- Execution complete: yes
- Latest execution status: Phase 6 `passed_with_issues`.
- Final verdict: `PASS WITH ISSUES`.

Lifecycle rule: this initiative is locked and has completed implementation through final local verification. Do not claim production or browser-proven realtime delivery until the authenticated two-browser smoke in `reports/final-report.md` passes.

## Objective

Add V1 realtime delivery UX for existing importer/forwarder conversations without rewriting the messaging domain.

PostgreSQL remains the source of truth. Existing REST/API-first message creation and listing remain the correctness path. WebSocket only delivers post-commit realtime events in V1 so clients can update or invalidate local state faster.

## Repository Truth To Audit Before Execution

- Current app is a single Next.js App Router application.
- Business data is PostgreSQL plus Drizzle.
- Clerk is authentication only.
- Existing messaging is quote-gated and database-backed.
- Existing messaging is explicitly not realtime.
- Existing notifications are DB-backed and not realtime.
- Render deployment currently appears as one web service, but actual target deployment/runtime facts must be re-confirmed before production claims.
- Realtime V1 implementation now uses a root `server.mjs` custom Node server. Production start must run `npm run start`; reverting to `next start` disables the WebSocket upgrade handler.

## Scope

- Audit current messaging schema, routes, actions/APIs, hooks, cache keys, auth, quote/request gating, notification count behavior, and WebSocket deployment/runtime support.
- Use WebSocket as the V1 realtime transport.
- Document SSE only as a fallback if Phase 0 proves persistent WebSocket connections cannot be supported by the current deployment without unapproved infrastructure.
- Add a small WebSocket transport layer for delivery events.
- Authenticate connected users with the current session/auth mechanism.
- Bind connections to the authenticated user profile.
- Subscribe users only to conversations they are authorized to access.
- Emit message/conversation/unread events only after existing message persistence succeeds.
- Update or invalidate frontend query/cache state without duplicating messages.
- Recover missed state through existing REST fetches after reconnect or transport failure.
- Test authorization, event emission, cache deduplication, disconnect/reconnect, and REST fallback.

## Non-Goals

- Do not rewrite conversations or messages.
- Do not send messages over WebSocket in V1.
- Do not make frontend optimistic state the source of truth.
- Do not require realtime delivery for correctness.
- Do not add typing indicators.
- Do not add online/offline presence.
- Do not add read receipts.
- Do not add reactions.
- Do not add attachments.
- Do not add push notifications.
- Do not add group chat.
- Do not add end-to-end encryption.
- Do not add an external realtime provider.
- Do not add multi-region scaling.
- Do not add Redis/pubsub unless Phase 0 proves current deployment requires it.
- Do not redesign notifications.
- Do not introduce Express, NestJS, Prisma, microservices, event buses, queues, AWS ECS, Terraform, Zustand, or unnecessary client state frameworks.

## Key Design Rule

Correct flow:

```text
user sends message
-> existing/create message API validates participant access and quote gate
-> database transaction commits message
-> backend emits realtime event after commit
-> sender and recipient clients update or invalidate cache
-> REST list/detail remains fallback and reconciliation source
```

Rejected flow:

```text
user sends WebSocket message
-> frontend assumes success
-> recipient sees event
-> database persistence happens later or fails
```

That design is unacceptable because shipment and quote communication is business record data, not disposable chat noise.

## Acceptance Criteria

- Phase 0 documents current messaging implementation from code evidence before any transport implementation.
- WebSocket is verified against Node/Next.js runtime and Render deployment reality before coding.
- SSE is documented only as a fallback if WebSocket persistent connections cannot be supported without unapproved infrastructure.
- Realtime events are post-commit only.
- Existing REST message create/list behavior still works with realtime disabled.
- Only authorized conversation participants receive conversation events.
- Importer ownership, forwarder company membership, and quote/request gating remain server-side.
- Sender and recipient receive consistent updates.
- Message duplication is prevented when REST and realtime both return the same message.
- Conversation list and unread count update or invalidate when a new message arrives.
- Reconnect triggers REST reconciliation for missed messages.
- Single-instance in-memory fanout limitation is documented if used.
- Multi-instance production limitation and Redis/pubsub upgrade trigger are explicit.
- Automated and manual verification evidence is recorded before final completion.

## Phase Breakdown

1. Current-state audit: `passed_with_issues`.
2. Realtime contract design: `passed_with_issues`.
3. Backend transport foundation: `passed_with_issues`.
4. Backend message event emission: `passed`.
5. Frontend realtime client: `passed`.
6. UI behavior and fallback: `passed_with_issues`.
7. Verification and hardening: `passed_with_issues`.

## Locked Transport Decision

Use WebSocket for V1.

Reason: the project runs on a Node server and WebSocket is the correct long-term realtime path for typing indicators, read receipts, presence, live quote/request updates, and notifications. V1 still uses WebSocket only for delivery events.

Message creation stays REST/API-first. Do not implement socket-based message writes in V1.

SSE is not the selected architecture. Document it only as a fallback if Phase 0 proves the current deployment cannot support persistent WebSocket connections without unapproved infrastructure. If that happens, stop for human confirmation before changing the architecture.

## Verification Plan

Authoring verification:

```bash
node tools/ai-runner/index.mjs realtime-messaging-v1 --check-only
git diff --check -- .ai/initiatives/realtime-messaging-v1
```

Execution verification must run sequentially after implementation:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build
```

Run DB checks only when schema/migration changes are made:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check
```

## Hard Stops

- Current message creation/listing path is unclear.
- Conversation participant authorization is ambiguous.
- Quote/request gate cannot be reused for realtime subscriptions.
- WebSocket support requires splitting the app into a separate backend service.
- WebSocket endpoint cannot authenticate with current Clerk/session setup.
- Current deployment cannot support persistent WebSocket connections without unapproved infrastructure.
- Realtime would require Redis/pubsub or external provider before local/single-instance V1.
- Any design sends primary message writes over realtime transport.
- Any event leaks messages, quotes, or conversation metadata to non-participants.
- Production readiness is requested before target deployment/runtime has been re-confirmed.
