# Phase 4: Authorization And Suspended Forwarder Handling

Status: pending

## Goal

Enforce forwarder-only access and define suspended-forwarder handling based on actual schema/state.

## Scope

- Forwarder route guards.
- Server-side query/action guards.
- Optional forwarder membership/status lookup.
- Suspended-forwarder behavior if the schema supports it.

Allowed file changes during execution, only if needed:

- `app/app/forwarder/requests/**`
- `lib/authz.ts`
- `lib/**` for forwarder membership/status helpers
- `.ai/initiatives/forwarder-open-requests/phases/phase-4-authorization-and-suspended-forwarder-handling.md`
- `.ai/initiatives/forwarder-open-requests/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Admin suspension tooling.
- Forwarder approval workflow.
- Quote eligibility enforcement beyond browsing.
- New suspension schema unless a completed dependency already requires it.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Completed auth/onboarding role helpers.
- Current forwarder company/member schema.

## Tasks

- Verify forwarder-only route guards.
- Verify importer cannot access route.
- Verify unauthenticated access redirects.
- Verify server-side queries cannot be called without forwarder role.
- Determine whether forwarder membership lookup is required.
- If suspended-forwarder state exists, enforce documented behavior.
- If no suspended-forwarder state exists, document as not applicable and do not invent schema.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Type-check passes.
- Lint passes.
- Authorization matrix is recorded.
- Suspended-forwarder handling is implemented or explicitly not applicable.

## Repair Policy

Allowed repairs:

- Missing guard.
- Incorrect route role.
- Minor helper/query mismatch inside authorization scope.

Hard-stop instead of repairing when:

- Suspended-forwarder behavior requires product decision.
- Fix requires admin tooling or approval workflow.
- Fix requires quote submission scope.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
