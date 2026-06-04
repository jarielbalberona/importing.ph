import {
  boolean,
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
  "bags_shoes_accessories",
  "cosmetics",
  "food_or_beverage",
  "furniture",
  "home_appliances",
  "machinery",
  "auto_motorcycle_parts",
  "construction_materials",
  "tools_hardware",
  "packaging_supplies",
  "plastic_paper_products",
  "resin_epoxy_adhesives",
  "chemicals_liquids",
  "paints_coatings_solvents",
  "batteries_power_banks",
  "fragile_items",
  "oversized_bulky_cargo",
  "branded_goods",
  "mixed_cargo",
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

export const notificationTypeEnum = pgEnum("notification_type", [
  "new_quote_received",
  "quote_accepted",
  "quote_rejected",
  "message_received",
]);

export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];

export const mediaFileContextEnum = pgEnum("media_file_context", [
  "shipment_request_attachment",
]);

export type MediaFileContext = (typeof mediaFileContextEnum.enumValues)[number];

export const mediaFileStatusEnum = pgEnum("media_file_status", [
  "temporary",
  "active",
  "deleted",
  "hidden",
]);

export type MediaFileStatus = (typeof mediaFileStatusEnum.enumValues)[number];

export const psgcRegions = pgTable("psgc_regions", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  geographicLevel: text("geographic_level").notNull().default("Reg"),
  version: text("version").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const psgcProvinces = pgTable(
  "psgc_provinces",
  {
    code: text("code").primaryKey(),
    name: text("name").notNull(),
    regionCode: text("region_code")
      .notNull()
      .references(() => psgcRegions.code, { onDelete: "restrict" }),
    geographicLevel: text("geographic_level").notNull().default("Prov"),
    version: text("version").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("psgc_provinces_region_code_idx").on(table.regionCode),
    index("psgc_provinces_name_idx").on(table.name),
  ],
);

export const psgcCitiesMunicipalities = pgTable(
  "psgc_cities_municipalities",
  {
    code: text("code").primaryKey(),
    name: text("name").notNull(),
    regionCode: text("region_code")
      .notNull()
      .references(() => psgcRegions.code, { onDelete: "restrict" }),
    provinceCode: text("province_code").references(() => psgcProvinces.code, {
      onDelete: "restrict",
    }),
    geographicLevel: text("geographic_level").notNull(),
    version: text("version").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("psgc_cities_municipalities_region_code_idx").on(table.regionCode),
    index("psgc_cities_municipalities_province_code_idx").on(table.provinceCode),
    index("psgc_cities_municipalities_name_idx").on(table.name),
  ],
);

export const psgcBarangays = pgTable(
  "psgc_barangays",
  {
    code: text("code").primaryKey(),
    name: text("name").notNull(),
    regionCode: text("region_code")
      .notNull()
      .references(() => psgcRegions.code, { onDelete: "restrict" }),
    provinceCode: text("province_code").references(() => psgcProvinces.code, {
      onDelete: "restrict",
    }),
    cityMunicipalityCode: text("city_municipality_code")
      .notNull()
      .references(() => psgcCitiesMunicipalities.code, {
        onDelete: "restrict",
      }),
    geographicLevel: text("geographic_level").notNull().default("Bgy"),
    version: text("version").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("psgc_barangays_city_municipality_code_idx").on(
      table.cityMunicipalityCode,
    ),
    index("psgc_barangays_province_code_idx").on(table.provinceCode),
    index("psgc_barangays_name_idx").on(table.name),
  ],
);

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
    location: text("location"),
    contactPhone: text("contact_phone"),
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
  contactPerson: text("contact_person"),
  contactEmail: text("contact_email"),
  originCities: text("origin_cities"),
  destinationAreas: text("destination_areas"),
  shippingModes: text("shipping_modes"),
  serviceDescription: text("service_description"),
  isSuspended: boolean("is_suspended").notNull().default(false),
  suspendedAt: timestamp("suspended_at", { withTimezone: true }),
  suspendedReason: text("suspended_reason"),
  suspendedByUserProfileId: uuid("suspended_by_user_profile_id").references(
    () => userProfiles.id,
    { onDelete: "set null" },
  ),
  ...timestamps,
});

export const forwarderQuoteDefaults = pgTable(
  "forwarder_quote_defaults",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    forwarderCompanyId: uuid("forwarder_company_id")
      .notNull()
      .references(() => forwarderCompanies.id, { onDelete: "cascade" }),
    currency: text("currency").notNull().default("PHP"),
    serviceOffered: text("service_offered"),
    transitMinDays: integer("transit_min_days"),
    transitMaxDays: integer("transit_max_days"),
    inclusions: text("inclusions"),
    exclusions: text("exclusions"),
    notes: text("notes"),
    validForDays: integer("valid_for_days"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("forwarder_quote_defaults_company_id_idx").on(
      table.forwarderCompanyId,
    ),
  ],
);

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
    destinationRegionCode: text("destination_region_code"),
    destinationRegionName: text("destination_region_name"),
    destinationProvinceCode: text("destination_province_code"),
    destinationProvinceName: text("destination_province_name"),
    destinationCityMunicipalityCode: text("destination_city_municipality_code"),
    destinationCityMunicipalityName: text("destination_city_municipality_name"),
    destinationBarangayCode: text("destination_barangay_code"),
    destinationBarangayName: text("destination_barangay_name"),
    destinationAddressDetails: text("destination_address_details"),
    destinationDisplayName: text("destination_display_name"),
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
    index("shipment_requests_destination_province_code_idx").on(
      table.destinationProvinceCode,
    ),
    index("shipment_requests_destination_city_municipality_code_idx").on(
      table.destinationCityMunicipalityCode,
    ),
    index("shipment_requests_created_at_idx").on(table.createdAt),
  ],
);

export const mediaFiles = pgTable(
  "media_files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerUserProfileId: uuid("owner_user_profile_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    importerProfileId: uuid("importer_profile_id").references(
      () => importerProfiles.id,
      { onDelete: "set null" },
    ),
    context: mediaFileContextEnum("context").notNull(),
    objectKey: text("object_key").notNull(),
    originalFilename: text("original_filename").notNull(),
    contentType: text("content_type").notNull(),
    detectedContentType: text("detected_content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    checksumSha256: text("checksum_sha256").notNull(),
    status: mediaFileStatusEnum("status").notNull().default("temporary"),
    attachedAt: timestamp("attached_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("media_files_object_key_idx").on(table.objectKey),
    index("media_files_owner_context_status_idx").on(
      table.ownerUserProfileId,
      table.context,
      table.status,
    ),
    index("media_files_importer_profile_id_idx").on(table.importerProfileId),
    index("media_files_status_created_at_idx").on(table.status, table.createdAt),
  ],
);

export const shipmentRequestAttachments = pgTable(
  "shipment_request_attachments",
  {
    shipmentRequestId: uuid("shipment_request_id")
      .notNull()
      .references(() => shipmentRequests.id, { onDelete: "cascade" }),
    fileId: uuid("file_id")
      .notNull()
      .references(() => mediaFiles.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("shipment_request_attachments_request_file_idx").on(
      table.shipmentRequestId,
      table.fileId,
    ),
    index("shipment_request_attachments_file_id_idx").on(table.fileId),
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

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recipientUserProfileId: uuid("recipient_user_profile_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    actorUserProfileId: uuid("actor_user_profile_id").references(
      () => userProfiles.id,
      { onDelete: "set null" },
    ),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    linkHref: text("link_href").notNull(),
    sourceShipmentRequestId: uuid("source_shipment_request_id").references(
      () => shipmentRequests.id,
      { onDelete: "cascade" },
    ),
    sourceQuoteId: uuid("source_quote_id").references(() => quotes.id, {
      onDelete: "cascade",
    }),
    sourceConversationId: uuid("source_conversation_id").references(
      () => conversations.id,
      { onDelete: "cascade" },
    ),
    sourceMessageId: uuid("source_message_id").references(() => messages.id, {
      onDelete: "cascade",
    }),
    dedupeKey: text("dedupe_key").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("notifications_dedupe_key_idx").on(table.dedupeKey),
    index("notifications_recipient_created_at_idx").on(
      table.recipientUserProfileId,
      table.createdAt,
    ),
    index("notifications_recipient_read_at_idx").on(
      table.recipientUserProfileId,
      table.readAt,
    ),
    index("notifications_type_idx").on(table.type),
    index("notifications_source_shipment_request_id_idx").on(
      table.sourceShipmentRequestId,
    ),
    index("notifications_source_quote_id_idx").on(table.sourceQuoteId),
    index("notifications_source_conversation_id_idx").on(
      table.sourceConversationId,
    ),
  ],
);
