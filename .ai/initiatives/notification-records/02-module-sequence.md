# Module Sequence

## Phase 1: Current Notification Event Audit

Inspect and document current truth from:

- completed dependency reports/artifacts
- `db/schema.ts`
- `drizzle/`
- request actions/routes
- quote actions/routes
- quote comparison actions/routes
- message actions/routes
- authz helpers
- any notification/email placeholders

Output:

- Current notification placeholder absence or presence.
- Actual event sources available.
- Missing event sources.
- Event-to-recipient map for only implemented flows.

## Phase 2: Notification Domain Schema Plan

Define and implement durable notification records.

Expected sequence:

1. Define notification type values.
2. Define `notifications` table.
3. Define typed source references.
4. Define recipient and actor references.
5. Define `read_at` behavior.
6. Define deterministic `dedupe_key` behavior.
7. Add indexes for recipient list/read queries.
8. Generate and apply migration.

## Phase 3: Event Integration Plan

Create notification records from real marketplace actions.

Expected sequence:

1. Integrate quote-submitted notification for importer owner.
2. Integrate importer-replied notification for forwarder recipients.
3. Integrate forwarder-replied notification for importer recipient.
4. Integrate quote-accepted and quote-rejected notifications for forwarder recipients.
5. Integrate new-matching-request notifications only if safe matching rules exist.
6. Integrate quote-expiring-soon only if expiration can be handled without async infrastructure.
7. Define failure behavior and transaction boundaries.

Do not invent standalone fake emitters. Notification creation belongs next to the business action that caused it.

## Phase 4: Notification UI List Plan

Define and implement minimal in-app list/read behavior.

Expected sequence:

1. Add recipient-scoped notification list route.
2. Add mark-read action.
3. Add mark-all-read only if it stays trivial and scoped.
4. Add unread/read display.
5. Link notifications to existing protected routes.
6. Verify every linked route re-checks business authorization.

## Phase 5: Verification And Smoke Plan

Run automated verification and manual smoke.

Automated commands:

1. `npm run db:migrate`
2. `npm run db:check`
3. `npm run type-check`
4. `npm run lint`
5. `npm run build`

Smoke:

1. Quote submission creates importer notification.
2. Message reply creates recipient notification.
3. Quote acceptance/rejection creates forwarder notification.
4. Users cannot read others' notifications.
5. Read/unread behavior works if implemented.
