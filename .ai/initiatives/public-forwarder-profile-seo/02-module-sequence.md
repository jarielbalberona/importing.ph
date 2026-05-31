# Module Sequence

## Phase 1: Public SEO Current-State Audit

Inspect and document current truth from:

- `app/page.tsx`
- `app/layout.tsx`
- public route tree
- metadata conventions
- sitemap/robots presence or absence
- `db/schema.ts`
- completed forwarder/request/quote dependency artifacts
- landing components and UI primitives

Output:

- Current public routes.
- Current metadata conventions.
- Current forwarder company/profile data.
- Whether this remains deferred or is approved for execution.

## Phase 2: Public Forwarder Profile Data Plan

Define public-safe forwarder data and required schema changes.

Expected sequence:

1. Identify existing forwarder company fields.
2. Define public-safe fields.
3. Define private fields that must never be public.
4. Define slug requirements.
5. Define profile visibility requirements.
6. Define service profile compatibility if service profiles exist.
7. Define migration needs only if execution is approved.

## Phase 3: Public Routes And SEO Plan

Define directory/profile routes and future route/lane compatibility.

Expected sequence:

1. Define `/forwarders`.
2. Define `/forwarders/[slug]`.
3. Define route/lane page pattern for `/shipping/*`.
4. Define metadata conventions.
5. Define sitemap/robots implications only if repo supports or needs them.
6. Keep route content minimal and factual.

## Phase 4: Privacy And Safety Plan

Define public exposure rules.

Expected sequence:

1. Define no importer/request/quote/message leakage.
2. Define suspended forwarder visibility.
3. Define unverified/incomplete profile visibility.
4. Define admin or forwarder controls for public visibility.
5. Define public-safe DTO/query boundary.

## Phase 5: Verification And Smoke Plan

Run automated verification and manual smoke if implementation proceeds.

Automated commands:

1. `npm run type-check`
2. `npm run lint`
3. `npm run build`

Smoke:

1. Public profile renders only public-safe data.
2. Private marketplace data is not exposed.
3. Suspended forwarder behavior matches product rules.
4. Metadata renders correctly if implemented.
