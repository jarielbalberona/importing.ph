# Phase 3: Wizard UI And Action Plan

Status: passed

## Goal

Implement importer-only request creation through a guided wizard with server-side validation and persistence.

## Scope

- Importer request creation routes under `app/app/requests`.
- Server action for request creation.
- Request validation logic.
- Existing UI primitive usage.
- Route/action guards.

Allowed file changes during execution, only if needed:

- `app/app/requests/**`
- `lib/**` for request validation/persistence helpers
- `components/**` for request wizard components if local extraction is justified
- `.ai/initiatives/shipment-request-wizard/phases/phase-3-wizard-ui-and-action-plan.md`
- `.ai/initiatives/shipment-request-wizard/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Forwarder request browsing.
- Quote submission.
- Messaging.
- Real file uploads.
- Complex client state libraries.
- React Query or Zustand.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Request schema.
- Existing auth helpers.
- Existing UI primitives.

## Tasks

- Decide and document draft-vs-post behavior before coding.
- Add importer-only request creation route.
- Add wizard UI steps.
- Add server action with importer guard.
- Add zod validation for required fields and quoting basis.
- Persist request to PostgreSQL.
- Redirect after successful creation.
- Keep attachment behavior to notes/placeholders only.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Wizard/action compiles.
- Invalid quoting basis is rejected.
- Importer-only guard exists at route and action level.
- Draft/post behavior is recorded.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Missing imports.
- Minor validation/action mismatch inside request creation scope.

Hard-stop instead of repairing when:

- Draft behavior requires a product decision.
- File attachments require real storage.
- Scope expands to forwarder browsing, quotes, or messaging.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
