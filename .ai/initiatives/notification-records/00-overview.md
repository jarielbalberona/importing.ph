# Notification Records

## Initiative Key

`notification-records`

## Dependencies

depends_on: auth-onboarding-roles, shipment-request-wizard, forwarder-open-requests, quote-submission-privacy, importer-quote-comparison, quote-gated-messaging

Dependency rule: do not begin execution until all dependencies have final reports, are not blocked or failed, and the request, quote, quote decision, and message actions that should create notifications exist. If an event source is still absent, stop rather than invent fake events.

## Initiative Status

- Status: draft
- Ready for execution: no
- Execution started: no
- Latest execution status: not started.

Lifecycle rule: this initiative is authored for review. Lock it only after dependency readiness and event-source truth are reviewed.

## Objective

Create durable in-app notification records for key marketplace events without requiring full email delivery, queues, workers, cron-heavy architecture, or external async infrastructure.

This initiative is about database-backed notification state. It is not an email system, push system, analytics stream, or event bus.

## Repo Baseline Observed During Authoring

- Current app code has no shipment request, quote, conversation, message, or notification schema in `db/schema.ts`.
- Current app code has no notification placeholders found under `app/`, `lib/`, `db/`, `components/`, or `scripts/`.
- Current app code has no request, quote, comparison, or messaging actions yet.
- `package.json` does not include Resend.
- Current app is a single Next.js App Router application using server actions for existing onboarding writes.
- Current authz helper is `lib/authz.ts`; it reads PostgreSQL-backed `user_profiles`.
- Current route mapping is `lib/routes.ts`.
- Prior initiatives intentionally defer notification records from quote comparison and messaging.

## Scope

- DB notifications table/model.
- Notification creation for minimum marketplace events:
  - forwarder: new matching shipment request, if matching rules are implemented or can be approximated safely
  - importer: new quote received
  - forwarder: importer replied
  - importer: forwarder replied
  - forwarder: quote accepted/rejected
  - importer: quote expiring soon, if expiration data exists and can be handled without async infrastructure
- Notification list/read behavior.
- Notification target ownership and role visibility.
- Resend-ready email layer may be documented/prepared only if current memory requires it, but real email sending is not required.
- Define deduplication or idempotency expectations for notification records.
- Define no-queue V1 behavior.
- Define exact events emitted by prior request/quote/messaging actions.

## Non-Goals

- Do not implement full email delivery unless current memory explicitly requires it.
- Do not add queues, Redis, workers, cron-heavy architecture, or event buses.
- Do not build push notifications.
- Do not build analytics.
- Do not build admin tooling except as a future note.
- Do not build payments, tracking, escrow, reviews, or public SEO pages.
- Do not introduce microservices, Prisma, Express, AWS, or Terraform.

## Acceptance Criteria

- Current notification/event baseline is audited and recorded.
- Notification schema defines recipient, event type, actor, source entity references, read state, dedupe key, and indexes.
- Notification creation is integrated only into real request, quote, quote-decision, and messaging actions.
- Notification failure does not corrupt core marketplace writes unless a transaction-local invariant requires rollback.
- Users can list their own notifications.
- Users can mark their own notifications read.
- Users cannot read or mutate other users' notifications.
- No queue, Redis, worker, event bus, cron-heavy process, push notification system, or email delivery is introduced.

## Recommended Product Decisions For Review

- V1 notifications should be created synchronously in the same server-side action that creates the business event.
- Notification writes should be best-effort only when they are not part of the business invariant. Do not fail quote submission or messaging because cosmetic notification creation failed, unless the product explicitly says notification auditability is critical.
- Use deterministic `dedupe_key` values for idempotency, such as `quote:<quoteId>:created` or `message:<messageId>:recipient:<profileId>`.
- Target notifications to `user_profiles.id` for V1. Forwarder company notifications should fan out to eligible forwarder member user profiles unless the completed forwarder membership model says otherwise.
- Do not implement quote-expiring-soon as a background process in V1. If needed, compute it opportunistically during notification list/request views or skip it until a scheduler is explicitly approved.
- Do not add Resend yet. Document a future adapter boundary only if review requires it.

## Domain Model

- Notification: durable in-app record for one user profile.
- Notification type: enum-like event category for request, quote, quote decision, and message events.
- Recipient: user profile allowed to see the notification.
- Actor: user profile or system action that caused the event.
- Source entity: request, quote, conversation, message, or quote decision that the notification points to.
- Dedupe key: deterministic idempotency key preventing duplicate notifications on retries.

## Module Sequence

1. Audit current notification and event-source truth.
2. Define notification domain, schema, dedupe, and indexes.
3. Integrate notification creation into real marketplace event actions.
4. Define and implement minimal list/read UI.
5. Run automated verification and manual smoke.

## Cross-Module Data Flow

```text
business action succeeds
-> derive notification recipients from PostgreSQL ownership/membership
-> create notification records with deterministic dedupe keys
-> redirect/revalidate business page
-> recipient reads notification list
-> recipient marks notification read
```

Notification records must follow business ownership. They must not become a side channel that exposes request, quote, message, or forwarder details to unauthorized users.

## Verification Plan

Automated commands:

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

Manual smoke:

- Quote submission creates importer notification.
- Message reply creates recipient notification.
- Quote acceptance/rejection creates forwarder notification.
- Users cannot read others' notifications.
- Read/unread behavior works if implemented.

## Hard Stops

Stop for human input if any of these occur:

- Dependencies are incomplete and not explicitly accepted.
- Request, quote, quote-decision, or messaging event sources do not exist.
- Matching rules for new request notifications are absent and cannot be approximated without privacy or spam risk.
- Quote-expiring-soon requires cron, queues, workers, or external scheduling.
- Notification records would leak private quote/message/request details to unauthorized users.
- Product requires email delivery, push notifications, admin tooling, analytics, queues, Redis, workers, event buses, microservices, Prisma, Express, AWS, Terraform, payment, tracking, escrow, reviews, or public SEO.
