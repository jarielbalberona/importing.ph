CREATE TYPE "public"."forwarder_member_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
UPDATE "forwarder_members"
SET "member_role" = 'member'
WHERE "member_role" NOT IN ('owner', 'admin', 'member');--> statement-breakpoint
ALTER TABLE "forwarder_members"
ALTER COLUMN "member_role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "forwarder_members"
ALTER COLUMN "member_role"
SET DATA TYPE "public"."forwarder_member_role"
USING "member_role"::"public"."forwarder_member_role";--> statement-breakpoint
ALTER TABLE "forwarder_members"
ALTER COLUMN "member_role"
SET DEFAULT 'owner';--> statement-breakpoint
