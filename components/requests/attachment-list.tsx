"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/file-rules";

export type AttachmentListItem = {
  id: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
};

export function AttachmentList({ files }: { files: AttachmentListItem[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (files.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No files were attached to this request.
      </p>
    );
  }

  async function openAttachment(file: AttachmentListItem) {
    setLoadingId(file.id);
    setError(null);

    try {
      const response = await fetch(
        `/api/media/shipment-request-attachments/${file.id}/url`,
        { method: "POST" },
      );
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message || "Attachment is not available.");
        return;
      }

      window.open(payload.url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Attachment is not available right now.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="grid gap-3">
      <ul className="grid gap-2">
        {files.map((file) => (
          <li
            key={file.id}
            className="flex min-w-0 items-center justify-between gap-3 rounded-md border bg-background p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {file.originalFilename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.sizeBytes)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void openAttachment(file)}
              disabled={loadingId === file.id}
            >
              {loadingId === file.id ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="size-4" aria-hidden="true" />
              )}
              Open
            </Button>
          </li>
        ))}
      </ul>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
