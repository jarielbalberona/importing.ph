import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError } from "@/lib/api-response";
import { ApiAuthError, requireApiProfile } from "@/lib/api-authz";
import { UploadValidationError } from "@/lib/file-validation";
import {
  finalizeMessageAttachmentUpload,
  MessageAttachmentAccessError,
} from "@/lib/message-attachments";
import { logServerError } from "@/lib/server-log";

const fileIdSchema = z.string().uuid();

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const parsed = fileIdSchema.safeParse((await params).fileId);
  if (!parsed.success) return apiError(404, "not_found", "File is not available.");

  try {
    const profile = await requireApiProfile();
    const file = await finalizeMessageAttachmentUpload(profile, parsed.data);
    return NextResponse.json({ file });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return apiError(error.status, error.code, "Authentication is required.");
    }
    if (error instanceof MessageAttachmentAccessError) {
      return apiError(404, "not_found", "File is not available.");
    }
    if (error instanceof UploadValidationError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: 400 },
      );
    }
    logServerError("storage.message_attachment_finalize_failed", error, {
      fileId: parsed.data,
    });
    return apiError(500, "internal_error", "Upload validation failed.");
  }
}
