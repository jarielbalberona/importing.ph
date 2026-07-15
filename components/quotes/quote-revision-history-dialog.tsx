import { HistoryIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatQuoteShippingMode,
} from "@/lib/format";

export type QuoteRevisionView = {
  id: string;
  revisionNumber: number;
  quoteAmount: string;
  currency: string;
  shippingMode: "sea" | "air";
  serviceOffered: string;
  estimatedTransitMinDays: number;
  estimatedTransitMaxDays: number;
  inclusions: string;
  exclusions: string;
  notes: string | null;
  validUntil: Date;
  createdAt: Date;
};

export function QuoteRevisionHistoryDialog({
  revisions,
}: {
  revisions: QuoteRevisionView[];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <HistoryIcon />
          Revision history ({revisions.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Quote revision history</DialogTitle>
          <DialogDescription>
            Immutable snapshots of the submitted quote. Revisions cannot be edited,
            restored, or deleted.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {[...revisions].reverse().map((revision, index) => (
            <section key={revision.id} className="rounded-md border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">
                  Revision {revision.revisionNumber}
                  {index === 0 ? " (latest)" : ""}
                </h3>
                <time className="text-xs text-muted-foreground">
                  {formatDateTime(revision.createdAt)}
                </time>
              </div>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <RevisionItem
                  label="Amount"
                  value={formatMoney(revision.currency, revision.quoteAmount)}
                />
                <RevisionItem
                  label="Shipping mode"
                  value={formatQuoteShippingMode(revision.shippingMode)}
                />
                <RevisionItem
                  label="Transit"
                  value={`${revision.estimatedTransitMinDays}-${revision.estimatedTransitMaxDays} days`}
                />
                <RevisionItem label="Service" value={revision.serviceOffered} />
                <RevisionItem label="Valid until" value={formatDate(revision.validUntil)} />
                <RevisionItem label="Inclusions" value={revision.inclusions} />
                <RevisionItem label="Exclusions" value={revision.exclusions} />
                <RevisionItem label="Notes" value={revision.notes} />
              </dl>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RevisionItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words leading-6">{value || "Not provided"}</dd>
    </div>
  );
}
