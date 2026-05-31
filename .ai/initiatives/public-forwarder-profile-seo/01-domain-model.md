# Domain Model

## Terms Observed In Current Repo

### Public Landing Page

Implemented at `app/page.tsx`.

Current behavior:

- Public unauthenticated marketing-style entry page.
- Links to sign-up and sign-in.
- Does not render forwarder directory/profile content.

### Metadata

Implemented only in `app/layout.tsx` as root static metadata.

Current fields:

- `title`
- `description`

No route-specific `generateMetadata`, sitemap, or robots convention is currently implemented.

### Forwarder Company

Implemented as `forwarder_companies`.

Current fields:

- `id`
- `name`
- timestamps

Missing for public profile use:

- slug
- public visibility flag
- public description
- logo/media
- service lanes
- verification/trust status
- suspension status
- contact/display preferences

## Terms Expected From Dependencies

### Quote Privacy

Expected from `quote-submission-privacy`.

Required rule:

- Public pages must never expose private quote fields or competitor quote data.

### Marketplace Loop

Expected from earlier initiatives.

Public SEO should not execute until the product proves users can create requests, submit quotes, and compare/select options.

## New Terms For This Initiative

### Public Forwarder Profile

Public-safe profile for one forwarder company.

Potential public fields:

- company name
- slug
- public description
- service regions or lanes
- public service categories
- public website/contact link if explicitly approved
- logo if media support exists
- profile visibility status

Do not publish fields just because they exist in the database.

### Forwarder Directory

Public list page for visible forwarders.

Likely route:

- `/forwarders`

Rules:

- Only visible, non-suspended forwarders should appear unless product explicitly says otherwise.
- Directory list should use public-safe summary fields only.

### Forwarder Slug

Stable URL identifier.

Likely route:

- `/forwarders/[slug]`

Requirements:

- Unique.
- Stable after publication.
- Collision handling defined before implementation.
- Rename behavior defined before launch.

### Public Visibility

Explicit state allowing a forwarder company profile to appear publicly.

Recommended default:

- not public until enabled.

Potential controls:

- admin-controlled
- forwarder-controlled with admin/safety override

### Service Profile

Optional future public business/service details for a forwarder.

Do not block quote submission on service profile completeness. Public profile completeness is separate from quoting ability.

### Route / Lane Page

Public SEO page for a shipping route or origin-destination pair.

Examples:

- `/shipping/china-to-philippines`
- `/shipping/guangzhou-to-manila`
- `/shipping/yiwu-to-manila`
- `/shipping/shenzhen-to-manila`

These pages should be thin and accurate. Do not invent coverage, pricing, forwarder counts, or operational claims.

## Private / Forbidden Public Data

Never expose publicly:

- importer identities
- importer shipment requests unless a later explicit public-request decision exists
- quote amounts
- quote notes
- transit times tied to private quotes
- inclusions/exclusions from private quotes
- messages
- forwarder competitor data
- admin/safety report data
- internal suspension reasons
- Clerk IDs or internal profile IDs

## Out-Of-Scope Terms

- Review/rating.
- Content article.
- CMS entry.
- Payment/tracking page.
- ERP/service operations profile.
- Public request marketplace.
- Analytics funnel.
