# Domain Model

## Terms Expected From Dependencies

### Shipment Request

Expected from `shipment-request-wizard`.

Required for this initiative:

- Durable request table.
- Importer ownership.
- Importer request detail route.
- Request status that can represent quote selection or can be extended safely.

### Quote

Expected from `quote-submission-privacy`.

Required for this initiative:

- Durable quote table.
- Request relationship.
- Forwarder company ownership.
- Quote amount.
- Currency.
- Service offered.
- Estimated transit min/max days.
- Inclusions.
- Exclusions.
- Notes.
- Valid until.
- Status.

### Quote Privacy Boundary

Expected from `quote-submission-privacy`.

Required for this initiative:

- Importer owner can see all quote details for owned request.
- Submitting forwarder can see own quote details.
- Competitor forwarders cannot see quote details.

## New Terms For This Initiative

### Quote Comparison

Importer-owned view of submitted quote details for one shipment request.

Comparison fields:

- amount
- currency
- service offered
- estimated transit range
- inclusions
- exclusions
- notes
- valid until
- status

### Accepted Quote

The quote selected by the importer for a request.

Recommended behavior:

- Only one quote can be accepted per request.
- Accepting a quote updates quote status and request selection state in one transaction.

### Rejected Quote

A quote explicitly declined by the importer.

Recommended behavior:

- Rejecting a quote updates that quote status only, unless request-level counters or denormalized summaries exist.
- Rejecting the currently accepted quote should hard-stop unless product defines unaccept/reopen behavior.

### Non-Selected Quote

A quote that is neither accepted nor rejected.

Recommended behavior:

- Leave non-selected quotes as `submitted` when another quote is accepted.
- Do not auto-reject unless product explicitly wants that behavior.

### Quote Decision Transaction

Atomic update that applies accept/reject changes consistently.

Required properties:

- Verifies importer ownership.
- Verifies quote belongs to owned request.
- Verifies current status allows transition.
- Updates quote/request status together where required.
- Prevents two accepted quotes on one request.

### Expired Quote

A quote where `valid_until` is before current time.

Recommended behavior:

- Display as expired.
- Do not allow acceptance unless product explicitly allows accepting expired quotes.

## Proposed Status Model

Quote statuses needed by this initiative:

- `submitted`
- `accepted`
- `rejected`
- `withdrawn` if already modeled by quote submission
- `superseded` if quote versions are modeled

Request status needed by this initiative:

- `posted` or equivalent before selection.
- `quote_selected` or equivalent after acceptance.

Hard stop if current dependency status names differ and mapping is ambiguous.

## Privacy Rules

- Importer owner sees all quote details for its own request.
- Non-owner importers see no quote details.
- Submitting forwarder sees its own quote details and status.
- Competitor forwarders see no quote details.
- Quote count remains aggregate-only for competitor forwarders.
- Status changes must not leak competitor details through labels, URLs, IDs, or redirects.

## Out-Of-Scope Terms

- Message.
- Conversation.
- Notification dispatch.
- Payment.
- Escrow.
- Tracking.
- Admin override.
- Public quote page.
