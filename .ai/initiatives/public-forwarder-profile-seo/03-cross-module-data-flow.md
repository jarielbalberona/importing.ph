# Cross-Module Data Flow

## Public Forwarder Directory Flow

```text
/forwarders
-> public route
-> query only public-visible forwarder profiles
-> public-safe forwarder summary DTO
-> render directory
```

Rules:

- No authentication required.
- No importer data.
- No quote data.
- No message data.
- No internal IDs or Clerk IDs.

## Public Forwarder Profile Flow

```text
/forwarders/[slug]
-> public route
-> lookup by slug and public visibility
-> exclude suspended/hidden forwarders
-> public-safe forwarder detail DTO
-> generate route metadata
-> render profile
```

Hard requirements:

- Slug lookup must not reveal hidden/suspended profiles.
- Not-found behavior should not leak private company state.
- Route metadata must use public-safe fields only.

## Forwarder Visibility Control Flow

```text
admin or forwarder profile control
-> require authorized user
-> update public visibility / slug / public fields
-> public routes reflect only enabled profile
```

This initiative should only implement controls if current memory requires it. Otherwise define the data contract and defer the control UI.

## Route / Lane Page Flow

```text
/shipping/[lane]
-> public route
-> validate lane against allowed lane config or table
-> render factual route page
-> generate metadata
```

Examples:

- `china-to-philippines`
- `guangzhou-to-manila`
- `yiwu-to-manila`
- `shenzhen-to-manila`

Do not generate claims about pricing, forwarder availability, delivery speed, or quote volume unless the repository has verified data for those claims.

## Privacy Boundary

Forbidden data path:

```text
shipment requests / quotes / messages / importer profiles
-> public routes
```

Allowed data path:

```text
forwarder company public profile fields
-> public-safe DTO
-> public routes
```

If a query helper joins private marketplace tables for convenience, stop. Public pages should not need private marketplace rows.

## Metadata Flow

```text
public-safe entity
-> title / description / canonical fields
-> route metadata
```

Current repo only proves root static metadata. Route-specific metadata and sitemap behavior must be introduced deliberately if implementation proceeds.
