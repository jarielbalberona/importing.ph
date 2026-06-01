# Decisions

## 2026-05-31: AI Memory V1 Is Markdown-First

Decision: Project AI memory and initiative execution state will live in repository markdown files for V1.

Rationale: The current goal is to reduce manual AI prompt loops, not build a retrieval platform. Markdown is auditable, diffable, and cheap.

Consequences:

- No Postgres, pgvector, embeddings, vector databases, dashboards, or cloud orchestration in V1.
- Initiative state changes must be visible in git diffs.
- Any future V2 storage or indexing system must justify itself against this simpler baseline.

## 2026-06-01: Wrong-Role Access Uses Unauthorized Page

Decision: PostgreSQL-authenticated users who access a route outside their role now redirect to `/unauthorized` instead of being silently redirected to their own workspace.

Rationale: An explicit unauthorized page is clearer for users and stronger for smoke/security regression testing. It preserves the existing database-backed role guard and does not move business truth into Clerk.

Consequences:

- `requireRole()` remains the central role guard.
- Signed-out users still go through Clerk sign-in.
- Signed-in users without a profile still go to `/onboarding`.
- Wrong-role importer, forwarder, and admin route attempts render a deterministic unauthorized surface.

## 2026-06-01: Admin Provisioning Remains Manual For V1

Decision: V1 validation will use manually seeded database admin profiles instead of public admin onboarding or self-selection.

Rationale: Admin access is a privileged safety boundary. Adding a productized admin provisioning flow before the marketplace loop is validated creates avoidable attack surface and workflow complexity.

Consequences:

- Ordinary onboarding must not create `admin` profiles.
- Production admin creation needs an explicit operator-controlled seed/manual process.
- Admin access continues to use PostgreSQL `user_profiles.role = "admin"` as the business-role source of truth.
- Clerk remains authentication only.

## 2026-06-01: Reports And User-Level Suspension Deferred For V1

Decision: V1 launch hardening will rely on forwarder-company suspension and an operational support channel, not a built-in report/moderation workflow or user-level suspension.

Rationale: The immediate product proof is the importer-forwarder quote marketplace loop. Report subject rules, moderation workflow, and user-level account policy are real product decisions and should not be guessed during hardening.

Consequences:

- Suspended forwarder companies cannot submit quotes.
- User-level suspension and Clerk account disabling remain deferred.
- Report database tables, report routes, and admin report review are deferred.
- This decision must be revisited before scaling beyond tightly monitored validation users.

## 2026-06-01: V1 Notifications Are In-App Only

Decision: V1 launch validation will use DB-backed in-app notifications only. Resend/email delivery is deferred.

Rationale: The repo currently has no `resend` dependency, no Resend environment variables, no Render email env wiring, and no verified sending-domain setup. Adding external email delivery during hardening would expand operational risk without being required to prove the marketplace loop.

Consequences:

- Quote, quote-decision, and message notifications remain durable database records.
- Notification writes remain best-effort and must not corrupt core marketplace actions.
- Email delivery can be added later only with explicit dependency, environment, sender-domain, and smoke-test work.
- Do not add queues, Redis, workers, cron-heavy architecture, event buses, or WebSockets for V1 notifications.
