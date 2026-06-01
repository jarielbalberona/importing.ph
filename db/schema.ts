import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "importer",
  "forwarder",
  "admin",
]);

export type UserRole = (typeof userRoleEnum.enumValues)[number];

export const shipmentRequestStatusEnum = pgEnum("shipment_request_status", [
  "draft",
  "posted",
  "quote_selected",
  "cancelled",
]);

export type ShipmentRequestStatus =
  (typeof shipmentRequestStatusEnum.enumValues)[number];

export const cargoTypeEnum = pgEnum("cargo_type", [
  "general_goods",
  "electronics",
  "apparel",
  "machinery",
  "furniture",
  "food_or_beverage",
  "cosmetics",
  "other",
]);

export type CargoType = (typeof cargoTypeEnum.enumValues)[number];

export const deliveryPreferenceEnum = pgEnum("delivery_preference", [
  "door_to_door",
  "port_to_door",
  "door_to_port",
  "port_to_port",
  "not_sure",
]);

export type DeliveryPreference =
  (typeof deliveryPreferenceEnum.enumValues)[number];

export const shippingPreferenceEnum = pgEnum("shipping_preference", [
  "lowest_cost",
  "fastest",
  "balanced",
  "not_sure",
]);

export type ShippingPreference =
  (typeof shippingPreferenceEnum.enumValues)[number];

export const quoteStatusEnum = pgEnum("quote_status", [
  "submitted",
  "accepted",
  "rejected",
  "withdrawn",
]);

export type QuoteStatus = (typeof quoteStatusEnum.enumValues)[number];

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    role: userRoleEnum("role").notNull(),
    fullName: text("full_name").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("user_profiles_clerk_user_id_idx").on(table.clerkUserId)],
);

export const importerProfiles = pgTable(
  "importer_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userProfileId: uuid("user_profile_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    companyName: text("company_name").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("importer_profiles_user_profile_id_idx").on(
      table.userProfileId,
    ),
  ],
);

export const forwarderCompanies = pgTable("forwarder_companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ...timestamps,
});

export const forwarderMembers = pgTable(
  "forwarder_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userProfileId: uuid("user_profile_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    forwarderCompanyId: uuid("forwarder_company_id")
      .notNull()
      .references(() => forwarderCompanies.id, { onDelete: "cascade" }),
    memberRole: text("member_role").notNull().default("owner"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("forwarder_members_user_profile_id_idx").on(
      table.userProfileId,
    ),
  ],
);

export const shipmentRequests = pgTable(
  "shipment_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    importerProfileId: uuid("importer_profile_id")
      .notNull()
      .references(() => importerProfiles.id, { onDelete: "cascade" }),
    status: shipmentRequestStatusEnum("status").notNull().default("posted"),
    cargoDescription: text("cargo_description").notNull(),
    cargoType: cargoTypeEnum("cargo_type").notNull(),
    totalCbm: numeric("total_cbm", { precision: 10, scale: 3 }),
    totalWeightKg: numeric("total_weight_kg", { precision: 10, scale: 2 }),
    packageCount: integer("package_count"),
    lengthCm: numeric("length_cm", { precision: 10, scale: 2 }),
    widthCm: numeric("width_cm", { precision: 10, scale: 2 }),
    heightCm: numeric("height_cm", { precision: 10, scale: 2 }),
    declaredValue: numeric("declared_value", { precision: 12, scale: 2 }),
    origin: text("origin").notNull(),
    destination: text("destination").notNull(),
    deliveryPreference: deliveryPreferenceEnum("delivery_preference").notNull(),
    shippingPreference: shippingPreferenceEnum("shipping_preference").notNull(),
    notes: text("notes"),
    attachmentNotes: text("attachment_notes"),
    ...timestamps,
  },
  (table) => [
    index("shipment_requests_importer_profile_id_idx").on(
      table.importerProfileId,
    ),
    index("shipment_requests_status_idx").on(table.status),
    index("shipment_requests_cargo_type_idx").on(table.cargoType),
    index("shipment_requests_delivery_preference_idx").on(
      table.deliveryPreference,
    ),
    index("shipment_requests_shipping_preference_idx").on(
      table.shippingPreference,
    ),
    index("shipment_requests_created_at_idx").on(table.createdAt),
  ],
);

export const quotes = pgTable(
  "quotes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shipmentRequestId: uuid("shipment_request_id")
      .notNull()
      .references(() => shipmentRequests.id, { onDelete: "cascade" }),
    forwarderCompanyId: uuid("forwarder_company_id")
      .notNull()
      .references(() => forwarderCompanies.id, { onDelete: "cascade" }),
    submittedByForwarderMemberId: uuid("submitted_by_forwarder_member_id")
      .notNull()
      .references(() => forwarderMembers.id, { onDelete: "restrict" }),
    status: quoteStatusEnum("status").notNull().default("submitted"),
    quoteAmount: numeric("quote_amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("PHP"),
    serviceOffered: text("service_offered").notNull(),
    estimatedTransitMinDays: integer("estimated_transit_min_days").notNull(),
    estimatedTransitMaxDays: integer("estimated_transit_max_days").notNull(),
    inclusions: text("inclusions").notNull(),
    exclusions: text("exclusions").notNull(),
    notes: text("notes"),
    validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("quotes_request_company_idx").on(
      table.shipmentRequestId,
      table.forwarderCompanyId,
    ),
    index("quotes_shipment_request_id_idx").on(table.shipmentRequestId),
    index("quotes_forwarder_company_id_idx").on(table.forwarderCompanyId),
    index("quotes_status_idx").on(table.status),
  ],
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shipmentRequestId: uuid("shipment_request_id")
      .notNull()
      .references(() => shipmentRequests.id, { onDelete: "cascade" }),
    importerProfileId: uuid("importer_profile_id")
      .notNull()
      .references(() => importerProfiles.id, { onDelete: "cascade" }),
    forwarderCompanyId: uuid("forwarder_company_id")
      .notNull()
      .references(() => forwarderCompanies.id, { onDelete: "cascade" }),
    openedByQuoteId: uuid("opened_by_quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("conversations_request_forwarder_company_idx").on(
      table.shipmentRequestId,
      table.forwarderCompanyId,
    ),
    index("conversations_importer_profile_id_idx").on(table.importerProfileId),
    index("conversations_forwarder_company_id_idx").on(
      table.forwarderCompanyId,
    ),
    index("conversations_shipment_request_id_idx").on(
      table.shipmentRequestId,
    ),
    index("conversations_opened_by_quote_id_idx").on(table.openedByQuoteId),
    index("conversations_updated_at_idx").on(table.updatedAt),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderUserProfileId: uuid("sender_user_profile_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    ...timestamps,
  },
  (table) => [
    index("messages_conversation_created_at_idx").on(
      table.conversationId,
      table.createdAt,
    ),
    index("messages_sender_user_profile_id_idx").on(
      table.senderUserProfileId,
    ),
  ],
);
