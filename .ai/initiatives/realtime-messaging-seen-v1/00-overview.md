# Realtime Messaging Seen V1

## Initiative Key

`realtime-messaging-seen-v1`

## Dependencies

depends_on: realtime-messaging-v1, quote-gated-messaging, notification-records

Dependency rule: do not implement seen state unless realtime messaging remains WebSocket delivery-only, message writes remain server-action/API-first, PostgreSQL remains source of truth, and conversation authorization can be enforced server-side.

## Initiative Status

- Status: locked
- Ready for execution: yes
- Execution started: yes
- Execution complete: yes
- Latest execution status: Phase 5 passed with issues.
- Final verdict: PASS WITH ISSUES.

Lifecycle rule: implement narrowly. Do not mark complete until reports, final verification, and browser smoke evidence exist.

## Objective

Add simple conversation-level seen/read state on top of the completed realtime messaging V1 implementation.

For V1, "Seen" means the recipient user profile has read up to the sender's latest outgoing message in the conversation.

## Scope

- Add `conversation_read_states`.
- Mark a conversation read through authenticated server actions/API-first writes.
- Authorize mark-read server-side using existing importer ownership and forwarder company membership rules.
- Emit `conversation.read_state.updated` only after durable read-state write.
- Show `Seen` only under the current user's latest outgoing message when another participant's read state covers that message.
- Keep notification behavior intact.

## Forwarder Rule

Seen is per active user profile, not per forwarder company.

Reason: the current data model has `user_profiles` and `forwarder_members`, but no assigned conversation participant or company-wide read identity. Treating one forwarder member's view as the whole company seeing the message would overstate the business fact.

## Non-Goals

- No per-message read receipt list.
- No typing indicators.
- No presence.
- No reactions.
- No socket writes.
- No notification redesign.
- No Redis/pubsub.
- No React Query.
- No third-party realtime provider.

## Phase Breakdown

1. Current read/unread and messaging UI audit: passed.
2. Schema and contract design: passed.
3. Backend read-state persistence: passed.
4. Realtime read-state event emission: passed.
5. Frontend mark-read and seen UI: passed.
6. Verification and browser smoke: passed with issues.

## Final Summary

Local V1 seen functionality is implemented and verified. PostgreSQL owns the read state through `conversation_read_states`; authenticated server actions mark read state; realtime delivery emits `conversation.read_state.updated` after durable read-state writes; frontend views show `Seen` only under the current user's latest outgoing message when another authorized user profile has read up to that message.

Accepted issue: this is locally proven on a single `server.mjs` process. Production Render instance count and deployed WebSocket/read-state smoke remain unproven.

## Verification Plan

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm test
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build
git diff --check
node tools/ai-runner/index.mjs realtime-messaging-seen-v1 --check-only
```

## Hard Stops

- Read state cannot be represented without weakening message/conversation ownership.
- Mark-read authorization cannot be enforced server-side.
- Seen requires socket writes.
- Seen requires notification redesign.
- Existing realtime message delivery breaks and cannot be repaired in scope.
