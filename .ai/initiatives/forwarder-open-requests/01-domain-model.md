# Domain Model

## Implemented Repo Terms This Initiative Builds On

### Forwarder

Current implemented role value: `forwarder`.

Current route destination: `/app/forwarder/requests`.

Forwarder open-request browsing must require a PostgreSQL-backed forwarder role.

### Forwarder Company

Current table: `forwarder_companies`.

Current behavior:

- Created during forwarder onboarding.

### Forwarder Member

Current table: `forwarder_members`.

Current behavior:

- Links a user profile to a forwarder company.
- Current default member role is `owner`.

Execution should use membership if the completed auth initiative exposes a reliable helper for it.

## Terms Expected From Dependency

### Shipment Request

Expected from `shipment-request-wizard`.

Required for this initiative:

- A durable request table.
- Importer ownership.
- Request status.
- Origin city/province or equivalent origin fields.
- Destination city/province or equivalent destination fields.
- Cargo type.
- Shipping mode or shipping preference.
- Door-to-door preference/requirement or delivery preference.
- Special handling / MSDS-related signal only if captured by request schema.

If these fields do not exist after the dependency completes, Phase 1 must document the gap and Phase 3 must not invent fake filters.

### Posted / Open Request

A request that is quoteable and visible to forwarders.

Expected behavior:

- `posted` or equivalent status is visible.
- `draft`, `closed`, and `cancelled` or equivalent non-open statuses are not visible.

### Quote Count

Safe aggregate count of quotes on a request.

Current repo truth:

- No quote table exists in current app code.

Rule:

- Show quote count only if a completed dependency or current schema provides a safe aggregate.
- Never expose quote identities or commercial details.

## New Terms For This Initiative

### Forwarder-Safe Request DTO

The exact response/query shape allowed for forwarder list and detail views.

Allowed categories:

- Request id.
- Status when open/posted.
- Cargo description/type.
- Origin and destination.
- Size/weight/quoting basis.
- Shipping and delivery preferences.
- Special handling/MSDS flags where captured.
- Created/posted date.
- Quote count only as aggregate if available.

Forbidden categories:

- Importer private internal notes not intended for quoting.
- Competitor quote identities.
- Competitor quote amounts.
- Competitor transit times.
- Competitor inclusions/exclusions.
- Competitor notes.
- Messages.

### Suspended Forwarder

Not implemented in current app code.

If a completed dependency introduces forwarder suspension/trust status, this initiative must define whether suspended forwarders can browse posted requests and whether they can quote later.

Recommended default:

- If suspension exists, suspended forwarders should not browse open requests unless product explicitly says browsing is allowed.

## Out-Of-Scope Terms

- Quote submission.
- Quote comparison.
- Message.
- Conversation.
- Notification.
- Attachment storage.
- Public SEO request page.
- Payment.
- Tracking event.
- Review/rating.

## Privacy Rules

- Forwarders can see request data needed to decide whether to quote.
- Forwarders cannot see competitor quote details.
- Request query helpers must not return forbidden quote fields by accident.
- Importer-only data must be intentionally classified before exposure.
