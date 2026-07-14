import { Download, FileText, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/file-rules";

export type AttachmentListItem = {
  id: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
};

export function AttachmentList({ files }: { files: AttachmentListItem[] }) {
  if (files.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No files were attached to this request.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          These files are user-provided and are not malware-scanned. Downloads
          are forced; open them only if you trust the sender.
        </p>
      </div>
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
            <Button asChild variant="outline" size="sm">
              <a
                href={`/api/media/shipment-request-attachments/${file.id}`}
              >
                <Download className="size-4" aria-hidden="true" />
                Download
              </a>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
