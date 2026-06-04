import type { ShipmentRequestStatus } from "@/db/schema";
import { titleFromEnum } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RequestStatusBadge({
  status,
  className,
}: {
  status: ShipmentRequestStatus | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit shrink-0 items-center justify-center rounded-4xl border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        requestStatusClasses(status),
        className,
      )}
    >
      {titleFromEnum(status)}
    </span>
  );
}

function requestStatusClasses(status: ShipmentRequestStatus | string) {
  switch (status) {
    case "posted":
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    case "quote_selected":
      return "border-blue-300 bg-blue-50 text-blue-700";
    case "draft":
      return "border-slate-300 bg-slate-50 text-slate-700";
    case "cancelled":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    default:
      return "border-border bg-background text-muted-foreground";
  }
}
