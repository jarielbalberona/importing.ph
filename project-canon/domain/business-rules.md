# Business Rules

Status: baseline / partially confirmed

Source: current repo inspection, plus bounded migrated reference from legacy root docs.

## Confirmed From Current Repo Inspection

- supported top-level user roles are `importer`, `forwarder`, and `admin`
- importer request destinations use PSGC-backed data tables
- quote uniqueness is constrained per request and forwarder company
- importer requests can be saved as `draft`; drafts are not broadcast to forwarders until posted
- submitted quotes can be edited or withdrawn only while the request remains `posted`
- quote submission creates revision 1 and every successful quote edit appends an immutable snapshot inside the quote transaction; accepted, rejected, and withdrawn quotes remain read-only
- quote acceptance closes the request for marketplace quoting by moving it to `quote_selected`
- quote acceptance atomically rejects every other submitted quote for the request; PostgreSQL enforces at most one accepted quote per request
- messaging is gated by quote-linked conversation access
- forwarder companies can be suspended for marketplace safety
- unread badge state is conversation-based, not raw-message-count based
- posting a shipment request creates in-app request notifications for active forwarder members
- quote submission creates in-app quote notifications for the importer
- quote decisions create in-app quote notifications for the submitting forwarder
- request-posted, quote-decision, and importer-to-forwarder message events also send best-effort email when the recipient email exists
- admin marketplace activity is a read model over request, quote, and safety events; it is not a separate audit-ledger table
- shipment request attachments stay private and are served only through the authenticated application download route after relationship authorization
- conversation attachments are bound to one uploader and one quote-gated conversation while temporary, and become active only in the same transaction that creates the message
- message attachments allow up to five files and 100 MB total per message; images/documents are limited to 10 MB each and videos to 50 MB each
- conversation attachments remain private to the importer and forwarder-company participants; public request links never expose them
- attachments are user-provided and explicitly not malware-scanned in V1; downloads are forced as opaque attachments with no-sniff and no-store controls
- public shipment sharing is importer-controlled and opt-in; posting a request never creates a public link automatically
- public request links expose only the importer-approved summary, coarse route, shipment classification and totals, posted date, and open/closed state; importer identity, private cargo data, addresses, attachments, and quote data remain private
- public request tokens are unlisted identifiers, not authorization credentials; anonymous viewing is allowed, but quotation submission still requires an eligible authenticated forwarder and the existing quote authorization checks
- disabling sharing invalidates the current link but retains the public summary and last-shared timestamp; closed links remain visible until the importer disables them

## Bounded Migrated Rules From Legacy/Reference Docs

Source: migrated from legacy root docs; validation status: needs code/runtime confirmation.

- Render deploys do not automatically include PSGC data import; operators must run migrations/import against the target database
- browser auth role-switch smoke should use separate browser contexts/private windows, or a full Clerk storage reset, instead of product-code bypasses

These migrated rules are consistent with visible code/docs seams, but they are not promoted as full runtime proof yet.
