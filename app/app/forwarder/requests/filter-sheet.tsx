"use client";

import Link from "next/link";
import { FilterIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  cargoTypeEnum,
  deliveryPreferenceEnum,
  shippingModePreferenceEnum,
  shippingPreferenceEnum,
} from "@/db/schema";
import {
  formatDeliveryPreference,
  formatShippingModePreference,
  titleFromEnum,
} from "@/lib/format";

export type ForwarderRequestFilters = {
  origin?: string;
  destination?: string;
  cargoType?: string;
  deliveryPreference?: string;
  shippingModePreference?: string;
  shippingPreference?: string;
  specialHandling?: "msds";
};

export function FilterSheet({
  filters,
  activeFilterCount,
}: {
  filters: ForwarderRequestFilters;
  activeFilterCount: number;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <FilterIcon />
          Filters
          {activeFilterCount > 0 ? (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[92vw] overflow-y-auto sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Narrow requests by route, cargo, delivery, and handling needs.
          </SheetDescription>
        </SheetHeader>

        <form className="flex min-h-0 flex-1 flex-col">
          <div className="grid gap-4 px-4">
            <label className="grid gap-2 text-sm font-medium">
              Origin city or area
              <Input
                name="origin"
                defaultValue={filters.origin}
                placeholder="Guangzhou, Yiwu, Shenzhen"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Philippine destination
              <Input
                name="destination"
                defaultValue={filters.destination}
                placeholder="Manila, Cebu, Davao"
              />
            </label>
            <SelectFilter
              label="Cargo type"
              name="cargoType"
              value={filters.cargoType}
              options={cargoTypeEnum.enumValues}
            />
            <SelectFilter
              label="Delivery preference"
              name="deliveryPreference"
              value={filters.deliveryPreference}
              options={deliveryPreferenceEnum.enumValues}
              formatOption={formatDeliveryPreference}
            />
            <SelectFilter
              label="Shipping mode"
              name="shippingModePreference"
              value={filters.shippingModePreference}
              options={shippingModePreferenceEnum.enumValues}
              formatOption={formatShippingModePreference}
              anyLabel="All"
            />
            <SelectFilter
              label="Shipping preference"
              name="shippingPreference"
              value={filters.shippingPreference}
              options={shippingPreferenceEnum.enumValues}
            />
            <label className="grid gap-2 text-sm font-medium">
              Special handling
              <Select
                name="specialHandling"
                defaultValue={filters.specialHandling ?? "__any"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__any">Any</SelectItem>
                  <SelectItem value="msds">MSDS mentioned</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>

          <SheetFooter>
            <Button type="submit" className="w-full">
              Apply filters
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/app/forwarder/requests">Clear filters</Link>
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function SelectFilter({
  label,
  name,
  value,
  options,
  formatOption = titleFromEnum,
  anyLabel,
}: {
  label: string;
  name: string;
  value?: string;
  options: readonly string[];
  formatOption?: (value: string) => string;
  anyLabel?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <Select name={name} defaultValue={value ?? "__any"}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__any">{anyLabel ?? "Any"}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {formatOption(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
