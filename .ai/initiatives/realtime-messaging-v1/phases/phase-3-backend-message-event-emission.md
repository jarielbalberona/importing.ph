# Phase 3: Backend Message Event Emission

Status: passed

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Objective

Emit realtime events from the existing message creation flow only after PostgreSQL persistence succeeds.

## Files Likely Involved

- `lib/messages.ts`
- Realtime emitter/helper from Phase 2.
- Existing notification helper if unread invalidation uses notification state.
- Existing tests or new focused backend tests.

## Implementation Notes

- Keep the existing create-message validation and database insert path.
- Do not add a WebSocket message-write path.
- Emit after successful transaction/commit.
- Emit `conversation.message.created` to sender and recipient participants.
- Emit or trigger `conversation.updated` for conversation lists.
- Emit or invalidate `conversation.unread.changed` only according to current unread truth.
- Treat realtime emission failure as non-fatal after the message commit, but log/report it enough for debugging.

## Acceptance Criteria

- Message creation still validates participant access and quote gate server-side.
- Message row is committed before event emission.
- Sender and recipient fanout is implemented consistently.
- Competitor forwarders and unrelated importers cannot receive events.
- Realtime failure does not roll back committed message persistence.
- Duplicate message rows are not created.

## Verification Commands

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`

## Risks

- Emitting inside a transaction before commit creates phantom UI state.
- Best-effort event failure can hide delivery bugs unless logged.
- Recipient resolution can accidentally over-fanout to all company members if current business rules are narrower.

## Rollback Notes

Remove post-commit emitter calls. Keep existing message persistence unchanged.

## Completion Notes

Implemented post-commit realtime emission from the existing `lib/messages.ts` message creation flow. Message insert and conversation `updated_at` update now run in one Drizzle transaction. Existing message validation, participant checks, quote gating, server actions, and notification behavior remain in place.

After the transaction succeeds, the backend publishes:

- `conversation.message.created`
- `conversation.updated`

Events are delivered through the Phase 2 in-process realtime bridge to authorized subscribed sockets only. No WebSocket message write path was added.

Verification:

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`: pass.
