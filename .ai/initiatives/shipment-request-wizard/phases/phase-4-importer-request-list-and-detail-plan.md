# Phase 4: Importer Request List And Detail Plan

Status: passed

## Goal

Implement importer-owned request list and detail views.

## Scope

- `app/app/requests/page.tsx`
- Request detail route under `app/app/requests`
- Request query helpers if needed
- Empty/error/not-found states
- Owner filtering

Allowed file changes during execution, only if needed:

- `app/app/requests/**`
- `lib/**` for request query helpers
- `components/**` for list/detail UI if local extraction is justified
- `.ai/initiatives/shipment-request-wizard/phases/phase-4-importer-request-list-and-detail-plan.md`
- `.ai/initiatives/shipment-request-wizard/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Forwarder browsing.
- Quote count unless already present in schema from a later initiative.
- Quote comparison.
- Messaging.
- Admin list/detail.

## Inputs

- Phase 2 report.
- Phase 3 report.
- Request schema and creation route.
- Existing importer proof route.

## Tasks

- Replace importer proof page with request list behavior.
- Add create-request entry point.
- Add request detail route.
- Query only current importer's requests.
- Add empty state.
- Add missing/non-owned request handling.
- Keep UI compact and operational.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- List/detail compiles.
- Owner filtering is present.
- Empty and not-found states are handled.
- Forwarder browsing remains absent.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Missing imports.
- Minor query/UI mismatch inside importer list/detail scope.

Hard-stop instead of repairing when:

- Visibility to forwarders is requested.
- Admin tooling is requested.
- Quote or messaging data is required.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
