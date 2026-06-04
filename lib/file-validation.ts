import { createHash } from "node:crypto";

import type { MediaFileContext } from "@/db/schema";
import { mediaContextRules } from "@/lib/file-rules";

export type ValidatedUploadFile = {
  bytes: Buffer;
  sizeBytes: number;
  originalFilename: string;
  contentType: string;
  detectedContentType: string;
  extension: string;
  checksumSha256: string;
};

export type UploadValidationErrorCode =
  | "empty"
  | "too_large"
  | "unsupported_type"
  | "invalid_file";

export class UploadValidationError extends Error {
  constructor(
    public readonly code: UploadValidationErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export async function validateUploadFile(
  file: File,
  context: MediaFileContext,
): Promise<ValidatedUploadFile> {
  const rules = mediaContextRules[context];

  if (!file || file.size === 0) {
    throw new UploadValidationError("empty", "Choose a non-empty file.");
  }

  if (file.size > rules.maxBytes) {
    throw new UploadValidationError(
      "too_large",
      `File is too large. Max size is ${Math.round(rules.maxBytes / (1024 * 1024))} MB.`,
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const detected = detectContentType(bytes, file.name);

  if (!detected) {
    throw new UploadValidationError(
      "unsupported_type",
      "Unsupported file type.",
    );
  }

  if (!rules.allowedContentTypes.includes(detected.contentType)) {
    throw new UploadValidationError(
      "unsupported_type",
      "Unsupported file type.",
    );
  }

  return {
    bytes,
    sizeBytes: bytes.byteLength,
    originalFilename: sanitizeFilename(file.name),
    contentType: detected.contentType,
    detectedContentType: detected.contentType,
    extension: detected.extension,
    checksumSha256: createHash("sha256").update(bytes).digest("hex"),
  };
}

export function detectContentType(bytes: Buffer, filename = "") {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { contentType: "image/jpeg", extension: "jpg" };
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { contentType: "image/png", extension: "png" };
  }

  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { contentType: "image/webp", extension: "webp" };
  }

  if (bytes.length >= 5 && bytes.subarray(0, 5).toString("ascii") === "%PDF-") {
    return { contentType: "application/pdf", extension: "pdf" };
  }

  const lower = filename.toLowerCase();
  if (looksLikeZip(bytes)) {
    if (lower.endsWith(".docx")) {
      return {
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        extension: "docx",
      };
    }
    if (lower.endsWith(".xlsx")) {
      return {
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        extension: "xlsx",
      };
    }
  }

  if (looksLikeOle(bytes)) {
    if (lower.endsWith(".doc")) {
      return { contentType: "application/msword", extension: "doc" };
    }
    if (lower.endsWith(".xls")) {
      return { contentType: "application/vnd.ms-excel", extension: "xls" };
    }
  }

  if (lower.endsWith(".csv") && looksLikeText(bytes)) {
    return { contentType: "text/csv", extension: "csv" };
  }

  return null;
}

function looksLikeZip(bytes: Buffer) {
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

function looksLikeOle(bytes: Buffer) {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0xd0 &&
    bytes[1] === 0xcf &&
    bytes[2] === 0x11 &&
    bytes[3] === 0xe0 &&
    bytes[4] === 0xa1 &&
    bytes[5] === 0xb1 &&
    bytes[6] === 0x1a &&
    bytes[7] === 0xe1
  );
}

function looksLikeText(bytes: Buffer) {
  const sample = bytes.subarray(0, Math.min(bytes.length, 4096));

  return sample.every((byte) => {
    return byte === 0x09 || byte === 0x0a || byte === 0x0d || (byte >= 0x20 && byte <= 0x7e);
  });
}

function sanitizeFilename(filename: string) {
  const trimmed = filename.trim();

  if (!trimmed) {
    return "upload";
  }

  return trimmed.replace(/[^\w.\- ()]/g, "_").slice(0, 180);
}
