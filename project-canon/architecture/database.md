# Database Architecture

Status: baseline / to be confirmed

Source: current repo inspection.

Current persistent business store:

- PostgreSQL
- Drizzle schema in `db/schema.ts`
- ordered SQL migrations under `drizzle/`

Core table groups currently present:

- identity and roles: `user_profiles`
- importer profiles: `importer_profiles`
- forwarder org model: `forwarder_companies`, `forwarder_members`, `forwarder_quote_defaults`
- marketplace requests and quotes: `shipment_requests`, `quotes`
- defensive controls: `rate_limit_states`
- messaging: `conversations`, `messages`, `conversation_read_states`
- notifications: `notifications`
- media and attachments: `media_files`, `shipment_request_attachments`
- destination lookup data: `psgc_regions`, `psgc_provinces`, `psgc_cities_municipalities`, `psgc_barangays`

Important current boundaries:

- Clerk is not the primary business-data store
- quote uniqueness is enforced per shipment request and forwarder company
- a partial unique index enforces at most one accepted quote per shipment request
- a unique nullable index enforces one active public-share token per shipment request link, with database checks for the 16-character URL-safe token and 10–280 character public summary
- conversations are scoped to request + forwarder company and opened by quote relationship
- notification rows dedupe by `dedupeKey`

PSGC note:

- destination lookup data is imported into the database, not shipped as frontend JSON
