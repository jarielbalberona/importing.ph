# Phase Report: Backend Message Event Emission

Final status: `passed`

## Executive Summary

Phase 3 integrated realtime event emission into the existing message creation flow without changing the write model.

Messages are still created through existing server actions/API-first code. PostgreSQL remains source of truth. WebSocket is delivery only.

## Files Changed

- `lib/messages.ts`
- `lib/realtime-events.ts`

## Implementation Summary

`lib/messages.ts` now wraps the message insert and conversation `updated_at` update in one Drizzle transaction. After the transaction succeeds, the existing notification behavior runs and realtime events are published through the in-process bridge.

Post-commit events:

- `conversation.message.created`
- `conversation.updated`

The sender may receive the canonical event for reconciliation. Recipients receive events only if they are connected and authorized through Phase 2 subscription checks.

## Source Of Truth Guardrails

- No socket write path was added.
- Message validation still uses `messageBodySchema`.
- Participant and quote-gated access checks still happen before writes.
- Realtime events are emitted only after the transaction completes.
- Realtime delivery failure does not create, mutate, or roll back message rows.

## Verification

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`: pass.

## Risks

- Realtime event delivery is best-effort. REST refresh remains the recovery path.
- Notification fanout remains the existing DB-backed behavior; realtime fanout is scoped to subscribed sockets rather than notification rows.

