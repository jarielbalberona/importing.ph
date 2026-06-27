# Business Rules

Status: baseline / partially confirmed

Source: current repo inspection, plus bounded migrated reference from legacy root docs.

## Confirmed From Current Repo Inspection

- supported top-level user roles are `importer`, `forwarder`, and `admin`
- importer request destinations use PSGC-backed data tables
- quote uniqueness is constrained per request and forwarder company
- messaging is gated by quote-linked conversation access
- forwarder companies can be suspended for marketplace safety
- unread badge state is conversation-based, not raw-message-count based
- posting a shipment request creates in-app request notifications for active forwarder members
- quote submission creates in-app quote notifications for the importer
- quote decisions create in-app quote notifications for the submitting forwarder

## Bounded Migrated Rules From Legacy/Reference Docs

Source: migrated from legacy root docs; validation status: needs code/runtime confirmation.

- shipment request attachments are intended to stay private, with object storage keyed by `media_files.object_key` and short-lived signed reads after authorization
- Render deploys do not automatically include PSGC data import; operators must run migrations/import against the target database
- browser auth role-switch smoke should use separate browser contexts/private windows, or a full Clerk storage reset, instead of product-code bypasses

These migrated rules are consistent with visible code/docs seams, but they are not promoted as full runtime proof yet.
