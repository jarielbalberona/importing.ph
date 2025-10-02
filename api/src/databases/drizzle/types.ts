import { InferSelectModel } from "drizzle-orm";

import { ROLE_LIST, TOKEN_LIST } from "@/databases/drizzle/lists";
import { authentications } from "@/models/drizzle/authentication.model";
import { users } from "@/models/drizzle/user.model";

export type UserSchemaType = InferSelectModel<typeof users>;
export type AuthenticationSchemaType = InferSelectModel<typeof authentications>;

/**
 * Enum Schema Types
 */
export type RoleType = (typeof ROLE_LIST.enumValues)[number];
export type TokenType = (typeof TOKEN_LIST.enumValues)[number];
