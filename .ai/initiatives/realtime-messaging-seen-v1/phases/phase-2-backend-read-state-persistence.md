# Phase 2: Backend Read-State Persistence

Status: passed

Allowed values: `pending`, `in_progress`, `repairing`, `passed`, `passed_with_issues`, `blocked`, `failed`.

## Objective

Add schema and idempotent mark-read persistence.

## Files Likely Involved

- `db/schema.ts`
- `drizzle/**`
- `lib/messages.ts`
- message server actions

## Acceptance Criteria

- Authenticated users can mark only authorized conversations read.
- Repeated mark-read does not duplicate rows.
- Older message IDs do not move state backward.
- Latest visible message id and timestamp are stored.

## Execution Notes

- Added `conversation_read_states` schema and migration.
- Added importer and forwarder mark-read server actions.
- Reused existing importer ownership and forwarder company membership checks before persistence.
- Implemented idempotent upsert with backward movement protection based on persisted message order.

## Verification Commands

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check`

## Risks

- Message ordering must use persisted `created_at`.

## Rollback Notes

Remove table, helper, and mark-read action wiring.
