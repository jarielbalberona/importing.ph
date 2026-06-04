# Verification Plan

## Static Verification

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm test
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run build
git diff --check
node tools/ai-runner/index.mjs realtime-messaging-seen-v1 --check-only
```

## DB Verification

Because this initiative adds schema:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:migrate
PATH=/opt/homebrew/bin:/usr/local/bin:$PATH DATABASE_URL=postgresql://importing_ph:importing_ph_password@localhost:55432/importing_ph_dev npm run db:check
```

## Browser Smoke

- importer `a1+clerk_test@clerk.com`
- forwarder `a2+clerk_test@clerk.com`
- use `server.mjs`
- prove bidirectional realtime seen state and refresh persistence.

