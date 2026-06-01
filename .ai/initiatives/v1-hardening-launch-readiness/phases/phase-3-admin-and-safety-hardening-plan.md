# Phase 3: Admin And Safety Hardening Plan

Status: passed_with_issues

## Goal

Harden admin provisioning and safety controls enough for V1 public validation without creating a moderation platform.

## Scope

Potentially affected modules:

- `app/admin/**`
- `lib/admin.ts`
- `lib/authz.ts`
- `lib/quotes.ts`
- `db/schema.ts`
- `drizzle/**`
- minimal report/safety helpers only if proven launch-critical

## Out Of Scope

- Full CRM/support dashboard.
- Document verification/manual approval.
- Advanced moderation workflows.
- Payment, escrow, tracking, reviews, analytics, ERP.
- Queues, Redis, WebSockets, event buses, microservices.
- Disabling Clerk accounts from application code unless explicitly approved.

## Inputs

- Phase 1 report.
- Phase 2 report.
- `basic-admin-safety` final report.
- Current admin/suspension code.
- Browser smoke expectations in `04-verification-plan.md`.

## Tasks

- Review admin provisioning gap and define the safest V1 approach.
- Review admin-only route/action authorization.
- Review forwarder-company suspension behavior.
- Decide whether user-level suspension is launch-critical.
- Decide whether a minimum report/abuse path is launch-critical.
- If implemented, keep report/suspension scope minimal and explicit.
- Ensure suspended forwarders remain blocked from quote submission.
- Document accepted limitations.

## Verification Commands

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build`

## Browser Smoke Required

- admin can access `/admin`.
- non-admin cannot access `/admin`.
- admin can view users, requests, and quotes.
- admin can suspend forwarder company.
- suspended forwarder cannot submit quote.
- normal forwarder can submit quote.
- if user-level suspension is implemented, suspended user behavior is smoke-tested.
- if reports are implemented, report creation and admin report visibility are smoke-tested.

## Expected Evidence

- Admin provisioning plan or implementation.
- Safety scope decision.
- Suspension smoke results.
- DB state proof for suspension/report changes if applicable.
- Automated commands pass.

## Repair Policy

Allowed repairs:

- type-check, lint, or build failures caused by this phase.
- additive migration drift.
- admin action import/redirect mismatch.
- quote suspension check mismatch.

Hard-stop instead of repairing when:

- admin provisioning requires a secret/manual step not documented.
- report subject authorization is ambiguous.
- user suspension semantics require product decision.
- changes would weaken quote privacy or role authorization.
- migration is destructive or target is not clearly local.

## Completion Notes

Phase 3 completed on 2026-06-01.

- No application code, schema, migration, or package changes were required in this phase.
- Existing admin access remains guarded by `requireRole(["admin"])`.
- Existing forwarder-company suspension remains the V1 safety control.
- Browser smoke proved admin access, non-admin denial, admin read surfaces, forwarder-company suspension, suspended-forwarder quote blocking, and normal-forwarder quote submission.
- DB smoke proved Forwarder A was suspended by the admin actor, Forwarder B remained active, the suspended request had zero quotes, and the normal request had one Forwarder B quote for `51000.00`.
- Smoke requests, companies, profiles, quotes, notifications, and disposable Clerk users were cleaned up by exact IDs.
- Durable V1 decision: admin provisioning remains manual/seeded; ordinary onboarding must not create admins.
- Durable V1 decision: reports and user-level suspension are deferred; do not expand V1 into a moderation platform before marketplace validation.
