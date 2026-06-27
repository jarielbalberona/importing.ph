import { CheckCircle2Icon, CircleIcon } from "lucide-react";

import { DetailCard } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type OnboardingChecklistItem = {
  label: string;
  complete: boolean;
  href?: string;
};

export function OnboardingChecklist({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: OnboardingChecklistItem[];
}) {
  const completedCount = items.filter((item) => item.complete).length;

  if (completedCount === items.length) {
    return null;
  }

  return (
    <DetailCard className="mt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">{title}</h2>
            <Badge variant="outline">
              {completedCount}/{items.length}
            </Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.complete ? CheckCircle2Icon : CircleIcon;

          return (
            <div
              key={item.label}
              className={cn(
                "flex min-w-0 items-start gap-2 rounded-md border px-3 py-2 text-sm",
                item.complete
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "bg-background",
              )}
            >
              <Icon
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  item.complete ? "text-emerald-700" : "text-muted-foreground",
                )}
              />
              <span className="min-w-0 break-words">{item.label}</span>
            </div>
          );
        })}
      </div>
    </DetailCard>
  );
}
