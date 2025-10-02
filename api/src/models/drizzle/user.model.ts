import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";

import { timestamps } from "@/databases/drizzle/helpers";

// Role enum for importers and forwarders
export const ROLE_TYPE = pgEnum("role_type", ["importer", "forwarder"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // Clerk user ID
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: ROLE_TYPE("role").notNull(),
  company_name: text("company_name"), // Optional, mainly for forwarders
  location: text("location"), // Optional, PH or China location
  ...timestamps
});