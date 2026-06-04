# Final Proof Report: Request Validation And PSGC Hardening

Final Verdict: `PASS WITH ISSUES`

## Summary

The `/app/requests/new` validation and PSGC destination hardening pass is proven locally and in a clean dependency environment.

The remaining issue is not application correctness: the repository-local `node_modules/@next/swc-darwin-arm64` install is damaged on this macOS machine and still fails local `pnpm build`/`pnpm dev` from the working tree. A fresh workspace with fresh dependencies builds successfully, so the SWC failure is classified as environment-only.

## Files Changed In Closure

- `scripts/import-psgc.ts`
- `docs/psgc-setup.md`
- `.ai/initiatives/request-validation-psgc-hardening/reports/final-proof-report.md`
- `.ai/state/current-state.md`
- `.ai/state/verification-status.md`
- `.ai/state/known-risks.md`

## Build Proof

Clean build environment:

- Source copied to `/tmp/importing-ph-clean-build`.
- Excluded local `node_modules`, `.next`, `.git`, and `data/psgc`.
- Fresh dependencies installed with `/opt/homebrew/bin/pnpm install --no-frozen-lockfile`.
- Build command: `/opt/homebrew/bin/pnpm build`.

Result:

- `PASS`
- `next build` compiled successfully and generated app routes, including `/app/requests/new` and `/v1/locations/*`.

Classification:

- Working-tree local SWC failure is environment-only.
- App code compiles in a clean dependency install.

## Official PSGC Import Proof

Seed files present locally:

- `data/psgc/regions.json`
- `data/psgc/provinces.json`
- `data/psgc/muncities.json`
- `data/psgc/barangays.json`

Import command:

```bash
pnpm db:import-psgc
```

Dry-run row counts:

- regions: `18`
- provinces/province-like parent rows: `117`
- cities/municipalities: `1656`
- barangays: `42011`

Real import:

- `PASS`
- Import completed as `PSGC 2025-2Q`.

Importer hardening completed during closure:

- Supports the local camelCase PSGC export shape.
- Reports missing seed files with setup guidance.
- Handles NCR with no province.
- Normalizes short HUC city pseudo-codes such as Makati `80300` to full PSGC code `1380300000`.
- Keeps raw 10-digit PSGC codes for runtime storage and display.

Live endpoint proof:

- `/v1/locations/regions`: returned PSGC regions.
- `/v1/locations/provinces?regionCode=0700000000`: returned Region VII provinces/province-like rows.
- `/v1/locations/cities-municipalities?provinceCode=0702200000`: returned Cebu cities/municipalities.
- `/v1/locations/cities-municipalities?regionCode=1300000000&q=Makati`: returned `City of Makati` with `provinceCode: null`.
- `/v1/locations/barangays?cityMunicipalityCode=1380300000&q=Bel-Air`: returned `Bel-Air` with `provinceCode: null`.

## Authenticated Browser Smoke

Browser session:

- In-app browser was already authenticated as an importer.
- Starting URL: `http://localhost:3001/app/requests`.

Verified behavior:

- Empty Step 1 blocked with friendly errors.
- Short description showed `Use at least 3 characters.`
- Missing cargo type showed friendly cargo type error.
- No raw Zod enum or internal schema message appeared in Step 1.
- Step 2 dimensions path passed with:
  - total weight `120`
  - package count `12`
  - dimensions `40 x 30 x 20 cm`
- Step 3 empty destination blocked.
- Normal PSGC path advanced:
  - Region VII
  - Cebu
  - Alcantara
  - Manga
- Changing destination to NCR showed `NCR has no province level...`.
- NCR path advanced directly from region to city:
  - National Capital Region (NCR)
  - City of Makati
  - Bel-Air
- Review displayed:
  - `Bel-Air, City of Makati, National Capital Region (NCR)`
  - `120 kg`
  - `12`
  - `40 x 30 x 20 cm`
- Entering Step 6 did not create a request.
- Double-clicking `Post request` created exactly one request.
- Created request stored structured NCR destination fields:
  - `destinationRegionCode = 1300000000`
  - `destinationProvinceCode = null`
  - `destinationCityMunicipalityCode = 1380300000`
  - `destinationBarangayCode = 1380300002`
  - `destinationDisplayName = Bel-Air, City of Makati, National Capital Region (NCR)`

Smoke cleanup:

- Exact request id `867fc074-ca24-47d3-91bd-8b4a9b22412e` was deleted after proof.

## Verification Commands

Passed:

- `/opt/homebrew/bin/pnpm lint`
- `/opt/homebrew/bin/pnpm type-check`
- `/opt/homebrew/bin/pnpm test`
- `/opt/homebrew/bin/pnpm db:check`
- `/opt/homebrew/bin/pnpm db:import-psgc -- --dry-run`
- `/opt/homebrew/bin/pnpm db:import-psgc`
- `/opt/homebrew/bin/pnpm build` in `/tmp/importing-ph-clean-build`

Blocked locally:

- Working-tree `pnpm build` and `pnpm dev` still fail when using the damaged local macOS SWC native package in `node_modules`.

## Remaining Risks

- Server-side idempotency token is still not implemented. The browser smoke proved current disabled state prevented accidental duplicate creation in the tested double-click case, but production-grade idempotency remains a separate hardening follow-up.
- The PSGC source files are local and gitignored. Staging/production must run the same import against the target database before location picker smoke can pass there.
- This is local authenticated browser proof, not Render/staging proof.

## Next Recommended Follow-Up

Add a server-side request idempotency key for final post actions before broad production traffic. Do not add it as part of this initiative unless explicitly approved.
