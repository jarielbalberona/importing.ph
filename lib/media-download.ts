export function forcedDownloadHeaders(input: {
  originalFilename: string;
  sizeBytes: number;
}) {
  const ascii = input.originalFilename
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/["\\]/g, "_");

  return {
    "Content-Disposition": `attachment; filename="${ascii || "attachment"}"; filename*=UTF-8''${encodeURIComponent(input.originalFilename)}`,
    "Content-Type": "application/octet-stream",
    "Content-Length": String(input.sizeBytes),
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, no-store",
  };
}
