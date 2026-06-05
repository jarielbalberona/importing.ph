"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RequestStatusBadge } from "@/components/requests/request-status-badge";

export type ShipmentQuoteDetails = {
  request: {
    href: string;
    title: string;
    route: string;
    cargoType?: string | null;
    status: string;
    sizeWeight?: string | null;
    deliveryPreference?: string | null;
    shippingModePreference?: string | null;
    shippingPreference?: string | null;
    notes?: string | null;
  };
  quote: {
    forwarderCompanyName: string;
    amount: string;
    shippingMode?: string | null;
    timeline: string;
    service?: string | null;
    inclusions?: string | null;
    exclusions?: string | null;
    notes?: string | null;
    status: string;
    validUntil?: string | null;
  };
};

type ShipmentQuoteDetailsDialogProps = {
  context: ShipmentQuoteDetails;
  trigger: ReactNode;
};

export function ShipmentQuoteDetailsDialog({
  context,
  trigger,
}: ShipmentQuoteDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{context.request.title}</DialogTitle>
          <DialogDescription>{context.request.route}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <section className="grid gap-4 border-b pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold">Shipment request</h3>
              <RequestStatusBadge status={context.request.status} />
            </div>
            <DefinitionGrid>
              <Definition label="Cargo type" value={context.request.cargoType} />
              <Definition label="Size and weight" value={context.request.sizeWeight} />
              <Definition
                label="Delivery preference"
                value={context.request.deliveryPreference}
              />
              <Definition
                label="Shipping mode"
                value={context.request.shippingModePreference}
              />
              <Definition
                label="Shipping preference"
                value={context.request.shippingPreference}
              />
              <Definition label="Notes" value={context.request.notes} wide />
            </DefinitionGrid>
          </section>

          <section className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold">Quote</h3>
              <Badge variant="secondary">{context.quote.status}</Badge>
            </div>
            <DefinitionGrid>
              <Definition
                label="Forwarder"
                value={context.quote.forwarderCompanyName}
              />
              <Definition label="Quoted price" value={context.quote.amount} />
              <Definition
                label="Shipping mode"
                value={context.quote.shippingMode}
              />
              <Definition label="Timeline" value={context.quote.timeline} />
              <Definition label="Service" value={context.quote.service} />
              <Definition label="Valid until" value={context.quote.validUntil} />
              <Definition label="Inclusions" value={context.quote.inclusions} wide />
              <Definition label="Exclusions" value={context.quote.exclusions} wide />
              <Definition label="Notes" value={context.quote.notes} wide />
            </DefinitionGrid>
          </section>
        </div>

        <DialogFooter>
          <Button asChild>
            <Link href={context.request.href}>View full request</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DefinitionGrid({ children }: { children: ReactNode }) {
  return (
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </dl>
  );
}

function Definition({
  label,
  value,
  wide = false,
}: {
  label: string;
  value?: ReactNode;
  wide?: boolean;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className={wide ? "min-w-0 sm:col-span-2 lg:col-span-3" : "min-w-0"}>
      <dt className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm leading-6">{value}</dd>
    </div>
  );
}
