# Module Sequence

## Phase 1: Current Importer Request Surface Audit

Inspect and document current truth from:

- `app/app/requests/page.tsx`
- `lib/authz.ts`
- `lib/routes.ts`
- `db/schema.ts`
- `drizzle/`
- `app/onboarding/actions.ts`
- `lib/onboarding.ts`
- `components/ui/*`
- `components.json`
- `package.json`

Output:

- Baseline report.
- Confirm no existing shipment request implementation.
- Identify exact files likely touched by later phases.

## Phase 2: Request Domain And Schema Plan

Define and implement the minimal request persistence layer.

Expected sequence:

1. Define enums for cargo type, delivery preference, shipping preference, and request status.
2. Define `shipment_requests` table with explicit columns.
3. Add ownership foreign key to `importer_profiles`.
4. Add useful indexes for importer-owned list/detail.
5. Generate Drizzle migration.
6. Verify migration and schema check.

Avoid JSON blob modeling for core request fields.

## Phase 3: Wizard UI And Action Plan

Define and implement importer-only request creation.

Expected sequence:

1. Add route structure for request creation under importer workspace.
2. Add server action for create/post request.
3. Add zod validation near request creation logic.
4. Build a compact wizard using existing UI conventions.
5. Enforce quoting-basis validation.
6. Enforce importer-only guard at route and action level.
7. Decide draft-vs-post behavior before coding.

## Phase 4: Importer Request List And Detail Plan

Define and implement importer-owned list/detail views.

Expected sequence:

1. Replace importer proof page with real importer request list behavior.
2. Add request detail route.
3. Query only requests owned by current importer profile.
4. Add empty state.
5. Add invalid/not-found behavior for non-owned request IDs.
6. Keep forwarder browsing out of scope.

## Phase 5: Verification And Smoke Plan

Run automated verification and browser smoke.

Automated commands:

1. `npm run db:migrate`
2. `npm run db:check`
3. `npm run type-check`
4. `npm run lint`
5. `npm run build`

Browser smoke:

1. Importer can create request.
2. Forwarder cannot create importer request.
3. Unauthenticated user redirects.
4. Invalid request basis is rejected.
5. Created request appears in importer list/detail.
