"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { FieldPath, FieldValues } from "react-hook-form";
import type { z } from "zod";

import {
  DetailCard,
  DetailValue,
  InfoGrid,
  StatusBadge,
} from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  cargoTypeEnum,
  deliveryPreferenceEnum,
  shippingPreferenceEnum,
} from "@/db/schema";
import { titleFromEnum } from "@/lib/format";
import { createShipmentRequestSchema } from "@/lib/validation";
import { createShipmentRequest } from "@/app/app/requests/new/actions";

type FormValues = z.input<typeof createShipmentRequestSchema>;

type Step = {
  title: string;
  description: string;
  fields: FieldPath<FormValues>[];
};

const steps = [
  {
    title: "Cargo basics",
    description: "Start with a short, plain description of what you are importing.",
    fields: ["cargoDescription", "cargoType"],
  },
  {
    title: "Size, weight, and value",
    description: "Use your best estimate. Forwarders can clarify details after quoting.",
    fields: [
      "totalCbm",
      "totalWeightKg",
      "packageCount",
      "lengthCm",
      "widthCm",
      "heightCm",
      "declaredValue",
    ],
  },
  {
    title: "Pickup and destination",
    description: "Tell forwarders where the shipment starts and where it needs to go.",
    fields: ["origin", "destination"],
  },
  {
    title: "Shipping preferences",
    description: "Pick the closest option. Choose Not sure if you want forwarders to advise.",
    fields: ["deliveryPreference", "shippingPreference"],
  },
  {
    title: "Notes and documents",
    description:
      "Add anything forwarders should know before quoting, especially document or handling notes.",
    fields: ["notes", "attachmentNotes"],
  },
  {
    title: "Review and post",
    description:
      "Confirm the details. Posting makes the request visible to forwarders for private quotes.",
    fields: [],
  },
] satisfies Step[];

export function NewShipmentRequestForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createShipmentRequestSchema),
    mode: "onTouched",
    defaultValues: {
      cargoType: "general_goods",
      deliveryPreference: "door_to_door",
      shippingPreference: "balanced",
    },
  });

  const values = useWatch({ control });
  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isFinalStep = currentStep === steps.length - 1;
  const progressLabel = `Step ${currentStep + 1} of ${steps.length}`;

  async function goNext() {
    const valid = await trigger(step.fields, { shouldFocus: true });

    if (!valid) {
      return;
    }

    setCurrentStep((value) => Math.min(value + 1, steps.length - 1));
  }

  function goBack() {
    setCurrentStep((value) => Math.max(value - 1, 0));
  }

  function submitRequest(data: FormValues) {
    const formData = new FormData();

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    }

    startTransition(() => {
      void createShipmentRequest(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit(submitRequest)} className="mt-8 grid gap-6">
      <DetailCard>
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <StatusBadge>{progressLabel}</StatusBadge>
            <h2 className="mt-3 break-words text-xl font-semibold">
              {step.title}
            </h2>
            <p className="mt-1 max-w-2xl break-words text-sm leading-6 text-muted-foreground">
              {step.description}
            </p>
          </div>
          <StepIndicator currentStep={currentStep} />
        </div>
      </DetailCard>

      <DetailCard>
        {currentStep === 0 ? <CargoBasicsStep register={register} errors={errors} /> : null}
        {currentStep === 1 ? <SizeStep register={register} errors={errors} /> : null}
        {currentStep === 2 ? <RouteStep register={register} errors={errors} /> : null}
        {currentStep === 3 ? <PreferencesStep register={register} errors={errors} /> : null}
        {currentStep === 4 ? <NotesStep register={register} errors={errors} /> : null}
        {currentStep === 5 ? <ReviewStep values={values} /> : null}
      </DetailCard>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between [&>button]:w-full [&>button]:sm:w-auto">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={isFirstStep || isPending}
        >
          Back
        </Button>
        {isFinalStep ? (
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Posting..." : "Post request"}
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={goNext}>
            Continue
          </Button>
        )}
      </div>
    </form>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <ol className="grid w-full grid-cols-6 gap-2 lg:w-auto">
      {steps.map((step, index) => (
        <li key={step.title}>
          <button
            type="button"
            className="grid w-full gap-1 text-left"
            aria-current={index === currentStep ? "step" : undefined}
            disabled
          >
            <span
              className={
                index <= currentStep
                  ? "h-2 w-full min-w-6 rounded-full bg-primary lg:w-10"
                  : "h-2 w-full min-w-6 rounded-full bg-border lg:w-10"
              }
            />
            <span className="sr-only">{step.title}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}

function CargoBasicsStep({
  register,
  errors,
}: StepComponentProps<FormValues>) {
  return (
    <div className="grid gap-4">
      <Field
        label="Shipment title and cargo description"
        helper="Use a short description you will recognize later, such as 'Phone accessories, Guangzhou to Manila'."
        error={errors.cargoDescription?.message}
      >
        <Input
          {...register("cargoDescription")}
          placeholder="Example: 20 cartons of phone accessories"
        />
      </Field>
      <Field
        label="Cargo type"
        helper="Choose the closest match. Forwarders can ask follow-up questions after they review the request."
        error={errors.cargoType?.message}
      >
        <Select {...register("cargoType")}>
          {cargoTypeEnum.enumValues.map((value) => (
            <option key={value} value={value}>
              {titleFromEnum(value)}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}

function SizeStep({ register, errors }: StepComponentProps<FormValues>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label="Total CBM"
        helper="CBM means total shipment volume. If you do not know it, provide weight or complete dimensions instead."
        error={errors.totalCbm?.message}
      >
        <Input {...register("totalCbm")} inputMode="decimal" placeholder="1.250" />
      </Field>
      <Field
        label="Total weight kg"
        helper="Use gross weight if that is all you have. Estimates are acceptable."
        error={errors.totalWeightKg?.message}
      >
        <Input {...register("totalWeightKg")} inputMode="decimal" placeholder="120" />
      </Field>
      <Field
        label="Package or carton count"
        helper="Required when using dimensions instead of CBM or weight."
        error={errors.packageCount?.message}
      >
        <Input {...register("packageCount")} inputMode="numeric" placeholder="20" />
      </Field>
      <Field
        label="Declared value"
        helper="Optional. Use the invoice value if available."
        error={errors.declaredValue?.message}
      >
        <Input {...register("declaredValue")} inputMode="decimal" placeholder="50000" />
      </Field>
      <Field
        label="Length cm"
        helper="Use the package or carton dimensions if you do not know total CBM."
        error={errors.lengthCm?.message}
      >
        <Input {...register("lengthCm")} inputMode="decimal" />
      </Field>
      <Field label="Width cm" error={errors.widthCm?.message}>
        <Input {...register("widthCm")} inputMode="decimal" />
      </Field>
      <Field label="Height cm" error={errors.heightCm?.message}>
        <Input {...register("heightCm")} inputMode="decimal" />
      </Field>
    </div>
  );
}

function RouteStep({ register, errors }: StepComponentProps<FormValues>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label="Origin"
        helper="City or supplier area is enough. Example: Guangzhou, China."
        error={errors.origin?.message}
      >
        <Input {...register("origin")} placeholder="Example: Guangzhou, China" />
      </Field>
      <Field
        label="Destination"
        helper="City or delivery area in the Philippines."
        error={errors.destination?.message}
      >
        <Input {...register("destination")} placeholder="Example: Manila, Philippines" />
      </Field>
    </div>
  );
}

function PreferencesStep({
  register,
  errors,
}: StepComponentProps<FormValues>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label="Delivery preference"
        helper="Choose Not sure if you want forwarders to recommend the best route."
        error={errors.deliveryPreference?.message}
      >
        <Select {...register("deliveryPreference")}>
          {deliveryPreferenceEnum.enumValues.map((value) => (
            <option key={value} value={value}>
              {titleFromEnum(value)}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label="Shipping preference"
        helper="Choose what matters most: cost, speed, or a balance of both."
        error={errors.shippingPreference?.message}
      >
        <Select {...register("shippingPreference")}>
          {shippingPreferenceEnum.enumValues.map((value) => (
            <option key={value} value={value}>
              {titleFromEnum(value)}
            </option>
          ))}
        </Select>
      </Field>
      <div className="rounded-md border bg-muted p-4 text-sm leading-6 text-muted-foreground sm:col-span-2">
        If the shipment needs MSDS, permits, special handling, or supplier
        coordination, add those details in the notes step.
      </div>
    </div>
  );
}

function NotesStep({ register, errors }: StepComponentProps<FormValues>) {
  return (
    <div className="grid gap-4">
      <Field
        label="Notes"
        helper="Add handling needs, timing concerns, supplier details, or anything forwarders should know before quoting."
        error={errors.notes?.message}
      >
        <Textarea {...register("notes")} rows={4} />
      </Field>
      <Field
        label="Supporting document notes"
        helper="File uploads are not available yet. You can describe your documents here, such as invoice, packing list, photos, or MSDS availability."
        error={errors.attachmentNotes?.message}
      >
        <Textarea
          {...register("attachmentNotes")}
          rows={3}
          placeholder="Example: Packing list ready. MSDS not sure yet."
        />
      </Field>
    </div>
  );
}

function ReviewStep({ values }: { values: Partial<FormValues> }) {
  const reviewGroups = useMemo<ReviewGroup[]>(
    () => [
      {
        title: "Cargo",
        items: [
          ["Shipment title and cargo description", values.cargoDescription],
          ["Cargo type", titleFromEnum(values.cargoType)],
        ],
      },
      {
        title: "Size, weight, and value",
        items: [
          ["Total CBM", valueWithUnit(values.totalCbm, "CBM")],
          ["Total weight", valueWithUnit(values.totalWeightKg, "kg")],
          ["Package or carton count", values.packageCount],
          ["Dimensions", dimensionsValue(values)],
          ["Declared value", values.declaredValue],
        ],
      },
      {
        title: "Pickup and destination",
        items: [
          ["Origin", values.origin],
          ["Destination", values.destination],
        ],
      },
      {
        title: "Preferences",
        items: [
          ["Delivery preference", titleFromEnum(values.deliveryPreference)],
          ["Shipping preference", titleFromEnum(values.shippingPreference)],
        ],
      },
      {
        title: "Notes and documents",
        items: [
          ["Notes", values.notes],
          ["Supporting document notes", values.attachmentNotes],
        ],
      },
    ],
    [values],
  );

  return (
    <div className="grid gap-6">
      <div className="rounded-md border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-cyan-950">
        Review the details below. Posting this request makes it visible to
        forwarders so they can send private quotes.
      </div>
      {reviewGroups.map((group) => (
        <section key={group.title} className="grid gap-3">
          <h3 className="text-base font-semibold">{group.title}</h3>
          <InfoGrid>
            {group.items.map(([label, value]) => (
              <DetailValue
                key={label}
                label={label}
                value={displayValue(value)}
              />
            ))}
          </InfoGrid>
        </section>
      ))}
    </div>
  );
}

type ReviewGroup = {
  title: string;
  items: ReviewItem[];
};

type ReviewItem = [label: string, value: unknown];

type StepComponentProps<T extends FieldValues> = {
  register: ReturnType<typeof useForm<T>>["register"];
  errors: ReturnType<typeof useForm<T>>["formState"]["errors"];
};

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

function displayValue(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return "Not provided";
  }

  return String(value);
}

function valueWithUnit(value: unknown, unit: string) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return `${value} ${unit}`;
}

function dimensionsValue(values: Partial<FormValues>) {
  if (!values.lengthCm || !values.widthCm || !values.heightCm) {
    return undefined;
  }

  return `${values.lengthCm} x ${values.widthCm} x ${values.heightCm} cm`;
}
