"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { saveImporterProfile } from "@/app/app/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importerProfileSettingsSchema } from "@/lib/validation";

type FormValues = z.input<typeof importerProfileSettingsSchema>;

export function ImporterProfileForm({
  defaultValues,
}: {
  defaultValues: FormValues;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const titleId = useId();
  const descriptionId = useId();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(importerProfileSettingsSchema),
    defaultValues,
  });

  function submitProfile(data: FormValues) {
    const formData = new FormData();

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }

    startTransition(() => {
      void saveImporterProfile(formData);
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-auto"
        onClick={() => setOpen(true)}
      >
        Edit profile
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 px-4 py-6"
          role="presentation"
        >
          <div
            aria-describedby={descriptionId}
            aria-labelledby={titleId}
            aria-modal="true"
            className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-lg border bg-background p-4 shadow-lg sm:p-6"
            role="dialog"
          >
            <div className="mb-5">
              <h2 id={titleId} className="text-lg font-semibold">
                Edit profile
              </h2>
              <p
                id={descriptionId}
                className="mt-1 text-sm leading-6 text-muted-foreground"
              >
                Update the contact details forwarders use when preparing quotes.
              </p>
            </div>

            <form onSubmit={handleSubmit(submitProfile)} className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Contact name"
                  helper="Use the name forwarders should recognize when quoting."
                  error={errors.fullName?.message}
                >
                  <Input {...register("fullName")} />
                </Field>
                <Field
                  label="Company or business name"
                  helper="This appears on your workspace records."
                  error={errors.companyName?.message}
                >
                  <Input {...register("companyName")} />
                </Field>
                <Field
                  label="Philippines location"
                  helper="City or area is enough."
                  error={errors.location?.message}
                >
                  <Input
                    {...register("location")}
                    placeholder="Makati, Metro Manila"
                  />
                </Field>
                <Field
                  label="Contact number"
                  helper="Add the number forwarders can use after quoting."
                  error={errors.contactPhone?.message}
                >
                  <Input {...register("contactPhone")} inputMode="tel" />
                </Field>
              </div>

              <div className="grid gap-3 border-t pt-5 sm:flex sm:flex-row-reverse">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full sm:w-auto"
                >
                  {isPending ? "Saving..." : "Save profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  className="w-full sm:w-auto"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
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
