# V1 Hardening Launch Readiness

## Initiative Key

`v1-hardening-launch-readiness`

## Dependencies

depends_on: local-db-migration-proof, auth-onboarding-roles, shipment-request-wizard, forwarder-open-requests, quote-submission-privacy, importer-quote-comparison, quote-gated-messaging, notification-records, basic-admin-safety

Dependency rule: do not begin execution unless every dependency has a final report with `PASS` or accepted `PASS WITH ISSUES`, and no dependency is blocked or failed.

## Initiative Status

- Status: locked
- Ready for execution: yes
- Execution started: yes
- Execution complete: yes
- Latest execution status: Phase 5 `passed_with_issues`.
- Final verdict: `PASS WITH ISSUES`.

Lifecycle rule: this initiative is authored for execution review. It must not expand the V1 product beyond hardening the implemented marketplace loop.

## Objective

Lock a focused V1 hardening and launch-readiness initiative for the implemented Importing.ph marketplace loop.

The goal is to tighten production-critical basics before public validation: auth/session/error UX, role redirects, admin provisioning, safety controls, notifications/email readiness, operational smoke, and security/privacy regression coverage.

This initiative is not a product-expansion vehicle.

## Repository Truth From Completed Initiatives

Completed non-deferred V1 initiatives prove:

- Local PostgreSQL and Drizzle migrations run against `localhost:55432/importing_ph_dev`.
- Clerk authenticates users, while PostgreSQL owns business roles and profiles.
- Importers can create posted shipment requests.
- Forwarders can browse posted/open requests.
- Forwarders can submit private quotes.
- Importer owners can compare quotes and accept/reject.
- Messaging opens only after a quote exists.
- DB-backed notification records exist for quote, quote decision, and message events.
- Admin can view users, requests, quotes, and suspend a forwarder company.
- Suspended forwarder companies cannot submit quotes.

Accepted known issues from completed work:

- Wrong-role access previously redirected to the user's own role destination; Phase 2 now sends wrong-role users to `/unauthorized`.
- Admin provisioning is not productized; V1 requires a manual/seeded admin profile process and no public admin self-selection.
- Shipment requests are posted-only in UI.
- Attachments are notes-only.
- Quote versions do not exist.
- Messaging is request/response only, with no realtime.
- Notifications are in-app DB records only; no email delivery.
- Email/Resend delivery is deferred for V1 launch validation because the repo currently has no Resend dependency, no env wiring, and no verified domain configuration.
- Reports are deferred; V1 should use an operational support channel until report subject authorization and moderation workflow are intentionally designed.
- User-level suspension and Clerk account disabling are deferred; company-level forwarder suspension is the implemented V1 safety control.

## Scope

- Final audit of the implemented V1 loop.
- Auth/session/error UX hardening.
- Wrong-role redirect behavior review and improvement if needed.
- Admin provisioning hardening.
- Minimum viable abuse/report workflow assessment.
- User-level and forwarder-level suspension behavior review.
- DB-backed notification UX review.
- Resend/email delivery readiness assessment without overbuilding.
- Operational logging/monitoring readiness.
- Render and local production-smoke checklist.
- Security/privacy regression smoke for quote visibility and messaging gates.
- Documentation of accepted V1 limitations.

## Non-Goals

- Do not build public SEO pages.
- Do not build payments, escrow, shipment tracking, reviews, ratings, analytics dashboards, AI recommendations, logistics ERP, warehouse tooling, or forwarder operations tooling.
- Do not add realtime/WebSockets.
- Do not add queues/event buses.
- Do not add Redis.
- Do not switch from Drizzle.
- Do not switch from Next.js App Router.
- Do not change package manager.
- Do not introduce Prisma, Express, AWS/ECS/Terraform, or microservices.
- Do not make public-forwarder-profile-seo part of this initiative.

## Acceptance Criteria

- Current V1 implementation and final reports are audited against the intended marketplace loop.
- Launch-critical gaps are separated from deferred product expansion.
- Auth/session/wrong-role/error behavior has a concrete hardening plan.
- Admin provisioning has a concrete local and production-safe path.
- Safety handling defines whether report workflow and user-level suspension are required before public validation.
- Notification/email readiness is assessed without requiring queues, cron-heavy design, or full marketing email infrastructure.
- Operational readiness checklist exists for local and Render smoke.
- Quote privacy and messaging gate regression smoke is defined and must pass before launch readiness is claimed.
- Accepted V1 limitations are documented explicitly.

## Module Sequence

1. Audit final implementation and reports.
2. Harden auth/session/error UX.
3. Harden admin and safety controls.
4. Review notification and email readiness.
5. Run operational readiness, production-smoke, and privacy/security regression plan.

## Verification Plan

Use the confirmed local database target unless current repo memory changes it:

```bash
DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev
```

Use the PATH prefix for npm commands:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH
```

Baseline verification commands:

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build`

Browser smoke must cover:

- signed-out redirects.
- importer onboarding/session.
- forwarder onboarding/session.
- wrong-role route access.
- quote privacy matrix.
- messaging gate.
- notification creation.
- admin access.
- forwarder suspension.

## Hard Stops

Stop for human decision if execution discovers:

- ambiguous auth/session behavior that could weaken role guards.
- quote privacy ambiguity or possible competitor quote leakage.
- messaging participant ambiguity.
- destructive migration requirement.
- production database target ambiguity.
- admin provisioning requiring Clerk dashboard-only secrets or manual production action not documented.
- report/safety scope expanding into moderation platform.
- email readiness requiring queues, workers, cron-heavy design, event buses, Redis, or WebSockets.
- any requested work outside the marketplace-loop hardening scope.
