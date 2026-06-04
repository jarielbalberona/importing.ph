# Handover Notes

## Current Status

`realtime-messaging-v1` is locked and ready for Phase 0 execution.

No application code has been implemented by this initiative scaffolding.

## Execution Posture

Start with Phase 0. Do not jump directly into WebSocket implementation.

The first job is to prove current repo truth:

- How messages are created.
- How messages are listed.
- How conversations are authorized.
- Whether React Query exists or another cache pattern is used.
- How notifications/unread state currently works.
- Whether the deployment/runtime can support persistent WebSocket connections cleanly.

## Locked Architecture

Use WebSocket for V1.

Message creation remains REST/API-first. WebSocket is for realtime delivery/events only. Socket-based message writes are explicitly out of scope for V1.

SSE is only a fallback if Phase 0 proves persistent WebSocket connections cannot be supported without unapproved infrastructure. Stop for human confirmation before switching to SSE.

## Non-Negotiable Rule

No WebSocket message write path.

The existing DB-backed message create flow must remain the only business write path. Realtime starts after commit and ends at cache update/invalidation.

## Suggested Next Prompt

```text
Execute Phase 0 of .ai/initiatives/realtime-messaging-v1. Audit current messaging schema, APIs/actions, UI, cache/query behavior, auth and quote gating, notification/unread state, and persistent WebSocket deployment/runtime support. Do not implement app code. Produce the Phase 0 report and update initiative status files only.
```
