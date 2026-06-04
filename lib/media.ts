import { randomBytes } from "node:crypto";

import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  forwarderMembers,
  importerProfiles,
  mediaFiles,
  quotes,
  shipmentRequestAttachments,
  shipmentRequests,
  type MediaFileContext,
  type UserRole,
} from "@/db/schema";
import { requireProfile, requireRole } from "@/lib/authz";
import { mediaContextRules } from "@/lib/file-rules";
import { putR2Object, createSignedR2ReadUrl } from "@/lib/r2-storage";
import { validateUploadFile } from "@/lib/file-validation";

export type UploadedMediaFile = {
  id: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  status: string;
};

export async function uploadShipmentRequestAttachment(file: File) {
  const { profile, importerProfile } = await requireImporterProfileForMedia();
  const context: MediaFileContext = "shipment_request_attachment";
  const validated = await validateUploadFile(file, context);
  const objectKey = buildObjectKey(context, profile.id, validated.extension);

  await putR2Object({
    objectKey,
    body: validated.bytes,
    contentType: validated.contentType,
    sizeBytes: validated.sizeBytes,
  });

  const [record] = await db
    .insert(mediaFiles)
    .values({
      ownerUserProfileId: profile.id,
      importerProfileId: importerProfile.id,
      context,
      objectKey,
      originalFilename: validated.originalFilename,
      contentType: validated.contentType,
      detectedContentType: validated.detectedContentType,
      sizeBytes: validated.sizeBytes,
      checksumSha256: validated.checksumSha256,
      status: "temporary",
    })
    .returning({
      id: mediaFiles.id,
      originalFilename: mediaFiles.originalFilename,
      contentType: mediaFiles.contentType,
      sizeBytes: mediaFiles.sizeBytes,
      status: mediaFiles.status,
    });

  return record satisfies UploadedMediaFile;
}

export async function detachTemporaryShipmentAttachment(fileId: string) {
  const { profile } = await requireImporterProfileForMedia();

  const [file] = await db
    .update(mediaFiles)
    .set({ status: "deleted", updatedAt: new Date() })
    .where(
      and(
        eq(mediaFiles.id, fileId),
        eq(mediaFiles.ownerUserProfileId, profile.id),
        eq(mediaFiles.context, "shipment_request_attachment"),
        eq(mediaFiles.status, "temporary"),
      ),
    )
    .returning({ id: mediaFiles.id });

  return Boolean(file);
}

export async function attachFilesToShipmentRequest(
  tx: Pick<typeof db, "select" | "insert" | "update">,
  input: {
    shipmentRequestId: string;
    importerProfileId: string;
    ownerUserProfileId: string;
    fileIds: string[];
  },
) {
  const fileIds = uniqueIds(input.fileIds);

  if (fileIds.length === 0) {
    return [];
  }

  const rules = mediaContextRules.shipment_request_attachment;

  if (fileIds.length > rules.maxCount) {
    throw new Error(`A shipment request can have up to ${rules.maxCount} attachments.`);
  }

  const files = await tx
    .select({
      id: mediaFiles.id,
      status: mediaFiles.status,
    })
    .from(mediaFiles)
    .where(
      and(
        inArray(mediaFiles.id, fileIds),
        eq(mediaFiles.ownerUserProfileId, input.ownerUserProfileId),
        eq(mediaFiles.importerProfileId, input.importerProfileId),
        eq(mediaFiles.context, "shipment_request_attachment"),
        eq(mediaFiles.status, "temporary"),
      ),
    );

  if (files.length !== fileIds.length) {
    throw new Error("One or more attachments are unavailable.");
  }

  await tx.insert(shipmentRequestAttachments).values(
    fileIds.map((fileId) => ({
      shipmentRequestId: input.shipmentRequestId,
      fileId,
    })),
  );

  await tx
    .update(mediaFiles)
    .set({ status: "active", attachedAt: new Date(), updatedAt: new Date() })
    .where(inArray(mediaFiles.id, fileIds));

  return fileIds;
}

export async function listShipmentRequestAttachmentsForViewer(
  shipmentRequestId: string,
) {
  await assertCanViewShipmentRequestAttachments(shipmentRequestId);

  return db
    .select({
      id: mediaFiles.id,
      originalFilename: mediaFiles.originalFilename,
      contentType: mediaFiles.contentType,
      sizeBytes: mediaFiles.sizeBytes,
      status: mediaFiles.status,
      createdAt: shipmentRequestAttachments.createdAt,
    })
    .from(shipmentRequestAttachments)
    .innerJoin(mediaFiles, eq(shipmentRequestAttachments.fileId, mediaFiles.id))
    .where(
      and(
        eq(shipmentRequestAttachments.shipmentRequestId, shipmentRequestId),
        eq(mediaFiles.context, "shipment_request_attachment"),
        eq(mediaFiles.status, "active"),
      ),
    )
    .orderBy(shipmentRequestAttachments.createdAt);
}

export async function mintAttachmentReadUrl(fileId: string) {
  const profile = await requireProfile();

  const [file] = await db
    .select({
      id: mediaFiles.id,
      objectKey: mediaFiles.objectKey,
      originalFilename: mediaFiles.originalFilename,
      contentType: mediaFiles.contentType,
      status: mediaFiles.status,
      shipmentRequestId: shipmentRequestAttachments.shipmentRequestId,
    })
    .from(mediaFiles)
    .innerJoin(
      shipmentRequestAttachments,
      eq(shipmentRequestAttachments.fileId, mediaFiles.id),
    )
    .where(
      and(
        eq(mediaFiles.id, fileId),
        eq(mediaFiles.context, "shipment_request_attachment"),
        eq(mediaFiles.status, "active"),
      ),
    )
    .limit(1);

  if (!file) {
    return null;
  }

  const allowed = await canProfileViewShipmentRequestAttachments(
    profile.id,
    profile.role,
    file.shipmentRequestId,
  );

  if (!allowed) {
    return null;
  }

  return {
    ...createSignedR2ReadUrl(file.objectKey),
    originalFilename: file.originalFilename,
    contentType: file.contentType,
  };
}

async function assertCanViewShipmentRequestAttachments(shipmentRequestId: string) {
  const profile = await requireProfile();
  const allowed = await canProfileViewShipmentRequestAttachments(
    profile.id,
    profile.role,
    shipmentRequestId,
  );

  if (!allowed) {
    throw new Error("Attachment access denied.");
  }
}

async function canProfileViewShipmentRequestAttachments(
  userProfileId: string,
  role: UserRole,
  shipmentRequestId: string,
) {
  if (role === "admin") {
    return true;
  }

  if (role === "importer") {
    const [owned] = await db
      .select({ id: shipmentRequests.id })
      .from(shipmentRequests)
      .innerJoin(
        importerProfiles,
        eq(importerProfiles.id, shipmentRequests.importerProfileId),
      )
      .where(
        and(
          eq(shipmentRequests.id, shipmentRequestId),
          eq(importerProfiles.userProfileId, userProfileId),
        ),
      )
      .limit(1);

    return Boolean(owned);
  }

  if (role === "forwarder") {
    const [postedVisible] = await db
      .select({ id: shipmentRequests.id })
      .from(shipmentRequests)
      .innerJoin(
        forwarderMembers,
        eq(forwarderMembers.userProfileId, userProfileId),
      )
      .where(
        and(
          eq(shipmentRequests.id, shipmentRequestId),
          eq(shipmentRequests.status, "posted"),
        ),
      )
      .limit(1);

    if (postedVisible) {
      return true;
    }

    const [visible] = await db
      .select({ id: quotes.id })
      .from(quotes)
      .innerJoin(
        forwarderMembers,
        eq(forwarderMembers.forwarderCompanyId, quotes.forwarderCompanyId),
      )
      .where(
        and(
          eq(quotes.shipmentRequestId, shipmentRequestId),
          eq(forwarderMembers.userProfileId, userProfileId),
        ),
      )
      .limit(1);

    return Boolean(visible);
  }

  return false;
}

function buildObjectKey(context: MediaFileContext, userProfileId: string, extension: string) {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const token = randomBytes(12).toString("hex");

  return `${context}/${userProfileId}/${yyyy}/${mm}/${Date.now()}-${token}.${extension}`;
}

function uniqueIds(values: string[]) {
  return Array.from(new Set(values.filter((value) => value.trim())));
}

async function requireImporterProfileForMedia() {
  const profile = await requireRole(["importer"]);

  const importerProfile = await db.query.importerProfiles.findFirst({
    where: eq(importerProfiles.userProfileId, profile.id),
  });

  if (!importerProfile) {
    throw new Error("Importer profile is missing for the current user.");
  }

  return { profile, importerProfile };
}
