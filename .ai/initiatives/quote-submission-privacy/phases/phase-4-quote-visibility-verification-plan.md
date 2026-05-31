# Phase 4: Quote Visibility Verification Plan

Status: pending

## Goal

Implement the minimum quote visibility surfaces and query boundaries required to prove importer, own-forwarder, and competitor privacy.

## Scope

- Importer-owned request quote visibility.
- Forwarder own-quote visibility.
- Competitor forwarder aggregate-only visibility.
- Query/DTO privacy tests or proof helpers if local pattern exists.

Allowed file changes during execution, only if needed:

- `app/app/requests/**`
- `app/app/forwarder/requests/**`
- `lib/**` for quote visibility/query helpers
- `.ai/initiatives/quote-submission-privacy/phases/phase-4-quote-visibility-verification-plan.md`
- `.ai/initiatives/quote-submission-privacy/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Full importer quote comparison UI.
- Quote acceptance/rejection.
- Messaging.
- Notifications.
- Public quote pages.

## Inputs

- Phase 1 report.
- Phase 2 report.
- Phase 3 report.
- Quote schema and submission flow.

## Tasks

- Add minimal importer owner visibility for quote details.
- Add own-forwarder visibility for submitted quote details.
- Add competitor-safe quote count only.
- Ensure competitor query/DTO excludes forbidden fields.
- Record privacy matrix in phase report.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Importer owner query is ownership-guarded.
- Own-forwarder query is company-guarded.
- Competitor forwarder query exposes aggregate count only.
- Forbidden fields are absent from competitor output.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Missing imports.
- Minor query/DTO mismatch inside quote privacy scope.

Hard-stop instead of repairing when:

- Competitor visibility requirements are unclear.
- Importer quote comparison scope expands beyond minimal proof.
- Privacy cannot be enforced without larger architecture changes.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
