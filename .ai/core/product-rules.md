# Product Rules

## Product Direction

Importing.ph is a Philippines-first import coordination marketplace.

The product should help importers and cargo forwarders coordinate shipment/import requests and quotes in one organized place instead of scattered chat threads, social messages, referrals, and private contact lists.

Core validation loop:

```text
Importer posts request
-> Forwarders submit quotes or responses
-> Importer compares options
-> Importer and forwarder communicate when allowed
-> Importer chooses how to proceed
```

Everything else is suspect until this loop works.

## Observed Business Rules

Implemented today:

- Supported persisted roles are `importer`, `forwarder`, and `admin`.
- Onboarding allows `importer` and `forwarder`.
- Admin exists in the database enum and route map but is not selectable in onboarding.
- Importer onboarding creates a user profile and importer profile.
- Forwarder onboarding creates a user profile, forwarder company, and owner membership.
- Protected workspace routes require a PostgreSQL-backed profile.
- Role-gated pages redirect users to their own role destination when they hit the wrong workspace.

## Planned Marketplace Rules

These are product rules to preserve when implementing the marketplace, but they are not yet proven as code:

- Importers own shipment/import requests.
- Cargo forwarders can review relevant requests.
- Forwarders submit private quotes or responses to importers.
- Importers compare forwarder options.
- Pricing and communication should become more organized and trackable than scattered external channels.
- Quote privacy matters: competitor forwarders must not see each other's prices, notes, transit times, or commercial details.
- Messaging should be tied to marketplace context, not become an unrestricted chat product.

## Trust Boundaries

- Clerk identity is not enough for product authorization; use PostgreSQL role/profile state.
- Forwarder users act through a forwarder company membership.
- Importer-owned request data and forwarder-owned quote data need explicit visibility checks.
- Quote visibility must be designed before quote tables or UI are implemented.
- Admin access must stay separate from importer and forwarder workspaces.

## Non-Goals

Do not build these for V1 unless explicitly approved:

- Logistics ERP.
- Forwarder ERP.
- Shipment tracking.
- Warehouse management.
- Customs operations management.
- Payments, escrow, billing, subscriptions.
- Ratings and reviews.
- Analytics dashboards.
- AI recommendations.
- Complex automation around freight operations.

## Hard Stops

Stop and ask for a product decision before implementing:

- Quote visibility rules.
- Messaging access rules.
- Request status lifecycle.
- Quote status lifecycle.
- Admin powers.
- Forwarder eligibility for seeing a request.
- Any payment, escrow, or billing behavior.
- Any destructive data behavior.
- Any feature that exposes one forwarder's quote details to another forwarder.

## Unknown Product Questions

- What shipment request fields are required for first launch?
- Which origins/destinations are supported first?
- Are requests open to all forwarders, filtered by lane/service, or invite-only?
- Can importers close, cancel, or reopen requests?
- Can forwarders revise quotes?
- Can multiple users belong to one importer company?
- Can multiple users belong to one forwarder company beyond the current owner model?
- What does "selected quote" mean operationally: preference marker, accepted quote, or binding agreement?
