# Forwarder Open Requests

## Initiative Key

`forwarder-open-requests`

## Dependencies

depends_on: local-db-migration-proof, auth-onboarding-roles, shipment-request-wizard

Dependency rule: do not begin execution until all dependencies have final reports, are not blocked or failed, and `shipment-request-wizard` proves that posted shipment requests can be created. This initiative cannot be executed honestly against the current app alone because current code has no shipment request table or posted request data.

## Initiative Status

- Status: locked
- Ready for execution: yes
- Execution started: no
- Latest execution status: not started.

Lifecycle rule: this initiative is authored for review. Lock it only after the dependency chain is complete or explicitly accepted.

## Objective

Let authenticated forwarder members view eligible/open posted shipment requests and filter them without exposing private quote details.

This initiative is browsing only. It is not quote submission, quote comparison, messaging, notifications, or forwarder operations software.

## Repo Baseline Observed During Authoring

- Current forwarder route is `app/app/forwarder/requests/page.tsx`.
- Current forwarder route is a proof page guarded by `requireRole(["forwarder"])`.
- Current database schema has `user_profiles`, `importer_profiles`, `forwarder_companies`, and `forwarder_members`.
- Current database schema does not contain shipment request tables.
- Shipment request fields/statuses are planned in `shipment-request-wizard`, not implemented in current app code.
- Current role destination for forwarders is `/app/forwarder/requests`.
- Current UI primitives are `Button`, `Input`, and `Label`.
- No quote tables exist in current app code.
- No suspended forwarder status exists in current app code.

## Scope

- Forwarder-only open request list.
- Forwarder request detail view for quoteable request information.
- Filters for:
  - origin city/province
  - destination city/province
  - cargo type
  - shipping mode
  - door-to-door requirement/preference
  - special handling / MSDS-related signals where available
- Request visibility limited to posted/open quoteable requests.
- Forwarders can see request information needed to decide whether to quote.
- Forwarders can see quote count only if quote data already exists or is planned by a completed dependency.
- Forwarders must not see competitor quote identities, amounts, transit times, inclusions, exclusions, notes, or messages.
- Define suspended-forwarder behavior if the completed auth/domain model includes suspension.
- Define route/action authorization rules.
- Define DB indexes needed for filtering.

## Non-Goals

- Do not build quote submission.
- Do not build importer quote comparison.
- Do not build messaging.
- Do not build notifications.
- Do not build file upload storage.
- Do not build public SEO pages.
- Do not build payments, tracking, escrow, reviews, analytics, ERP, or forwarder operations tooling.
- Do not introduce queues, Redis, WebSockets, microservices, Prisma, Express, AWS, or Terraform.

## Acceptance Criteria

- Current forwarder/request baseline is audited and recorded.
- Forwarder list queries only posted/open quoteable requests.
- Forwarder detail shows only approved request fields.
- Filters work for available request fields.
- Request filtering has appropriate database indexes.
- Importers cannot access forwarder open request routes.
- Unauthenticated users are redirected by existing auth protection.
- Draft, closed, and cancelled requests are not exposed.
- Quote count is shown only if a safe aggregate exists.
- Competitor quote details are not exposed.

## Domain Model

- Open request: a posted shipment request visible to eligible forwarders.
- Quoteable request information: request fields needed to decide whether to quote.
- Forwarder member: user associated with a forwarder company.
- Suspended forwarder: not currently implemented; behavior must be defined only if a completed dependency introduces the state.
- Quote count: safe aggregate count, not quote details.

## Module Sequence

1. Audit current forwarder/request state.
2. Define visibility and privacy boundary.
3. Define and implement filters/list/detail.
4. Define and implement authorization and suspended-forwarder behavior if applicable.
5. Run verification and privacy smoke.

## Cross-Module Data Flow

```text
/app/forwarder/requests
-> requireRole(["forwarder"])
-> optional forwarder membership/status lookup
-> posted/open shipment_requests query
-> filtered forwarder-safe DTO
-> list UI
```

```text
/app/forwarder/requests/[requestId]
-> requireRole(["forwarder"])
-> posted/open shipment_requests lookup
-> forwarder-safe request detail DTO
-> detail UI
```

## Verification Plan

Automated commands:

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

Browser/manual smoke:

- Forwarder can see posted request.
- Importer cannot access forwarder open request route.
- Unauthenticated user redirects.
- Draft/closed/cancelled requests are not exposed.
- Quote count is allowed if implemented.
- Competitor quote details are not exposed.

## Hard Stops

Stop for human input if any of these occur:

- Dependencies are incomplete and not explicitly accepted.
- Shipment request schema lacks fields needed for required filters.
- Product requires forwarder eligibility rules beyond role/membership.
- Suspended-forwarder behavior needs a product decision.
- Quote count requires quote tables that do not exist.
- Any request would expose competitor quote details.
- Scope expands to quote submission, messaging, notifications, tracking, payment, ERP, or operations tooling.
