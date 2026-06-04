import { NextResponse } from "next/server";
import { z } from "zod";

import { mintAttachmentReadUrl } from "@/lib/media";

const fileIdSchema = z.string().uuid();

export async function POST(
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

  const signed = await mintAttachmentReadUrl(parsed.data);

  if (!signed) {
    return NextResponse.json(
      { error: "not_found", message: "File is not available." },
      { status: 404 },
    );
  }

  return NextResponse.json(signed);
}
