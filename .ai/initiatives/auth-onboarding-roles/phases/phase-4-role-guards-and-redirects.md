# Phase 4: Role Guards And Redirects

Status: pending

## Goal

Prove or minimally harden database-backed role guards, role redirects, wrong-role behavior, and admin route handling.

## Scope

- `proxy.ts`.
- `lib/authz.ts`.
- `lib/routes.ts`.
- `app/after-auth/page.tsx`.
- `app/app/requests/page.tsx`.
- `app/app/forwarder/requests/page.tsx`.
- `app/admin/page.tsx`.
- `app/unauthorized/page.tsx` only if a product-approved wrong-role UX change is required.

Allowed file changes during execution, only if needed:

- `proxy.ts`
- `lib/authz.ts`
- `lib/routes.ts`
- `app/after-auth/page.tsx`
- `app/app/requests/page.tsx`
- `app/app/forwarder/requests/page.tsx`
- `app/admin/page.tsx`
- `app/unauthorized/page.tsx`
- `.ai/initiatives/auth-onboarding-roles/phases/phase-4-role-guards-and-redirects.md`
- `.ai/initiatives/auth-onboarding-roles/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Admin provisioning.
- New workspace shell.
- Route groups or navigation redesign.
- Shipment, quote, or messaging route guards.
- Clerk metadata authorization.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Current auth helper and route files.

## Tasks

- Verify Clerk middleware protects intended route groups.
- Verify `requireProfile` redirects profile-less users to `/onboarding`.
- Verify `requireRole(["importer"])` protects importer proof route.
- Verify `requireRole(["forwarder"])` protects forwarder proof route.
- Verify `requireRole(["admin"])` protects admin proof route.
- Verify wrong-role behavior and document whether current role-destination redirect remains accepted.
- Verify `/after-auth` deterministic redirect behavior.
- Document admin route truth: enum and route exist, onboarding does not provision admin.
- Apply the smallest fix only if current route guards are wrong or inconsistent with accepted behavior.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Type-check passes.
- Lint passes.
- Report lists route protection matrix.
- Report records admin handling.
- Report records wrong-role behavior.

## Repair Policy

Allowed repairs:

- Missing or incorrect page-level role guard.
- Incorrect role destination.
- Middleware protected-route mismatch.
- Minor type/import/lint issue in touched scope.

Hard-stop instead of repairing when:

- Wrong-role UX requires a product decision.
- Admin provisioning requires a security/product decision.
- Fix requires changing auth provider.
- Fix requires business truth in Clerk metadata.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
