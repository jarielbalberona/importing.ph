# Domain Model

## Implemented Terms

### User Profile

Implemented as `user_profiles`.

Fields currently include:

- `id`.
- `clerk_user_id`.
- `role`.
- `full_name`.
- `created_at`.
- `updated_at`.

This is the application profile linked to Clerk identity.

### User Role

Implemented as PostgreSQL enum `user_role` and Drizzle enum `userRoleEnum`.

Current values:

- `importer`.
- `forwarder`.
- `admin`.

### Importer Profile

Implemented as `importer_profiles`.

Current meaning: business profile for an importer user.

Fields currently include:

- `id`.
- `user_profile_id`.
- `company_name`.
- timestamps.

Current constraint: one importer profile per user profile.

### Forwarder Company

Implemented as `forwarder_companies`.

Current meaning: company record created during forwarder onboarding.

Fields currently include:

- `id`.
- `name`.
- timestamps.

### Forwarder Member

Implemented as `forwarder_members`.

Current meaning: membership linking a user profile to a forwarder company.

Fields currently include:

- `id`.
- `user_profile_id`.
- `forwarder_company_id`.
- `member_role`.
- timestamps.

Current constraint: one forwarder membership per user profile.

Current default member role: `owner`.

## Planned / Conceptual Terms

These terms are part of the product direction but are not implemented in the current schema.

### Shipment Request / Import Request

Conceptual meaning: a request created by an importer describing cargo/import needs so forwarders can respond.

Unknown:

- Required fields.
- Visibility rules.
- Status lifecycle.
- Supported origin/destination model.
- Whether requests are public to all forwarders, filtered, or invite-only.

### Quote / Forwarder Response

Conceptual meaning: a private commercial response from a forwarder to an importer's request.

Unknown:

- Required pricing fields.
- Transit time fields.
- Inclusion/exclusion fields.
- Revision rules.
- Expiration rules.
- Selection/acceptance semantics.

Hard rule for future implementation: do not expose one forwarder's quote details to another forwarder.

### Conversation / Message

Conceptual meaning: communication between importer and forwarder in the context of a request or quote.

Unknown:

- Whether messaging requires a submitted quote.
- Whether conversations are per request, per quote, or per importer-forwarder pair.
- Message visibility and admin access.

### Request Status

Conceptual meaning: lifecycle state for a shipment/import request.

Unknown:

- Draft/open/closed/cancelled/selected states are not confirmed.
- Status transitions are not defined.

### Origin / Destination

Conceptual meaning: cargo movement endpoints, likely relevant to China-to-Philippines importing.

Unknown:

- Whether locations are free text, country/city/port fields, or normalized reference data.
- Whether first launch supports only China origin and Philippines destination or broader routes.

### Cargo Type

Conceptual meaning: classification of cargo in a shipment/import request.

Unknown:

- Whether cargo type is free text, enum, category table, or document-backed.
- Whether dangerous goods, restricted items, or customs categories matter in V1.

## Source-Of-Truth Rules

- Clerk is identity only.
- PostgreSQL owns roles and business profile state.
- Drizzle schema owns current database structure.
- Product terms should not be promoted from conceptual to implemented until code and migrations prove them.

## Trust And Visibility Rules

Implemented:

- Role-gated workspace routes use PostgreSQL profile role.

Planned but not implemented:

- Importer request ownership.
- Forwarder company ownership of quotes.
- Quote privacy.
- Messaging access boundaries.
- Admin visibility.

Any future initiative touching these areas must define the access matrix before writing schema or UI.
