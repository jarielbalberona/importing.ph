# Public Forwarder Profile SEO

## Initiative Key

`public-forwarder-profile-seo`

## Dependencies

depends_on: shipment-request-wizard, forwarder-open-requests, quote-submission-privacy, importer-quote-comparison

Dependency rule: keep this initiative deferred until the marketplace request/quote loop is proven. Prefer completing quote-gated messaging too before execution unless product review explicitly decides acquisition pages are needed earlier.

## Initiative Status

- Status: draft
- Ready for execution: no
- Execution started: no
- Latest execution status: not started.
- Deferred: yes

Lifecycle rule: this initiative is authored for future review. Do not lock for execution until the marketplace loop is working and public acquisition is the next priority.

## Objective

Plan public forwarder profiles and SEO route/lane pages for future acquisition without exposing private marketplace data or distracting from V1 marketplace validation.

This is a deferred acquisition initiative. It must not outrank the core loop:

```text
Importer posts request
-> Forwarder submits quote
-> Importer compares quote
-> Importer chooses how to proceed
```

## Repo Baseline Observed During Authoring

- Current public route is `app/page.tsx`.
- Current app has Clerk auth routes and protected workspace/admin proof routes.
- Current metadata convention is only root `metadata` in `app/layout.tsx`.
- There is no `/forwarders` route.
- There is no `/forwarders/[slug]` route.
- There is no `/shipping/*` route.
- There is no sitemap or robots route/file found in the app tree.
- Current `forwarder_companies` schema has only `id`, `name`, `created_at`, and `updated_at`.
- Current repo has no forwarder slug, public visibility flag, service profile, route/lane, logo, description, verification, suspension, review, or rating schema.
- Current marketplace request/quote loop is not implemented in current app code.

## Scope

- Public forwarder profile route planning, likely `/forwarders/[slug]`, if supported by current memory.
- Public forwarder directory planning, likely `/forwarders`.
- Future route/lane page compatibility:
  - `/shipping/china-to-philippines`
  - `/shipping/guangzhou-to-manila`
  - `/shipping/yiwu-to-manila`
  - `/shipping/shenzhen-to-manila`
- SEO metadata conventions.
- Public-safe forwarder fields only.
- Privacy rules for what must not be public.
- Admin or forwarder controls for profile visibility if current memory requires it.
- Keep implementation minimal and compatible with current marketplace data model.

## Non-Goals

- Do not build this before the marketplace loop unless current product memory requires it.
- Do not build content marketing CMS.
- Do not build import guide articles unless current memory requires it.
- Do not build reviews/ratings.
- Do not expose private quote, request, message, or importer data.
- Do not build payments, tracking, escrow, analytics, ERP, or subscriptions.
- Do not introduce queues, Redis, WebSockets, microservices, Prisma, Express, AWS, or Terraform.

## Acceptance Criteria

- Current public route, metadata, and forwarder data baseline is audited.
- Initiative remains deferred unless product review explicitly makes it launch-critical.
- Public-safe forwarder fields are defined before any public route is implemented.
- Private marketplace data is explicitly excluded from public pages.
- Slug and visibility rules are defined.
- Suspended/unverified forwarder public behavior is defined.
- Directory/profile/lane routes are planned without CMS or content sprawl.
- Verification plan proves metadata and privacy if implementation eventually proceeds.

## Recommended Product Decisions For Review

- Keep this deferred until at least request creation, open request browsing, quote submission, and quote comparison are proven.
- Do not implement public profiles from the current `forwarder_companies.name` alone. That is too thin and risks publishing incomplete business data.
- Require an explicit `public_profile_enabled` or equivalent visibility flag before a forwarder appears publicly.
- Require stable slugs before public routes launch.
- Hide suspended forwarders from public pages by default.
- Treat route/lane pages as static acquisition pages linked to real marketplace coverage only after there is evidence of supply or demand.

## Domain Model

- Public forwarder profile: public-safe representation of a forwarder company.
- Forwarder slug: stable URL identifier for a forwarder company.
- Public visibility: explicit flag deciding whether a company can appear publicly.
- Service profile: optional future public business/service details.
- Route/lane page: public SEO landing page for an origin-destination route.
- Public-safe field: field approved for unauthenticated users.

## Module Sequence

1. Audit current public/SEO state.
2. Define public forwarder profile data.
3. Define public routes and SEO plan.
4. Define privacy and safety behavior.
5. Define verification and smoke plan.

## Cross-Module Data Flow

```text
forwarder company
-> public visibility and slug checks
-> public-safe DTO
-> /forwarders and /forwarders/[slug]
-> metadata generation
```

```text
route/lane config or data
-> public-safe lane page
-> metadata generation
-> no private request/quote/message data
```

## Verification Plan

Automated commands:

- `npm run type-check`
- `npm run lint`
- `npm run build`

Manual smoke:

- Public profile renders only public-safe data.
- Private marketplace data is not exposed.
- Suspended forwarder behavior matches product rules.
- Metadata renders correctly if implemented.

## Hard Stops

Stop for human input if any of these occur:

- Marketplace loop dependencies are incomplete and not explicitly accepted.
- Product wants this before marketplace validation without a clear acquisition reason.
- Public fields cannot be distinguished from private marketplace data.
- Slug uniqueness or profile visibility is unresolved.
- Suspended or unverified forwarder visibility is unclear.
- Any route exposes private quote, request, message, importer, or competitor data.
- Scope expands to CMS, article publishing, ratings/reviews, analytics, payments, tracking, escrow, ERP, subscriptions, queues, Redis, WebSockets, microservices, Prisma, Express, AWS, or Terraform.
