# Quote Submission Privacy

## Initiative Key

`quote-submission-privacy`

## Dependencies

depends_on: local-db-migration-proof, auth-onboarding-roles, shipment-request-wizard, forwarder-open-requests

Dependency rule: do not begin execution until all dependencies have final reports, are not blocked or failed, and `forwarder-open-requests` proves that forwarders can browse posted requests safely. This initiative cannot execute honestly against current app code alone because current code has no shipment request table, open request browsing implementation, or quote table.

## Initiative Status

- Status: locked
- Ready for execution: yes
- Execution started: yes
- Latest execution status: complete.
- Final report: `reports/final-report.md`
- Final verdict: `PASS WITH ISSUES`
- Next recommended initiative: `importer-quote-comparison`

Lifecycle rule: this initiative is authored for review. Lock it only after the dependency chain is complete or explicitly accepted.

## Objective

Let an authenticated forwarder submit a private quote on an eligible posted shipment request while preventing competitor quote data leakage.

This initiative creates the first private commercial response surface. The privacy boundary is the product. If competitor quote details leak, the marketplace is not trustworthy.

## Repo Baseline Observed During Authoring

- Current app code has no quote tables in `db/schema.ts`.
- Current app code has no quote migrations under `drizzle/`.
- Current app code has no quote server actions.
- Current app code has no shipment request table; shipment requests are planned in `shipment-request-wizard`.
- Current app code has no forwarder open request browsing; it is planned in `forwarder-open-requests`.
- Current forwarder route is `app/app/forwarder/requests/page.tsx`, currently a proof route guarded by `requireRole(["forwarder"])`.
- Current importer route is `app/app/requests/page.tsx`, currently a proof route guarded by `requireRole(["importer"])`.
- Current schema has `user_profiles`, `importer_profiles`, `forwarder_companies`, and `forwarder_members`.
- Current app code has no suspended-forwarder status.
- Current UI primitives are `Button`, `Input`, and `Label`.

## Scope

- Forwarder submits a quote for an eligible posted shipment request.
- Quote form fields:
  - quote amount
  - currency, default `PHP` unless a completed dependency defines otherwise
  - service offered
  - estimated transit min days
  - estimated transit max days
  - inclusions
  - exclusions
  - notes
  - valid until
- Define quote statuses needed for first implementation.
- Define quote and quote version model if revisions are included.
- Define whether one forwarder company can submit one active quote per request or multiple revisions.
- Define snapshot behavior for submitted quote data.
- Define privacy boundary:
  - importer owner can see all quote details for their own request
  - submitting forwarder/company can see its own quote details
  - other forwarders can only see allowed aggregate metadata such as quote count
- Define suspended-forwarder behavior: suspended forwarder cannot submit quote.
- Define route/action authorization checks.
- Define database tables, enums, indexes, and constraints.
- Define privacy-focused verification.

## Non-Goals

- Do not build importer quote comparison UI beyond what is necessary to verify quote visibility.
- Do not build quote acceptance or rejection unless a completed dependency explicitly requires it here.
- Do not build messaging.
- Do not build notifications.
- Do not build service profiles unless absolutely required; if mentioned, keep them future or optional prefill.
- Do not build payments, tracking, escrow, reviews, analytics, ERP, or public SEO pages.
- Do not introduce queues, Redis, WebSockets, microservices, Prisma, Express, AWS, or Terraform.

## Acceptance Criteria

- Current quote/request/auth baseline is audited and recorded.
- Quote schema is explicit and migration-backed.
- Forwarder quote submission is guarded by database-backed forwarder role and company membership.
- Suspended forwarders cannot submit if suspension state exists.
- Quote validation enforces amount, currency, service, transit range, and valid-until rules.
- One-company-per-request active quote/revision behavior is defined and enforced.
- Importer owner can view quote details for their own request.
- Submitting forwarder/company can view its own quote details.
- Competitor forwarders cannot view quote identity, amount, transit times, inclusions, exclusions, notes, or messages.
- Other forwarders can see only safe aggregate metadata, such as quote count, if implemented.
- Privacy smoke proves competitor leakage does not happen.

## Recommended Product Decisions For Review

- V1 should allow one active quote per forwarder company per request.
- V1 should not support multiple active quotes from the same company on one request.
- V1 should store submitted quote values as a durable snapshot.
- V1 should skip `quote_versions` unless revisions are required in the first pass. If revisions are required, use `quotes` as the stable quote identity and `quote_versions` as append-only snapshots.
- V1 quote statuses should be minimal: `submitted`, `withdrawn`, and optionally `superseded` if revisions are implemented.
- Quote acceptance/rejection should be a later initiative.

## Domain Model

- Quote: private commercial response from a forwarder company to an importer-owned posted request.
- Quote status: lifecycle state for submitted quote.
- Quote snapshot: submitted values preserved at time of submission.
- Quote version: optional append-only revision model if revisions are implemented.
- Quote owner: submitting forwarder company.
- Quote viewer: importer owner or submitting forwarder company.
- Competitor forwarder: any other forwarder company.

## Module Sequence

1. Audit current quote/request/auth baseline.
2. Define and implement quote domain/schema/privacy boundary.
3. Define and implement quote submission flow.
4. Define and implement quote visibility verification surfaces.
5. Run automated verification and privacy smoke.

## Cross-Module Data Flow

```text
Forwarder request detail
-> requireRole(["forwarder"])
-> forwarder company membership lookup
-> eligible posted request lookup
-> quote submission form
-> server action
-> validation
-> quotes insert or revision insert
-> redirect to own quote view or request detail
```

```text
Importer-owned request detail
-> requireRole(["importer"])
-> importer ownership check
-> quote details for that request
-> importer-only quote detail output
```

```text
Other forwarder request detail
-> requireRole(["forwarder"])
-> posted request lookup
-> aggregate quote count only
-> no competitor quote fields
```

## Verification Plan

Automated commands:

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

Privacy smoke:

- Forwarder A submits quote.
- Importer sees Forwarder A quote details.
- Forwarder A sees own quote details.
- Forwarder B sees request and quote count only.
- Forwarder B cannot see Forwarder A identity, amount, transit time, inclusions, exclusions, or notes.
- Suspended forwarder cannot submit quote if suspension state exists.

## Hard Stops

Stop for human input if any of these occur:

- Dependencies are incomplete and not explicitly accepted.
- Posted request eligibility is not implemented or unclear.
- Product requires multiple active quotes from one forwarder company on one request.
- Product requires quote acceptance/rejection in this initiative.
- Quote revision behavior is disputed.
- Suspended-forwarder state is missing but required by product before quote submission.
- Any query or DTO would expose competitor quote details.
- Scope expands to messaging, notifications, payments, tracking, ERP, or public SEO.
