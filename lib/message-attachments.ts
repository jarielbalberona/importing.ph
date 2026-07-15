import { randomBytes } from "node:crypto";
import { extname } from "node:path";

import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { db, type Database } from "@/db";
import {
  conversations,
  forwarderMembers,
  importerProfiles,
  mediaFiles,
  messageAttachments,
  messages,
  type UserRole,
} from "@/db/schema";
import {
  maxBytesForMessageContentType,
  messageAttachmentContentTypes,
  messageAttachmentMaxCount,
  messageAttachmentMaxTotalBytes,
} from "@/lib/file-rules";
import {
  claimedTypeMatches,
  detectContentType,
  extensionMatches,
  sanitizeFilename,
  UploadValidationError,
} from "@/lib/file-validation";
import {
  createPresignedR2PutUrl,
  deleteR2Object,
  getR2ObjectRange,
  headR2Object,
} from "@/lib/r2-storage";

const supportedExtensions = new Map([
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
  ["mp4", "video/mp4"],
  ["webm", "video/webm"],
  ["mov", "video/quicktime"],
  ["pdf", "application/pdf"],
  ["doc", "application/msword"],
  ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ["xls", "application/vnd.ms-excel"],
  ["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ["csv", "text/csv"],
]);

export type MessageAttachment = {
  id: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  downloadUrl: string;
};

export const messageAttachmentAuthorizationSchema = z.object({
  conversationId: z.string().uuid(),
  filename: z.string().trim().min(1).max(180),
  contentType: z.enum(messageAttachmentContentTypes),
  sizeBytes: z.number().int().positive(),
});

export async function canProfileAccessConversation(
  profile: { id: string; role: UserRole },
  conversationId: string,
  database: Pick<Database, "select"> = db,
) {
  if (profile.role === "importer") {
    const [row] = await database
      .select({ id: conversations.id })
      .from(conversations)
      .innerJoin(
        importerProfiles,
        eq(conversations.importerProfileId, importerProfiles.id),
      )
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(importerProfiles.userProfileId, profile.id),
        ),
      )
      .limit(1);
    return Boolean(row);
  }

  if (profile.role === "forwarder") {
    const [row] = await database
      .select({ id: conversations.id })
      .from(conversations)
      .innerJoin(
        forwarderMembers,
        eq(conversations.forwarderCompanyId, forwarderMembers.forwarderCompanyId),
      )
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(forwarderMembers.userProfileId, profile.id),
        ),
      )
      .limit(1);
    return Boolean(row);
  }

  return false;
}

export async function authorizeMessageAttachmentUpload(
  profile: { id: string; role: UserRole },
  rawInput: unknown,
) {
  const input = messageAttachmentAuthorizationSchema.parse(rawInput);
  if (!(await canProfileAccessConversation(profile, input.conversationId))) {
    throw new MessageAttachmentAccessError();
  }

  const extension = extname(input.filename).slice(1).toLowerCase();
  const expectedType = supportedExtensions.get(extension);
  if (!expectedType || expectedType !== input.contentType) {
    throw new UploadValidationError(
      "invalid_file",
      "The filename extension and declared file type do not match.",
    );
  }
  if (input.sizeBytes > maxBytesForMessageContentType(input.contentType)) {
    throw new UploadValidationError(
      "too_large",
      input.contentType.startsWith("video/")
        ? "Videos must be 50 MB or smaller."
        : "Images and documents must be 10 MB or smaller.",
    );
  }

  const pending = await db
    .select({ sizeBytes: mediaFiles.sizeBytes })
    .from(mediaFiles)
    .where(
      and(
        eq(mediaFiles.ownerUserProfileId, profile.id),
        eq(mediaFiles.conversationId, input.conversationId),
        eq(mediaFiles.context, "conversation_message_attachment"),
        eq(mediaFiles.status, "temporary"),
      ),
    );
  if (pending.length >= messageAttachmentMaxCount) {
    throw new UploadValidationError("invalid_file", "A message can contain up to 5 files.");
  }
  if (
    pending.reduce((sum, file) => sum + file.sizeBytes, 0) + input.sizeBytes >
    messageAttachmentMaxTotalBytes
  ) {
    throw new UploadValidationError(
      "too_large",
      "Attachments for one message cannot exceed 100 MB total.",
    );
  }

  const filename = sanitizeFilename(input.filename);
  const objectKey = buildTemporaryObjectKey(profile.id, input.conversationId, extension);
  const [file] = await db
    .insert(mediaFiles)
    .values({
      ownerUserProfileId: profile.id,
      conversationId: input.conversationId,
      context: "conversation_message_attachment",
      objectKey,
      originalFilename: filename,
      contentType: input.contentType,
      detectedContentType: "",
      sizeBytes: input.sizeBytes,
      checksumSha256: null,
      status: "temporary",
    })
    .returning({ id: mediaFiles.id });
  const signed = createPresignedR2PutUrl({
    objectKey,
    contentType: input.contentType,
    expiresInSeconds: 600,
  });

  return {
    fileId: file.id,
    uploadUrl: signed.url,
    expiresAt: signed.expiresAt.toISOString(),
    filename,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
  };
}

export async function finalizeMessageAttachmentUpload(
  profile: { id: string; role: UserRole },
  fileId: string,
) {
  const file = await getOwnedTemporaryFile(profile, fileId);
  if (!file || !(await canProfileAccessConversation(profile, file.conversationId))) {
    throw new MessageAttachmentAccessError();
  }

  const head = await headR2Object(file.objectKey);
  const actualSize = Number(head?.headers.get("content-length"));
  const storedType = head?.headers.get("content-type")?.split(";")[0].trim();
  if (!head || !Number.isSafeInteger(actualSize) || actualSize <= 0) {
    throw new UploadValidationError("invalid_file", "The uploaded object is incomplete.");
  }
  if (actualSize !== file.sizeBytes || storedType !== file.contentType) {
    throw new UploadValidationError(
      "invalid_file",
      "The uploaded file does not match the authorized upload.",
    );
  }
  if (actualSize > maxBytesForMessageContentType(file.contentType)) {
    throw new UploadValidationError("too_large", "The uploaded file is too large.");
  }

  const inspectionRange = file.contentType.startsWith("video/")
    ? `bytes=0-${Math.min(actualSize - 1, 4 * 1024 * 1024 - 1)}`
    : undefined;
  const object = await getR2ObjectRange(file.objectKey, inspectionRange);
  if (!object?.body) {
    throw new UploadValidationError("invalid_file", "The uploaded object is unavailable.");
  }
  const bytes = Buffer.from(await object.arrayBuffer());
  const detected = await detectContentType(bytes, file.originalFilename);
  if (
    !detected ||
    !extensionMatches(file.originalFilename, detected.extension) ||
    !claimedTypeMatches(file.contentType, detected.contentType)
  ) {
    throw new UploadValidationError(
      "invalid_file",
      "The file extension or declared type does not match its contents.",
    );
  }

  const [verified] = await db
    .update(mediaFiles)
    .set({
      detectedContentType: detected.contentType,
      sizeBytes: actualSize,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(mediaFiles.id, file.id),
        eq(mediaFiles.status, "temporary"),
        eq(mediaFiles.ownerUserProfileId, profile.id),
      ),
    )
    .returning({
      id: mediaFiles.id,
      originalFilename: mediaFiles.originalFilename,
      contentType: mediaFiles.detectedContentType,
      sizeBytes: mediaFiles.sizeBytes,
    });
  if (!verified) throw new MessageAttachmentAccessError();
  return toAttachment(verified);
}

export async function cancelMessageAttachmentUpload(
  profile: { id: string; role: UserRole },
  fileId: string,
) {
  const file = await getOwnedTemporaryFile(profile, fileId);
  if (!file) return false;
  await deleteR2Object(file.objectKey);
  const [deleted] = await db
    .update(mediaFiles)
    .set({ status: "deleted", updatedAt: new Date() })
    .where(
      and(
        eq(mediaFiles.id, file.id),
        eq(mediaFiles.ownerUserProfileId, profile.id),
        eq(mediaFiles.status, "temporary"),
      ),
    )
    .returning({ id: mediaFiles.id });
  return Boolean(deleted);
}

export async function getMessageAttachmentDownloadForProfile(
  profile: { id: string; role: UserRole },
  fileId: string,
) {
  const [file] = await db
    .select({
      id: mediaFiles.id,
      conversationId: messages.conversationId,
      objectKey: mediaFiles.objectKey,
      originalFilename: mediaFiles.originalFilename,
      contentType: mediaFiles.detectedContentType,
      sizeBytes: mediaFiles.sizeBytes,
    })
    .from(messageAttachments)
    .innerJoin(mediaFiles, eq(messageAttachments.fileId, mediaFiles.id))
    .innerJoin(messages, eq(messageAttachments.messageId, messages.id))
    .where(
      and(
        eq(mediaFiles.id, fileId),
        eq(mediaFiles.context, "conversation_message_attachment"),
        eq(mediaFiles.status, "active"),
      ),
    )
    .limit(1);
  if (!file || !(await canProfileAccessConversation(profile, file.conversationId))) {
    return null;
  }
  return file;
}

export async function listAttachmentsForMessages(messageIds: string[]) {
  if (messageIds.length === 0) return new Map<string, MessageAttachment[]>();
  const rows = await db
    .select({
      messageId: messageAttachments.messageId,
      id: mediaFiles.id,
      originalFilename: mediaFiles.originalFilename,
      contentType: mediaFiles.detectedContentType,
      sizeBytes: mediaFiles.sizeBytes,
      displayPosition: messageAttachments.displayPosition,
    })
    .from(messageAttachments)
    .innerJoin(mediaFiles, eq(messageAttachments.fileId, mediaFiles.id))
    .where(
      and(
        inArray(messageAttachments.messageId, messageIds),
        eq(mediaFiles.status, "active"),
      ),
    )
    .orderBy(messageAttachments.messageId, messageAttachments.displayPosition);
  const result = new Map<string, MessageAttachment[]>();
  for (const row of rows) {
    const current = result.get(row.messageId) ?? [];
    current.push(toAttachment(row));
    result.set(row.messageId, current);
  }
  return result;
}

export async function attachFilesToMessage(
  tx: Pick<typeof db, "select" | "insert" | "update">,
  input: {
    messageId: string;
    conversationId: string;
    ownerUserProfileId: string;
    fileIds: string[];
  },
) {
  const fileIds = Array.from(new Set(input.fileIds));
  if (fileIds.length === 0) return [];
  if (fileIds.length > messageAttachmentMaxCount) {
    throw new MessageAttachmentValidationError("too_many_files");
  }
  const files = await tx
    .select({
      id: mediaFiles.id,
      originalFilename: mediaFiles.originalFilename,
      contentType: mediaFiles.detectedContentType,
      sizeBytes: mediaFiles.sizeBytes,
    })
    .from(mediaFiles)
    .where(
      and(
        inArray(mediaFiles.id, fileIds),
        eq(mediaFiles.ownerUserProfileId, input.ownerUserProfileId),
        eq(mediaFiles.conversationId, input.conversationId),
        eq(mediaFiles.context, "conversation_message_attachment"),
        eq(mediaFiles.status, "temporary"),
        sql`${mediaFiles.verifiedAt} is not null`,
      ),
    );
  if (files.length !== fileIds.length) {
    throw new MessageAttachmentValidationError("unavailable_attachment");
  }
  if (files.reduce((sum, file) => sum + file.sizeBytes, 0) > messageAttachmentMaxTotalBytes) {
    throw new MessageAttachmentValidationError("attachments_too_large");
  }

  await tx.insert(messageAttachments).values(
    fileIds.map((fileId, displayPosition) => ({
      messageId: input.messageId,
      fileId,
      displayPosition,
    })),
  );
  const now = new Date();
  await tx
    .update(mediaFiles)
    .set({ status: "active", attachedAt: now, updatedAt: now })
    .where(inArray(mediaFiles.id, fileIds));

  const byId = new Map(files.map((file) => [file.id, file]));
  return fileIds.map((fileId) => toAttachment(byId.get(fileId)!));
}

export function messageAttachmentPreview(attachments: MessageAttachment[]) {
  const first = attachments[0];
  if (!first) return "";
  if (first.contentType.startsWith("image/")) return "Photo";
  if (first.contentType.startsWith("video/")) return "Video";
  if (first.contentType === "application/pdf") return "PDF";
  return "Attachment";
}

export class MessageAttachmentAccessError extends Error {
  constructor() {
    super("forbidden");
  }
}

export class MessageAttachmentValidationError extends Error {
  constructor(readonly code: "too_many_files" | "attachments_too_large" | "unavailable_attachment") {
    super(code);
  }
}

async function getOwnedTemporaryFile(
  profile: { id: string },
  fileId: string,
) {
  const [file] = await db
    .select({
      id: mediaFiles.id,
      conversationId: mediaFiles.conversationId,
      objectKey: mediaFiles.objectKey,
      originalFilename: mediaFiles.originalFilename,
      contentType: mediaFiles.contentType,
      sizeBytes: mediaFiles.sizeBytes,
    })
    .from(mediaFiles)
    .where(
      and(
        eq(mediaFiles.id, fileId),
        eq(mediaFiles.ownerUserProfileId, profile.id),
        eq(mediaFiles.context, "conversation_message_attachment"),
        eq(mediaFiles.status, "temporary"),
      ),
    )
    .limit(1);
  return file?.conversationId ? { ...file, conversationId: file.conversationId } : null;
}

function toAttachment(file: {
  id: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
}): MessageAttachment {
  return {
    ...file,
    downloadUrl: `/api/media/message-attachments/${file.id}`,
  };
}

function buildTemporaryObjectKey(
  userProfileId: string,
  conversationId: string,
  extension: string,
) {
  const token = randomBytes(16).toString("hex");
  return `temporary/conversation-message-attachments/${conversationId}/${userProfileId}/${Date.now()}-${token}.${extension}`;
}
