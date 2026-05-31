import {
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
