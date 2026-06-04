CREATE TYPE "public"."delivery_preference_v1" AS ENUM(
  'supplier_pickup_to_door',
  'china_warehouse_to_door',
  'supplier_pickup_to_ph_warehouse',
  'china_warehouse_to_ph_warehouse',
  'not_sure'
);--> statement-breakpoint

ALTER TABLE "shipment_requests"
  ALTER COLUMN "delivery_preference"
  TYPE "public"."delivery_preference_v1"
  USING (
    CASE "delivery_preference"::text
      WHEN 'door_to_door' THEN 'supplier_pickup_to_door'
      WHEN 'port_to_door' THEN 'china_warehouse_to_door'
      WHEN 'door_to_port' THEN 'supplier_pickup_to_ph_warehouse'
      WHEN 'port_to_port' THEN 'china_warehouse_to_ph_warehouse'
      WHEN 'not_sure' THEN 'not_sure'
    END
  )::"public"."delivery_preference_v1";--> statement-breakpoint

DROP TYPE "public"."delivery_preference";--> statement-breakpoint

ALTER TYPE "public"."delivery_preference_v1" RENAME TO "delivery_preference";--> statement-breakpoint
