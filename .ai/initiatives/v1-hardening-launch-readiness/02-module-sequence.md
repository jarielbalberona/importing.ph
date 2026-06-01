# Module Sequence

## Phase 1: Final V1 Implementation Audit

Read current final reports, state files, and current code for:

- auth and onboarding.
- shipment requests.
- forwarder request browsing.
- quote submission/privacy.
- quote comparison/decisions.
- messaging.
- notifications.
- admin/suspension.

Output must be a launch-critical gap list only. Do not create a wishlist.

## Phase 2: Auth Session Error UX Hardening

Review and harden:

- signed-out redirects.
- sign-in/sign-up return paths.
- `/after-auth`.
- `/onboarding`.
- wrong-role route access.
- `/unauthorized`.
- user-facing server-action errors.
- stale sessions and missing profile behavior.

Any implementation must preserve server-side database-backed role checks.

## Phase 3: Admin And Safety Hardening

Review and harden:

- admin provisioning process.
- admin-only route/action guards.
- forwarder-company suspension.
- possible user-level suspension requirement.
- minimum viable abuse/report path.
- direct-action abuse prevention.

Reports and user suspension should be added only if the audit proves they are launch-critical.

## Phase 4: Notification And Email Readiness

Review and harden:

- DB-backed notification recipient scoping.
- mark-read behavior.
- notification links.
- notification failure handling.
- whether Resend/email is needed for V1 public validation.

Do not introduce queues, workers, Redis, event buses, cron-heavy architecture, or broad email marketing scope.

## Phase 5: Operational Readiness And Smoke

Define and execute final readiness checks:

- local production-style smoke.
- Render deployment checklist.
- environment variable checklist.
- non-destructive database smoke.
- quote privacy matrix.
- messaging gate regression.
- notification regression.
- admin suspension regression.
- accepted V1 limitations.

No launch-ready claim is valid unless privacy/security smoke passes.

## Cross-Phase Rule

Each phase must leave the system simpler or safer. If a hardening item starts turning into a new product feature, stop and document it as deferred.
