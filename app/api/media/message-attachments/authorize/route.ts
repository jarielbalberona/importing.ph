import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, rateLimitResponse } from "@/lib/api-response";
import { ApiAuthError, requireApiProfile } from "@/lib/api-authz";
import { UploadValidationError } from "@/lib/file-validation";
import {
  authorizeMessageAttachmentUpload,
  MessageAttachmentAccessError,
} from "@/lib/message-attachments";
import {
  consumeRateLimit,
  RateLimitError,
  rateLimitPolicies,
} from "@/lib/rate-limit";
import { logServerError } from "@/lib/server-log";

export async function POST(request: Request) {
  try {
    const profile = await requireApiProfile();
    await consumeRateLimit(rateLimitPolicies.attachmentUpload, profile.id);
    const input = await request.json();
    const upload = await authorizeMessageAttachmentUpload(profile, input);
    return NextResponse.json({ upload });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return apiError(error.status, error.code, "Attachment upload is not allowed.");
    }
    if (error instanceof RateLimitError) return rateLimitResponse(error);
    if (error instanceof MessageAttachmentAccessError) {
      return apiError(404, "not_found", "Conversation is not available.");
    }
    if (error instanceof UploadValidationError || error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "invalid_request",
          message:
            error instanceof UploadValidationError
              ? error.message
              : "The attachment details are invalid.",
        },
        { status: 400 },
      );
    }
    logServerError("storage.message_attachment_authorize_failed", error);
    return apiError(500, "internal_error", "Upload could not be authorized.");
  }
}
