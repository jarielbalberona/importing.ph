# Cross-Module Data Flow

## Forwarder List Flow

```text
/app/forwarder/requests
-> requireRole(["forwarder"])
-> optional forwarder membership/status check
-> parse filters from search params
-> query posted/open shipment_requests
-> map to forwarder-safe list DTO
-> render list or empty state
```

Critical boundaries:

- Forwarder role must be checked on the server.
- Query must filter to posted/open quoteable requests.
- Query must not return competitor quote details.

## Forwarder Detail Flow

```text
/app/forwarder/requests/[requestId]
-> requireRole(["forwarder"])
-> optional forwarder membership/status check
-> query one posted/open shipment request
-> map to forwarder-safe detail DTO
-> render detail or not-found
```

Critical boundaries:

- Draft/closed/cancelled requests must behave as not found or inaccessible.
- Detail DTO must expose no quote details except safe aggregate count if available.

## Filter Flow

```text
search params
-> validation/normalization
-> query predicates
-> indexed shipment request columns
-> list result
```

Required filters if fields exist:

- origin city/province
- destination city/province
- cargo type
- shipping mode / shipping preference
- door-to-door requirement/preference
- special handling / MSDS-related signal

If a field is missing from the completed shipment request schema, do not fake it. Document the gap and either skip the filter or hard-stop if the filter is mandatory.

## Quote Count Flow

```text
shipment request
-> aggregate quote count, if quote table exists
-> count only
-> forwarder list/detail
```

Forbidden flow:

```text
shipment request
-> quotes rows
-> competitor identities / amounts / transit times / notes
-> forwarder UI
```

That forbidden flow must not exist.

## Authorization Flow

```text
Clerk auth
-> user_profiles lookup
-> requireRole(["forwarder"])
-> optional forwarder_members lookup
-> open request query
```

Importer role must be redirected or blocked by the existing role-guard pattern.

## Data Safety

- No public endpoint for open requests unless a future initiative explicitly approves it.
- No quote details in list/detail DTOs.
- No file upload or attachment storage access in this initiative.
- No messages or conversations.
