# Phase 3 Report: Importer UI Action Plan

Final status: `passed`

## Summary Of Changes

Added importer quote decision UI and server actions to the importer-owned request detail.

Changes:

- Added `app/app/requests/[requestId]/actions.ts`.
- Added `acceptQuote` and `rejectQuote` server actions.
- Added importer quote decision buttons on submitted quotes.
- Added accepted/rejected decision feedback through query params.
- Added expired quote display and blocked accept action for expired quotes.
- Kept accepted/rejected/withdrawn quotes read-only.
- Preserved proof-level quote comparison fields already present from `quote-submission-privacy`.

## Files Changed

- `app/app/requests/[requestId]/actions.ts`
- `app/app/requests/[requestId]/page.tsx`
- `lib/quotes.ts`
- `.ai/initiatives/importer-quote-comparison/phases/phase-3-importer-ui-action-plan.md`
- `.ai/initiatives/importer-quote-comparison/reports/phase-3-importer-ui-action-plan.md`
- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

## Implementation Notes

- Accept is shown only for submitted, non-expired quotes while the request is not already `quote_selected`.
- Reject is shown for submitted quotes.
- Expired state comes from the quote query as `isExpired`; the UI does not call time-dependent functions during render.
- Decision actions parse both `requestId` and `quoteId` as UUIDs.
- Decision actions rely on Phase 2 owner-guarded helpers for authorization and transaction safety.

## Verification Summary

Passed: 2.

Failed then repaired: 1.

Skipped: 0.

## Commands Run

- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run type-check`: pass.
- `PATH=/opt/homebrew/bin:/usr/local/bin:$PATH npm run lint`: initial fail, then pass after repair.

Failure excerpt:

```text
Error: Cannot call impure function during render
Date.now()
```

## Repairs Attempted

1. Lint failed because `Date.now()` was called during render.
   - Repair: moved expiry calculation into `getImporterVisibleQuotesForOwnedRequest()` as database-derived `isExpired`.
   - Result: `type-check` and `lint` passed.

## State Files Updated

- `.ai/state/current-state.md`
- `.ai/state/known-risks.md`
- `.ai/state/verification-status.md`

No decision update was made.

## Risks And Limitations

- accepted: Comparison UI is still compact/proof-level and not a full optimization or scoring interface.
- accepted: Accepting one quote does not auto-reject non-selected quotes.
- accepted: Rejected accepted quotes and unaccept/reopen remain unsupported.

## Next Phase Readiness

Ready for Phase 4: `phase-4-privacy-and-authorization-plan`.
