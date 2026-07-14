import { createHash } from "node:crypto";
import { extname } from "node:path";

import { fileTypeFromBuffer } from "file-type";

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
  const detected = await detectContentType(bytes, file.name);

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

  if (!extensionMatches(file.name, detected.extension)) {
    throw new UploadValidationError(
      "invalid_file",
      "The file extension does not match its contents.",
    );
  }

  if (!claimedTypeMatches(file.type, detected.contentType)) {
    throw new UploadValidationError(
      "invalid_file",
      "The file type does not match its contents.",
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

export async function detectContentType(bytes: Buffer, filename = "") {
  const detected = await fileTypeFromBuffer(bytes);
  if (detected && detected.ext !== "cfb") {
    const mapped = detectedTypes[detected.ext];
    return mapped ?? null;
  }

  const lower = filename.toLowerCase();
  if (detected?.ext === "cfb") {
    if (containsUtf16DirectoryName(bytes, "WordDocument")) {
      return { contentType: "application/msword", extension: "doc" };
    }
    if (
      containsUtf16DirectoryName(bytes, "Workbook") ||
      containsUtf16DirectoryName(bytes, "Book")
    ) {
      return { contentType: "application/vnd.ms-excel", extension: "xls" };
    }
  }

  if (lower.endsWith(".csv") && looksLikeText(bytes)) {
    return { contentType: "text/csv", extension: "csv" };
  }

  return null;
}

const detectedTypes: Record<
  string,
  { contentType: string; extension: string } | undefined
> = {
  jpg: { contentType: "image/jpeg", extension: "jpg" },
  png: { contentType: "image/png", extension: "png" },
  webp: { contentType: "image/webp", extension: "webp" },
  pdf: { contentType: "application/pdf", extension: "pdf" },
  docx: {
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extension: "docx",
  },
  xlsx: {
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extension: "xlsx",
  },
};

function containsUtf16DirectoryName(bytes: Buffer, name: string) {
  return bytes.includes(Buffer.from(name, "utf16le"));
}

function looksLikeText(bytes: Buffer) {
  const sample = bytes.subarray(0, Math.min(bytes.length, 4096));

  return sample.every((byte) => {
    return byte === 0x09 || byte === 0x0a || byte === 0x0d || (byte >= 0x20 && byte <= 0x7e);
  });
}

function extensionMatches(filename: string, detectedExtension: string) {
  const extension = extname(filename).slice(1).toLowerCase();
  return (
    extension === detectedExtension ||
    (detectedExtension === "jpg" && extension === "jpeg")
  );
}

function claimedTypeMatches(claimed: string, detected: string) {
  if (!claimed || claimed === "application/octet-stream") return true;
  if (claimed === detected) return true;
  return (
    detected === "text/csv" &&
    (claimed === "text/plain" || claimed === "application/vnd.ms-excel")
  );
}

function sanitizeFilename(filename: string) {
  const trimmed = filename.trim();

  if (!trimmed) {
    return "upload";
  }

  return trimmed.replace(/[^\w.\- ()]/g, "_").slice(0, 180);
}
