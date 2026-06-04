# Implementation Plan

## Execution Order

Execute phases in order. Do not skip Phase 0.

1. Audit current messaging/auth/cache/runtime truth and verify persistent WebSocket support.
2. Lock the realtime contract.
3. Add the smallest authenticated WebSocket transport foundation through a minimal custom Node server entrypoint.
4. Emit post-commit events from the existing message creation flow.
5. Add the frontend realtime client/provider and subscription hook.
6. Wire conversation, list, and unread fallback behavior.
7. Verify, harden, report, and update local AI state.

## CTO Guidance

Do not turn this into a chat platform.

The product need is simple: users should not have to refresh to see messages in an existing quote-gated conversation. Anything beyond that is scope creep.

## Transport Plan

WebSocket is the locked V1 transport.

Phase 0 verifies support; it does not choose transport from scratch.

- Use WebSocket for realtime delivery/events.
- Use the same Render web service and same public port.
- Replace `next start` with a minimal custom Node server only when implementing Phase 2.
- Let Next.js handle all normal HTTP requests.
- Handle only WebSocket upgrade requests for the realtime endpoint.
- Keep message creation REST/API-first.
- Do not implement socket-based message writes in V1.
- Document SSE only as a fallback if persistent WebSocket connections cannot run without unapproved infrastructure.
- Use neither external realtime providers nor Redis/pubsub for local/single-instance V1 unless current deployment reality makes in-memory fanout impossible and the human approves the scope change.

## Backend Plan

- Keep current message create/list APIs or server actions.
- Plan to wrap message insert plus conversation `updated_at` update in one database transaction before event emission.
- Add authenticated connection handling.
- Add authorized conversation subscription handling.
- Store connection/subscription state in memory only if Phase 0 accepts single-instance limitations.
- Emit events after message commit.
- Log realtime emission failure without rolling back committed messages.

## Frontend Plan

- Add one central realtime provider/client.
- Add conversation subscription hook.
- Connect after auth and disconnect on logout.
- Reconnect with backoff.
- Refetch through existing server-rendered refresh after reconnect.
- Do not add React Query.
- Use small local client state for active conversation messages if needed.
- Use `router.refresh()` for V1 reconciliation unless Phase 2 explicitly chooses minimal JSON read endpoints.
- Deduplicate by message ID.

## Testing Plan

- Unit/integration coverage for backend authorization and event emission where current test harness supports it.
- Frontend coverage for cache deduplication and reconnect invalidation where current test harness supports it.
- Manual two-session smoke remains mandatory for claiming UX proof.

## Stop Conditions

- Current messaging write path is not clear.
- WebSocket requires non-approved infrastructure.
- Authorization cannot be reused safely.
- Event payload risks quote/message leakage.
- Realtime write path is proposed.
- Production claim is requested without deployment/runtime proof.
