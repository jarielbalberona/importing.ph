# Phase 2: Importer Onboarding Hardening

Status: pending

## Goal

Prove or minimally harden importer onboarding from signed-in Clerk user to PostgreSQL business records and importer redirect.

## Scope

- Importer branch of `lib/onboarding.ts`.
- `app/onboarding/actions.ts`.
- `app/onboarding/page.tsx` only if validation or form wiring is broken.
- `scripts/prove-onboarding.ts` for importer proof/idempotency coverage.
- `lib/routes.ts` for importer destination only if current routing is wrong.

Allowed file changes during execution, only if needed:

- `lib/onboarding.ts`
- `app/onboarding/actions.ts`
- `app/onboarding/page.tsx`
- `scripts/prove-onboarding.ts`
- `lib/routes.ts`
- `.ai/initiatives/auth-onboarding-roles/phases/phase-2-importer-onboarding-hardening.md`
- `.ai/initiatives/auth-onboarding-roles/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Forwarder changes except shared onboarding code unavoidable for importer proof.
- Clerk metadata.
- Admin provisioning.
- Shipment requests.
- Quotes.
- Messaging.
- Tenant abstractions.

## Inputs

- Phase 1 report.
- `lib/onboarding.ts`
- `app/onboarding/actions.ts`
- `app/onboarding/page.tsx`
- `lib/routes.ts`
- `db/schema.ts`
- `scripts/prove-onboarding.ts`

## Tasks

- Verify importer validation requires role, full name, and company name.
- Verify unauthenticated submissions redirect to Clerk sign-in.
- Verify importer write creates `user_profiles` and `importer_profiles`.
- Verify importer write is transactional.
- Verify duplicate/retry onboarding cannot create duplicate importer rows.
- Verify duplicate/retry onboarding cannot silently switch an existing role.
- Verify importer redirect target is `/app/requests`.
- Apply the smallest fix only if verification exposes a real gap.

## Verification Commands

- `npm run db:prove-onboarding`
- `npm run type-check`

## Expected Evidence

- Importer profile proof passes.
- Importer user profile and importer profile IDs are produced by proof output.
- Retry/idempotency behavior is proven or documented as an active gap.
- Type-check passes.

## Repair Policy

Allowed repairs:

- Importer onboarding idempotency bug.
- Importer proof-script coverage gap.
- Importer redirect mismatch.
- Minor validation/type/import issue in touched scope.

Hard-stop instead of repairing when:

- Fix requires storing role/profile data in Clerk metadata.
- Fix requires changing product role definitions.
- Fix requires introducing tenant/workspace abstraction.
- Fix would touch shipment, quote, or messaging code.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
