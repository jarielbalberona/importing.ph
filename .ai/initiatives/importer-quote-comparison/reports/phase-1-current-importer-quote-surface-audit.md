# Phase 1 Report: Current Importer Quote Surface Audit

Final status: `passed`

## Summary Of Changes

Audit-only phase. No application code, schema, migration, runner, test, or package files changed.

The dependency chain is complete enough to begin this initiative. `quote-submission-privacy` has a final report and browser proof for private quote submission and competitor aggregate-only visibility.

## Files Changed

- `.ai/initiatives/importer-quote-comparison/phases/phase-1-current-importer-quote-surface-audit.md`
- `.ai/initiatives/importer-quote-comparison/reports/phase-1-current-importer-quote-surface-audit.md`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

No decision update was made.

## Repository Truth

Observed schema:

- `shipment_request_status`: `draft`, `posted`, `cancelled`
- `quote_status`: `submitted`, `withdrawn`
- `shipment_requests` has importer ownership through `importer_profile_id`.
- `quotes` has `shipment_request_id`, `forwarder_company_id`, `submitted_by_forwarder_member_id`, status, amount, currency, service, transit min/max days, inclusions, exclusions, notes, valid-until, timestamps.
- `quotes_request_company_idx` enforces one quote per request and forwarder company.

Observed routes and helpers:

- Importer request detail exists at `app/app/requests/[requestId]/page.tsx`.
- Importer detail uses `getShipmentRequestForCurrentImporter()` before loading quotes, so request ownership is checked before quote detail output.
- Importer detail currently shows proof-level submitted quote details.
- Forwarder request detail exists at `app/app/forwarder/requests/[requestId]/page.tsx`.
- Forwarder detail shows aggregate quote count to all eligible forwarders.
- Forwarder detail shows own quote details only through `getForwarderOwnQuoteForRequest(request.id, member.companyId)`.
- Forwarder quote submission action exists at `app/app/forwarder/requests/[requestId]/actions.ts`.
- There is no importer quote accept/reject action yet.

## Current Privacy Boundary

Verified from current code and the completed quote privacy report:

- Importer owner can see all quote details for its own request.
- Submitting forwarder can see its own quote details.
- Competitor forwarder sees request details and quote count only.
- Non-owner importer access to another importer request is blocked by `getShipmentRequestForCurrentImporter()`.

## Gaps For Accept / Reject

Required before implementation:

- Add quote statuses for `accepted` and `rejected`.
- Add a request status for quote selection, likely `quote_selected`.
- Decide whether request needs `selected_quote_id` or whether selected quote is derived from the accepted quote row.
- Add transaction helper for accept quote:
  - verify importer owns request
  - verify quote belongs to owned request
  - reject expired quote acceptance
  - prevent multiple accepted quotes for one request
  - update quote/request state atomically
- Add transaction helper for reject quote:
  - verify importer owns request
  - verify quote belongs to owned request
  - prevent rejecting an already accepted quote unless a later product decision defines unaccept/reopen
- Preserve competitor aggregate-only visibility after statuses exist.

## Commands Run

- `test -f .ai/initiatives/local-db-migration-proof/reports/final-report.md && test -f .ai/initiatives/auth-onboarding-roles/reports/final-report.md && test -f .ai/initiatives/shipment-request-wizard/reports/final-report.md && test -f .ai/initiatives/forwarder-open-requests/reports/final-report.md && test -f .ai/initiatives/quote-submission-privacy/reports/final-report.md`: pass.
- `git status --short`: pass; dirty worktree recorded and preserved.
- `test -f db/schema.ts && test -d drizzle && test -f lib/authz.ts && test -d app/app/requests && test -d app/app/forwarder/requests`: pass.
- `rg -n "quoteStatusEnum|shipmentRequestStatusEnum|quotes|quote_selected|accepted|rejected|withdrawn|submitQuote|getImporterVisibleQuotes|getForwarderOwnQuote" db lib app/app/requests app/app/forwarder/requests drizzle -g'*.ts' -g'*.tsx' -g'*.sql'`: pass.

## Repairs Attempted

None.

## State Files Updated

- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

No decision update was made.

## Risks And Limitations

- active: Current schema cannot represent accepted/rejected quotes or selected request state yet.
- active: Phase 2 must choose and implement the minimal additive status model without broad workflow expansion.
- accepted: Non-selected quotes should remain `submitted` after one quote is accepted, matching the initiative's recommended product decision.
- accepted: Expired quote acceptance should be blocked; no product decision is needed to allow it.

## Next Phase Readiness

Ready for Phase 2: `phase-2-quote-comparison-domain-status-plan`.
