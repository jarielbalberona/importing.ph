import assert from "node:assert/strict";
import test from "node:test";

import { buildUnreadConversationSet } from "@/lib/app-badges";

test("one sender can send multiple unread messages without increasing the badge past one conversation", () => {
  const unreadConversationIds = buildUnreadConversationSet({
    conversationIds: ["conversation-1"],
    currentUserProfileId: "user-a",
    latestMessageByConversationId: {
      "conversation-1": {
        id: "message-10",
        senderUserProfileId: "user-b",
      },
    },
    lastReadMessageIdByConversationId: {
      "conversation-1": "message-3",
    },
  });

  assert.deepEqual([...unreadConversationIds], ["conversation-1"]);
});

test("two conversations with unread incoming messages produce a count of two", () => {
  const unreadConversationIds = buildUnreadConversationSet({
    conversationIds: ["conversation-1", "conversation-2"],
    currentUserProfileId: "user-a",
    latestMessageByConversationId: {
      "conversation-1": {
        id: "message-4",
        senderUserProfileId: "user-b",
      },
      "conversation-2": {
        id: "message-8",
        senderUserProfileId: "user-c",
      },
    },
    lastReadMessageIdByConversationId: {
      "conversation-1": "message-2",
      "conversation-2": undefined,
    },
  });

  assert.equal(unreadConversationIds.size, 2);
  assert.deepEqual([...unreadConversationIds].sort(), [
    "conversation-1",
    "conversation-2",
  ]);
});

test("opening a conversation and reading the latest message removes it from the unread set", () => {
  const unreadConversationIds = buildUnreadConversationSet({
    conversationIds: ["conversation-1", "conversation-2"],
    currentUserProfileId: "user-a",
    latestMessageByConversationId: {
      "conversation-1": {
        id: "message-4",
        senderUserProfileId: "user-b",
      },
      "conversation-2": {
        id: "message-8",
        senderUserProfileId: "user-c",
      },
    },
    lastReadMessageIdByConversationId: {
      "conversation-1": "message-4",
      "conversation-2": undefined,
    },
  });

  assert.deepEqual([...unreadConversationIds], ["conversation-2"]);
});

test("outgoing latest messages do not count as unread conversations", () => {
  const unreadConversationIds = buildUnreadConversationSet({
    conversationIds: ["conversation-1", "conversation-2"],
    currentUserProfileId: "user-a",
    latestMessageByConversationId: {
      "conversation-1": {
        id: "message-4",
        senderUserProfileId: "user-a",
      },
      "conversation-2": {
        id: "message-8",
        senderUserProfileId: "user-c",
      },
    },
    lastReadMessageIdByConversationId: {},
  });

  assert.deepEqual([...unreadConversationIds], ["conversation-2"]);
});
