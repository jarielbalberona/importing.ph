# Module Sequence

## Phase 1: Current Importer Quote Surface Audit

Inspect and document current truth from:

- completed `quote-submission-privacy` reports/artifacts
- completed request detail routes
- `db/schema.ts`
- `drizzle/`
- `lib/authz.ts`
- importer request routes
- forwarder quote visibility routes
- any quote actions/helpers

Output:

- Current quote schema and statuses.
- Current request status model.
- Current visibility helpers.
- Gaps for accept/reject.

## Phase 2: Quote Comparison Domain Status Plan

Define and implement status transitions and transactional rules.

Expected sequence:

1. Define quote comparison DTO for importer owner.
2. Define accepted/rejected/non-selected statuses.
3. Define request status transition.
4. Decide whether accepting one quote auto-rejects others.
5. Define expired quote behavior.
6. Add schema/status changes if needed.
7. Define transaction/concurrency protections.

## Phase 3: Importer UI Action Plan

Implement importer quote comparison and decision actions.

Expected sequence:

1. Add comparison UI to importer-owned request detail.
2. Show empty state when no quotes exist.
3. Show expired and already-selected states.
4. Add accept action.
5. Add reject action.
6. Confirm actions are server-side guarded.
7. Keep UI operational and compact.

## Phase 4: Privacy And Authorization Plan

Verify and harden viewer-specific access.

Expected sequence:

1. Enforce importer owner access to all request quotes.
2. Block non-owner importer access.
3. Preserve submitting-forwarder own-quote access.
4. Preserve competitor-forwarder restricted access.
5. Check direct URL/action abuse cases.
6. Ensure accepted/rejected statuses do not leak details.

## Phase 5: Verification And Smoke Plan

Run automated verification and browser/manual smoke.

Automated commands:

1. `npm run db:migrate`
2. `npm run db:check`
3. `npm run type-check`
4. `npm run lint`
5. `npm run build`

Smoke:

1. Importer sees all quotes on own request.
2. Non-owner importer cannot see quotes.
3. Submitting forwarder sees own quote only.
4. Competitor forwarder cannot see quote details.
5. Importer accepts one quote.
6. Importer rejects one quote.
7. Status transitions are correct.
