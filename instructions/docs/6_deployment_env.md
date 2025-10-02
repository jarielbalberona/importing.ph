# 📁 Deployment & Environment Setup

## .env.example
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Dev commands
```bash
pnpm dev            # Run frontend
pnpm dev:api        # Run backend (Express)
```

## Docker (optional)
```yaml
services:
  app:
    build: ./app
    ports: [3000:3000]
  api:
    build: ./api
    ports: [3001:3001]
```

## Route 53 & Terraform
Use Route 53 to map:
- importing.ph
- app.importing.ph
- api.importing.ph
```