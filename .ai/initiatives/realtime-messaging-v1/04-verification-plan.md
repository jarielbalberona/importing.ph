# Verification Plan

## Authoring Verification

This task is planning/scaffolding only. Do not run migrations, app tests, browser smoke, or make application code changes during authoring.

Allowed structure checks:

```bash
node tools/ai-runner/index.mjs realtime-messaging-v1 --check-only
git diff --check -- .ai/initiatives/realtime-messaging-v1
```

## Phase 0 Verification

Commands:

```bash
git status --short
rg -n "conversation|conversations|message|messages|notification|unread|quote" db lib app components hooks
rg -n "useQuery|QueryClient|queryKey|revalidatePath|fetch\\(" app components lib hooks package.json
rg -n "websocket|ws|sse|eventsource|upgrade|server-sent|socket" app lib package.json next.config.* render.yaml
test -f render.yaml
```

Expected evidence:

- Current messaging schema/API/UI/cache truth is documented.
- Current auth and quote-gate checks are documented.
- Current WebSocket deployment/runtime constraints are documented.
- WebSocket support is verified from code/deployment evidence before implementation.
- SSE is mentioned only as a fallback if persistent WebSocket connections cannot be supported without unapproved infrastructure.
- No application code changes.

## Phase 1 Verification

Commands:

```bash
git diff --check -- .ai/initiatives/realtime-messaging-v1
```

Expected evidence:

- Event names and payloads are documented.
- Subscription/auth model is documented.
- Cache update/invalidation rules are documented.
- Privacy and REST fallback rules are explicit.

## Phase 2 Verification

Commands:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint
```

Expected evidence:

- Realtime endpoint compiles.
- Connection authentication binds to a user profile.
- Unauthorized connection/subscription is rejected.
- Disconnect cleanup is implemented.
- Single-instance limitation is documented if in-memory fanout is used.

## Phase 3 Verification

Commands:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint
```

Expected evidence:

- Existing message creation path is still the only write path.
- Events emit only after successful DB commit.
- Sender and recipient fanout is covered.
- Message records are not duplicated.
- Notification writes, if touched, stay DB-backed and scoped.

## Phase 4 Verification

Commands:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint
```

Expected evidence:

- Realtime provider/client compiles.
- Connect/disconnect/reconnect behavior exists.
- Subscription hook is conversation-scoped.
- Cache updates or invalidations dedupe by message ID.
- REST refetch remains available.

## Phase 5 Verification

Commands:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint
```

Expected evidence:

- Conversation detail updates without manual refresh.
- Conversation list updates or invalidates after new message.
- Unread count refreshes or invalidates.
- Disconnected/reconnecting UI does not block sending or reading through REST.

## Phase 6 Final Automated Verification

Run sequentially:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build
node tools/ai-runner/index.mjs realtime-messaging-v1 --check-only
git diff --check -- .ai/initiatives/realtime-messaging-v1
```

Run DB checks if schema/migration changed:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check
```

## Manual Smoke Checklist

- Importer and forwarder are logged in on separate browsers or isolated sessions.
- Importer sends a message; forwarder receives it without manual refresh.
- Forwarder replies; importer receives it without manual refresh.
- Conversation list updates when new message arrives.
- Unread count updates or refreshes.
- Unauthorized user does not receive events for the conversation.
- Competitor forwarder cannot subscribe to or receive conversation events.
- Unrelated importer cannot subscribe to or receive conversation events.
- Browser refresh recovers message state.
- Realtime disconnect/reconnect recovers missed messages through REST refetch.
- Realtime disabled or disconnected still allows existing REST send/list behavior.

## Done Criteria

- Every phase report exists.
- Final report exists.
- All phase statuses are `passed` or `passed_with_issues`.
- WebSocket deployment limitation is explicitly documented.
- Automated verification evidence is recorded.
- Manual smoke result or exact skip impact is recorded.
- No app code path makes realtime the source of truth.
