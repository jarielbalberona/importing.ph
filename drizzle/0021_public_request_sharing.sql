ALTER TABLE "shipment_requests"
  ADD COLUMN "public_share_token" text,
  ADD COLUMN "public_summary" text,
  ADD COLUMN "public_shared_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "shipment_requests"
  ADD CONSTRAINT "shipment_requests_public_share_token_format"
  CHECK ("public_share_token" IS NULL OR "public_share_token" ~ '^[A-Za-z0-9_-]{16}$'),
  ADD CONSTRAINT "shipment_requests_public_summary_length"
  CHECK ("public_summary" IS NULL OR char_length("public_summary") BETWEEN 10 AND 280);
--> statement-breakpoint
CREATE UNIQUE INDEX "shipment_requests_public_share_token_idx"
  ON "shipment_requests" USING btree ("public_share_token");
