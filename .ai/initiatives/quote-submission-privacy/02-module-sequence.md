# Module Sequence

## Phase 1: Current Quote Request Auth Audit

Inspect and document current truth from:

- `db/schema.ts`
- `drizzle/`
- `lib/authz.ts`
- completed `shipment-request-wizard` artifacts
- completed `forwarder-open-requests` artifacts
- current importer and forwarder request routes
- any quote-related code or placeholders

Output:

- Current request schema and posted status truth.
- Current forwarder route/detail truth.
- Current quote baseline and gaps.
- Current suspended-forwarder truth.

## Phase 2: Quote Domain Schema Privacy Plan

Define and implement quote persistence and privacy boundary.

Expected sequence:

1. Define quote status enum.
2. Define `quotes` table.
3. Decide whether `quote_versions` is needed.
4. Add constraints for one active quote per forwarder company per request, or document revision semantics.
5. Add indexes for request quote lookup and forwarder own-quote lookup.
6. Define importer quote detail DTO.
7. Define forwarder own-quote DTO.
8. Define competitor aggregate DTO.
9. Generate and apply migration.

## Phase 3: Quote Submission Flow Plan

Define and implement forwarder quote submission.

Expected sequence:

1. Add quote form on eligible posted request detail.
2. Add server action for quote submission.
3. Validate amount, currency, service, transit days, valid-until, and text fields.
4. Verify request is eligible and posted/open.
5. Verify current user is a forwarder member.
6. Enforce suspended-forwarder rule if state exists.
7. Enforce duplicate/revision behavior.
8. Persist snapshot data.

## Phase 4: Quote Visibility Verification Plan

Define and implement minimal visibility surfaces required to prove privacy.

Expected sequence:

1. Importer owner can read quote details for owned request.
2. Submitting forwarder can read own quote details.
3. Competitor forwarder can read request and safe aggregate only.
4. Quote count is aggregate-only.
5. Competitor quote fields are absent by query/DTO shape.

Do not build full quote comparison UI unless needed for proof. Keep importer visibility minimal and operational.

## Phase 5: Automated And Browser Verification

Run final automated verification and privacy smoke.

Automated commands:

1. `npm run db:migrate`
2. `npm run db:check`
3. `npm run type-check`
4. `npm run lint`
5. `npm run build`

Privacy smoke:

1. Forwarder A submits quote.
2. Importer sees Forwarder A quote details.
3. Forwarder A sees own quote details.
4. Forwarder B sees request and quote count only.
5. Forwarder B cannot see Forwarder A identity, amount, transit time, inclusions, exclusions, or notes.
6. Suspended forwarder cannot submit quote if suspension state exists.
