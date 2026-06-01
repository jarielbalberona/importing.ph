# Phase 5 Report: Operational Readiness And Smoke Plan

Final status: `passed_with_issues`

## Summary

Phase 5 ran final local automated verification and a full local browser smoke matrix for the implemented V1 marketplace loop.

No application code, schema, migration, package, or environment changes were required. The final result is launch-ready for controlled V1 validation with accepted limitations documented below.

## Files Changed

- `.ai/initiatives/v1-hardening-launch-readiness/00-overview.md`
- `.ai/initiatives/v1-hardening-launch-readiness/phases/phase-5-operational-readiness-and-smoke-plan.md`
- `.ai/initiatives/v1-hardening-launch-readiness/reports/phase-5-operational-readiness-and-smoke-plan.md`
- `.ai/initiatives/v1-hardening-launch-readiness/reports/final-report.md`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

No application feature code changed in this phase.

## Automated Verification

Commands ran sequentially:

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build`: pass.
- `node tools/ai-runner/index.mjs v1-hardening-launch-readiness --check-only`: pass.

The dev server was restarted after `npm run build` before browser smoke so server actions used fresh dev action IDs.

## Browser Smoke Fixture

Fixture prefix: `smoke_harden_final_1780293420136`

Accounts:

- Admin: `smoke_harden_final_1780293420136+admin+clerk_test@clerk.com`
- Importer A: `smoke_harden_final_1780293420136+importer-a+clerk_test@clerk.com`
- Importer B: `smoke_harden_final_1780293420136+importer-b+clerk_test@clerk.com`
- Forwarder A: `smoke_harden_final_1780293420136+forwarder-a+clerk_test@clerk.com`
- Forwarder B: `smoke_harden_final_1780293420136+forwarder-b+clerk_test@clerk.com`

Requests:

- Request A: `300d074f-7d48-4ffd-91d9-8aa315210b68`, privacy/quote/messaging request.
- Request B: `cc641936-911f-4c2d-afc9-adca378b2df4`, suspension request.

## Browser Smoke Results

Signed-out redirects:

- `/app/requests`: redirected to sign-in; no protected data visible.
- `/app/forwarder/requests`: redirected to sign-in; no protected data visible.
- `/admin`: redirected to sign-in; no protected data visible.

Importer A session and role guards:

- `/after-auth`: redirected to `/app/requests`.
- `/onboarding`: redirected to `/app/requests`.
- `/app/forwarder/requests`: redirected to `/unauthorized`.
- `/admin`: redirected to `/unauthorized`.

Forwarder A session and role guards:

- `/after-auth`: redirected to `/app/forwarder/requests`.
- `/onboarding`: redirected to `/app/forwarder/requests`.
- `/app/requests`: redirected to `/unauthorized`.
- `/admin`: redirected to `/unauthorized`.

Quote privacy matrix:

- Forwarder A submitted quote `PHP 41000.00` on Request A and saw its own quote details.
- Importer A saw Forwarder A identity, amount, service, transit, inclusions, exclusions, and notes on owned request detail.
- Forwarder B saw Request A and quote count only.
- Forwarder B did not see Forwarder A identity, amount, service, inclusions, exclusions, notes, messages, or quote version details.
- Forwarder B direct importer request URL went to `/unauthorized` and leaked no quote details.
- Importer B direct owner detail URL rendered no quote details.

Messaging gate:

- Forwarder B, without a quote, had no `Message importer` entry point on Request B.
- Importer A accepted Forwarder A quote and opened a conversation with Forwarder A.
- Importer A sent `Phase 5 importer to forwarder message`.
- Forwarder B direct conversation route did not expose the message or conversation details.

Notification smoke:

- Forwarder A quote submission created Importer A `New quote received` notification.
- Importer A quote acceptance created Forwarder A `Quote accepted` notification.
- Importer A message created Forwarder A `New message` notification.
- Forwarder A did not see Importer A's `New quote received` notification.
- Forwarder B received no competitor notifications.

Admin and suspension:

- Admin accessed `/admin` and saw users, requests, and quotes.
- Admin suspended Forwarder B company.
- DB proof confirmed Forwarder B was suspended by the admin actor.
- Suspended Forwarder B attempted to quote Request B and was blocked with `error=forwarder_suspended`; no quote row persisted.
- Active Forwarder A submitted a normal quote on Request B.

## Database Proof

Target confirmed:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Pre-cleanup checks:

- Request A had exactly one Forwarder A quote for `41000.00`, status `accepted`.
- Request B had exactly one Forwarder A quote for `39000.00`, status `submitted`.
- Forwarder B had no quote rows.
- Request A had one conversation with Forwarder A only.
- The conversation had one importer-sent message.
- Importer A had `new_quote_received` notification records.
- Forwarder A had `quote_accepted` and `message_received` notifications.
- Forwarder B had no competitor notifications.
- Forwarder B company was suspended by the admin profile.

Cleanup:

- Deleted exact smoke shipment requests.
- Deleted exact smoke forwarder companies.
- Deleted exact smoke user profiles.
- Deleted exact disposable Clerk users.
- Post-cleanup counts were zero for matching user profiles, companies, requests, quotes, conversations, messages, and notifications.

No destructive reset, drop, truncate, or non-local database command was run.

## Render Production Smoke Checklist

Observed Render config:

- Service: `importing-ph`
- Runtime: Node
- Build command: `npm ci && npm run build`
- Start command: `npm run start`
- Database: Render PostgreSQL `importing-ph-db`

Required environment variables:

- `NODE_VERSION=22`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/after-auth`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/after-auth`
- `DATABASE_URL` from Render database connection string

Production smoke rules:

- Do not run destructive DB commands against production.
- Confirm the production `DATABASE_URL` target before any migration.
- Apply migrations only through the approved deploy/release process.
- Use production Clerk keys only in production; do not mix dev/test keys with production.
- Admin provisioning must be manual/seeded and operator controlled.
- Email is not enabled; no Resend smoke is required until email is intentionally added.

Manual post-deploy smoke:

- Sign in as seeded admin and confirm `/admin` loads users, requests, and quotes.
- Sign in as importer and confirm `/app/requests` loads.
- Sign in as forwarder and confirm `/app/forwarder/requests` loads.
- Confirm wrong-role routes land on `/unauthorized`.
- Create one test request, one forwarder quote, one importer accept, one message, and expected notifications.
- Suspend a test forwarder company and confirm quote submission is blocked.
- Clean up only exact test rows; never reset production.

## Repairs And Process Issues

- Browser text entry hit the known virtual clipboard limitation; keypress-based entry was used.
- Clerk disposable accounts required OTP; test OTP `424242` was used.
- Admin suspension UI had multiple suspend forms; the intended Forwarder B suspension was verified by DB proof.
- The dev server was restarted after build before smoke to avoid stale server-action IDs.

## Risks And Limitations

- accepted: Admin provisioning remains manual/seeded for V1.
- accepted: Reports and user-level suspension remain deferred.
- accepted: Notifications are in-app only; email/Resend is deferred.
- accepted: Shipment request UI is posted-only; draft is schema-only.
- accepted: Attachments are notes-only.
- accepted: Messaging is request/response only, with no realtime/read receipts.
- accepted: Quote versions do not exist.
- active: `.ai/core/*` remains stale in places and should be realigned after this execution if future agents rely on core memory over state/final reports.

## State Updates

- Updated `.ai/state/current-state.md`.
- Updated `.ai/state/known-risks.md`.
- Updated `.ai/state/verification-status.md`.

## Next Phase Readiness

No next phase remains in `v1-hardening-launch-readiness`.
