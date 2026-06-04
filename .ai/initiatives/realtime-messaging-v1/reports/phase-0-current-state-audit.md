# Phase Report: Current-State Audit

Final status: `passed_with_issues`

## Executive Summary

Phase 0 audited the current repo state for V1 realtime messaging. No application code, schema, migrations, packages, or infrastructure files were changed.

Verdict: WebSocket is viable as the locked V1 transport, but not with the current `next start` entrypoint alone. Render supports inbound WebSocket connections for Node web services, and the repo deploys as a Render Node web service. The missing implementation piece is an application-owned HTTP server/upgrade handler. Phase 1 should design a minimal custom Node server that delegates normal HTTP traffic to Next.js and attaches WebSocket handling at a dedicated path such as `/api/realtime` or `/ws`.

The messaging domain is clean enough for realtime events. PostgreSQL remains source of truth. Message creation is currently server-action/API-first, routed through `lib/messages.ts`, and realtime events should originate after the message insert, conversation `updated_at` update, and notification attempt complete. The current insert/update sequence is not wrapped in an explicit transaction, so Phase 1 should decide whether to wrap message insert plus conversation update before adding event emission.

## No-Application-Code Confirmation

No app code, schema, migrations, packages, runtime config, or database state was modified.

Files changed by this phase:

- `.ai/initiatives/realtime-messaging-v1/00-overview.md`
- `.ai/initiatives/realtime-messaging-v1/phases/phase-0-current-state-audit.md`
- `.ai/initiatives/realtime-messaging-v1/reports/phase-0-current-state-audit.md`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

## Current Messaging Architecture

### Source Of Truth Entities

Current schema truth from `db/schema.ts`:

- `shipment_requests`: importer-owned request.
- `quotes`: private quote for one shipment request and one forwarder company.
- `conversations`: quote-gated thread for one shipment request and one forwarder company.
- `messages`: persisted message rows in a conversation.
- `notifications`: recipient-owned in-app notification records.
- `media_files` and `shipment_request_attachments`: attachment support exists for shipment requests in the current dirty worktree, not for messages.

Conversation table:

- `id`
- `shipment_request_id`
- `importer_profile_id`
- `forwarder_company_id`
- `opened_by_quote_id`
- timestamps

Conversation indexes:

- unique `shipment_request_id + forwarder_company_id`
- importer profile lookup
- forwarder company lookup
- shipment request lookup
- opened quote lookup
- `updated_at`

Message table:

- `id`
- `conversation_id`
- `sender_user_profile_id`
- `body`
- timestamps

Message indexes:

- `conversation_id + created_at`
- sender user profile lookup

Notification table:

- recipient, actor, type, title/body/link, source references, dedupe key, `read_at`, timestamps.
- notification types: `new_quote_received`, `quote_accepted`, `quote_rejected`, `message_received`.

There is no conversation-specific unread table and no read receipt model. Current unread is notification-level only: `notifications.read_at`.

### Ownership And Visibility Rules

Importer access:

- `requireImporterProfile()` requires role `importer`.
- Importer conversation access requires `conversations.importer_profile_id = current importer profile id`.
- Importer quote gate requires a qualifying quote for the request, forwarder company, and importer-owned request.

Forwarder access:

- `requireForwarderMember()` requires role `forwarder` and resolves the user's `forwarder_members` row.
- Forwarder conversation access requires `conversations.forwarder_company_id = current member company id`.
- Forwarder quote gate requires a qualifying quote for the request and current forwarder company.

Quote gating:

- `messagingQuoteStatuses = ["submitted", "accepted", "rejected"]`.
- `withdrawn` quotes do not open messaging.
- No quote means no conversation creation/access.

Competitor privacy:

- Competitor forwarders are not conversation participants because conversation lookup is scoped to their own company id.
- Message queries are scoped by conversation after participant-scoped conversation lookup.

### Conversation Creation Flow

```text
Importer entry point
-> app/app/requests/[requestId]/actions.ts
-> getOrCreateConversationForCurrentImporter(requestId, forwarderCompanyId)
-> requireImporterProfile()
-> getQuoteGateForImporter()
-> getOrCreateConversation()
-> redirect to /app/requests/messages/[conversationId]
```

```text
Forwarder entry point
-> app/app/forwarder/requests/[requestId]/actions.ts
-> getOrCreateConversationForCurrentForwarder(requestId)
-> requireForwarderMember()
-> getQuoteGateForForwarder()
-> getOrCreateConversation()
-> redirect to /app/forwarder/messages/[conversationId]
```

`getOrCreateConversation()` inserts into `conversations` with `onConflictDoNothing` on `(shipment_request_id, forwarder_company_id)`, then re-selects the row if it already exists.

### Message Creation Flow

```text
Importer message form
-> sendImporterMessage(formData)
-> createMessageInConversationForCurrentImporter(conversationId, body)
-> getConversationForCurrentImporter(conversationId)
-> requireImporterProfile()
-> createMessageInConversation()
-> insert messages row
-> update conversations.updated_at
-> notifyMessageCreated()
-> redirect back to conversation
```

```text
Forwarder message form
-> sendForwarderMessage(formData)
-> createMessageInConversationForCurrentForwarder(conversationId, body)
-> getConversationForCurrentForwarder(conversationId)
-> requireForwarderMember()
-> createMessageInConversation()
-> insert messages row
-> update conversations.updated_at
-> notifyMessageCreated()
-> redirect back to conversation
```

Message validation:

- `messageBodySchema`: trimmed string, min 1, max 2000.

Current commit point:

- `db.insert(messages).returning({ id })` commits one statement.
- `db.update(conversations).set({ updatedAt })` commits a second statement.
- `notifyMessageCreated()` runs after both.
- There is no explicit transaction around message insert plus conversation update.

### Message Retrieval Flow

```text
Importer detail page
-> getConversationForCurrentImporter(conversationId)
-> getConversationForParticipant(importer, importerProfile.id)
-> participant-scoped conversation query
-> messages query by conversation id ordered by created_at
-> render server page / client component props
```

```text
Forwarder detail page
-> getConversationForCurrentForwarder(conversationId)
-> getConversationForParticipant(forwarder, member.companyId)
-> participant-scoped conversation query
-> messages query by conversation id ordered by created_at
-> render server page
```

### Conversation Listing Flow

Importer:

```text
/app/requests/messages
-> ImporterMessagesWorkspace
-> getConversationsForCurrentImporter()
-> requireImporterProfile()
-> participant-scoped conversation list ordered by conversations.updated_at
-> attachLatestMessages()
-> client workspace receives server-fetched props
```

Forwarder:

```text
/app/forwarder/messages
-> getConversationsForCurrentForwarder()
-> requireForwarderMember()
-> participant-scoped conversation list ordered by conversations.updated_at
```

Issue: importer list attaches latest message preview; forwarder list currently does not attach latest message preview.

## Current Auth Architecture

Provider:

- Clerk via `@clerk/nextjs`.

Server identity:

- `auth()` from `@clerk/nextjs/server` returns `userId` and `redirectToSignIn`.
- `getProfileForCurrentUser()` maps Clerk `userId` to `user_profiles.clerk_user_id`.
- `requireProfile()` redirects to `/onboarding` if no DB profile exists.
- `requireRole()` redirects to `/unauthorized` if role mismatch.

Onboarding:

- `createOnboardingProfile()` writes `user_profiles`.
- Importer onboarding creates `importer_profiles`.
- Forwarder onboarding creates `forwarder_companies` and owner `forwarder_members`.
- Admin cannot be created through onboarding.

WebSocket authentication recommendation:

- Do not use redirecting helpers directly in the WebSocket handshake.
- Add a non-redirecting socket auth helper that validates Clerk identity from the handshake.
- Preferred V1 path: client opens WebSocket after Clerk auth is loaded and sends/uses a Clerk session token or a first-party short-lived realtime token minted by a normal authenticated route/action.
- Server validates token/session, resolves `user_profiles`, and binds the socket to `userProfileId`, role, and forwarder/importer context as needed.

Authorization recommendation:

- Socket connection auth only proves who the user is.
- Subscription authorization must still call participant-scoped conversation access logic or a new non-redirecting equivalent:
  - importer: conversation importer profile matches current importer profile.
  - forwarder: conversation forwarder company matches current member company.
  - quote gate remains tied to the existing conversation/opened quote rules.

## Current Query / Cache Architecture

There is no React Query/TanStack Query setup in the current repo:

- no `@tanstack/react-query` dependency.
- no `useQuery`, `QueryClient`, `queryKey`, `useMutation`, `invalidateQueries`, or `setQueryData` usage.

Current messaging data flow is server-rendered:

- importer messages page fetches conversations server-side, transforms to props, then renders `ImporterMessagesClient`.
- forwarder messages pages render directly from server queries.
- message sending uses server actions and redirects.
- no optimistic update behavior was found.

Current fetch usage is unrelated to messaging:

- shipment request attachment upload/delete/list.
- PSGC/location client fetch.
- R2 storage fetch.

Impacted cache/state areas for realtime:

- Active conversation messages.
- Conversation list ordering/preview.
- Notification list / unread badges if any future badge is added.

Because React Query does not exist, Phase 1 has two realistic choices:

1. Do not add React Query. Add small local client state for active conversation messages/list previews and use REST JSON endpoints plus `router.refresh()` for reconciliation.
2. Add React Query deliberately as a new dependency only if the user approves that architectural change. This is not currently aligned with project rules, which say not to introduce React Query by default.

Recommended V1 frontend path:

- Avoid adding React Query in Phase 1.
- Add typed JSON read endpoints for conversation detail/list if client-side refetch is needed.
- Use WebSocket events to patch local message arrays by message ID for the active conversation.
- Use `router.refresh()` or explicit JSON refetch after reconnect to reconcile server truth.
- Invalidate/refetch rather than locally compute unread counts because unread is notification-backed today.

## Current Runtime / Deployment Architecture

Repo evidence:

- `package.json` scripts:
  - `dev`: `next dev --port=3001`
  - `build`: `next build`
  - `start`: `next start`
- `next.config.ts` has no custom config.
- No app-level WebSocket, SSE, socket, or upgrade handler exists.
- No `ws`, Socket.IO, or realtime dependency exists.
- `render.yaml` defines one Render web service:
  - runtime: `node`
  - plan: `starter`
  - build: `npm ci && npm run build`
  - start: `npm run start`
  - `NODE_VERSION=22`
  - `DATABASE_URL` from Render Postgres.
- No middleware source file currently exists in repo root; `.next/server/middleware.*` is generated output and not source truth.

External docs checked:

- Render WebSocket docs say Render web services can accept inbound WebSocket connections, no fixed maximum connection duration is imposed, keepalive/reconnect logic is required, all public traffic uses the single web service port, and horizontally scaled services assign WebSocket connections randomly across instances.
- Next.js route handler docs describe HTTP method handlers using Web Request/Response APIs. They do not provide the app-owned Node HTTP upgrade hook needed by common `ws` server attachment.
- Next.js custom server docs show how to create an app-owned HTTP server and update scripts to run `node server.js`; docs warn a custom server should be used only when the integrated router cannot meet requirements and can lose some optimizations.

Runtime assessment:

- A. Can current deployment support persistent WebSockets? `PASS WITH ISSUES`.
  - Render Node web service: yes.
  - Current `next start` app entrypoint: no clear app-owned attachment point.
  - Implementation likely requires a minimal custom Node server or equivalent custom runtime entrypoint.
- B. Instance model:
  - Repo declares one Render web service on starter plan.
  - Actual instance count/autoscaling is not confirmed from repo.
  - Treat as unknown until Render dashboard/target config is confirmed.
- C. V1 in-memory connection tracking:
  - Safe for local development and a confirmed single instance.
  - Not safe as a correctness mechanism under multiple instances.
  - Acceptable because REST remains source of truth/recovery and realtime is not correctness-critical.
- D. Future scale:
  - Redis/pubsub or another shared fanout layer is required once multiple app instances exist or when delivery across random instance assignment matters.

## Realtime Readiness Assessment

Locked design validation:

```text
REST/server action creates message
-> existing auth and participant checks
-> PostgreSQL message insert
-> conversation updated_at update
-> DB notification best-effort
-> WebSocket event emitted after successful persistence path
-> sender and recipient sockets receive event
-> active clients patch or refetch
-> REST/server refresh recovers missed state
```

This design is sound for V1 if Phase 1 addresses:

- custom server/upgrade attachment.
- non-redirecting socket auth.
- participant-scoped subscription helper.
- post-commit event seam.
- local client state/refetch without React Query.

## Recommended WebSocket Integration Points

### Where WebSocket Should Attach

Preferred attachment:

- Minimal custom Node HTTP server at project root, for example `server.mjs` or `server.js`.
- It creates the HTTP server, delegates normal requests to Next via `app.getRequestHandler()`, and attaches a `ws` server on a dedicated path.
- Update local/prod scripts only in the implementation phase after Phase 1 design approval.

Do not attach WebSocket to ordinary App Router route handlers unless Phase 1 proves Next 16 provides a stable supported upgrade API in this project. Current code and docs do not prove that.

### How Authentication Should Work

Recommended:

- Browser obtains a Clerk-backed authenticated context.
- WebSocket handshake includes a short-lived token or session token.
- Server validates token with Clerk server APIs.
- Server resolves `user_profiles` by Clerk user id.
- Socket is bound to `userProfileId`, `role`, and later role-specific participant context.

Avoid:

- relying on UI-hidden conversation ids.
- relying on redirecting auth helpers in socket code.
- trusting client-sent role/company/importer ids.

### How Authorization Should Work

Subscription request:

```text
socket authenticated user
-> subscribe(conversationId)
-> resolve user profile
-> if importer: require conversation.importer_profile_id matches importer profile
-> if forwarder: require conversation.forwarder_company_id matches member company
-> register subscription only after server check
```

Emission recipients:

- importer owner user profile.
- forwarder members for the conversation's forwarder company.
- sender may also receive event for consistent local reconciliation.

### Where Events Should Be Emitted

Canonical source: `lib/messages.ts`.

Recommended seam:

- Refactor `createMessageInConversation()` into a transaction-aware service path:
  - validate body.
  - insert message.
  - update conversation `updated_at`.
  - commit.
  - notify message recipients best-effort.
  - emit `conversation.message.created` and related invalidation events best-effort after commit.

The event should not originate in route/page actions because there are multiple callers and route actions are controller-level wrappers. It should not originate in a low-level repository helper that lacks participant/recipient context unless the helper returns enough data to derive authorized recipients safely.

## Sequence Diagrams

### Current Message Send

```text
User
-> Server action
-> role/profile guard
-> participant-scoped conversation lookup
-> messages insert
-> conversations.updated_at update
-> notification best-effort insert
-> redirect
-> server render refetch
```

### Proposed V1 Realtime Send

```text
User
-> Server action/API
-> role/profile guard
-> participant-scoped conversation lookup
-> transaction: message insert + conversation update
-> commit
-> notification best-effort
-> realtime emitter best-effort
-> WebSocket fanout to authorized connected participants
-> clients patch active message list or refetch
```

### Reconnect Recovery

```text
socket disconnect
-> client marks realtime degraded
-> reconnect with backoff
-> authenticate again
-> resubscribe to visible conversation ids
-> REST/router refresh for active conversation, conversation list, notifications
-> server truth wins
```

## Risks And Constraints

- Current `next start` does not expose an obvious app-owned HTTP server for `ws` upgrade handling.
- Custom server is probably required; this is acceptable but not free. It changes dev/start scripts and removes some Next default-server assumptions.
- Current message write path is not a single explicit transaction. Event emission must not happen until after message insert and conversation update are both durable.
- No React Query exists; any plan based on query keys is wrong for current repo truth.
- Notification unread is not conversation unread. Do not fake conversation unread counts from nowhere.
- In-memory fanout is only safe for local or confirmed single-instance deployments.
- Render can replace instances and randomly assigns connections when scaled horizontally; reconnect and REST recovery are mandatory.
- No current production URL, actual instance count, autoscaling state, or target Clerk config is confirmed from repo.
- Worktree is heavily dirty outside this initiative. Phase 1 must re-check app code before implementation.

## Open Questions

- What is the actual Render instance count/autoscaling setting?
- Will the team accept a minimal custom Node server for WebSocket attachment?
- Should V1 add JSON read endpoints for conversation detail/list recovery, or rely on `router.refresh()`?
- Should message insert plus conversation update be wrapped in a transaction before event emission?
- Should forwarder fanout target all company members or only current owner/member patterns? Current notification logic fans out to all forwarder members except sender.
- Should notification unread be refreshed through the existing notifications page only, or should the app shell eventually show unread badges?

## Go / No-Go Recommendation For Phase 1

Recommendation: `GO WITH ISSUES`.

Proceed to Phase 1 contract design, but Phase 1 must explicitly design:

- custom server/upgrade attachment.
- socket auth helper.
- participant subscription helper.
- post-commit emission contract.
- frontend state/refetch approach without assuming React Query.
- in-memory fanout limitation and Redis/pubsub upgrade trigger.

Do not proceed to Phase 2 implementation until those are settled.

## Required Decision Outputs

- Is WebSocket viable in the current deployment?
  - Yes on Render Node web service, with issues. Current `next start` entrypoint needs an app-owned HTTP server/upgrade attachment.
- Where should WebSocket attach?
  - Dedicated WebSocket path on a minimal custom Node HTTP server that delegates normal requests to Next.
- How should authentication work?
  - Validate Clerk-backed token/session during handshake, then resolve `user_profiles`.
- How should authorization work?
  - Authorize each conversation subscription with server-side participant checks using importer profile or forwarder company membership.
- Where should events be emitted?
  - In `lib/messages.ts` after the durable message persistence path, not in page actions.
- Which React Query caches are affected?
  - None. React Query is not installed or used. Affected state is active conversation messages, conversation list previews/order, and notification/unread refresh through server refresh or future JSON endpoints.
- Can V1 safely use in-memory connection tracking?
  - Yes for local and confirmed single-instance deployment only. No for multi-instance production correctness.
- Is there any blocker preventing Phase 1?
  - No blocker for Phase 1. There is a blocker for Phase 2 until Phase 1 designs the custom server/WebSocket attachment and auth strategy.

## Commands Run

- `git status --short`: pass; dirty worktree recorded.
- `rg -n "conversation|conversations|message|messages|notification|unread|quote" db lib app components hooks`: pass; messaging/notification surfaces identified.
- `rg -n "useQuery|QueryClient|queryKey|revalidatePath|fetch\\(" app components lib hooks package.json`: pass; no React Query found; unrelated fetch usage identified.
- `rg -n "websocket|ws|sse|eventsource|upgrade|server-sent|socket" app lib package.json next.config.* render.yaml`: pass; no app-level realtime implementation found.
- `test -f render.yaml`: pass.
- Read-only inspection of `.ai/core/*`, realtime initiative docs, messaging code, auth/onboarding code, notification code, package/deployment config, and relevant route files: pass.
- Official docs lookup:
  - Render WebSockets docs.
  - Next.js Route Handlers docs.
  - Next.js Custom Server docs.

## Verification Summary

- Passed: read-only Phase 0 verification.
- Failed: none.
- Skipped: type-check, lint, build, DB checks, browser smoke, and runtime server smoke because Phase 0 is audit-only and must not implement or run realtime.

## Next Phase

Proceed to Phase 1: `phase-1-realtime-contract-design`.
