# Module Sequence

## Phase 1: Current Messaging Placeholder Audit

Inspect and document current truth from:

- completed dependency reports/artifacts
- `db/schema.ts`
- `drizzle/`
- `lib/authz.ts`
- `lib/routes.ts`
- importer request routes
- forwarder request routes
- quote submission and privacy helpers
- any conversation/message placeholders

Output:

- Current request schema and ownership truth.
- Current quote schema/status truth.
- Current messaging absence or placeholder truth.
- Current authz/helper gaps for participant checks.

## Phase 2: Conversation Message Domain Plan

Define and implement persistence for quote-gated messaging.

Expected sequence:

1. Define `conversations` table.
2. Define `messages` table.
3. Define unique conversation constraint for request plus forwarder company.
4. Define foreign keys to request, quote, forwarder company, and user profile.
5. Define optional quote version reference only if quote versions exist.
6. Define indexes for importer conversation list, forwarder conversation list, and message chronology.
7. Generate and apply migration.

Keep schema explicit. Do not use generic participants or JSON blob modeling unless dependency output forces it.

## Phase 3: Messaging Access Control Plan

Define and implement server-side participant and quote-gate checks.

Expected sequence:

1. Add helper to resolve current importer participant.
2. Add helper to resolve current forwarder company participant.
3. Verify quote exists before conversation creation/access.
4. Verify importer owns the request before importer reads/writes.
5. Verify forwarder company submitted the quote before forwarder reads/writes.
6. Block no-quote, competitor, unrelated importer, and unauthenticated cases.
7. Ensure direct action calls repeat the same checks.

## Phase 4: UI Action Plan

Define and implement simple conversation list/detail and message create behavior.

Expected sequence:

1. Add importer conversation list/detail route under the importer workspace.
2. Add forwarder conversation list/detail route under the forwarder workspace.
3. Add message creation server action.
4. Render chronological messages.
5. Add empty/loading/error states.
6. Keep compose behavior plain form-submit.
7. Avoid realtime infrastructure.

## Phase 5: Verification And Smoke Plan

Run automated verification and browser/manual smoke.

Automated commands:

1. `npm run db:migrate`
2. `npm run db:check`
3. `npm run type-check`
4. `npm run lint`
5. `npm run build`

Smoke:

1. Messaging blocked before quote.
2. Messaging opens after quote.
3. Importer can message quoting forwarder.
4. Quoting forwarder can message importer.
5. Competitor forwarder cannot access conversation.
6. Unrelated importer cannot access conversation.
