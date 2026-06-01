# Phase 5: Operational Readiness And Smoke Plan

Status: passed_with_issues

## Goal

Run final local readiness verification and produce a Render production-smoke checklist with explicit launch criteria.

## Scope

- Final automated commands.
- Local browser smoke.
- Non-destructive DB checks.
- Render deployment checklist.
- Environment variable checklist.
- Privacy/security regression smoke.
- Final initiative report.
- State updates required by the execution skill.

## Out Of Scope

- Public SEO.
- Payments, tracking, reviews, analytics, ERP.
- Queue/worker/realtime architecture.
- Destructive production operations.
- Broad deployment infrastructure changes.

## Inputs

- Phase 1 through Phase 4 reports.
- Current package scripts.
- `render.yaml`.
- `.env.example` if present.
- Current local DB and browser smoke accounts/fixtures.

## Tasks

- Run final automated verification in order.
- Run complete browser smoke matrix from `04-verification-plan.md`.
- Confirm quote privacy matrix still passes.
- Confirm messaging gate still passes.
- Confirm notification creation and scoping still pass.
- Confirm admin access and forwarder suspension still pass.
- Document exact smoke fixture setup and cleanup.
- Document Render production-smoke checklist.
- Document launch-ready, launch-blocking, and accepted-deferred items.
- Write `reports/final-report.md`.

## Verification Commands

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build`
- `node tools/ai-runner/index.mjs v1-hardening-launch-readiness --check-only`

## Browser Smoke Required

Run all cases from `04-verification-plan.md`:

- signed-out redirects.
- importer onboarding/session.
- forwarder onboarding/session.
- wrong-role route access.
- quote privacy matrix.
- messaging gate.
- notification creation.
- admin access.
- forwarder suspension.

Each case must include exact account/role, route, action, expected UI result, expected database state, forbidden behavior, and pass/fail.

## Expected Evidence

- Automated command results.
- Browser smoke matrix results.
- DB fixture cleanup proof.
- Render checklist.
- Final launch-readiness verdict.

## Repair Policy

Allowed repairs:

- type-check failures.
- lint failures.
- build failures.
- missing imports.
- route/link mismatch.
- minor smoke fixture mismatch.
- active-scope auth/error/admin/notification hardening defects.

Hard-stop instead of repairing when:

- quote privacy matrix fails and cannot be fixed safely in scope.
- messaging participant privacy fails and cannot be fixed safely in scope.
- destructive migration is needed.
- DATABASE_URL is not clearly local for local smoke.
- production DB command target is ambiguous.
- fix would require public SEO, payments, tracking, reviews, analytics, ERP, queues, Redis, WebSockets, Prisma, Express, AWS/ECS/Terraform, or package manager migration.
- same failure persists after three repair attempts.

## Completion Notes

Phase 5 completed on 2026-06-01.

- Final automated verification passed sequentially: `db:migrate`, `db:check`, `type-check`, `lint`, `build`, and runner check-only.
- Full local browser smoke covered signed-out redirects, importer session, forwarder session, wrong-role access, quote privacy, messaging gate, notifications, admin access, and forwarder suspension.
- Disposable smoke fixture used admin, importer owner, non-owner importer, Forwarder A, Forwarder B, two posted requests, two Forwarder A quotes, one accepted quote, one conversation, one message, scoped notifications, and Forwarder B suspension.
- Quote privacy matrix passed: importer owner saw all details, Forwarder A saw own quote, Forwarder B saw quote count only and no competitor quote details, and direct abuse attempts were blocked.
- Messaging gate passed: no-quote Forwarder B had no messaging entry point and could not read Forwarder A conversation.
- Notification smoke passed: quote submission, quote acceptance, and message notifications were created for the correct recipients.
- Admin smoke passed: admin read views rendered, Forwarder B was suspended, suspended Forwarder B could not persist a quote, and active Forwarder A could still quote another request.
- Smoke rows and disposable Clerk users were cleaned up by exact IDs.
- Render checklist is documented in the phase report and final report.
