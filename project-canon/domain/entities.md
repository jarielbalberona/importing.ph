# Domain Entities

Status: current repo inspection

Source: current repo inspection.

Primary entities currently represented in schema/code:

- `user_profiles`
- `importer_profiles`
- `forwarder_companies`
- `forwarder_members`
- `forwarder_quote_defaults`
- `shipment_requests`
- `quotes`
- `conversations`
- `messages`
- `conversation_read_states`
- `notifications`
- `media_files`
- `shipment_request_attachments`
- PSGC location entities

Relationship summary:

- a `user_profile` has one business role
- an importer user owns one importer profile
- a forwarder user joins a forwarder company through membership
- shipment requests belong to importer profiles
- quotes belong to one request and one forwarder company
- conversations link importer, forwarder company, request, and the opening quote
- notifications reference user recipients plus optional source request/quote/conversation/message
