import { NextResponse } from "next/server";
import { z } from "zod";

import { detachTemporaryShipmentAttachment } from "@/lib/media";

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

  const detached = await detachTemporaryShipmentAttachment(parsed.data);

  if (!detached) {
    return NextResponse.json(
      { error: "not_found", message: "File is not available." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
