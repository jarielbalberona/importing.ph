import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, rateLimitResponse } from "@/lib/api-response";
import { ApiAuthError, requireApiProfile } from "@/lib/api-authz";
import {
  cancelMessageAttachmentUpload,
  getMessageAttachmentDownloadForProfile,
} from "@/lib/message-attachments";
import {
  consumeRateLimit,
  RateLimitError,
  rateLimitPolicies,
} from "@/lib/rate-limit";
import { getR2ObjectRange } from "@/lib/r2-storage";
import { logServerError } from "@/lib/server-log";

const fileIdSchema = z.string().uuid();

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const parsed = fileIdSchema.safeParse((await params).fileId);
  if (!parsed.success) return apiError(404, "not_found", "File is not available.");
  try {
    const profile = await requireApiProfile();
    const deleted = await cancelMessageAttachmentUpload(profile, parsed.data);
    if (!deleted) return apiError(404, "not_found", "File is not available.");
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return apiError(error.status, error.code, "File removal is not allowed.");
    }
    logServerError("storage.message_attachment_cancel_failed", error, {
      fileId: parsed.data,
    });
    return apiError(500, "internal_error", "File removal failed.");
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const parsed = fileIdSchema.safeParse((await params).fileId);
  if (!parsed.success) return apiError(404, "not_found", "File is not available.");
  try {
    const profile = await requireApiProfile();
    await consumeRateLimit(rateLimitPolicies.attachmentDownload, profile.id);
    const file = await getMessageAttachmentDownloadForProfile(profile, parsed.data);
    if (!file) return apiError(404, "not_found", "File is not available.");

    const range = request.headers.get("range") ?? undefined;
    const object = await getR2ObjectRange(file.objectKey, range);
    if (!object?.body) return apiError(404, "not_found", "File is not available.");

    const disposition = file.contentType.startsWith("image/") || file.contentType.startsWith("video/")
      ? "inline"
      : "attachment";
    const asciiFilename = file.originalFilename
      .replace(/[^\x20-\x7E]/g, "_")
      .replace(/["\\]/g, "_");
    const headers = new Headers({
      "Content-Type": file.contentType,
      "Content-Disposition": `${disposition}; filename="${asciiFilename || "attachment"}"; filename*=UTF-8''${encodeURIComponent(file.originalFilename)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Accept-Ranges": "bytes",
    });
    for (const name of ["content-length", "content-range"]) {
      const value = object.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(object.body, {
      status: object.status === 206 ? 206 : 200,
      headers,
    });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return apiError(error.status, error.code, "Authentication is required.");
    }
    if (error instanceof RateLimitError) return rateLimitResponse(error);
    logServerError("storage.message_attachment_download_failed", error, {
      fileId: parsed.data,
    });
    return apiError(500, "internal_error", "Download failed.");
  }
}
