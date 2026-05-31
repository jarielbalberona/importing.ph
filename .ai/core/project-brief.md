# Project Brief

## Observed From Repo

`importing.ph` is currently a small Next.js App Router application with a local AI memory scaffold.

The repository proves these current capabilities:

- Public landing page at `/`.
- Clerk-backed sign-in and sign-up routes.
- Protected onboarding route that writes application role/profile data to PostgreSQL.
- Role-gated proof routes for importers, forwarders, and admins.
- PostgreSQL schema for user profiles, importer profiles, forwarder companies, and forwarder membership.
- Local PostgreSQL via Docker Compose.
- Render deployment configuration for a Node web service and managed PostgreSQL database.
- Local AI initiative runner and markdown memory scaffold under `.ai/` and `tools/ai-runner/`.

The repository does not currently prove a working shipment request, quote, comparison, messaging, or quote selection flow.

## Planned Product Context

Importing.ph is intended to streamline importing from China to the Philippines by helping importers and cargo forwarders coordinate shipment requests and quotes in one place.

The core user problem is fragmented coordination. Importers often compare forwarders through chat apps, social platforms, referrals, and private contacts. That makes pricing, response tracking, and communication hard to compare and easy to lose.

Primary users:

- Importers.
- Cargo forwarders.

Intended marketplace loop:

```text
Importer creates shipment/import request
-> Forwarders review relevant requests
-> Forwarders submit private quotes or responses
-> Importer compares options
-> Messaging occurs where allowed
-> Importer chooses how to proceed
```

Treat this as product direction, not implemented fact.

## Likely Current Scope

The implemented scope is foundation work:

- Authentication shell.
- Onboarding.
- Role persistence in PostgreSQL.
- Basic route authorization.
- Local database setup and proof scripts.
- AI planning/execution scaffold.

The next product work should probably build the first real marketplace slice rather than add more infrastructure.

## Explicit Non-Goals For V1

Do not turn this into a logistics operating system.

Out of scope unless explicitly approved:

- Shipment tracking.
- Freight operations management.
- Warehouse management.
- ERP-style forwarder tooling.
- Escrow or payments.
- Subscriptions or billing.
- Ratings and reviews.
- Analytics dashboards.
- AI recommendations.
- Microservices, queues, Redis, WebSockets, event buses, or separate backend services.

If a feature does not directly improve request creation, forwarder quoting, importer comparison, messaging, or quote selection, challenge it before implementation.

## Unknown / Open Gaps

- Exact shipment request fields are not implemented.
- Quote fields, quote privacy, and quote lifecycle are not implemented.
- Messaging model and access rules are not implemented.
- Admin responsibilities are not defined beyond a proof route.
- Whether forwarder relevance/filtering is manual, category-based, lane-based, or invite-based is unknown.
- Request statuses and quote statuses need a product decision before schema work.
- No test coverage proves role privacy beyond basic route code.
