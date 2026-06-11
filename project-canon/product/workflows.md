# Product Workflows

Status: baseline / to be confirmed

Source: current repo inspection.

## Core Marketplace Workflow

1. user signs in
2. user completes onboarding as importer or forwarder
3. importer creates and posts a shipment request
4. forwarder submits one quote per request/company
5. importer reviews requests and quote counts
6. conversation opens from quote relationship
7. notifications and unread badges reflect quote/message activity

## Supporting Workflows

- importer profile and request management
- forwarder public company profile discovery
- admin marketplace oversight and forwarder suspension
- PSGC-backed destination lookup for request destinations
- optional shipment request attachments with private object storage

## Workflow Boundaries

- messaging is quote-gated, not globally open
- the app is currently modeled as a marketplace, not a logistics ERP
- older legacy notes may describe additional intent, but current canon should follow code-backed behavior first
