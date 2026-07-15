import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  maxBytesForMessageContentType,
  messageAttachmentMaxCount,
  messageAttachmentMaxTotalBytes,
} from "../lib/file-rules";
import {
  messageAttachmentAuthorizationSchema,
  messageAttachmentPreview,
} from "../lib/message-attachments";
import { messageInputSchema } from "../lib/messages";

describe("message attachments", () => {
  it("permits attachment-only and combined messages", () => {
    const attachmentId = crypto.randomUUID();
    assert.equal(
      messageInputSchema.parse({ body: "", attachmentIds: [attachmentId] }).body,
      "",
    );
    assert.equal(
      messageInputSchema.parse({ body: "See attached", attachmentIds: [attachmentId] }).body,
      "See attached",
    );
    assert.throws(() => messageInputSchema.parse({ body: "", attachmentIds: [] }));
  });

  it("enforces declared upload types and per-type limits", () => {
    const conversationId = crypto.randomUUID();
    assert.doesNotThrow(() =>
      messageAttachmentAuthorizationSchema.parse({
        conversationId,
        filename: "packing-list.pdf",
        contentType: "application/pdf",
        sizeBytes: 10 * 1024 * 1024,
      }),
    );
    assert.throws(() =>
      messageAttachmentAuthorizationSchema.parse({
        conversationId,
        filename: "unsafe.svg",
        contentType: "image/svg+xml",
        sizeBytes: 100,
      }),
    );
    assert.equal(maxBytesForMessageContentType("video/mp4"), 50 * 1024 * 1024);
    assert.equal(maxBytesForMessageContentType("application/pdf"), 10 * 1024 * 1024);
    assert.equal(messageAttachmentMaxCount, 5);
    assert.equal(messageAttachmentMaxTotalBytes, 100 * 1024 * 1024);
  });

  it("uses useful attachment-only conversation previews", () => {
    const base = {
      id: crypto.randomUUID(),
      originalFilename: "file",
      sizeBytes: 100,
      downloadUrl: "/download",
    };
    assert.equal(messageAttachmentPreview([{ ...base, contentType: "image/jpeg" }]), "Photo");
    assert.equal(messageAttachmentPreview([{ ...base, contentType: "video/mp4" }]), "Video");
    assert.equal(messageAttachmentPreview([{ ...base, contentType: "application/pdf" }]), "PDF");
    assert.equal(messageAttachmentPreview([{ ...base, contentType: "text/csv" }]), "Attachment");
  });
});
