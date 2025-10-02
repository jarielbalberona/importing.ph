import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  decimal
} from "drizzle-orm/pg-core";

import { users } from "./user.model";
import { shipments } from "./shipment.model";

// Service type enum
export const SERVICE_TYPE = pgEnum("service_type", ["door_to_door", "to_manila_warehouse"]);

// Quote status enum
export const QUOTE_STATUS = pgEnum("quote_status", ["submitted", "accepted", "rejected"]);

export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  shipment_id: uuid("shipment_id").references(() => shipments.id).notNull(),
  forwarder_id: uuid("forwarder_id").references(() => users.id).notNull(),
  all_in_cost: decimal("all_in_cost", { precision: 10, scale: 2 }).notNull(), // In PHP or USD
  eta_to_ph: decimal("eta_to_ph", { precision: 5, scale: 0 }).notNull(), // Days to PH
  eta_to_door: decimal("eta_to_door", { precision: 5, scale: 0 }), // Optional days to door
  service_type: SERVICE_TYPE("service_type").notNull(),
  notes: text("notes"), // Optional with permits, insurance, etc
  status: QUOTE_STATUS("status").default("submitted").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Relationships
export const quotesRelations = relations(quotes, ({ one }) => ({
  shipment: one(shipments, {
    fields: [quotes.shipment_id],
    references: [shipments.id]
  }),
  forwarder: one(users, {
    fields: [quotes.forwarder_id],
    references: [users.id]
  })
}));
