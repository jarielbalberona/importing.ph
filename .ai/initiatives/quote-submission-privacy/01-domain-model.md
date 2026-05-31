# Domain Model

## Implemented Repo Terms This Initiative Builds On

### Forwarder Company

Current table in app code: `forwarder_companies`.

Expected role in this initiative:

- Owns submitted quotes.
- Defines the company boundary for competitor privacy.

### Forwarder Member

Current table in app code: `forwarder_members`.

Expected role in this initiative:

- Links the current user to the forwarder company that submits the quote.
- Must be checked before quote submission.

### Importer Profile

Current table in app code: `importer_profiles`.

Expected role from `shipment-request-wizard`:

- Owns shipment requests.
- Determines which importer can see all quote details for a request.

## Terms Expected From Dependencies

### Shipment Request

Expected from `shipment-request-wizard`.

Required for this initiative:

- Durable request table.
- Importer ownership.
- Posted/open status.
- Request detail route or server-side query for eligible posted requests.

### Open Request

Expected from `forwarder-open-requests`.

Required for this initiative:

- Forwarder-safe posted request detail.
- Forwarder route where quote submission can be linked.
- Privacy boundary that already avoids exposing quote details to competitors.

### Suspended Forwarder

Not implemented in current app code.

If a completed dependency introduces suspension/trust status:

- Suspended forwarders must not submit quotes.

If no such state exists:

- Document as not applicable and do not invent suspension schema inside this initiative unless the human explicitly requires it.

## New Terms For This Initiative

### Quote

A private commercial response from one forwarder company to one eligible posted shipment request.

Recommended ownership:

- `quotes.shipment_request_id` references the request table from `shipment-request-wizard`.
- `quotes.forwarder_company_id` references `forwarder_companies.id`.

Recommended uniqueness:

- One active quote per forwarder company per request.

### Quote Status

Minimal lifecycle enum.

Recommended V1 values:

- `submitted`
- `withdrawn`
- `superseded` only if revisions are implemented

Do not add `accepted` or `rejected` in this initiative unless a completed dependency explicitly requires it. Acceptance belongs in a later quote-selection initiative.

### Quote Snapshot

The durable submitted quote values at the time of submission.

Snapshot fields:

- quote amount
- currency
- service offered
- estimated transit min days
- estimated transit max days
- inclusions
- exclusions
- notes
- valid until

### Quote Version

Optional append-only revision record.

Recommended rule:

- Skip `quote_versions` in the first pass if revisions are not required.
- If revisions are required, use `quotes` as stable identity and `quote_versions` for immutable submitted revisions.
- Do not allow multiple active quotes by the same forwarder company on the same request.

### Competitor Forwarder

Any forwarder company that did not submit the quote.

Forbidden visibility:

- quote id if it identifies competitor activity beyond safe aggregate
- forwarder identity
- amount
- transit time
- inclusions
- exclusions
- notes
- messages

### Quote Count

Safe aggregate count of quotes submitted on a request.

Allowed visibility:

- Other forwarders may see count only if implemented as an aggregate and not paired with identities or commercial fields.

## Privacy Rules

- Importer owner can see all quote details for its own request.
- Submitting forwarder/company can see its own quote details.
- Competitor forwarders cannot see quote details.
- Query/DTO shape must enforce privacy; hiding fields in UI is not enough.
- Server actions must verify authorization before writes and reads.

## Out-Of-Scope Terms

- Quote acceptance.
- Quote rejection.
- Conversation.
- Message.
- Notification.
- Payment.
- Escrow.
- Tracking.
- Service profile as a required prerequisite.
- Public quote page.
