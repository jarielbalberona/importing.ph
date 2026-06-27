# Backend Architecture

Status: baseline / to be confirmed

Source: current repo inspection.

Current backend behavior is implemented inside the same Next.js repo through:

- server actions
- Route Handlers
- shared library modules under `lib/`
- a custom `server.mjs` process that boots Next.js and handles realtime WebSocket connections

WebSockets are an approved V1 infrastructure seam only for quote-gated realtime
messaging and read-state updates. The WebSocket endpoint is `/api/realtime/ws`;
clients obtain short-lived realtime tokens from `/api/realtime/token`, and the
server checks profile and conversation relationships before allowing
subscriptions. This does not approve separate realtime services, queues, or
event buses.

Authentication is handled by Clerk, but business authorization and business data live in the app database and app code.

Observed backend responsibility areas:

- onboarding profile creation
- role checks and redirects
- request draft/post, quote edit/withdraw/decision, messaging, notification, and admin queries/actions
- PSGC import and lookup
- attachment validation/storage orchestration
- realtime token handling and conversation subscription checks
- best-effort Resend-backed marketplace email for events where local recipient email exists

Status note:

- no separate microservice architecture is present in current repo inspection
