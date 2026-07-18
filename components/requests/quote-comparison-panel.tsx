"use client";

import { useMemo, useState } from "react";

import { acceptQuote } from "@/app/app/requests/[requestId]/actions";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { GuideLinksCard } from "@/components/guides/guide-links-card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type QuoteComparisonItem = {
  id: string;
  requestId: string;
  companyName: string;
  amount: string;
  status: string;
  shippingMode: string;
  serviceOffered: string;
  transitRange: string;
  validUntil: string;
  inclusions: string;
  exclusions: string;
  notes: string;
  submittedAt: string;
  isExpired: boolean;
  canAccept: boolean;
};

type QuoteComparisonPanelProps = {
  quotes: QuoteComparisonItem[];
};

export function QuoteComparisonPanel({ quotes }: QuoteComparisonPanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedQuotes = useMemo(
    () => quotes.filter((quote) => selectedIds.includes(quote.id)),
    [quotes, selectedIds],
  );

  function setSelected(quoteId: string, selected: boolean) {
    setSelectedIds((current) => {
      if (selected) {
        return current.includes(quoteId) ? current : [...current, quoteId];
      }

      return current.filter((id) => id !== quoteId);
    });
  }

  if (quotes.length === 0) {
    return (
      <div className="rounded-md border border-dashed bg-background p-6 text-sm text-muted-foreground">
        No quotes are available to compare yet.
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <GuideLinksCard
        title="Before you choose a quote"
        description="Use these quick references if you are comparing speed, cost, and what the quote really covers."
        guides={[
          {
            slug: "air-cargo-vs-sea-cargo",
            title: "Air Freight vs Sea Freight from China to the Philippines",
            description: "Compare urgency, shipment size, and cost tradeoffs before deciding.",
          },
          {
            slug: "how-to-request-a-shipping-quote",
            title: "How to Request a Shipping Quote: A Practical Template",
            description: "Review the usual gaps that lead to revised charges or confusing comparisons.",
          },
        ]}
      />
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <span className="sr-only">Select</span>
              </TableHead>
              <TableHead>Forwarder</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Transit</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(quote.id)}
                    onCheckedChange={(value) =>
                      setSelected(quote.id, value === true)
                    }
                    aria-label={`Compare ${quote.companyName}`}
                  />
                </TableCell>
                <TableCell className="whitespace-normal font-medium">
                  {quote.companyName}
                </TableCell>
                <TableCell>{quote.amount}</TableCell>
                <TableCell>{quote.transitRange}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {quote.isExpired ? (
                      <Badge variant="outline">Expired</Badge>
                    ) : null}
                    <Badge variant="secondary">{quote.status}</Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedQuotes.length < 2 ? (
        <p className="text-sm text-muted-foreground">
          Select at least two quotes to compare side by side.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border bg-background">
          <Table className="min-w-max">
            <TableBody>
              <ComparisonRow
                label="Forwarder"
                quotes={selectedQuotes}
                value="companyName"
                valueClassName="font-semibold"
              />
              <ComparisonRow label="Amount" quotes={selectedQuotes} value="amount" />
              <ComparisonRow
                label="Shipping mode"
                quotes={selectedQuotes}
                value="shippingMode"
              />
              <ComparisonRow label="Service type" quotes={selectedQuotes} value="serviceOffered" />
              <ComparisonRow label="Transit" quotes={selectedQuotes} value="transitRange" />
              <ComparisonRow label="Valid until" quotes={selectedQuotes} value="validUntil" />
              <ComparisonRow label="Included" quotes={selectedQuotes} value="inclusions" />
              <ComparisonRow label="Not included" quotes={selectedQuotes} value="exclusions" />
              <ComparisonRow label="Notes" quotes={selectedQuotes} value="notes" />
              <ComparisonRow label="Submitted" quotes={selectedQuotes} value="submittedAt" />
              <TableRow>
                <TableCell className="sticky left-0 z-10 min-w-36 bg-background font-medium">
                  Accept quote
                </TableCell>
                {selectedQuotes.map((quote) => (
                  <TableCell
                    key={quote.id}
                    className="min-w-56 whitespace-normal align-top leading-6"
                  >
                    {quote.canAccept ? (
                      <form action={acceptQuote}>
                        <input type="hidden" name="requestId" value={quote.requestId} />
                        <input type="hidden" name="quoteId" value={quote.id} />
                        <ConfirmSubmitButton
                          type="submit"
                          size="sm"
                          title="Accept this quote?"
                          message="This will mark the quote as accepted for this shipment request. Other quotes will remain visible for your records."
                          confirmLabel="Accept quote"
                          cancelLabel="Cancel"
                        >
                          Accept quote
                        </ConfirmSubmitButton>
                      </form>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Not available
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function ComparisonRow({
  label,
  quotes,
  value,
  valueClassName,
}: {
  label: string;
  quotes: QuoteComparisonItem[];
  value: keyof QuoteComparisonItem;
  valueClassName?: string;
}) {
  return (
    <TableRow>
      <TableCell className="sticky left-0 z-10 min-w-36 bg-background font-medium">
        {label}
      </TableCell>
      {quotes.map((quote) => (
        <TableCell
          key={quote.id}
          className={`min-w-56 whitespace-normal align-top leading-6 ${valueClassName ?? ""}`}
        >
          {String(quote[value]) || "Not provided"}
        </TableCell>
      ))}
    </TableRow>
  );
}
