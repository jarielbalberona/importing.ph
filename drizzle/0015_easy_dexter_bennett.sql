DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'quote_shipping_mode'
  ) THEN
    CREATE TYPE "public"."quote_shipping_mode" AS ENUM('sea', 'air');
  END IF;
END
$$;--> statement-breakpoint

ALTER TABLE "quotes"
ADD COLUMN IF NOT EXISTS "shipping_mode" "quote_shipping_mode";--> statement-breakpoint

UPDATE "quotes" AS q
SET "shipping_mode" = CASE
  WHEN sr."shipping_mode_preference" = 'air' THEN 'air'::"quote_shipping_mode"
  ELSE 'sea'::"quote_shipping_mode"
END
FROM "shipment_requests" AS sr
WHERE sr."id" = q."shipment_request_id"
  AND q."shipping_mode" IS NULL;--> statement-breakpoint

ALTER TABLE "quotes"
ALTER COLUMN "shipping_mode" SET NOT NULL;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "quotes_shipping_mode_idx"
ON "quotes" USING btree ("shipping_mode");
