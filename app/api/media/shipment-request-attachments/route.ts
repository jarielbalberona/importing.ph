import { NextResponse } from "next/server";

import { UploadValidationError } from "@/lib/file-validation";
import {
  listShipmentRequestAttachmentsForViewer,
  uploadShipmentRequestAttachment,
} from "@/lib/media";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "invalid_file", message: "Choose a file to upload." },
        { status: 400 },
      );
    }

    const uploaded = await uploadShipmentRequestAttachment(file);

    return NextResponse.json({ file: uploaded });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: 400 },
      );
    }

    console.error("shipment attachment upload failed", error);

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
    const files = await listShipmentRequestAttachmentsForViewer(shipmentRequestId);

    return NextResponse.json({ files });
  } catch {
    return NextResponse.json(
      { error: "not_found", message: "Attachments are not available." },
      { status: 404 },
    );
  }
}
