# Phase 2: Conversation Message Domain Plan

Status: passed

## Goal

Define and implement the database model for quote-gated conversations and messages.

## Scope

- Conversation schema.
- Message schema.
- Foreign keys and constraints.
- Indexes for importer list, forwarder list, and message chronology.
- Migration generation and local migration proof.

Allowed file changes during execution, only if needed:

- `db/schema.ts`
- `drizzle/**`
- `lib/**` for messaging domain/query helpers
- `.ai/initiatives/quote-gated-messaging/phases/phase-2-conversation-message-domain-plan.md`
- `.ai/initiatives/quote-gated-messaging/reports/*`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md` only if a durable decision is forced

## Out Of Scope

- Messaging UI.
- Message creation UI/action.
- Realtime infrastructure.
- Notifications.
- Attachments.
- Admin inspection.

## Inputs

- Phase 1 report.
- Completed request schema.
- Completed quote schema.
- Completed quote privacy boundary.
- Current Drizzle schema/migrations.

## Tasks

- Define `conversations` table.
- Define `messages` table.
- Add unique conversation constraint for request plus forwarder company.
- Add foreign keys to request, quote, forwarder company, and sender user profile.
- Add optional quote version reference only if quote versions exist.
- Add indexes for participant lookup and message chronology.
- Generate and apply migration.

## Verification Commands

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`

## Expected Evidence

- Conversation/message schema exists.
- Migration applies.
- Drizzle check passes.
- Type-check passes.
- Phase report documents constraints and indexes.

## Repair Policy

Allowed repairs:

- Type-check failures.
- Drizzle schema/migration generation drift.
- Minor enum/constraint/index mismatch inside messaging scope.

Hard-stop instead of repairing when:

- Quote schema cannot identify request plus forwarder company.
- Request ownership cannot be linked to importer.
- Destructive migration is required.
- Product asks for generic chat, public chat, admin inspection, attachments, or realtime behavior.

## Database And Smoke Requirements

- For read-only database inspection, use `DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev`. Do not assume port `5432`.
- For destructive, repeatable, or isolated smoke data, use the initiative-specific test database documented in `04-verification-plan.md`; run `DATABASE_URL=<test-url> npm run db:migrate` and `DATABASE_URL=<test-url> npm run db:check` before seeding.
- Seed smoke data through real app actions or existing repo scripts wherever possible. If a needed test DB or fixture script does not exist, this phase may plan it but must not fake results.
- Clean up smoke data by deterministic prefix, test account id, or dedupe key as applicable. Never run cleanup or destructive reset against a non-local database.
- Any smoke test in this phase must follow the step-by-step account, route, action, expected UI, expected database state, forbidden behavior, and pass/fail criteria in `04-verification-plan.md`.
- Hard-stop instead of guessing on database target, destructive operation, auth boundary, role authorization, quote visibility, or product-scope ambiguity.

## Completion Notes

Executed on 2026-06-01.

- Added `conversations` table with request, importer profile, forwarder company, and opening quote references.
- Added unique `(shipment_request_id, forwarder_company_id)` conversation constraint.
- Added `messages` table with conversation and sender user profile references.
- Added participant lookup and message chronology indexes.
- Generated and applied additive migration `drizzle/0005_bright_turbo.sql`.
- `npm run db:migrate`, `npm run db:check`, and `npm run type-check` passed against the confirmed local development database target.
