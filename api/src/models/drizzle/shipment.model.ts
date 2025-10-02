import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  date
} from "drizzle-orm/pg-core";

import { users } from "./user.model";

// Delivery type enum
export const DELIVERY_TYPE = pgEnum("delivery_type", ["door_to_door", "to_manila_warehouse"]);

// Shipment status enum
export const SHIPMENT_STATUS = pgEnum("shipment_status", ["open", "quoted", "accepted", "closed"]);

export const shipments = pgTable("shipments", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id).notNull(), // Importer
  origin_city: text("origin_city").notNull(), // e.g. Guangzhou
  destination: text("destination").notNull(), // e.g. Dumaguete
  delivery_type: DELIVERY_TYPE("delivery_type").notNull(),
  cargo_volume: text("cargo_volume").notNull(), // e.g. 2 CBM / 200kg
  item_type: text("item_type"), // Optional
  target_delivery_date: date("target_delivery_date"), // Optional
  notes: text("notes"), // Optional additional instructions
  status: SHIPMENT_STATUS("status").default("open").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Relationships
export const shipmentsRelations = relations(shipments, ({ one, many }) => ({
  importer: one(users, {
    fields: [shipments.user_id],
    references: [users.id]
  }),
  quotes: many(quotes)
}));
