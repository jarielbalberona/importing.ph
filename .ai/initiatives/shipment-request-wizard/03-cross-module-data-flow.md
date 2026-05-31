# Cross-Module Data Flow

## Request Creation Flow

```text
/app/requests/new
-> requireRole(["importer"])
-> wizard form
-> create request server action
-> requireRole(["importer"]) or equivalent action guard
-> importer_profiles lookup for current user_profile_id
-> zod validation
-> shipment_requests insert
-> redirect to request detail or list
```

Critical boundaries:

- Route guard is not enough; the server action must also verify importer role/profile.
- Ownership must use PostgreSQL profile data.
- Clerk metadata must not be used as ownership truth.

## Wizard Step Flow

```text
Step 1: What are you shipping?
-> cargo description
-> cargo type

Step 2: Size, weight, and value
-> total CBM or total weight or dimensions plus package count
-> declared value optional

Step 3: Pickup and destination
-> origin/pickup location
-> destination location

Step 4: Shipping preference
-> delivery preference
-> shipping preference

Step 5: Attachments and notes
-> notes
-> attachment placeholder text only, unless real storage is explicitly added later

Step 6: Review and post
-> final validation
-> persist request
```

## Persistence Flow

```text
db/schema.ts
-> Drizzle migration
-> shipment_requests table
-> app server action
-> importer-owned rows
```

Recommended table ownership:

```text
shipment_requests.importer_profile_id
-> importer_profiles.id
```

Recommended list/detail indexes:

```text
importer_profile_id
status
created_at
```

## List Flow

```text
/app/requests
-> requireRole(["importer"])
-> importer profile lookup
-> shipment_requests where importer_profile_id = current importer profile
-> render list or empty state
```

## Detail Flow

```text
/app/requests/[requestId]
-> requireRole(["importer"])
-> importer profile lookup
-> shipment_requests where id = requestId and importer_profile_id = current importer profile
-> render detail or not-found
```

## External Services

No external services are required by this initiative beyond the existing Clerk authentication layer.

Real file upload storage is out of scope. Do not add Cloudflare R2 or placeholder upload services.

## Security And Privacy

- Importer route and action guards are mandatory.
- Forwarders must not access request creation.
- Forwarder browsing is not part of this initiative.
- Do not expose importer-owned request detail through unguarded routes or public APIs.
