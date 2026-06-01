# Phase 4 Report: Notification And Email Readiness Plan

Final status: `passed_with_issues`

## Summary

Phase 4 reviewed the current DB-backed notification implementation and re-proved the important notification flows in the in-app browser.

No application code, schema, migration, package, or environment example changes were required. The correct V1 decision is to keep email deferred: this repository currently has no `resend` dependency, no Resend environment variables, no Render email env wiring, and no verified sending-domain setup.

## Files Changed

- `.ai/initiatives/v1-hardening-launch-readiness/00-overview.md`
- `.ai/initiatives/v1-hardening-launch-readiness/phases/phase-4-notification-and-email-readiness-plan.md`
- `.ai/initiatives/v1-hardening-launch-readiness/reports/phase-4-notification-and-email-readiness-plan.md`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`
- `.ai/state/decisions.md`

No application feature code changed in this phase.

## Notification Readiness

Observed implementation:

- `lib/notifications.ts` creates recipient-owned notification records.
- Notification inserts are idempotent by `dedupe_key`.
- Notification writes are best-effort and do not roll back core quote/message/decision actions.
- `getNotificationsForCurrentUser()` scopes list reads to the current PostgreSQL `user_profiles.id`.
- `markNotificationReadForCurrentUser()` scopes updates to the current PostgreSQL `user_profiles.id`.
- `/app/notifications` renders current-user notifications with `Open` links and `Mark read`.

Smoke result:

- Quote submission created an importer notification.
- Quote accept created a forwarder notification.
- Message send created a forwarder notification.
- Mark-read worked for the importer notification.
- Forwarder notification list did not show the importer-only quote-submitted notification.

## Email Readiness Decision

Decision: email delivery remains deferred for V1 validation.

Reason:

- `package.json` has no `resend` dependency.
- `.env.example` has no Resend variables.
- `render.yaml` has no Resend variables.
- No verified sending domain or sender identity is represented in repo truth.
- Adding email now would introduce external-service setup without improving the core marketplace proof enough to justify the risk.

Future minimum checklist if email becomes required:

- Add `resend` dependency intentionally.
- Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to env docs and Render env config without printing secrets.
- Verify a sending domain/sender outside the app.
- Keep email writes best-effort for V1 unless product explicitly requires blocking behavior.
- Do not add queues, Redis, workers, cron-heavy design, event buses, or WebSockets.

## Browser Smoke

Disposable smoke fixture prefix: `smoke_harden_notify_1780292390492`

Accounts used:

- Importer: `smoke_harden_notify_1780292390492+importer+clerk_test@clerk.com`
- Forwarder: `smoke_harden_notify_1780292390492+forwarder+clerk_test@clerk.com`

Results:

- Forwarder visited `/app/forwarder/requests/a1ffb722-6073-42b1-a9f5-79b40f2799e9`: pass.
- Forwarder submitted quote `PHP 37500.00`: pass; UI redirected to `?quote=submitted` and showed own quote.
- Importer visited `/app/notifications`: pass; saw `New quote received`.
- Importer clicked `Mark read`: pass; notification changed to `read` and `Mark read` disappeared.
- Importer visited `/app/requests/a1ffb722-6073-42b1-a9f5-79b40f2799e9`: pass; saw quote details.
- Importer accepted quote: pass; request status became `quote_selected` and quote status became `accepted`.
- Importer opened conversation and sent `Importer phase 4 notification smoke message`: pass.
- Forwarder visited `/app/notifications`: pass; saw `Quote accepted` and `New message`.
- Forwarder notification list did not show `New quote received`: pass.

Browser self-heal:

- Clerk required email OTP for disposable accounts; test OTP `424242` was used.
- Browser text entry hit the known virtual clipboard limitation; direct keypress entry was used.
- A server-action overlay appeared after `npm run build` ran while the dev server was active; the local dev server was restarted and the smoke rerun passed.

## Database Smoke

Target confirmed before DB commands:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Pre-cleanup DB proof:

- One quote existed for request `a1ffb722-6073-42b1-a9f5-79b40f2799e9`.
- Quote amount was `37500.00` PHP.
- Quote status was `accepted`.
- One conversation existed for the request and forwarder company.
- One message existed in that conversation, sent by the importer profile user.
- Importer notification `new_quote_received` existed and had `read_at` set.
- Forwarder notification `quote_accepted` existed.
- Forwarder notification `message_received` existed.
- Forwarder had no `new_quote_received` notification.

Cleanup:

- Deleted exact smoke shipment request.
- Deleted exact smoke forwarder company.
- Deleted exact smoke user profiles.
- Deleted exact disposable Clerk users.
- Post-cleanup counts were zero for matching user profiles, forwarder companies, shipment requests, quotes, conversations, messages, and notifications.

No destructive reset, drop, truncate, or non-local database command was run.

## Commands Run

Parallel launch mistake:

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: failed because it ran in parallel with build and `.next/types/validator.ts` could not find `./routes.js`.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build`: pass.

Sequential rerun:

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build`: pass.

Fixture and proof commands:

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev node --input-type=module <phase-4-fixture-create>`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev node --input-type=module <phase-4-db-proof>`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev node --input-type=module <phase-4-cleanup>`: pass.

Skipped:

- `npm run db:migrate` and `npm run db:check` were skipped because Phase 4 made no schema changes and the phase file only requires these commands if schema changes occur.

## Security And Privacy Impact

- Notification read and update paths remain current-user scoped.
- Notification records did not leak across importer and forwarder recipients.
- Quote privacy was not weakened.
- Messaging gate was not weakened.
- Clerk remains authentication only; PostgreSQL remains the business-role/profile truth.

## Risks And Limitations

- accepted: In-app DB notifications are the only V1 notification delivery mechanism.
- accepted: Email/Resend delivery is deferred until dependency, env vars, sending-domain setup, and operational expectations are intentionally added.
- accepted: Notification writes remain best-effort. Core marketplace writes can succeed if notification creation fails.
- active: Browser smoke still depends on Clerk development key limits and occasional OTP prompts for disposable accounts.

## State Updates

- Updated `.ai/state/current-state.md`.
- Updated `.ai/state/known-risks.md`.
- Updated `.ai/state/verification-status.md`.
- Updated `.ai/state/decisions.md`.

## Next Phase Readiness

Phase 5, `phase-5-operational-readiness-and-final-regression`, can start.
