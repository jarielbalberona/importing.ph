import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  detectContentType,
  validateUploadFile,
  UploadValidationError,
} from "../lib/file-validation";

const context = "shipment_request_attachment";

describe("shipment attachment validation", () => {
  it("detects pdf from bytes", async () => {
    const detected = await detectContentType(
      Buffer.from("%PDF-1.7\n"),
      "invoice.pdf",
    );

    assert.deepEqual(detected, {
      contentType: "application/pdf",
      extension: "pdf",
    });
  });

  it("rejects unsupported file bytes", async () => {
    const file = new File([Buffer.from("<svg></svg>")], "unsafe.svg", {
      type: "image/svg+xml",
    });

    await assert.rejects(
      () => validateUploadFile(file, context),
      (error) =>
        error instanceof UploadValidationError &&
        error.code === "unsupported_type",
    );
  });

  it("rejects oversized files", async () => {
    const file = new File([Buffer.alloc(10 * 1024 * 1024 + 1)], "large.pdf", {
      type: "application/pdf",
    });

    await assert.rejects(
      () => validateUploadFile(file, context),
      (error) =>
        error instanceof UploadValidationError && error.code === "too_large",
    );
  });

  it("accepts jpeg by detected bytes and records checksum metadata", async () => {
    const file = new File([Buffer.from([0xff, 0xd8, 0xff, 0x00])], "photo.jpg", {
      type: "image/jpeg",
    });

    const validated = await validateUploadFile(file, context);

    assert.equal(validated.contentType, "image/jpeg");
    assert.equal(validated.detectedContentType, "image/jpeg");
    assert.equal(validated.extension, "jpg");
    assert.equal(validated.checksumSha256.length, 64);
  });
});
