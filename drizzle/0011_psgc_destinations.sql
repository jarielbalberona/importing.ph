CREATE TABLE "psgc_regions" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"geographic_level" text DEFAULT 'Reg' NOT NULL,
	"version" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "psgc_provinces" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"region_code" text NOT NULL,
	"geographic_level" text DEFAULT 'Prov' NOT NULL,
	"version" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "psgc_cities_municipalities" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"region_code" text NOT NULL,
	"province_code" text,
	"geographic_level" text NOT NULL,
	"version" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "psgc_barangays" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"region_code" text NOT NULL,
	"province_code" text,
	"city_municipality_code" text NOT NULL,
	"geographic_level" text DEFAULT 'Bgy' NOT NULL,
	"version" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shipment_requests" ADD COLUMN "destination_region_code" text;--> statement-breakpoint
ALTER TABLE "shipment_requests" ADD COLUMN "destination_region_name" text;--> statement-breakpoint
ALTER TABLE "shipment_requests" ADD COLUMN "destination_province_code" text;--> statement-breakpoint
ALTER TABLE "shipment_requests" ADD COLUMN "destination_province_name" text;--> statement-breakpoint
ALTER TABLE "shipment_requests" ADD COLUMN "destination_city_municipality_code" text;--> statement-breakpoint
ALTER TABLE "shipment_requests" ADD COLUMN "destination_city_municipality_name" text;--> statement-breakpoint
ALTER TABLE "shipment_requests" ADD COLUMN "destination_barangay_code" text;--> statement-breakpoint
ALTER TABLE "shipment_requests" ADD COLUMN "destination_barangay_name" text;--> statement-breakpoint
ALTER TABLE "shipment_requests" ADD COLUMN "destination_address_details" text;--> statement-breakpoint
ALTER TABLE "shipment_requests" ADD COLUMN "destination_display_name" text;--> statement-breakpoint
ALTER TABLE "psgc_provinces" ADD CONSTRAINT "psgc_provinces_region_code_psgc_regions_code_fk" FOREIGN KEY ("region_code") REFERENCES "public"."psgc_regions"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psgc_cities_municipalities" ADD CONSTRAINT "psgc_cities_municipalities_region_code_psgc_regions_code_fk" FOREIGN KEY ("region_code") REFERENCES "public"."psgc_regions"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psgc_cities_municipalities" ADD CONSTRAINT "psgc_cities_municipalities_province_code_psgc_provinces_code_fk" FOREIGN KEY ("province_code") REFERENCES "public"."psgc_provinces"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psgc_barangays" ADD CONSTRAINT "psgc_barangays_region_code_psgc_regions_code_fk" FOREIGN KEY ("region_code") REFERENCES "public"."psgc_regions"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psgc_barangays" ADD CONSTRAINT "psgc_barangays_province_code_psgc_provinces_code_fk" FOREIGN KEY ("province_code") REFERENCES "public"."psgc_provinces"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psgc_barangays" ADD CONSTRAINT "psgc_barangays_city_municipality_code_psgc_cities_municipalities_code_fk" FOREIGN KEY ("city_municipality_code") REFERENCES "public"."psgc_cities_municipalities"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "psgc_provinces_region_code_idx" ON "psgc_provinces" USING btree ("region_code");--> statement-breakpoint
CREATE INDEX "psgc_provinces_name_idx" ON "psgc_provinces" USING btree ("name");--> statement-breakpoint
CREATE INDEX "psgc_cities_municipalities_region_code_idx" ON "psgc_cities_municipalities" USING btree ("region_code");--> statement-breakpoint
CREATE INDEX "psgc_cities_municipalities_province_code_idx" ON "psgc_cities_municipalities" USING btree ("province_code");--> statement-breakpoint
CREATE INDEX "psgc_cities_municipalities_name_idx" ON "psgc_cities_municipalities" USING btree ("name");--> statement-breakpoint
CREATE INDEX "psgc_barangays_city_municipality_code_idx" ON "psgc_barangays" USING btree ("city_municipality_code");--> statement-breakpoint
CREATE INDEX "psgc_barangays_province_code_idx" ON "psgc_barangays" USING btree ("province_code");--> statement-breakpoint
CREATE INDEX "psgc_barangays_name_idx" ON "psgc_barangays" USING btree ("name");--> statement-breakpoint
CREATE INDEX "shipment_requests_destination_province_code_idx" ON "shipment_requests" USING btree ("destination_province_code");--> statement-breakpoint
CREATE INDEX "shipment_requests_destination_city_municipality_code_idx" ON "shipment_requests" USING btree ("destination_city_municipality_code");
