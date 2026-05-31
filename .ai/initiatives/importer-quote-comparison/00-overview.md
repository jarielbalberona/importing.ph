# Importer Quote Comparison

## Initiative Key

`importer-quote-comparison`

## Dependencies

depends_on: local-db-migration-proof, auth-onboarding-roles, shipment-request-wizard, forwarder-open-requests, quote-submission-privacy

Dependency rule: do not begin execution until all dependencies have final reports, are not blocked or failed, and `quote-submission-privacy` proves private quote submission and competitor privacy. This initiative cannot execute honestly against current app code alone because current code has no shipment request detail route, quote schema, or quote actions.

## Initiative Status

- Status: draft
- Ready for execution: no
- Execution started: no
- Latest execution status: not started.

Lifecycle rule: this initiative is authored for review. Lock it only after the dependency chain is complete or explicitly accepted.

## Objective

Let the importer owner of a shipment request compare submitted private quotes and choose how to proceed, without exposing quote details to non-owners or competitor forwarders.

This completes the first request-to-quote decision loop. It is not messaging, payment, escrow, notification, or shipment execution.

## Repo Baseline Observed During Authoring

- Current app code has no quote schema in `db/schema.ts`.
- Current app code has no quote actions.
- Current app code has no importer request detail route.
- Current importer route is `app/app/requests/page.tsx`, currently a proof page guarded by `requireRole(["importer"])`.
- Current forwarder route is `app/app/forwarder/requests/page.tsx`, currently a proof page guarded by `requireRole(["forwarder"])`.
- Quote submission, quote privacy, and quote visibility are planned in `quote-submission-privacy`, not implemented in current app code.
- `quote-submission-privacy` intentionally leaves quote acceptance/rejection to this initiative.
- Current UI primitives are `Button`, `Input`, and `Label`.

## Scope

- Importer-owned request detail shows submitted quotes.
- Importer can compare:
  - amount
  - currency
  - service offered
  - estimated transit range
  - inclusions
  - exclusions
  - notes
  - valid until/status
- Importer can accept a quote.
- Importer can reject a quote.
- Define resulting status changes for:
  - selected quote
  - rejected quote
  - request status
  - non-selected quotes
- Define whether accepting one quote auto-rejects others or leaves them non-selected.
- Define quote expiration display/handling if already modeled.
- Define route/action authorization:
  - only importer owner can compare all quotes
  - submitting forwarder can still see own quote only
  - competitor forwarders cannot see quote details
- Define transactional consistency for accept/reject operations.
- Define verification for quote privacy after acceptance/rejection.

## Non-Goals

- Do not build messaging unless noted only as a future dependency.
- Do not build notifications, except note what future notification records should consume.
- Do not build payments, escrow, tracking, reviews, analytics, admin tooling, or public SEO pages.
- Do not add service profile management.
- Do not introduce queues, Redis, WebSockets, microservices, Prisma, Express, AWS, or Terraform.

## Acceptance Criteria

- Current importer quote surface is audited and recorded.
- Importer owner can see all submitted quotes for its own request.
- Non-owner importer cannot see quotes for another importer's request.
- Submitting forwarder can still see only its own quote.
- Competitor forwarder cannot see quote details before or after selection.
- Importer can accept one quote transactionally.
- Importer can reject one quote transactionally.
- Selected/rejected/non-selected quote statuses are defined and implemented.
- Request status transition on quote acceptance is defined and implemented.
- Privacy smoke proves status changes do not leak quote details.

## Recommended Product Decisions For Review

- Accepting one quote should mark that quote `accepted`.
- Rejected quote should be marked `rejected`.
- Non-selected submitted quotes should remain `submitted` unless the product explicitly wants auto-reject. Auto-reject can annoy forwarders and implies a decision the importer may not intend.
- Request status should move to `quote_selected` or equivalent when a quote is accepted.
- Quote acceptance/rejection should be transactional with request status update.
- Quote expiration should be displayed from `valid_until` if modeled by `quote-submission-privacy`; expired quote acceptance should hard-stop unless product accepts it.

## Domain Model

- Quote comparison: importer-owned view of submitted quote details for one request.
- Accepted quote: selected quote the importer wants to proceed with.
- Rejected quote: quote the importer explicitly declines.
- Non-selected quote: submitted quote not accepted or rejected.
- Request selection state: request-level record that a quote has been selected.
- Quote decision transaction: atomic update of quote/request statuses.

## Module Sequence

1. Audit current importer quote surface.
2. Define quote comparison domain/status transitions.
3. Define and implement importer UI/actions.
4. Define and implement privacy/authorization checks.
5. Run automated verification and privacy smoke.

## Cross-Module Data Flow

```text
/app/requests/[requestId]
-> requireRole(["importer"])
-> importer ownership check
-> request lookup
-> quote list for owned request
-> comparison UI
```

```text
accept quote action
-> requireRole(["importer"])
-> importer ownership check
-> quote belongs to owned request
-> transaction
-> update selected quote status
-> update request status/selected quote reference
-> optionally leave non-selected quotes submitted or mark per approved rule
```

```text
forwarder own quote view
-> requireRole(["forwarder"])
-> forwarder company check
-> own quote only
-> status visible only for own quote
```

## Verification Plan

Automated commands:

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

Browser/manual smoke:

- Importer sees all quotes on own request.
- Non-owner importer cannot see quotes.
- Submitting forwarder sees own quote only.
- Competitor forwarder cannot see quote details.
- Importer accepts one quote.
- Importer rejects one quote.
- Status transitions are correct.

## Hard Stops

Stop for human input if any of these occur:

- Dependencies are incomplete and not explicitly accepted.
- Quote statuses from `quote-submission-privacy` cannot support accept/reject without product decision.
- Request status does not have or cannot add a selected/accepted state safely.
- Product requires accepting expired quotes.
- Product requires auto-rejecting non-selected quotes but the rule is unclear.
- Any query or DTO exposes quote details to non-owner importers or competitor forwarders.
- Scope expands to messaging, notifications, payments, escrow, tracking, admin tooling, or public SEO.
