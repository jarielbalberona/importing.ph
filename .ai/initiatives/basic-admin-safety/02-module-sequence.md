# Module Sequence

## Phase 1: Current Admin Safety Audit

Inspect and document current truth from:

- `app/admin/page.tsx`
- `lib/authz.ts`
- `lib/routes.ts`
- `db/schema.ts`
- `drizzle/`
- completed request/quote dependency artifacts
- report placeholders, if any
- suspension/trust placeholders, if any

Output:

- Current admin route behavior.
- Current user/profile schema.
- Current request/quote schema available from dependencies.
- Current report/suspension absence or presence.
- Gaps for admin reads and safety actions.

## Phase 2: Admin Access And Read-Only Views Plan

Define and implement minimal admin read-only visibility.

Expected sequence:

1. Confirm admin guard behavior.
2. Define admin user/profile list.
3. Define admin request list/detail visibility.
4. Define admin quote list/detail visibility.
5. Define report list visibility only if reports exist or are added in this initiative.
6. Ensure routes/actions are admin-only.

Keep the interface operational and boring. Admin needs inspection, not a back-office product.

## Phase 3: Suspension Safety Action Plan

Define and implement minimal suspension behavior.

Expected sequence:

1. Decide whether suspension lives on `user_profiles`, `forwarder_companies`, or both.
2. Add suspension fields or tables.
3. Add admin suspend/unsuspend action if unsuspend is needed.
4. Add quote submission suspension check.
5. Define behavior for signed-in suspended users.
6. Verify suspended forwarder cannot submit quote.
7. Verify normal forwarder can still submit quote.

## Phase 4: Reports Plan

Define and implement minimal reports only if still needed.

Expected sequence:

1. Confirm whether report model already exists.
2. Define report subject types.
3. Add basic report schema if absent and approved.
4. Add report creation only for safe existing subjects.
5. Add admin report list/detail if report schema is implemented.
6. Avoid advanced workflows.

If message reports are included, confirm `quote-gated-messaging` is complete first.

## Phase 5: Verification And Smoke Plan

Run automated verification and manual smoke.

Automated commands:

1. `npm run db:migrate`
2. `npm run db:check`
3. `npm run type-check`
4. `npm run lint`
5. `npm run build`

Smoke:

1. Non-admin cannot access admin routes.
2. Admin can view users.
3. Admin can view requests.
4. Admin can view quotes.
5. Admin can suspend forwarder.
6. Suspended forwarder cannot submit quote.
7. Normal forwarder can still submit quote.
