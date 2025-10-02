```markdown
# importing.ph - v0.dev Context

## Project Structure
```
app/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Landing page
│   │   ├── dashboard/
│   │   │   ├── page.tsx            # Role selection
│   │   │   ├── importer/
│   │   │   │   └── page.tsx        # Importer dashboard
│   │   │   └── forwarder/
│   │   │       └── page.tsx        # Forwarder dashboard
│   │   ├── sign-in/[[...sign-in]]/
│   │   └── sign-up/[[...sign-up]]/
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── auth/
│   │   │   └── role-selection.tsx
│   │   ├── shipments/
│   │   │   ├── shipment-list.tsx
│   │   │   ├── create-shipment-dialog.tsx
│   │   │   └── open-shipments-list.tsx
│   │   └── quotes/
│   │       └── my-quotes-list.tsx
│   └── config/
│       └── site.ts
```

## Tech Stack
- Next.js 15 + React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Clerk authentication
- Zustand + React Query

## User Roles
- **Importer**: Posts shipments, receives quotes, accepts best offer
- **Forwarder**: Views open shipments, submits quotes, manages proposals

## Key Features
- Shipment posting and management
- Quote comparison and selection
- Role-based dashboards
- Real-time status updates
```