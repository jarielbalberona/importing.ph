# Phase 2: Visibility And Privacy Plan

Status: passed

## Goal

Define and implement the forwarder-safe request data boundary so open request browsing cannot leak competitor quote details.

## Scope

- Request query helpers or DTO mappers.
- Forwarder-safe field selection.
- Quote count aggregate only if safe quote data exists.
- Privacy documentation in phase report.

Allowed file changes during execution, only if needed:

- `lib/**` for request query/DTO helpers
- `app/app/forwarder/requests/**` only if needed to keep DTO boundary local
- `.ai/initiatives/forwarder-open-requests/phases/phase-2-visibility-and-privacy-plan.md`
- `.ai/initiatives/forwarder-open-requests/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Quote submission.
- Importer quote comparison.
- Messaging.
- Notifications.
- New quote schema.
- Public APIs.

## Inputs

- Phase 1 report.
- Completed shipment request schema.
- Product privacy rules.

## Tasks

- Classify request fields as forwarder-visible or hidden.
- Define list DTO.
- Define detail DTO.
- Define quote count behavior if available.
- Ensure forbidden quote fields cannot be returned by query shape.
- Document privacy decisions in the phase report.

## Verification Commands

- `npm run type-check`
- `npm run lint`

## Expected Evidence

- Type-check passes.
- Lint passes.
- Field map is documented.
- Forbidden quote fields are absent.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Lint failures.
- Missing imports.
- Minor DTO/query mismatch inside privacy boundary.

Hard-stop instead of repairing when:

- Product wants competitor quote details exposed.
- Quote count requires new quote schema.
- Field classification is unclear for sensitive importer data.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.
