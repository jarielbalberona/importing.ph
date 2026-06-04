import type { MediaFileContext } from "@/db/schema";

export const shipmentAttachmentMaxBytes = 10 * 1024 * 1024;
export const shipmentAttachmentMaxCount = 5;

export const mediaContextRules: Record<
  MediaFileContext,
  {
    maxBytes: number;
    maxCount: number;
    allowedContentTypes: readonly string[];
    label: string;
  }
> = {
  shipment_request_attachment: {
    maxBytes: shipmentAttachmentMaxBytes,
    maxCount: shipmentAttachmentMaxCount,
    allowedContentTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    label: "shipment request attachment",
  },
};

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

export function acceptedFileDescription(context: MediaFileContext) {
  const rules = mediaContextRules[context];

  return `JPG, PNG, WebP, PDF, DOC, DOCX, XLS, XLSX, or CSV. Max ${formatBytes(rules.maxBytes)} each.`;
}
