# Module Sequence

## Phase 1: Current Forwarder Request Audit

Inspect and document current truth from:

- `app/app/forwarder/requests/page.tsx`
- `lib/authz.ts`
- `lib/routes.ts`
- `db/schema.ts`
- `drizzle/`
- completed `shipment-request-wizard` artifacts
- completed `auth-onboarding-roles` artifacts
- existing UI primitives

Output:

- Current forwarder route baseline.
- Available shipment request fields from completed dependency.
- Missing filter support.
- Privacy risks.

## Phase 2: Visibility And Privacy Plan

Define exact forwarder-safe field exposure.

Expected sequence:

1. Identify all request columns available after `shipment-request-wizard`.
2. Classify each field as forwarder-visible, importer-only, or not relevant.
3. Define list DTO.
4. Define detail DTO.
5. Define quote aggregate behavior if quote data exists.
6. Prohibit competitor quote details by query shape, not just UI omission.

## Phase 3: Filter List Detail Plan

Implement forwarder list/detail browsing and filters.

Expected sequence:

1. Replace forwarder proof page with open request list.
2. Add request detail route.
3. Add filter controls for available fields.
4. Query only posted/open requests.
5. Add empty state.
6. Add indexes for common filters if missing.
7. Avoid fake filters for fields not present in schema.

## Phase 4: Authorization And Suspended Forwarder Handling

Define and implement access behavior.

Expected sequence:

1. Enforce forwarder-only route access.
2. Enforce server-side query access.
3. Confirm importer cannot access forwarder routes.
4. Confirm unauthenticated users redirect.
5. Determine whether forwarder membership lookup is required beyond role.
6. Define suspended-forwarder behavior only if a suspension state exists.

## Phase 5: Verification And Privacy Smoke

Run automated verification and browser/manual smoke.

Automated commands:

1. `npm run db:migrate`
2. `npm run db:check`
3. `npm run type-check`
4. `npm run lint`
5. `npm run build`

Smoke:

1. Forwarder can see posted request.
2. Importer cannot access forwarder open request route.
3. Unauthenticated user redirects.
4. Draft/closed/cancelled requests are not exposed.
5. Quote count is visible only if safely implemented.
6. Competitor quote details are not exposed.
