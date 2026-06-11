# Backend Architecture

Status: baseline / to be confirmed

Source: current repo inspection.

Current backend behavior is implemented inside the same Next.js repo through:

- server actions
- Route Handlers
- shared library modules under `lib/`
- a custom `server.mjs` process that boots Next.js and handles realtime WebSocket connections

Authentication is handled by Clerk, but business authorization and business data live in the app database and app code.

Observed backend responsibility areas:

- onboarding profile creation
- role checks and redirects
- request, quote, messaging, notification, and admin queries/actions
- PSGC import and lookup
- attachment validation/storage orchestration
- realtime token handling and conversation subscription checks

Status note:

- no separate microservice architecture is present in current repo inspection
