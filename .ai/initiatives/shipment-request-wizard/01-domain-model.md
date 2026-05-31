# Domain Model

## Implemented Repo Terms This Initiative Builds On

### Importer

Current implemented role value: `importer`.

Current route destination: `/app/requests`.

Importer request creation must require a PostgreSQL-backed importer role and importer profile.

### Importer Profile

Current table: `importer_profiles`.

Expected ownership link:

- New shipment request records should reference `importer_profiles.id`.

Do not hang ownership directly off Clerk metadata.

## New Terms To Define During Execution

### Shipment Request

An importer-owned request describing cargo/import needs so forwarders can quote later.

V1 purpose:

- Capture enough structured information for a forwarder to assess and price a shipment.
- Give the importer a durable request list/detail view.

Not V1 purpose:

- Forwarder quote submission.
- Messaging.
- Shipment tracking.
- File storage.

### Request Status

Minimal status enum for the request lifecycle.

Recommended V1 options:

- `draft`: importer is still editing and request is not visible for future quoting.
- `posted`: importer has submitted the request as quoteable.
- `cancelled`: importer withdrew the request.

Execution must decide whether first pass supports both `draft` and `posted`, or uses `posted` only. If draft behavior adds too much UI/state complexity, use `posted` only and document draft as later work.

### Cargo Type

V1 cargo classification enum.

Recommended values:

- `general_goods`
- `electronics`
- `apparel`
- `machinery`
- `furniture`
- `food_or_beverage`
- `cosmetics`
- `other`

Hard stop if the product requires regulated/dangerous-goods handling in this initiative. That is a different risk class.

### Delivery Preference

V1 handling preference enum.

Recommended values:

- `door_to_door`
- `port_to_door`
- `door_to_port`
- `port_to_port`
- `not_sure`

### Shipping Preference

V1 quote preference enum.

Recommended values:

- `lowest_cost`
- `fastest_time`
- `balanced`
- `not_sure`

### Quoting Basis

Minimum useful shipment sizing data.

Validation rule:

At least one of these must be present:

- total CBM
- total weight
- dimensions plus carton/package count

Without this, the request is not quoteable and should not be posted.

## Recommended V1 Fields

Required fields:

- importer profile owner
- cargo description
- cargo type
- origin/pickup location
- destination location
- shipping preference
- delivery preference
- request status
- at least one quoting basis

Optional fields:

- total CBM
- total weight
- length
- width
- height
- package/carton count
- declared value
- currency
- preferred pickup date
- notes
- attachment descriptions or placeholder metadata only if no real file storage is added

## Ownership Rules

- A shipment request belongs to exactly one importer profile.
- Only the owning importer can create, list, or view their requests in this initiative.
- Forwarders cannot create importer requests.
- Forwarders should not get browsing access in this initiative.
- Admin behavior is out of scope.

## Out-Of-Scope Terms

- Quote.
- Quote count.
- Conversation.
- Message.
- Real attachment object.
- File storage key.
- Payment.
- Tracking event.
- Forwarder visibility/filtering.
