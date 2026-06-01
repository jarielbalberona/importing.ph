ALTER TYPE "public"."quote_status" ADD VALUE 'accepted' BEFORE 'withdrawn';--> statement-breakpoint
ALTER TYPE "public"."quote_status" ADD VALUE 'rejected' BEFORE 'withdrawn';--> statement-breakpoint
ALTER TYPE "public"."shipment_request_status" ADD VALUE 'quote_selected' BEFORE 'cancelled';
