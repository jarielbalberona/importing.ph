# Final Report: Realtime Messaging Seen V1

Verdict: PASS WITH ISSUES

## Summary

V1 conversation-level seen/read state is implemented on top of realtime messaging without changing the message write model.

PostgreSQL remains the source of truth. Message sends remain server-action/API-first. Seen state writes are server-action/API-first. WebSocket is delivery-only and emits `conversation.read_state.updated` after durable read-state writes.

## Capabilities Implemented

- `conversation_read_states` table with one row per conversation and user profile.
- Importer and forwarder mark-read server actions.
- Server-side authorization for mark-read.
- Idempotent read-state advancement with backward movement protection.
- Realtime read-state events.
- Importer and forwarder UI handling for read-state patches.
- `Seen` under only the current user's latest outgoing message.
- Refresh recovery from PostgreSQL.

## Verification

- `npm run type-check`: passed.
- `npm run lint`: passed.
- `npm test`: passed.
- `npm run build`: passed.
- `git diff --check`: passed for initiative scope.
- `node tools/ai-runner/index.mjs realtime-messaging-seen-v1 --check-only`: passed.
- Local browser smoke: passed with issues.

## Browser Smoke

- Importer: `a1+clerk_test@clerk.com`
- Forwarder: `a2+clerk_test@clerk.com`
- Conversation: `cf68b210-6a61-4e76-80bd-c91178c51cf8`
- Importer message: `Importer seen smoke 1780590285739`
- Forwarder message: `Forwarder seen smoke 1780590335699`

Both users received the other user's message without manual refresh. Both users saw `Seen` under their latest outgoing message after the other side viewed it. Refresh preserved messages and seen state without duplicates.

## Known Risks

- Production migration and deployed smoke are not proven.
- Multi-instance Render deployment still needs shared pub/sub later; V1 in-memory realtime remains single-instance scoped.
- Forwarder seen state is per active user profile, not company-wide.
- This is not per-message read-receipt history.

## Guardrails

- No socket writes.
- No React Query.
- No Redis/pubsub.
- No third-party realtime provider.
- PostgreSQL source of truth preserved.
- Events emit after durable DB writes.
- Notification behavior preserved.
