# Phase 2 Report: Quote Comparison Domain Status Plan

Final status: `passed`

## Summary Of Changes

Implemented the minimal quote/request decision model for importer quote comparison.

Changes:

- Added quote statuses `accepted` and `rejected`.
- Added shipment request status `quote_selected`.
- Added importer decision helpers:
  - `acceptQuoteForCurrentImporter(quoteId)`
  - `rejectQuoteForCurrentImporter(quoteId)`
  - `QuoteDecisionError`
- Accept helper verifies importer ownership, quote/request relationship, submitted status, non-expired validity, and one accepted quote per request.
- Reject helper verifies importer ownership, quote/request relationship, and submitted status.
- Accepting a quote updates the quote to `accepted` and the request to `quote_selected` in one transaction.
- Rejecting a quote updates only that quote to `rejected`.
- Non-selected quotes remain `submitted`.

## Files Changed

- `db/schema.ts`
- `drizzle/0004_closed_lucky_pierre.sql`
- `drizzle/meta/0004_snapshot.json`
- `drizzle/meta/_journal.json`
- `lib/quotes.ts`
- `.ai/initiatives/importer-quote-comparison/phases/phase-2-quote-comparison-domain-status-plan.md`
- `.ai/initiatives/importer-quote-comparison/reports/phase-2-quote-comparison-domain-status-plan.md`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

## Status Model

Quote statuses:

- `submitted`: quote is active and decisionable.
- `accepted`: importer selected this quote.
- `rejected`: importer explicitly declined this quote.
- `withdrawn`: already modeled for future forwarder withdrawal, not implemented as a flow here.

Request statuses:

- `posted`: request is open for quotes.
- `quote_selected`: importer accepted one quote.
- `draft` and `cancelled`: existing statuses preserved.

## Transaction / Concurrency Strategy

Accepting a quote:

- Uses `requireImporterProfile()` to bind the action to the current importer.
- Loads the quote through the owned request, not by quote id alone.
- Blocks non-`submitted` quotes.
- Blocks expired quotes.
- Takes `pg_advisory_xact_lock(hashtext(requestId))` inside the database transaction.
- Re-checks for an existing accepted quote for the request.
- Updates quote status and request status atomically.

Rejecting a quote:

- Loads the quote through the owned request.
- Blocks non-`submitted` quotes.
- Updates only the quote status.

Rejected accepted quotes and unaccept/reopen behavior are intentionally not supported.

## Verification Summary

Passed: 5.

Failed then repaired: 1.

Skipped: 0.

## Commands Run

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run db:generate`: pass; generated `drizzle/0004_closed_lucky_pierre.sql`.
- `sed -n '1,220p' drizzle/0004_closed_lucky_pierre.sql`: pass; migration inspected.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate`: initial fail; repaired migration/concurrency approach; rerun passed.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev node --input-type=module - <<'JS' <enum inspection> JS`: pass; local DB has quote statuses `submitted`, `accepted`, `rejected`, `withdrawn` and request statuses `draft`, `posted`, `quote_selected`, `cancelled`.

## Repairs Attempted

1. Initial migration generated a partial unique index using the new `accepted` enum value in the same migration.
   - Failure cause: PostgreSQL rejected the attempted index predicate repair using `status::text = 'accepted'` because functions in index predicates must be immutable.
   - Repair: removed the partial index and added a transaction-level advisory lock around quote acceptance.
   - Result: `db:migrate`, `db:check`, and `type-check` passed.

## State Files Updated

- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

No decision update was made.

## Risks And Limitations

- accepted: Non-selected quotes remain `submitted` after one quote is accepted.
- accepted: Accepting expired quotes is blocked.
- accepted: There is no unaccept/reopen behavior for accepted quotes.
- accepted: One accepted quote per request is guarded by a transaction-level advisory lock and status re-check rather than a partial unique index.

## Next Phase Readiness

Ready for Phase 3: `phase-3-importer-ui-action-plan`.
