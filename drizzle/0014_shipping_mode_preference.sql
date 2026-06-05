DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'shipping_mode_preference'
  ) THEN
    CREATE TYPE "public"."shipping_mode_preference" AS ENUM('sea', 'air', 'either');
  END IF;
END
$$;--> statement-breakpoint

ALTER TABLE "shipment_requests"
ADD COLUMN IF NOT EXISTS "shipping_mode_preference" "shipping_mode_preference";--> statement-breakpoint

UPDATE "shipment_requests"
SET "shipping_mode_preference" = 'either'
WHERE "shipping_mode_preference" IS NULL;--> statement-breakpoint

ALTER TABLE "shipment_requests"
ALTER COLUMN "shipping_mode_preference" SET NOT NULL;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "shipment_requests_shipping_mode_preference_idx"
ON "shipment_requests" USING btree ("shipping_mode_preference");
