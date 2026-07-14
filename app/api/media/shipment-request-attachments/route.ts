import { NextResponse } from "next/server";

import { apiError, rateLimitResponse } from "@/lib/api-response";
import { ApiAuthError, requireApiProfile, requireApiRole } from "@/lib/api-authz";
import { UploadValidationError } from "@/lib/file-validation";
import {
  listShipmentRequestAttachmentsForProfile,
  uploadShipmentRequestAttachmentForProfile,
} from "@/lib/media";
import {
  consumeRateLimit,
  RateLimitError,
  rateLimitPolicies,
} from "@/lib/rate-limit";
import { logServerError } from "@/lib/server-log";

export async function POST(request: Request) {
  try {
    const profile = await requireApiRole(["importer"]);
    await consumeRateLimit(rateLimitPolicies.attachmentUpload, profile.id);
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "invalid_file", message: "Choose a file to upload." },
        { status: 400 },
      );
    }

    const uploaded = await uploadShipmentRequestAttachmentForProfile(profile, file);

    return NextResponse.json({ file: uploaded });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return apiError(error.status, error.code, "Attachment upload is not allowed.");
    }
    if (error instanceof RateLimitError) {
      return rateLimitResponse(error);
    }
    if (error instanceof UploadValidationError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: 400 },
      );
    }

    logServerError("storage.attachment_upload_failed", error);

    return NextResponse.json(
      { error: "upload_failed", message: "Upload failed. Try again." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shipmentRequestId = url.searchParams.get("shipmentRequestId");

  if (!shipmentRequestId) {
    return NextResponse.json(
      { error: "invalid_request", message: "shipmentRequestId is required." },
      { status: 400 },
    );
  }

  try {
    const profile = await requireApiProfile();
    const files = await listShipmentRequestAttachmentsForProfile(
      profile,
      shipmentRequestId,
    );

    if (!files) {
      return apiError(404, "not_found", "Attachments are not available.");
    }

    return NextResponse.json({ files });
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return apiError(error.status, error.code, "Authentication is required.");
    }
    throw error;
  }
}
