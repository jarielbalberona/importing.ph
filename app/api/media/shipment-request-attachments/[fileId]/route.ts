import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, rateLimitResponse } from "@/lib/api-response";
import { ApiAuthError, requireApiProfile, requireApiRole } from "@/lib/api-authz";
import {
  detachTemporaryShipmentAttachmentForProfile,
  getAttachmentDownloadForProfile,
} from "@/lib/media";
import { forcedDownloadHeaders } from "@/lib/media-download";
import {
  consumeRateLimit,
  RateLimitError,
  rateLimitPolicies,
} from "@/lib/rate-limit";
import { getR2Object } from "@/lib/r2-storage";
import { logServerError } from "@/lib/server-log";

const fileIdSchema = z.string().uuid();

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;
  const parsed = fileIdSchema.safeParse(fileId);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_file", message: "Invalid file id." },
      { status: 400 },
    );
  }

  try {
    const profile = await requireApiRole(["importer"]);
    await consumeRateLimit(rateLimitPolicies.attachmentUpload, profile.id);
    const detached = await detachTemporaryShipmentAttachmentForProfile(
      profile,
      parsed.data,
    );

    if (!detached) {
      return apiError(404, "not_found", "File is not available.");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return apiError(error.status, error.code, "File removal is not allowed.");
    }
    if (error instanceof RateLimitError) {
      return rateLimitResponse(error);
    }
    logServerError("storage.attachment_delete_failed", error, {
      fileId: parsed.data,
    });
    return apiError(500, "internal_error", "File removal failed. Try again.");
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;
  const parsed = fileIdSchema.safeParse(fileId);
  if (!parsed.success) {
    return apiError(404, "not_found", "File is not available.");
  }

  try {
    const profile = await requireApiProfile();
    await consumeRateLimit(rateLimitPolicies.attachmentDownload, profile.id);
    const file = await getAttachmentDownloadForProfile(profile, parsed.data);
    if (!file) {
      return apiError(404, "not_found", "File is not available.");
    }

    const object = await getR2Object(file.objectKey);
    if (!object?.body) {
      return apiError(404, "not_found", "File is not available.");
    }

    return new Response(object.body, {
      status: 200,
      headers: forcedDownloadHeaders(file),
    });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return apiError(error.status, error.code, "Authentication is required.");
    }
    if (error instanceof RateLimitError) {
      return rateLimitResponse(error);
    }
    logServerError("storage.attachment_download_failed", error, {
      fileId: parsed.data,
    });
    return apiError(500, "internal_error", "Download failed. Try again.");
  }
}
