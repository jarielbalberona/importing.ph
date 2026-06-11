This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## PSGC Location Data

Shipment request destinations use PSGC-backed database tables. Seed JSON is not
bundled into the frontend. See:

- `project-canon/operations/environments.md`
- `project-canon/operations/deployment.md`
- `project-canon/operations/troubleshooting.md`

for the current canonical PSGC import and environment notes.

## Render Deployment

`render.yaml` builds with `npm ci && npm run build` and starts with
`npm run start`. It does not run database migrations or PSGC import during
deploy.

Before using `/app/requests/new` on a Render environment, run migrations and a
one-off PSGC import against that environment's database:

```bash
npm run db:migrate
PSGC_DATA_DIR=/path/to/psgc-json PSGC_VERSION=2025-2Q npm run db:import-psgc
```

The PSGC JSON files are intentionally gitignored. Provide them to the Render
runtime/job filesystem or run the command from a trusted machine with access to
the target `DATABASE_URL`. See the project-canon operations files above for the
current canonical deployment and troubleshooting notes.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy

This project currently targets Render, not Vercel.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
