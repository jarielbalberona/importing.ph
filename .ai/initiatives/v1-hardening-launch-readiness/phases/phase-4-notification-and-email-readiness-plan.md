# Phase 4: Notification And Email Readiness Plan

Status: passed_with_issues

## Goal

Review DB notification UX and decide whether minimal Resend/email readiness is required for V1 launch validation.

## Scope

Potentially affected modules:

- `lib/notifications.ts`
- `app/app/notifications/**`
- quote/message action integrations
- environment documentation/checklist inside initiative reports
- minimal email adapter only if explicitly justified and dependency already exists or is safely added in scope

## Out Of Scope

- Full email campaign system.
- Notification preferences.
- Push notifications.
- Realtime updates.
- Queues, Redis, workers, cron-heavy architecture, event buses.
- Analytics.

## Inputs

- Phase 1 report.
- `notification-records` final report.
- Current notification code.
- Current dependencies and env examples.
- Render readiness requirements from Phase 5.

## Tasks

- Review notification recipient scoping.
- Review mark-read behavior and notification links.
- Review notification write failure behavior.
- Review whether email is required for quote/message/admin-critical events before public validation.
- If email readiness is needed, define minimum Resend configuration and smoke without creating queue/worker architecture.
- Document what remains in-app only.

## Verification Commands

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build`

If schema changes occur:

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check`

## Browser Smoke Required

- quote submission creates importer notification.
- quote accept/reject creates forwarder notification.
- message send creates recipient notification.
- user cannot read another user's notifications.
- mark-read behavior works.
- if email is enabled, email readiness is verified without exposing secrets.

## Expected Evidence

- Notification UX readiness assessment.
- Email readiness decision.
- Browser/database smoke results.
- Automated commands pass.

## Repair Policy

Allowed repairs:

- type-check, lint, or build failures caused by this phase.
- notification link/route mismatch.
- recipient scoping bug inside current notification surface.
- missing import or minor server-action mismatch.

Hard-stop instead of repairing when:

- email delivery requires new queue/worker/retry architecture.
- Resend/domain setup is unavailable and cannot be safely validated.
- notification recipient privacy is ambiguous.
- a fix would weaken core marketplace write behavior.

## Completion Notes

Phase 4 completed on 2026-06-01.

- No application code, schema, migration, package, or env-example changes were required.
- Notification recipient scoping and mark-read behavior were re-proved in browser and database smoke.
- Quote submission created an importer notification.
- Importer mark-read updated only the importer notification.
- Quote acceptance created a forwarder notification.
- Importer message send created a forwarder notification.
- Forwarder notification list did not expose the importer-only quote-submitted notification.
- Smoke fixture rows and disposable Clerk users were cleaned up by exact IDs.
- Resend/email delivery is not enabled in this repo: no `resend` dependency, no Resend env vars, and no Render email env wiring exist.
- Durable V1 decision: email delivery remains deferred; V1 launch validation uses in-app DB notifications only.
