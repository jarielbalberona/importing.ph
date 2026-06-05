"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatShippingModePreference } from "@/lib/format";
import {
  quoteSubmissionSchema,
  quoteSubmissionSchemaForRequestMode,
} from "@/lib/validation";
import { submitQuote } from "@/app/app/forwarder/requests/[requestId]/actions";

type FormValues = z.input<typeof quoteSubmissionSchema>;

const serviceTypeOptions = [
  {
    value: "supplier_pickup_to_door",
    label: "Supplier pickup -> my address",
  },
  {
    value: "china_warehouse_to_door",
    label: "China warehouse -> my address",
  },
  {
    value: "supplier_pickup_to_ph_warehouse",
    label: "Supplier pickup -> PH warehouse pickup",
  },
  {
    value: "china_warehouse_to_ph_warehouse",
    label: "China warehouse -> PH warehouse pickup",
  },
  {
    value: "not_sure",
    label: "Not sure, recommend for me",
  },
] as const;

type ServiceTypeValue = (typeof serviceTypeOptions)[number]["value"];

const serviceTypeLabels: Record<ServiceTypeValue, string> = {
  supplier_pickup_to_door: "Supplier pickup -> my address",
  china_warehouse_to_door: "China warehouse -> my address",
  supplier_pickup_to_ph_warehouse: "Supplier pickup -> PH warehouse pickup",
  china_warehouse_to_ph_warehouse: "China warehouse -> PH warehouse pickup",
  not_sure: "Not sure, recommend for me",
};

export function QuoteSubmissionForm({
  requestId,
  requestShippingModePreference,
  defaultValues,
  cancelHref,
}: {
  requestId: string;
  requestShippingModePreference: "sea" | "air" | "either";
  defaultValues?: Partial<FormValues>;
  cancelHref?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const initialServiceType = useMemo(
    () => serviceTypeFromValue(defaultValues?.serviceOffered),
    [defaultValues?.serviceOffered],
  );
  const [serviceType, setServiceType] = useState<ServiceTypeValue>(
    initialServiceType,
  );
  const [shippingMode, setShippingMode] = useState<
    FormValues["shippingMode"] | undefined
  >(
    requestShippingModePreference === "either"
      ? defaultValues?.shippingMode
      : requestShippingModePreference,
  );
  const shippingModeLocked = requestShippingModePreference !== "either";
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(
      quoteSubmissionSchemaForRequestMode(requestShippingModePreference),
    ),
    defaultValues: {
      currency: "PHP",
      shippingMode:
        requestShippingModePreference === "either"
          ? defaultValues?.shippingMode
          : requestShippingModePreference,
      ...defaultValues,
    },
  });

  useEffect(() => {
    setValue("serviceOffered", serviceTypeLabels[serviceType], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("currency", "PHP", { shouldDirty: true, shouldValidate: false });
    if (requestShippingModePreference !== "either") {
      setValue("shippingMode", requestShippingModePreference, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [requestShippingModePreference, serviceType, setValue]);

  function submitQuoteForm(data: FormValues) {
    const formData = new FormData();

    formData.append("requestId", requestId);

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    }

    startTransition(() => {
      void submitQuote(formData);
    });
  }

  return (
    <form
      onSubmit={handleSubmit(submitQuoteForm)}
      className="grid gap-6 rounded-md border bg-background p-4 sm:p-5"
    >
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" {...register("currency")} />
      <input type="hidden" {...register("serviceOffered")} />
      <div className="min-w-0">
        <h2 className="text-lg font-semibold">Submit quote</h2>
        <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">
          Private quote. Only the importer can see your pricing and service
          details.
        </p>
      </div>

      <Section
        title="Price"
        description="Enter the total amount the importer should compare."
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <Field label="Amount" error={errors.quoteAmount?.message}>
            <div className="flex items-center gap-2">
              <Input
                {...register("quoteAmount")}
                inputMode="decimal"
                placeholder="25000.00"
              />
              <Badge variant="outline" className="shrink-0">
                PHP
              </Badge>
            </div>
          </Field>
          <Field label="Valid until" error={errors.validUntil?.message}>
            <Input {...register("validUntil")} type="date" />
          </Field>
        </div>
      </Section>

      <Section
        title="Service and timing"
        description="Keep service choice and timing practical."
      >
        <div className="grid gap-4">
          <Field
            label="Importer shipping mode preference"
            helper="This is what the importer asked for on the request."
          >
            <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
              {formatShippingModePreference(requestShippingModePreference)}
            </div>
          </Field>
          <Field
            label="Quote shipping mode"
            helper={
              shippingModeLocked
                ? "Locked to the importer request so quotes stay comparable."
                : "Choose whether this quote is for sea cargo or air cargo."
            }
            error={errors.shippingMode?.message}
          >
            <Select
              name="shippingMode"
              value={shippingMode}
              onValueChange={(value) => {
                setShippingMode(value as FormValues["shippingMode"]);
                setValue("shippingMode", value as FormValues["shippingMode"], {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              disabled={shippingModeLocked}
            >
              <SelectTrigger aria-invalid={Boolean(errors.shippingMode) || undefined}>
                <SelectValue placeholder="Select shipping mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sea">Sea cargo</SelectItem>
                <SelectItem value="air">Air cargo</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" {...register("shippingMode")} />
          </Field>
          <Field
            label="Service type"
            helper="Choose the closest coverage for this quote."
            error={errors.serviceOffered?.message}
          >
            <Select
              value={serviceType}
              onValueChange={(value) => setServiceType(value as ServiceTypeValue)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <div className="grid gap-2">
              <Label>Estimated transit time</Label>
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-2">
                <div className="grid min-w-0 gap-2">
                  <Input
                    {...register("estimatedTransitMinDays", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    max={365}
                    step={1}
                    inputMode="numeric"
                    placeholder="9"
                    aria-label="Transit time from"
                  />
                  {errors.estimatedTransitMinDays?.message ? (
                    <p className="text-xs font-medium text-red-700">
                      {errors.estimatedTransitMinDays.message}
                    </p>
                  ) : null}
                </div>
                <span className="text-sm text-muted-foreground">to</span>
                <div className="grid min-w-0 gap-2">
                  <Input
                    {...register("estimatedTransitMaxDays", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    max={365}
                    step={1}
                    inputMode="numeric"
                    placeholder="15"
                    aria-label="Transit time to"
                  />
                  {errors.estimatedTransitMaxDays?.message ? (
                    <p className="text-xs font-medium text-red-700">
                      {errors.estimatedTransitMaxDays.message}
                    </p>
                  ) : null}
                </div>
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Quote coverage"
        description="Keep the comparison block short and direct."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Included"
            helper="Pickup, freight, customs processing, delivery..."
            error={errors.inclusions?.message}
          >
            <Textarea
              {...register("inclusions")}
              rows={3}
              placeholder="Pickup, freight, customs processing, delivery..."
            />
          </Field>
          <Field
            label="Not included"
            helper="Duties, storage, special handling..."
            error={errors.exclusions?.message}
          >
            <Textarea
              {...register("exclusions")}
              rows={3}
              placeholder="Duties, storage, special handling..."
            />
          </Field>
        </div>
      </Section>

      <Section title="Notes" description="Optional">
        <Field
          label="Notes or assumptions"
          helper="Add required documents, assumptions, or questions for the importer."
          error={errors.notes?.message}
        >
          <Textarea {...register("notes")} rows={3} />
        </Field>
      </Section>

      <div className="grid gap-3 border-t pt-5 sm:flex sm:flex-row-reverse">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Submitting..." : "Submit quote"}
        </Button>
        {cancelHref ? (
          <Button
            asChild
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Link href={cancelHref}>Cancel</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function serviceTypeFromValue(value?: string): ServiceTypeValue {
  if (!value) {
    return "supplier_pickup_to_door";
  }

  const matched = Object.entries(serviceTypeLabels).find(
    ([, label]) => label.toLowerCase() === value.toLowerCase(),
  );

  return (
    (matched?.[0] as ServiceTypeValue | undefined) ??
    "supplier_pickup_to_door"
  );
}

function Field({
  label,
  helper,
  error,
  children,
}: {
  label: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <Label>{label}</Label>
      {children}
      {helper ? (
        <p className="text-xs leading-5 text-muted-foreground">{helper}</p>
      ) : null}
      {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
