# Architecture Overview

Status: baseline / to be confirmed

Source: current repo inspection.

The current implementation is a single Next.js App Router application with:

- React frontend routes and components
- server-side auth and role checks
- Route Handlers and server actions
- PostgreSQL as business-data storage
- Drizzle ORM and SQL migrations
- a custom Node server for Next.js plus WebSocket realtime handling

Realtime messaging is implemented as part of the monolith. The approved V1
shape is `server.mjs` hosting `/api/realtime/ws` for quote-gated messaging and
read-state updates, with relationship checks before subscription.

The app is monolithic at deployment level.

Bounded major surfaces:

- public marketing/guides/profile pages
- authenticated app shell
- onboarding and role routing
- admin marketplace safety
- request, quote, message, notification, and profile data access
- PSGC location lookup endpoints
- private attachment upload/read flow with R2-backed object storage

Not yet claimed:

- complete architecture audit
- horizontally scaled realtime behavior proof
- full background-job model
