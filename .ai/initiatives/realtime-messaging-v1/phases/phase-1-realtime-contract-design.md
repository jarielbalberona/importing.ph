# Phase 1: Realtime Contract Design

Status: passed_with_issues

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Objective

Define the smallest safe realtime event contract and subscription model for existing conversations.

## Files Likely Involved

- `.ai/initiatives/realtime-messaging-v1/01-domain-model.md`
- `.ai/initiatives/realtime-messaging-v1/03-cross-module-data-flow.md`
- `.ai/initiatives/realtime-messaging-v1/04-verification-plan.md`
- New or existing contract docs under the initiative.
- App contract/types files only if execution explicitly chooses to add typed event definitions.

## Implementation Notes

- Design the minimal custom Node server entrypoint for WebSocket upgrade handling.
- Define event names:
  - `realtime.connected`
  - `realtime.error`
  - `conversation.subscribed`
  - `conversation.unsubscribed`
  - `conversation.message.created`
  - `conversation.updated`
  - `conversation.unread.changed` only if current unread model supports it safely.
- Decide whether message-created events carry full safe message payloads or only IDs.
- Prefer enough safe payload for immediate UI update, but require REST reconciliation.
- Define versioning or payload discriminators if implemented in code.
- Define subscription request/response behavior.
- Define unauthorized subscription behavior without leaking conversation existence.
- Explicitly forbid `message.send` and all socket database writes in V1.
- Plan message insert plus conversation `updated_at` update as one transaction before Phase 3 event emission.

## Acceptance Criteria

- Event names and payload shapes are documented.
- Custom server approach and WebSocket path are documented.
- Socket authentication strategy is documented.
- Payload privacy rules are documented.
- Subscription authorization model is documented.
- Reconnect/reconciliation contract is documented.
- Client deduplication key is documented.
- REST fallback behavior is explicit.
- Frontend strategy does not require React Query.

## Verification Commands

- `git diff --check -- .ai/initiatives/realtime-messaging-v1`

## Risks

- Overbroad payloads can leak quote or participant data.
- Too-thin payloads can cause noisy refetches; acceptable for V1 if simpler.
- Contract drift later can break clients unless typed or well documented.

## Rollback Notes

If the contract is wrong, update the initiative docs before implementation. Do not patch around a bad contract in UI code.

## Completion Notes

Phase 1 designed the custom Node server approach, WebSocket path, auth/subscription model, V1 event contract, frontend state strategy without React Query, and required Phase 2+ code changes. Final report: `../reports/phase-1-realtime-contract-design.md`.

Verdict: `PASS WITH ISSUES`.

Key issue: WebSocket contract is ready, but Phase 2 must implement a custom server entrypoint and package/script changes carefully because the current app uses `next start`.
