# Frontend Architecture

Status: baseline / to be confirmed

Source: current repo inspection.

Current frontend stack:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- component layer under `components/`

Observed route groups include:

- public pages: `/`, `/about`, `/guides`, `/forwarder/[companySlug]`
- auth routes: `/sign-in`, `/sign-up`, `/after-auth`
- onboarding: `/onboarding`
- authenticated app shell: `/app/...`
- admin: `/admin`

Frontend behavior depends on server-side role enforcement through shared auth helpers rather than a separate SPA state architecture.

Current V1 product surfaces include:

- importer shipment request list with draft/post success state and launch checklist
- forwarder open-request list with launch checklist
- forwarder company profile screen with public-profile completeness meter
- shared importer/forwarder inbox client with conversation-level read/unread labels
- admin marketplace page with activity, users, requests, quotes, and forwarder safety controls

Status note:

- richer frontend state-management rules are not asserted here yet
- browser/runtime UX proof is still task-specific, not established globally
