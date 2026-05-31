# Quote Gated Messaging

## Initiative Key

`quote-gated-messaging`

## Dependencies

depends_on: local-db-migration-proof, auth-onboarding-roles, shipment-request-wizard, forwarder-open-requests, quote-submission-privacy, importer-quote-comparison

Dependency rule: do not begin execution until all dependencies have final reports, are not blocked or failed, and `quote-submission-privacy` proves private quote submission and competitor privacy. `importer-quote-comparison` is a hard dependency for this execution order so messaging is implemented only after quote comparison privacy and status behavior are proven.

## Initiative Status

- Status: locked
- Ready for execution: yes
- Execution started: no
- Latest execution status: not started.

Lifecycle rule: this initiative is locked for dependency-gated execution. Do not begin execution until all dependency final reports are present and accepted.

## Objective

Open private messaging only between an importer and a forwarder company after that forwarder has submitted a quote on the importer's shipment request.

This is not real-time chat infrastructure. V1 should prove the marketplace communication rule with simple server-rendered list/detail pages and ordinary form submits.

## Repo Baseline Observed During Authoring

- Current app code has no shipment request schema in `db/schema.ts`.
- Current app code has no quote schema in `db/schema.ts`.
- Current app code has no conversation or message schema.
- Current app code has no messaging placeholders found under `app/`, `lib/`, `db/`, or `components/`.
- Current importer route is `app/app/requests/page.tsx`, a proof page guarded by `requireRole(["importer"])`.
- Current forwarder route is `app/app/forwarder/requests/page.tsx`, a proof page guarded by `requireRole(["forwarder"])`.
- Current authz helper is `lib/authz.ts`; it reads PostgreSQL-backed `user_profiles`.
- Current route mapping is `lib/routes.ts`.
- Quote submission and quote privacy are planned in `quote-submission-privacy`, not implemented in current app code.

## Scope

- One conversation per shipment request plus importer plus forwarder company.
- Messaging opens only after quote submission.
- No quote means no messaging.
- Importer can message only forwarders who submitted a quote on that request.
- Forwarder can message only the importer for requests where that forwarder company submitted a quote.
- Messages are private to participants.
- Messages may reference `quoteId` and optionally `quoteVersionId` if quote versions exist.
- Define conversation list/detail routes for importer and forwarder.
- Define message creation and read behavior.
- Define database tables, indexes, constraints, and participant checks.
- Define direct URL/action abuse prevention.
- Define no-WebSocket, no-queue V1 behavior.

## Non-Goals

- Do not implement real-time messaging.
- Do not add WebSockets, queues, Redis, or event buses.
- Do not build notifications in this initiative, except note events for later.
- Do not build admin inspection unless current memory requires it.
- Do not build file attachments.
- Do not build payments, tracking, escrow, reviews, analytics, or public SEO pages.
- Do not introduce microservices, Prisma, Express, AWS, or Terraform.

## Acceptance Criteria

- Current messaging/request/quote/auth baseline is audited and recorded.
- Schema plan defines conversations and messages with participant, quote, and request constraints.
- Exactly one conversation exists per request and forwarder company.
- Message creation is blocked before quote submission.
- Importer can read/send only in conversations for its own requests and quoted forwarders.
- Forwarder can read/send only as a member of the quoting forwarder company.
- Competitor forwarders cannot access conversations or messages.
- Unrelated importers cannot access conversations or messages.
- Direct route/action abuse is blocked by server-side checks, not UI hiding.
- V1 behavior is request/response form-submit messaging, with no realtime infrastructure.

## Recommended Product Decisions For Review

- Messaging should be allowed after a submitted quote exists, not after quote acceptance. Waiting until acceptance weakens the marketplace loop and blocks useful clarification.
- Use one `conversations` row per `shipment_request_id` and `forwarder_company_id`; importer participation is derived from the request owner.
- Store `quote_id` on the conversation as the quote that opened the conversation.
- If quote versions exist, messages may reference a specific `quote_version_id`, but messages should not require quote versions for V1.
- Do not create group chat, admin chat, attachments, typing states, read receipts, or realtime delivery in V1.
- Keep read behavior simple: chronological messages and optional `last_read_at` only if the UI needs unread state immediately.

## Domain Model

- Conversation: private thread for one request and one quoting forwarder company.
- Message: individual text entry in a conversation.
- Participant: importer owner or member of the quoting forwarder company.
- Quote gate: server-side rule that a submitted quote must exist before conversation access or message creation.
- Conversation identity: unique request and forwarder company pair.

## Module Sequence

1. Audit current messaging placeholders and dependency outputs.
2. Define conversation/message domain, constraints, and indexes.
3. Define and implement messaging access control.
4. Define and implement list/detail UI and message actions.
5. Run automated verification and browser/manual smoke.

## Cross-Module Data Flow

```text
quote submission
-> quote row exists for request + forwarder company
-> conversation can be created or fetched
-> importer/forwarder participant checks
-> message list/detail
-> create message action
```

```text
importer conversation access
-> requireRole(["importer"])
-> importer profile lookup
-> request ownership check
-> quote exists for request + forwarder company
-> conversation/messages
```

```text
forwarder conversation access
-> requireRole(["forwarder"])
-> forwarder company membership lookup
-> quote exists for request + forwarder company
-> conversation/messages
```

## Verification Plan

Automated commands:

- `npm run db:migrate`
- `npm run db:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`

Browser/manual smoke:

- Messaging blocked before quote.
- Messaging opens after quote.
- Importer can message quoting forwarder.
- Quoting forwarder can message importer.
- Competitor forwarder cannot access conversation.
- Unrelated importer cannot access conversation.

## Hard Stops

Stop for human input if any of these occur:

- Dependencies are incomplete and not explicitly accepted.
- Product requires messaging only after quote acceptance but quote comparison is incomplete.
- Quote schema cannot reliably prove request plus forwarder company ownership.
- Request ownership or forwarder company membership is ambiguous.
- Admin message inspection is required.
- Realtime messaging, notifications, attachments, payments, escrow, tracking, reviews, analytics, public SEO, queues, Redis, WebSockets, microservices, Prisma, Express, AWS, or Terraform enters scope.
- Any query or DTO exposes messages to non-participants.
