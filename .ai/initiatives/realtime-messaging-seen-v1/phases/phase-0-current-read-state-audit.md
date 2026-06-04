# Phase 0: Current Read State Audit

Status: passed

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Objective

Audit current read/unread, messaging UI, realtime events, and authorization before adding seen state.

## Findings

- Current unread is notification-level only through `notifications.read_at`.
- There is no conversation-level read state table.
- There are no per-message read receipts.
- Current message views receive server-rendered messages plus realtime deltas.
- Current message writes are server actions through `lib/messages.ts`.
- Current realtime transport is WebSocket delivery-only through `server.mjs`.
- Existing subscription authorization is importer ownership or forwarder company membership.

## Decision

Add per-user-profile conversation read state. For forwarders, "seen" means the specific active forwarder member user profile read the conversation, not the whole company.

## Verification Commands

- Repository inspection only.

## Risks

- Multi-member forwarder companies may need company-level or assigned-user semantics later.

## Rollback Notes

No application code changed in this phase.

