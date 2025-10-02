-- Initial migration for importing.ph shipment marketplace
-- This replaces the old task-based schema with shipment/quote marketplace schema

-- Create role type enum
CREATE TYPE "public"."role_type" AS ENUM('importer', 'forwarder');

-- Create delivery type enum
CREATE TYPE "public"."delivery_type" AS ENUM('door_to_door', 'to_manila_warehouse');

-- Create shipment status enum
CREATE TYPE "public"."shipment_status" AS ENUM('open', 'quoted', 'accepted', 'closed');

-- Create service type enum
CREATE TYPE "public"."service_type" AS ENUM('door_to_door', 'to_manila_warehouse');

-- Create quote status enum
CREATE TYPE "public"."quote_status" AS ENUM('submitted', 'accepted', 'rejected');

-- Create users table
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" "role_type" NOT NULL,
	"company_name" text,
	"location" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create shipments table
CREATE TABLE "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"origin_city" text NOT NULL,
	"destination" text NOT NULL,
	"delivery_type" "delivery_type" NOT NULL,
	"cargo_volume" text NOT NULL,
	"item_type" text,
	"target_delivery_date" date,
	"notes" text,
	"status" "shipment_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create quotes table
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"forwarder_id" uuid NOT NULL,
	"all_in_cost" numeric(10,2) NOT NULL,
	"eta_to_ph" numeric(5,0) NOT NULL,
	"eta_to_door" numeric(5,0),
	"service_type" "service_type" NOT NULL,
	"notes" text,
	"status" "quote_status" DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_forwarder_id_users_id_fk" FOREIGN KEY ("forwarder_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
