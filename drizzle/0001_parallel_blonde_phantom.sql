CREATE TYPE "public"."cargo_type" AS ENUM('general_goods', 'electronics', 'apparel', 'machinery', 'furniture', 'food_or_beverage', 'cosmetics', 'other');--> statement-breakpoint
CREATE TYPE "public"."delivery_preference" AS ENUM('door_to_door', 'port_to_door', 'door_to_port', 'port_to_port', 'not_sure');--> statement-breakpoint
CREATE TYPE "public"."shipment_request_status" AS ENUM('draft', 'posted', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."shipping_preference" AS ENUM('lowest_cost', 'fastest', 'balanced', 'not_sure');--> statement-breakpoint
CREATE TABLE "shipment_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"importer_profile_id" uuid NOT NULL,
	"status" "shipment_request_status" DEFAULT 'posted' NOT NULL,
	"cargo_description" text NOT NULL,
	"cargo_type" "cargo_type" NOT NULL,
	"total_cbm" numeric(10, 3),
	"total_weight_kg" numeric(10, 2),
	"package_count" integer,
	"length_cm" numeric(10, 2),
	"width_cm" numeric(10, 2),
	"height_cm" numeric(10, 2),
	"declared_value" numeric(12, 2),
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"delivery_preference" "delivery_preference" NOT NULL,
	"shipping_preference" "shipping_preference" NOT NULL,
	"notes" text,
	"attachment_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shipment_requests" ADD CONSTRAINT "shipment_requests_importer_profile_id_importer_profiles_id_fk" FOREIGN KEY ("importer_profile_id") REFERENCES "public"."importer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "shipment_requests_importer_profile_id_idx" ON "shipment_requests" USING btree ("importer_profile_id");--> statement-breakpoint
CREATE INDEX "shipment_requests_status_idx" ON "shipment_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "shipment_requests_created_at_idx" ON "shipment_requests" USING btree ("created_at");