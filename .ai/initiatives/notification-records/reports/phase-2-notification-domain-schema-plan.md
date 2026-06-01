# Phase 2 Report: Notification Domain Schema Plan

Final status: `passed`

## Summary

Phase 2 added durable notification records.

The schema targets user profiles directly, not Clerk metadata. This keeps notification ownership in PostgreSQL with the rest of business state.

## Files Changed

- `db/schema.ts`
- `drizzle/0006_legal_azazel.sql`
- `drizzle/meta/0006_snapshot.json`
- `drizzle/meta/_journal.json`
- `.ai/initiatives/notification-records/phases/phase-2-notification-domain-schema-plan.md`
- `.ai/initiatives/notification-records/reports/phase-2-notification-domain-schema-plan.md`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

## Schema Added

`notification_type` enum:

- `new_quote_received`
- `quote_accepted`
- `quote_rejected`
- `message_received`

`notifications` table:

- `id`
- `recipient_user_profile_id`
- `actor_user_profile_id`
- `type`
- `title`
- `body`
- `link_href`
- `source_shipment_request_id`
- `source_quote_id`
- `source_conversation_id`
- `source_message_id`
- `dedupe_key`
- `read_at`
- `created_at`
- `updated_at`

Indexes and constraints:

- unique `dedupe_key`.
- recipient plus created-at index.
- recipient plus read-at index.
- type index.
- source shipment request, quote, and conversation indexes.
- foreign keys to user profiles and source entities.

## Commands Run

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:generate`: pass; generated `drizzle/0006_legal_azazel.sql`.
- `sed -n '1,260p' drizzle/0006_legal_azazel.sql`: pass; migration inspected.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate`: pass; PostgreSQL emitted one identifier-truncation notice for a generated FK name.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: pass.

## Verification Summary

- Passed commands: 5.
- Failed commands: 0.
- Skipped commands: browser smoke and UI checks were out of scope for this schema phase.

## Self-Heal Attempts

None.

## Browser Accounts Used

None.

## Database And Migration Changes

Applied migration `drizzle/0006_legal_azazel.sql` to:

- `postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`

The migration is additive. It creates one enum, one table, indexes, and foreign keys. It does not drop, truncate, or reset data.

## Auth, Privacy, And Security Impact

No runtime notification access path exists yet. The schema supports recipient scoping through `recipient_user_profile_id`.

Notification links must still target protected routes that re-check authorization.

## Unrelated Drift

Prior initiative changes remain in the worktree and were preserved.

## State Files Updated

- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

No durable decision update was required.

## Risks And Limitations

- active: Notification creation helpers are not implemented yet.
- active: Notification UI/list/read behavior is not implemented yet.
- accepted: New matching request and quote-expiring-soon notification types are not in the enum because those events are not approved for V1 execution.

## Next Phase Readiness

Phase 3 is ready. It should add idempotent notification creation helpers and integrate only the real event sources: quote submitted, message received, quote accepted, and quote rejected.
