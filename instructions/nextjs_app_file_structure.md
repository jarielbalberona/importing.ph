# 📂 File Structure: `importing.ph/app` (Next.js 15 with Feature-Based Layout)

```
importing.ph/
└── app/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── dashboard/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── importer/
    │   │   │   └── page.tsx
    │   │   └── forwarder/
    │   │       └── page.tsx
    │   └── auth/
    │       ├── sign-in/
    │       │   └── page.tsx
    │       └── sign-up/
    │           └── page.tsx

    ├── src/
    │   ├── features/
    │   │   ├── auth/
    │   │   │   ├── api/
    │   │   │   │   └── clerk.ts
    │   │   │   └── hooks/
    │   │   │       └── useClerkUser.ts
    │   │   ├── users/
    │   │   │   ├── api/
    │   │   │   │   └── userClient.ts
    │   │   │   └── hooks/
    │   │   │       └── useRole.ts
    │   │   ├── shipments/
    │   │   │   ├── api/
    │   │   │   │   └── shipmentClient.ts
    │   │   │   ├── hooks/
    │   │   │   │   ├── queries/
    │   │   │   │   │   ├── useShipmentsQuery.ts
    │   │   │   │   │   └── useShipmentDetail.ts
    │   │   │   │   └── mutations/
    │   │   │   │       ├── useCreateShipment.ts
    │   │   │   │       └── useUpdateShipment.ts
    │   │   │   ├── components/
    │   │   │   │   ├── ShipmentForm.tsx
    │   │   │   │   ├── ShipmentList.tsx
    │   │   │   │   └── ShipmentCard.tsx
    │   │   │   ├── shipment.types.ts
    │   │   │   └── shipment.schema.ts
    │   │   ├── quotes/
    │   │   │   ├── api/
    │   │   │   │   └── quoteClient.ts
    │   │   │   ├── hooks/
    │   │   │   │   ├── queries/
    │   │   │   │   │   └── useQuotesByShipment.ts
    │   │   │   │   └── mutations/
    │   │   │   │       ├── useSubmitQuote.ts
    │   │   │   │       └── useAcceptQuote.ts
    │   │   │   ├── components/
    │   │   │   │   ├── QuoteCard.tsx
    │   │   │   │   └── QuoteList.tsx
    │   │   │   ├── quote.types.ts
    │   │   │   └── quote.schema.ts

    │   ├── components/
    │   │   ├── ui/
    │   │   │   ├── Button.tsx
    │   │   │   ├── Card.tsx
    │   │   │   └── Input.tsx
    │   │   ├── layout/
    │   │   │   ├── Sidebar.tsx
    │   │   │   └── Topbar.tsx

    │   ├── lib/
    │   │   ├── apiClient.ts
    │   │   ├── constants.ts
    │   │   ├── utils.ts
    │   │   └── authGuard.tsx

    │   ├── store/
    │   │   └── useSessionStore.ts

    │   └── types/
    │       └── global.ts

    ├── public/
    │   └── logo.svg

    ├── tailwind.config.ts
    ├── tsconfig.json
    └── .env.local
```
