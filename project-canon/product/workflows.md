# Product Workflows

Status: baseline / to be confirmed

Source: current repo inspection.

## Core Marketplace Workflow

1. user signs in
2. user completes onboarding as importer or forwarder
3. importer creates a shipment request as a draft or posts it immediately
4. active forwarders receive request-posted in-app notifications and best-effort email notifications when a request is posted
5. forwarder submits one quote per request/company
6. forwarder can edit or withdraw a submitted quote while the request remains open and the quote is not decided
7. importer receives a quote notification and reviews quote counts/private quotes
8. accepting a quote atomically moves the request to `quote_selected` and rejects every other submitted quote
9. conversation opens from quote relationship
10. notifications and unread badges reflect request, quote, message, and read-state activity

## Public Request Sharing

1. the importer explicitly enables sharing on a posted request and writes a dedicated 10–280 character public summary
2. the importer reviews the exact privacy-safe projection before creating the unlisted `/r/{token}` link
3. anonymous visitors can view the safe shipment summary; automatic social-media link previews cause no writes or other side effects
4. sign-in, sign-up, and onboarding preserve the public URL through the `submit_quote` intent, with the forwarder role preselected but editable
5. only an eligible authenticated forwarder enters the existing protected quotation flow; the public page never submits a quote
6. quote selection or cancellation immediately changes an active public page to a closed state with no quotation action
7. the importer can rotate an open link or disable an active link; rotation and disabling invalidate the previous URL immediately

## Supporting Workflows

- importer profile and request management
- forwarder public company profile discovery
- importer request draft/save and publish flow
- forwarder public profile completeness meter
- importer and forwarder launch checklists
- admin marketplace oversight and forwarder suspension
- admin marketplace activity log
- PSGC-backed destination lookup for request destinations
- optional unscanned shipment request attachments with private object storage, authenticated forced download, and a visible user warning
- transactional email templates for marketplace notifications
- quote summary PDF template surface for future quote/export flows
- importer-controlled public request links with anonymous privacy-safe viewing and authenticated quotation handoff

## Workflow Boundaries

- messaging is quote-gated, not globally open
- the app is currently modeled as a marketplace, not a logistics ERP
- older legacy notes may describe additional intent, but current canon should follow code-backed behavior first
