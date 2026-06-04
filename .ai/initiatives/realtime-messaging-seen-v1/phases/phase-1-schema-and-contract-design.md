# Phase 1: Schema And Contract Design

Status: passed

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Objective

Define read-state schema and realtime contract.

## Acceptance Criteria

- Schema is additive.
- Read state is per user profile.
- Event contract is explicit.
- Mark-read remains API/server-action-first.

## Completion Notes

Designed `conversation_read_states` and `conversation.read_state.updated`.

## Verification Commands

- `git diff --check -- .ai/initiatives/realtime-messaging-seen-v1`

## Risks

- Future product may require read state by company or assigned forwarder.

## Rollback Notes

Drop the additive table and remove event handling.

