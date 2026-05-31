# Cross-Module Data Flow

## Quote Submission Flow

```text
/app/forwarder/requests/[requestId]
-> requireRole(["forwarder"])
-> forwarder_members lookup
-> posted/open shipment request lookup
-> quote form submit
-> server action
-> validate quote input
-> enforce duplicate/revision rule
-> insert quotes row or quote version snapshot
-> redirect to own quote/request detail
```

Critical boundaries:

- Route guard is not enough; the server action must verify forwarder role, membership, request eligibility, and suspension state if available.
- A forwarder can submit only for posted/open eligible requests.
- A forwarder company cannot create multiple active quotes for the same request unless revision semantics are explicitly implemented.

## Importer Quote Visibility Flow

```text
/app/requests/[requestId]
-> requireRole(["importer"])
-> importer ownership check
-> request lookup
-> quote details for request
-> importer-only DTO
```

Allowed importer fields:

- submitting forwarder company identity
- quote amount
- currency
- service offered
- estimated transit min/max days
- inclusions
- exclusions
- notes
- valid until
- quote status
- submitted/updated timestamps

## Forwarder Own Quote Visibility Flow

```text
/app/forwarder/requests/[requestId]
-> requireRole(["forwarder"])
-> forwarder company lookup
-> own quote lookup by request and company
-> own-quote DTO
```

Allowed submitting-forwarder fields:

- its own quote details
- its own quote status
- request detail already allowed by `forwarder-open-requests`

## Competitor Forwarder Privacy Flow

```text
/app/forwarder/requests/[requestId]
-> requireRole(["forwarder"])
-> forwarder company lookup
-> request lookup
-> aggregate quote count
-> no competitor quote rows
-> competitor-safe DTO
```

Forbidden competitor fields:

- submitting forwarder identity
- quote id if it reveals competitor quote ownership
- amount
- transit time
- inclusions
- exclusions
- notes
- messages

## Quote Count Flow

```text
quotes grouped by shipment_request_id
-> count only
-> forwarder-safe request DTO
```

Quote count must not include identities, prices, timing, or quote text.

## Snapshot / Revision Flow

Recommended V1 without revisions:

```text
quotes
-> one submitted snapshot per request + forwarder company
```

If revisions are required:

```text
quotes stable identity
-> quote_versions append-only snapshots
-> latest submitted version exposed to importer and submitting forwarder
-> competitors still see count only
```

## Data Safety

- Do not expose quote rows through public APIs.
- Do not expose quote details in forwarder open-request list/detail for competitors.
- Do not rely on UI hiding alone.
- Queries must select only allowed fields for each viewer class.
