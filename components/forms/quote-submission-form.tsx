"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { quoteSubmissionSchema } from "@/lib/validation";
import { submitQuote } from "@/app/app/forwarder/requests/[requestId]/actions";

type FormValues = z.input<typeof quoteSubmissionSchema>;

export function QuoteSubmissionForm({
  requestId,
  defaultValues,
}: {
  requestId: string;
  defaultValues?: Partial<FormValues>;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(quoteSubmissionSchema),
    defaultValues: {
      currency: "PHP",
      ...defaultValues,
    },
  });

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
      className="mt-6 grid gap-5 rounded-lg border bg-card p-4 shadow-sm sm:p-6"
    >
      <input type="hidden" name="requestId" value={requestId} />
      <div className="min-w-0">
        <h2 className="text-lg font-semibold">Send your quote</h2>
        <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">
          Your quote is private. Other forwarders cannot see your price or
          service details.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Amount"
          helper="Enter the total amount the importer should compare."
          error={errors.quoteAmount?.message}
        >
          <Input {...register("quoteAmount")} inputMode="decimal" placeholder="25000.00" />
        </Field>
        <Field
          label="Currency"
          helper="Philippine peso is supported for this workflow."
          error={errors.currency?.message}
        >
          <Input {...register("currency")} placeholder="PHP" />
        </Field>
        <div className="sm:col-span-2">
          <Field
            label="Service offered"
            helper="Summarize what your quote covers, such as door-to-door consolidation."
            error={errors.serviceOffered?.message}
          >
            <Input
              {...register("serviceOffered")}
              placeholder="China to Philippines door-to-door consolidation"
            />
          </Field>
        </div>
        <Field
          label="Minimum transit days"
          helper="Use your realistic best-case transit time."
          error={errors.estimatedTransitMinDays?.message}
        >
          <Input {...register("estimatedTransitMinDays")} inputMode="numeric" placeholder="12" />
        </Field>
        <Field
          label="Maximum transit days"
          helper="Use your realistic worst-case transit time."
          error={errors.estimatedTransitMaxDays?.message}
        >
          <Input {...register("estimatedTransitMaxDays")} inputMode="numeric" placeholder="18" />
        </Field>
        <Field
          label="Valid until"
          helper="Choose the date this price expires."
          error={errors.validUntil?.message}
        >
          <Input
            {...register("validUntil")}
            inputMode="numeric"
            placeholder="2026-07-01"
          />
        </Field>
      </div>

      <Field
        label="Inclusions"
        helper="List what is included, such as pickup, freight, customs processing, delivery, or documentation support."
        error={errors.inclusions?.message}
      >
        <Textarea {...register("inclusions")} rows={3} placeholder="Example: China pickup, ocean freight, customs assistance, Manila delivery" />
      </Field>
      <Field
        label="Exclusions"
        helper="List what is not included so the importer can compare quotes fairly."
        error={errors.exclusions?.message}
      >
        <Textarea {...register("exclusions")} rows={3} placeholder="Example: Duties, taxes, storage, special permits" />
      </Field>
      <Field
        label="Notes"
        helper="Add assumptions, required documents, or questions for the importer."
        error={errors.notes?.message}
      >
        <Textarea {...register("notes")} rows={3} />
      </Field>

      <div>
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Sending..." : "Send quote"}
        </Button>
      </div>
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
