# Shipment request attachments

This upload foundation is deliberately narrow. It supports private shipment request attachments only.

## Architecture

- Original files are stored once in a private Cloudflare R2 bucket.
- The database stores `media_files.object_key` and metadata, not public URLs.
- Request linkage lives in `shipment_request_attachments`.
- Uploads before final request creation are `media_files.status = 'temporary'`.
- Final request submission atomically creates the request, links selected file IDs, and marks them `active`.
- Removing a temporary attachment marks its file row `deleted`. It does not delete the R2 object.
- Reads mint short-lived R2 signed GET URLs after authorization.

Already-issued signed URLs remain usable until expiry. Do not treat the URL itself as per-viewer authorization after issuance.

## Environment

Required in local/dev/staging/production:

```bash
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=importing-ph-private-dev
R2_ENDPOINT=https://your_cloudflare_account_id.r2.cloudflarestorage.com
R2_REGION=auto
R2_READ_URL_EXPIRES_SECONDS=900
```

`R2_ENDPOINT` may be omitted if `R2_ACCOUNT_ID` is present, but set it explicitly in Render to remove ambiguity.

## Rules

- Context: `shipment_request_attachment`
- Max size: 10 MB per file
- Max count: 5 files per request
- Allowed: JPG, PNG, WebP, PDF, DOC, DOCX, XLS, XLSX, CSV
- Browser MIME type is not trusted. Server-side byte/header inspection decides acceptance.
- Hidden, deleted, or temporary files do not mint read URLs.

## Manual proof checklist

1. Set the R2 env variables for the target environment.
2. Run `npm run db:migrate`.
3. Sign in as an importer.
4. Open `/app/requests/new`.
5. Reach Step 5.
6. Upload a valid image.
7. Upload a valid PDF.
8. Try an unsupported file and confirm a type-specific rejection.
9. Try a file over 10 MB and confirm a size-specific rejection.
10. Remove one uploaded file and confirm it disappears from the pending request.
11. Continue to Step 6 and confirm no request is created yet.
12. Click `Post request` once.
13. Confirm one `shipment_requests` row is created.
14. Confirm linked rows exist in `shipment_request_attachments`.
15. Confirm `media_files.object_key` is populated and no public URL is stored.
16. Confirm the object exists in the private R2 bucket.
17. Open the request detail page and open/download an attachment.
18. Confirm another unauthorized user cannot mint the attachment URL.

## Target deployment check

Before enabling this in staging or production, confirm Render has the R2 variables above. The app will fail uploads if R2 config is missing; that is intentional. Silent local fallback storage would be a fake feature and would hide production misconfiguration.
