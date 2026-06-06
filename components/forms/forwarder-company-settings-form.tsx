"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

import { saveForwarderCompanySettings } from "@/app/app/forwarder/company/actions";
import { Button } from "@/components/ui/button";
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
import { forwarderCompanySettingsSchema } from "@/lib/validation";

type FormValues = z.input<typeof forwarderCompanySettingsSchema>;

export function ForwarderCompanySettingsForm({
  defaultValues,
  cancelHref,
  canEdit = true,
}: {
  defaultValues: FormValues;
  cancelHref?: string;
  canEdit?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(forwarderCompanySettingsSchema),
    defaultValues,
  });

  function submitSettings(data: FormValues) {
    const formData = new FormData();

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }

    startTransition(() => {
      void saveForwarderCompanySettings(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit(submitSettings)} className="grid gap-6">
      <fieldset disabled={!canEdit || isPending} className="grid gap-6">
      <section className="grid gap-4">
        <div>
          <h2 className="text-lg font-semibold">Public company profile</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            These details appear on your public forwarder company profile.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" error={errors.companyName?.message}>
            <Input {...register("companyName")} />
          </Field>
          <Field
            label="Supported shipping modes"
            helper="Choose the lanes your company commonly quotes."
            error={errors.shippingModes?.message}
          >
            <Controller
              control={control}
              name="shippingModes"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Sea and air</SelectItem>
                    <SelectItem value="sea">Sea freight</SelectItem>
                    <SelectItem value="air">Air freight</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-lg font-semibold">Service coverage</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Describe the China origins and Philippines destinations importers should
            expect to see on your public profile.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Main China origin cities" error={errors.originCities?.message}>
            <Textarea
              {...register("originCities")}
              rows={3}
              placeholder="Guangzhou, Shenzhen, Yiwu"
            />
          </Field>
          <Field
            label="Main Philippines destinations"
            error={errors.destinationAreas?.message}
          >
            <Textarea
              {...register("destinationAreas")}
              rows={3}
              placeholder="Metro Manila, Cebu, Davao"
            />
          </Field>
        </div>
        <Field
          label="Short service description"
          helper="Keep this practical. Mention what importers should know before requesting a quote."
          error={errors.serviceDescription?.message}
        >
          <Textarea {...register("serviceDescription")} rows={4} />
        </Field>
      </section>

      <section className="grid gap-4 border-t pt-6">
        <div>
          <h2 className="text-lg font-semibold">Internal contact details</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            These details are not shown on your public company profile.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact person" error={errors.contactPerson?.message}>
            <Input {...register("contactPerson")} />
          </Field>
          <Field label="Contact email" error={errors.contactEmail?.message}>
            <Input {...register("contactEmail")} inputMode="email" />
          </Field>
        </div>
      </section>

      <section className="grid gap-4 border-t pt-6">
        <div>
          <h2 className="text-lg font-semibold">Quote defaults</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Save common quote details so you can respond faster to shipment
            requests. You can still edit every quote before sending it.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default currency" error={errors.defaultCurrency?.message}>
            <Input {...register("defaultCurrency")} placeholder="PHP" />
          </Field>
          <Field
            label="Quote valid for"
            helper="Number of days from the day you prepare a quote."
            error={errors.defaultValidForDays?.message}
          >
            <Input
              {...register("defaultValidForDays")}
              inputMode="numeric"
              placeholder="14"
            />
          </Field>
          <Field
            label="Minimum transit days"
            error={errors.defaultTransitMinDays?.message}
          >
            <Input
              {...register("defaultTransitMinDays")}
              inputMode="numeric"
              placeholder="12"
            />
          </Field>
          <Field
            label="Maximum transit days"
            error={errors.defaultTransitMaxDays?.message}
          >
            <Input
              {...register("defaultTransitMaxDays")}
              inputMode="numeric"
              placeholder="18"
            />
          </Field>
        </div>
        <Field
          label="Default service offered"
          error={errors.defaultServiceOffered?.message}
        >
          <Input
            {...register("defaultServiceOffered")}
            placeholder="China to Philippines door-to-door consolidation"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Default inclusions"
            helper="List what is usually included, such as pickup, freight, customs support, or delivery."
            error={errors.defaultInclusions?.message}
          >
            <Textarea {...register("defaultInclusions")} rows={4} />
          </Field>
          <Field
            label="Default exclusions"
            helper="List common exclusions, such as duties, taxes, storage, or special permits."
            error={errors.defaultExclusions?.message}
          >
            <Textarea {...register("defaultExclusions")} rows={4} />
          </Field>
        </div>
        <Field
          label="Default quote notes"
          helper="Add common assumptions or document reminders."
          error={errors.defaultNotes?.message}
        >
          <Textarea {...register("defaultNotes")} rows={4} />
        </Field>
      </section>

      <div className="grid gap-3 border-t pt-5 sm:flex sm:flex-row-reverse">
        <Button
          type="submit"
          disabled={!canEdit || isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? "Saving..." : "Save company settings"}
        </Button>
        {cancelHref ? (
          <Button
            asChild
            type="button"
            variant="outline"
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            <Link href={cancelHref}>Cancel</Link>
          </Button>
        ) : null}
      </div>
      </fieldset>
    </form>
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
