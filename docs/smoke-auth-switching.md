## Authenticated Browser Smoke: Importer vs Forwarder

For shipping-mode E2E smoke, do not rely on the same Clerk browser context when
switching roles.

- Use separate browser contexts/windows for importer and forwarder sessions.
- If you must reuse a single window, clear Clerk auth state before sign-in:
  - `localStorage.clear()`
  - `sessionStorage.clear()`
  - Reload (`window.location.reload()`)
  - Sign in with the target role account.

### Recommended local sequence

1. Open `/app/requests/new` as importer with a signed-in context.
2. Create the request.
3. Open a fresh browser context (or private window).
4. Visit `/sign-in` and sign in as forwarder.
5. Browse and quote the importer request.

Notes:

- Do not add role-switch bypasses in product code.
- Keep `shippingModePreference` and quote validation unchanged.
- If automated tooling still fails to switch, capture and clear Clerk cookie/storage
  keys before creating the new session.
