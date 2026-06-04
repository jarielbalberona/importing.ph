# Phase 2 Report: Backend Read-State Persistence

Verdict: PASS

Implemented `conversation_read_states` as the PostgreSQL source of truth for conversation-level read cursors.

## Files Changed

- `db/schema.ts`
- `drizzle/0012_conversation_read_states.sql`
- `drizzle/meta/_journal.json`
- `lib/messages.ts`
- `app/app/requests/messages/[conversationId]/actions.ts`
- `app/app/forwarder/messages/[conversationId]/actions.ts`

## Decisions

- Read state is per `user_profile_id`, not per forwarder company.
- Mark-read remains server-action/API-first.
- The operation is idempotent and refuses to move the cursor backward.

## Verification

- `npm run type-check`: passed.
- `npm run lint`: passed.
- `npm run db:migrate`: passed against local PostgreSQL.
- `npm run db:check`: passed against local PostgreSQL.

## Risks

Production databases must receive migration `0012_conversation_read_states.sql` before deployed seen state can work.
