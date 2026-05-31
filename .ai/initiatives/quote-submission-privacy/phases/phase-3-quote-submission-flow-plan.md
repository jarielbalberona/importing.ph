# Phase 3: Quote Submission Flow Plan

Status: pending

## Goal

Implement forwarder quote submission for eligible posted requests with validation, authorization, and duplicate/revision handling.

## Scope

- Forwarder request detail route/form.
- Quote submission server action.
- Quote validation.
- Forwarder company membership lookup.
- Request eligibility check.
- Suspended-forwarder check if state exists.

Allowed file changes during execution, only if needed:

- `app/app/forwarder/requests/**`
- `lib/**` for quote submission/validation helpers
- `components/**` for quote form extraction if justified
- `.ai/initiatives/quote-submission-privacy/phases/phase-3-quote-submission-flow-plan.md`
- `.ai/initiatives/quote-submission-privacy/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Importer quote comparison UI.
- Quote acceptance/rejection.
- Messaging.
- Notifications.
- Payments.
- Required service profile creation.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Completed forwarder open request detail.
- Quote schema.

## Tasks

- Add quote form fields.
- Add server action.
- Validate amount, currency, service, transit days, inclusions/exclusions/notes, and valid-until.
- Enforce `PHP` default unless completed memory says otherwise.
- Check posted request eligibility.
- Check forwarder role and company membership.
- Block suspended forwarder if state exists.
- Enforce one active quote or revision behavior.
- Persist submitted snapshot.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Quote submission compiles.
- Invalid quote input is rejected.
- Eligibility and membership checks are present.
- Duplicate/revision behavior is enforced.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Missing imports.
- Minor validation/action mismatch inside quote submission scope.

Hard-stop instead of repairing when:

- Suspended-forwarder behavior requires product decision.
- Quote revision behavior is unresolved.
- Scope expands to acceptance, messaging, notifications, payments, or service profiles.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
