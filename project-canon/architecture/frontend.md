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

Status note:

- richer frontend state-management rules are not asserted here yet
- browser/runtime UX proof is still task-specific, not established globally
