import { and, eq, isNull, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  conversations,
  forwarderMembers,
  importerProfiles,
  notifications,
} from "@/db/schema";
import { requireProfile } from "@/lib/authz";

export type AppBadgeState = {
  currentUserProfileId: string;
  accessibleConversationIds: string[];
  unreadConversationIds: string[];
  unreadMessageConversationCount: number;
  unreadNotificationCount: number;
};

export function buildUnreadConversationSet(input: {
  conversationIds: string[];
  currentUserProfileId: string;
  latestMessageByConversationId: Record<
    string,
    { id: string; senderUserProfileId: string } | undefined
  >;
  lastReadMessageIdByConversationId: Record<string, string | undefined>;
}) {
  const unreadConversationIds = new Set<string>();

  for (const conversationId of input.conversationIds) {
    const latestMessage = input.latestMessageByConversationId[conversationId];

    if (!latestMessage) {
      continue;
    }

    if (latestMessage.senderUserProfileId === input.currentUserProfileId) {
      continue;
    }

    const lastReadMessageId =
      input.lastReadMessageIdByConversationId[conversationId];

    if (lastReadMessageId !== latestMessage.id) {
      unreadConversationIds.add(conversationId);
    }
  }

  return unreadConversationIds;
}

export async function getAppBadgeStateForCurrentUser() {
  const profile = await requireProfile();
  return getAppBadgeStateForProfile(profile);
}

export async function getAppBadgeStateForProfile(profile: {
  id: string;
  role: "importer" | "forwarder" | "admin";
}) {

  if (profile.role === "admin") {
    return null;
  }

  const accessibleConversationIds = await getAccessibleConversationIds(
    profile.id,
    profile.role,
  );
  const unreadConversationIds = await getUnreadConversationIds(
    profile.id,
    profile.role,
  );
  const [notificationCountResult] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientUserProfileId, profile.id),
        ne(notifications.type, "message_received"),
        isNull(notifications.readAt),
      ),
    );

  return {
    currentUserProfileId: profile.id,
    accessibleConversationIds,
    unreadConversationIds,
    unreadMessageConversationCount: unreadConversationIds.length,
    unreadNotificationCount: notificationCountResult?.count ?? 0,
  } satisfies AppBadgeState;
}

async function getAccessibleConversationIds(userProfileId: string, role: "importer" | "forwarder") {
  const rows =
    role === "importer"
      ? await db
          .select({ id: conversations.id })
          .from(conversations)
          .innerJoin(
            importerProfiles,
            eq(conversations.importerProfileId, importerProfiles.id),
          )
          .where(eq(importerProfiles.userProfileId, userProfileId))
      : await db
          .select({ id: conversations.id })
          .from(conversations)
          .innerJoin(
            forwarderMembers,
            eq(conversations.forwarderCompanyId, forwarderMembers.forwarderCompanyId),
          )
          .where(eq(forwarderMembers.userProfileId, userProfileId));

  return rows.map((row) => row.id);
}

async function getUnreadConversationIds(userProfileId: string, role: "importer" | "forwarder") {
  const accessJoin =
    role === "importer"
      ? sql`
          inner join importer_profiles access_scope
            on access_scope.id = c.importer_profile_id
           and access_scope.user_profile_id = ${userProfileId}
        `
      : sql`
          inner join forwarder_members access_scope
            on access_scope.forwarder_company_id = c.forwarder_company_id
           and access_scope.user_profile_id = ${userProfileId}
        `;

  const result = await db.execute(sql`
    select c.id
    from conversations c
    ${accessJoin}
    inner join lateral (
      select m.id, m.sender_user_profile_id, m.created_at
      from messages m
      where m.conversation_id = c.id
      order by m.created_at desc
      limit 1
    ) latest on true
    left join conversation_read_states crs
      on crs.conversation_id = c.id
     and crs.user_profile_id = ${userProfileId}
    left join messages last_read_message
      on last_read_message.id = crs.last_read_message_id
    where latest.sender_user_profile_id <> ${userProfileId}
      and (
        crs.id is null
        or last_read_message.created_at < latest.created_at
      )
  `);

  return Array.from(result).map((row) => String(row.id));
}
