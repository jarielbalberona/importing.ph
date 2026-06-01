# Shipment Request Wizard

## Initiative Key

`shipment-request-wizard`

## Dependencies

depends_on: local-db-migration-proof, auth-onboarding-roles

Dependency rule: do not begin execution until `local-db-migration-proof` and `auth-onboarding-roles` are completed with final reports, or a human explicitly accepts them as already proven. This initiative depends on a working local database and database-backed importer role guards.

## Initiative Status

- Status: locked
- Ready for execution: yes
- Execution started: yes
- Latest execution status: completed. Final verdict: `PASS`.

Lifecycle rule: this initiative is authored for review. Lock it only after dependencies are complete or explicitly accepted and the request domain choices are approved.

## Objective

Allow an authenticated importer to create a minimal but quoteable shipment/import request through a guided wizard, storing durable request data in PostgreSQL.

This is the first marketplace data slice. It must stay small enough to validate importer request creation without dragging in forwarder browsing, quotes, messaging, file storage, tracking, or operations software.

## Repo Baseline Observed During Authoring

- Current importer route is `app/app/requests/page.tsx`.
- `app/app/requests/page.tsx` is a proof route guarded by `requireRole(["importer"])`.
- There are no shipment request tables in `db/schema.ts`.
- There are no shipment request migrations under `drizzle/`.
- There are no request creation server actions.
- Existing server action pattern is `app/onboarding/actions.ts`.
- Existing validation pattern uses `zod` in `lib/onboarding.ts`.
- Existing route destination for importers is `/app/requests` in `lib/routes.ts`.
- Existing UI primitives are `Button`, `Input`, and `Label`.
- The repo uses Tailwind CSS v4 and shadcn-style component conventions.
- There is no file upload/storage implementation.

## Scope

- Importer-only shipment/import request creation flow.
- Wizard route structure under the importer workspace.
- Request wizard steps:
  1. What are you shipping?
  2. Size, weight, and value.
  3. Pickup and destination.
  4. Shipping preference.
  5. Attachments and notes.
  6. Review and post.
- Define required and optional V1 fields.
- Define cargo type enum.
- Define delivery preference enum.
- Define shipping preference enum.
- Define minimal request statuses.
- Define validation requiring at least one useful quoting basis:
  - total CBM
  - or total weight
  - or dimensions plus carton/package count
- Define importer ownership rules.
- Decide whether execution supports `DRAFT` plus `POSTED`, or `POSTED`-only for first pass.
- Define route and server action guards.
- Define database schema and migration requirements.
- Define importer-owned request list and detail behavior.

## Non-Goals

- Do not build forwarder browsing.
- Do not build quote submission.
- Do not build quote comparison.
- Do not build messaging.
- Do not build real file upload storage.
- Do not build payments, tracking, escrow, subscriptions, reviews, analytics, or admin tooling.
- Do not introduce queues, Redis, WebSockets, microservices, Prisma, Express, AWS, or Terraform.
- Do not add tenant/workspace abstractions unless existing completed initiatives explicitly require them.

## Acceptance Criteria

- Current importer/request baseline is audited and recorded.
- A minimal shipment request schema is defined and implemented only during execution.
- Importer ownership is enforced by database relationship and route/action guards.
- Request creation validates required fields and quoting-basis rules.
- Importer can create a request through the wizard.
- Created request appears in importer-owned list and detail views.
- Forwarder cannot create importer requests.
- Unauthenticated users are redirected by existing auth protection.
- Invalid request basis is rejected.
- Automated verification commands pass or failures are recorded with exact evidence.

## Domain Model

- Shipment request: importer-owned record describing goods and shipping requirements.
- Request owner: importer profile that created the request.
- Cargo type: explicit enum for V1 cargo classification.
- Delivery preference: explicit enum for pickup/drop-off or delivery handling preference.
- Shipping preference: explicit enum for speed/cost/service preference.
- Request status: minimal lifecycle state for request creation and posting.
- Quoting basis: enough size/weight data for forwarders to quote.

## Module Sequence

1. Audit current importer/request surface.
2. Define and implement request domain/schema/migration.
3. Define and implement wizard UI/server action/persistence.
4. Define and implement importer request list/detail.
5. Run automated verification and browser smoke.

## Cross-Module Data Flow

```text
Importer route
-> requireRole(["importer"])
-> request wizard form
-> server action
-> zod validation
-> importer profile lookup
-> shipment_requests insert/update
-> redirect to importer request detail or list
```

```text
Importer request list/detail
-> requireRole(["importer"])
-> importer profile lookup
-> shipment_requests filtered by importer_profile_id
-> render only owner data
```

## Verification Plan

Automated commands:

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

Browser smoke:

- Importer can create a request.
- Forwarder cannot create importer request.
- Unauthenticated user redirects.
- Invalid request basis is rejected.
- Created request appears in importer list/detail.

## Hard Stops

Stop for human input if any of these occur:

- Dependencies are incomplete and not explicitly accepted.
- Required V1 request fields are disputed.
- Draft behavior cannot be decided from this initiative.
- File attachment expectations require real storage.
- Request visibility to forwarders is requested.
- Quote, messaging, payment, tracking, admin, or analytics scope appears.
- Schema change would require destructive migration.
- Route/action guard behavior conflicts with `auth-onboarding-roles`.
