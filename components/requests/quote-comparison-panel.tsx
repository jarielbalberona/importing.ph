"use client";

import { useMemo, useState } from "react";

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
  companyName: string;
  amount: string;
  status: string;
  serviceOffered: string;
  transitRange: string;
  validUntil: string;
  inclusions: string;
  exclusions: string;
  notes: string;
  submittedAt: string;
  isExpired: boolean;
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
        <div className="rounded-md border bg-background">
          <Table>
            <TableBody>
              <ComparisonRow label="Forwarder" quotes={selectedQuotes} value="companyName" />
              <ComparisonRow label="Amount" quotes={selectedQuotes} value="amount" />
              <ComparisonRow label="Service" quotes={selectedQuotes} value="serviceOffered" />
              <ComparisonRow label="Transit" quotes={selectedQuotes} value="transitRange" />
              <ComparisonRow label="Valid until" quotes={selectedQuotes} value="validUntil" />
              <ComparisonRow label="Inclusions" quotes={selectedQuotes} value="inclusions" />
              <ComparisonRow label="Exclusions" quotes={selectedQuotes} value="exclusions" />
              <ComparisonRow label="Notes" quotes={selectedQuotes} value="notes" />
              <ComparisonRow label="Submitted" quotes={selectedQuotes} value="submittedAt" />
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
}: {
  label: string;
  quotes: QuoteComparisonItem[];
  value: keyof QuoteComparisonItem;
}) {
  return (
    <TableRow>
      <TableCell className="sticky left-0 z-10 min-w-36 bg-background font-medium">
        {label}
      </TableCell>
      {quotes.map((quote) => (
        <TableCell
          key={quote.id}
          className="min-w-56 whitespace-normal align-top leading-6"
        >
          {String(quote[value]) || "Not provided"}
        </TableCell>
      ))}
    </TableRow>
  );
}
