"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  cloneElement,
  isValidElement,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type { ReactElement, ReactNode } from "react";
import { flushSync } from "react-dom";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { FieldPath, FieldValues, UseFormSetValue } from "react-hook-form";
import type { z } from "zod";
import { FileText, FileUp, Loader2, X } from "lucide-react";

import { DetailValue, InfoGrid, StatusBadge } from "@/components/app-shell";
import { GuideLinksCard } from "@/components/guides/guide-links-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
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
import {
  LocationPicker,
  type DestinationSelection,
} from "@/features/locations/components/LocationPicker";
import {
  formatDeliveryPreference,
  formatShippingModePreference,
  titleFromEnum,
} from "@/lib/format";
import {
  createShipmentRequestSchema,
  otherChinaOriginValue,
} from "@/lib/validation";
import {
  buildDestinationDisplayName,
  calculateEstimatedTotalCbm,
  getShipmentRequestStepBlockingErrors,
  inferShipmentSizingMethod,
  prepareShipmentSizingForSubmission,
  type ShipmentRequestStepIndex,
  type ShipmentSizingMethod,
} from "@/lib/shipment-request-wizard";
import {
  createShipmentRequest,
  saveDraftShipmentRequest,
} from "@/app/app/requests/new/actions";
import {
  acceptedFileDescription,
  formatBytes,
  shipmentAttachmentMaxCount,
} from "@/lib/file-rules";
import { cn } from "@/lib/utils";

type FormValues = z.input<typeof createShipmentRequestSchema>;
type Option = {
  value: string;
  label: string;
};

type Step = {
  title: string;
  description: string;
  fields: FieldPath<FormValues>[];
};

type UploadedAttachment = {
  id: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  status: string;
};

const steps = [
  {
    title: "Cargo details",
    description:
      "Describe what you are importing and provide the best size, weight, and value estimate you have.",
    fields: [
      "cargoDescription",
      "cargoType",
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
    title: "Route and delivery",
    description:
      "Tell forwarders where the shipment starts, how it should be received, and where it needs to go.",
    fields: [
      "origin",
      "destination",
      "destinationRegionCode",
      "destinationRegionName",
      "destinationProvinceCode",
      "destinationProvinceName",
      "destinationCityMunicipalityCode",
      "destinationCityMunicipalityName",
      "destinationBarangayCode",
      "destinationBarangayName",
      "destinationAddressDetails",
      "destinationDisplayName",
      "deliveryPreference",
      "shippingModePreference",
    ],
  },
  {
    title: "Preferences and documents",
    description:
      "Tell forwarders what matters most and add any files or handling notes.",
    fields: ["shippingPreference", "notes", "attachmentNotes"],
  },
  {
    title: "Review and post",
    description:
      "Review the shipment request before sending it to forwarders.",
    fields: [],
  },
] satisfies Step[];

const cargoTypeOptions = [
  { value: "general_goods", label: "General merchandise" },
  { value: "electronics", label: "Electronics / gadgets" },
  { value: "apparel", label: "Clothing / textiles" },
  { value: "bags_shoes_accessories", label: "Bags / shoes / accessories" },
  { value: "cosmetics", label: "Cosmetics / beauty products" },
  { value: "food_or_beverage", label: "Food / packaged goods" },
  { value: "furniture", label: "Furniture / home items" },
  { value: "home_appliances", label: "Home appliances" },
  { value: "machinery", label: "Machinery / equipment" },
  { value: "auto_motorcycle_parts", label: "Auto / motorcycle parts" },
  { value: "construction_materials", label: "Construction materials" },
  { value: "tools_hardware", label: "Tools / hardware" },
  { value: "packaging_supplies", label: "Packaging supplies" },
  { value: "plastic_paper_products", label: "Plastic / paper products" },
  { value: "resin_epoxy_adhesives", label: "Resin / epoxy / adhesives" },
  { value: "chemicals_liquids", label: "Chemicals / liquids" },
  { value: "paints_coatings_solvents", label: "Paints / coatings / solvents" },
  { value: "batteries_power_banks", label: "Batteries / power banks" },
  { value: "fragile_items", label: "Fragile items" },
  { value: "oversized_bulky_cargo", label: "Oversized / bulky cargo" },
  { value: "branded_goods", label: "Branded goods" },
  { value: "mixed_cargo", label: "Mixed cargo" },
  { value: "other", label: "Other" },
] satisfies Option[];

const cargoTypesRequiringHandlingDetails = new Set([
  "resin_epoxy_adhesives",
  "chemicals_liquids",
  "paints_coatings_solvents",
  "batteries_power_banks",
]);

const chinaOriginOptions = [
  { value: "Guangzhou, China", label: "Guangzhou" },
  { value: "Shenzhen, China", label: "Shenzhen" },
  { value: "Dongguan, China", label: "Dongguan" },
  { value: "Foshan, China", label: "Foshan" },
  { value: "Zhongshan, China", label: "Zhongshan" },
  { value: "Huizhou, China", label: "Huizhou" },
  { value: "Yiwu, China", label: "Yiwu" },
  { value: "Hangzhou, China", label: "Hangzhou" },
  { value: "Ningbo, China", label: "Ningbo" },
  { value: "Wenzhou, China", label: "Wenzhou" },
  { value: "Shanghai, China", label: "Shanghai" },
  { value: "Suzhou, China", label: "Suzhou" },
  { value: "Nanjing, China", label: "Nanjing" },
  { value: "Xiamen, China", label: "Xiamen" },
  { value: "Quanzhou, China", label: "Quanzhou" },
  { value: "Fuzhou, China", label: "Fuzhou" },
  { value: "Qingdao, China", label: "Qingdao" },
  { value: "Jinan, China", label: "Jinan" },
  { value: "Tianjin, China", label: "Tianjin" },
  { value: "Beijing, China", label: "Beijing" },
  { value: otherChinaOriginValue, label: "Other city in China" },
] satisfies Option[];

const chinaOriginOptionValues = new Set(
  chinaOriginOptions.map((option) => option.value),
);

const deliveryPreferenceOptions = [
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
] satisfies Option[];

const shippingPreferenceOptions = [
  { value: "lowest_cost", label: "Cheapest available" },
  { value: "fastest", label: "Fastest available" },
  { value: "balanced", label: "Balanced cost and speed" },
  { value: "not_sure", label: "Forwarder recommendation" },
] satisfies Option[];

const shippingModePreferenceOptions = [
  { value: "sea", label: "Sea cargo" },
  { value: "air", label: "Air cargo" },
  { value: "either", label: "Open to either" },
] satisfies Option[];

export function NewShipmentRequestForm({
  defaultValues,
}: {
  defaultValues?: Partial<FormValues>;
} = {}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [sizingMethod, setSizingMethod] = useState<ShipmentSizingMethod>(() =>
    inferShipmentSizingMethod(defaultValues ?? {}),
  );
  const sizingCache = useRef({
    knownCbm: defaultValues?.totalCbm,
    dimensions: {
      packageCount: defaultValues?.packageCount,
      lengthCm: defaultValues?.lengthCm,
      widthCm: defaultValues?.widthCm,
      heightCm: defaultValues?.heightCm,
    },
  });
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setError,
    clearErrors,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createShipmentRequestSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      cargoType: undefined,
      deliveryPreference: undefined,
      shippingModePreference: undefined,
      shippingPreference: undefined,
      ...defaultValues,
    },
  });

  const values = useWatch({ control });
  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isFinalStep = currentStep === steps.length - 1;
  const progressLabel = `Step ${currentStep + 1} of ${steps.length}`;

  function changeSizingMethod(nextMethod: ShipmentSizingMethod) {
    if (nextMethod === sizingMethod) {
      return;
    }

    const options = { shouldDirty: true, shouldValidate: false };

    if (nextMethod === "dimensions") {
      sizingCache.current.knownCbm = getValues("totalCbm");
      setValue("totalCbm", undefined, options);
      setValue(
        "packageCount",
        sizingCache.current.dimensions.packageCount,
        options,
      );
      setValue("lengthCm", sizingCache.current.dimensions.lengthCm, options);
      setValue("widthCm", sizingCache.current.dimensions.widthCm, options);
      setValue("heightCm", sizingCache.current.dimensions.heightCm, options);
    } else {
      sizingCache.current.dimensions = {
        packageCount: getValues("packageCount"),
        lengthCm: getValues("lengthCm"),
        widthCm: getValues("widthCm"),
        heightCm: getValues("heightCm"),
      };
      setValue("packageCount", undefined, options);
      setValue("lengthCm", undefined, options);
      setValue("widthCm", undefined, options);
      setValue("heightCm", undefined, options);
      setValue("totalCbm", sizingCache.current.knownCbm, options);
    }

    clearErrors([
      "totalCbm",
      "packageCount",
      "lengthCm",
      "widthCm",
      "heightCm",
    ]);
    setSizingMethod(nextMethod);
  }

  async function goNext() {
    const valid = await validateCurrentStep();

    if (!valid) {
      setFormError("Complete the required fields before continuing.");
      return;
    }

    setFormError(null);
    setCurrentStep((value) => Math.min(value + 1, steps.length - 1));
  }

  async function validateCurrentStep() {
    clearErrors(step.fields);
    const fieldsValid = await trigger(step.fields, { shouldFocus: true });
    const blockingErrors = getShipmentRequestStepBlockingErrors(
      currentStep as ShipmentRequestStepIndex,
      prepareShipmentSizingForSubmission(getValues(), sizingMethod),
    );
    const blockingErrorEntries = Object.entries(blockingErrors);

    for (const [field, message] of blockingErrorEntries) {
      setError(
        field as FieldPath<FormValues>,
        {
          type: "manual",
          message,
        },
        { shouldFocus: blockingErrorEntries[0]?.[0] === field },
      );
    }

    return fieldsValid && blockingErrorEntries.length === 0;
  }

  function goBack() {
    setFormError(null);
    setCurrentStep((value) => Math.max(value - 1, 0));
  }

  async function submitRequest(data: FormValues, intent: "draft" | "posted") {
    if (!isFinalStep || hasSubmitted) {
      return;
    }

    flushSync(() => {
      setHasSubmitted(true);
    });
    const valid = await trigger();

    if (!valid) {
      setHasSubmitted(false);
      setFormError("Please review the highlighted fields before posting your request.");
      return;
    }

    setFormError(null);
    const formData = new FormData();
    const submissionData = prepareShipmentSizingForSubmission(
      data,
      sizingMethod,
    );

    for (const [key, value] of Object.entries(submissionData)) {
      if (key === "attachmentFileIds") {
        continue;
      }
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    }

    for (const attachment of attachments) {
      formData.append("attachmentFileIds", attachment.id);
    }

    startTransition(() => {
      void (intent === "draft"
        ? saveDraftShipmentRequest(formData)
        : createShipmentRequest(formData));
    });
  }

  function handleInvalidSubmit() {
    setFormError("Please review the highlighted fields before posting your request.");
  }

  async function handleValidSubmit(data: FormValues) {
    await submitRequest(data, "posted");
  }

  const postRequest = handleSubmit(handleValidSubmit, handleInvalidSubmit);
  const saveDraft = handleSubmit(
    async (data) => {
      await submitRequest(data, "draft");
    },
    handleInvalidSubmit,
  );
  const currentStepErrorMessages = getCurrentStepErrorMessages(currentStep, errors);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
      className="mt-8"
    >
      <Card className="gap-0">
        <CardHeader className="border-b pb-4">
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
        </CardHeader>

        <CardContent className="py-6">
          {formError ? (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p className="font-medium">{formError}</p>
              {currentStepErrorMessages.length > 0 ? (
                <ul className="mt-2 grid gap-1 text-sm">
                  {currentStepErrorMessages.map((message) => (
                    <li key={message}>- {message}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
          {currentStep === 0 ? (
            <CargoDetailsStep
              control={control}
              register={register}
              errors={errors}
              sizingMethod={sizingMethod}
              onSizingMethodChange={changeSizingMethod}
            />
          ) : null}
          {currentStep === 1 ? (
            <RouteAndDeliveryStep
              control={control}
              register={register}
              setValue={setValue}
              errors={errors}
            />
          ) : null}
          {currentStep === 2 ? (
            <PreferencesAndDocumentsStep
              control={control}
              register={register}
              errors={errors}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              disabled={isPending || hasSubmitted}
            />
          ) : null}
          {currentStep === 3 ? (
            <ReviewStep
              values={prepareShipmentSizingForSubmission(values, sizingMethod)}
              attachments={attachments}
            />
          ) : null}
        </CardContent>

        <CardFooter className="flex-col-reverse gap-3 sm:flex-row sm:justify-between [&>button]:w-full [&>button]:sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={isFirstStep || isPending}
          >
            Back
          </Button>
          {isFinalStep ? (
            <div className="grid w-full gap-3 sm:flex sm:w-auto sm:flex-row-reverse">
              <Button
                type="button"
                size="lg"
                onClick={() => {
                  void postRequest();
                }}
                disabled={isPending || hasSubmitted}
              >
                {isPending || hasSubmitted ? "Posting..." : "Post request"}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => {
                  void saveDraft();
                }}
                disabled={isPending || hasSubmitted}
              >
                {isPending || hasSubmitted ? "Saving..." : "Save draft"}
              </Button>
            </div>
          ) : (
            <Button type="button" size="lg" onClick={goNext} disabled={isPending || hasSubmitted}>
              Continue
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <ol className="grid w-full grid-cols-4 gap-2 lg:w-auto">
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

function CargoDetailsStep({
  control,
  register,
  errors,
  sizingMethod,
  onSizingMethodChange,
}: StepComponentProps<FormValues> & {
  sizingMethod: ShipmentSizingMethod;
  onSizingMethodChange: (method: ShipmentSizingMethod) => void;
}) {
  const selectedCargoType = useWatch({ control, name: "cargoType" });
  const showHandlingNote =
    typeof selectedCargoType === "string" &&
    cargoTypesRequiringHandlingDetails.has(selectedCargoType);
  const showOtherNote = selectedCargoType === "other";

  return (
    <div className="grid gap-6">
      <section className="grid gap-4">
        <h3 className="text-base font-semibold">Cargo description</h3>
        <Field
          label="Shipment title and cargo description"
          helper="Use a short description you will recognize later, such as 'Phone accessories, Guangzhou to Manila'."
          error={errors.cargoDescription?.message}
          required
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
          required
        >
          <Controller
            control={control}
            name="cargoType"
            render={({ field }) => (
              <OptionCombobox
                options={cargoTypeOptions}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Search cargo type"
                emptyMessage="No cargo type found."
                invalid={Boolean(errors.cargoType)}
              />
            )}
          />
        </Field>
        {showHandlingNote ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            Some forwarders may ask for product photos, invoice, or safety
            documents before quoting.
          </div>
        ) : null}
        {showOtherNote ? (
          <div className="rounded-md border bg-muted p-4 text-sm leading-6 text-muted-foreground">
            Use the required description field above to state the exact cargo type.
            Do not leave it vague.
          </div>
        ) : null}
      </section>

      <section className="grid gap-4">
        <h3 className="text-base font-semibold">Size, weight, and value</h3>
        <SizeFields
          control={control}
          register={register}
          errors={errors}
          sizingMethod={sizingMethod}
          onSizingMethodChange={onSizingMethodChange}
        />
      </section>
    </div>
  );
}

function SizeFields({
  control,
  register,
  errors,
  sizingMethod,
  onSizingMethodChange,
}: Pick<StepComponentProps<FormValues>, "control" | "register" | "errors"> & {
  sizingMethod: ShipmentSizingMethod;
  onSizingMethodChange: (method: ShipmentSizingMethod) => void;
}) {
  const sizeValues = useWatch({
    control,
    name: ["totalCbm", "totalWeightKg", "packageCount", "lengthCm", "widthCm", "heightCm"],
  });
  const [, , packageCount, lengthCm, widthCm, heightCm] = sizeValues;
  const estimatedTotalCbm = calculateEstimatedTotalCbm({
    packageCount,
    lengthCm,
    widthCm,
    heightCm,
  });

  return (
    <div className="grid gap-4">
      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium">How do you want to enter shipment size?</legend>
        <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
          <SizingMethodCard
            checked={sizingMethod === "known_cbm"}
            title="I know the total CBM"
            description="Enter the supplier or packing estimate directly."
            onSelect={() => onSizingMethodChange("known_cbm")}
          />
          <SizingMethodCard
            checked={sizingMethod === "dimensions"}
            title="Calculate from carton dimensions"
            description="Use carton count and one-carton measurements."
            onSelect={() => onSizingMethodChange("dimensions")}
          />
        </div>
      </fieldset>
      <GuideLinksCard
        title="Need help estimating shipment size?"
        description="Use these before posting if you are unsure about CBM, carton dimensions, or what forwarders usually need."
        guides={[
          {
            slug: "what-is-cbm",
            title: "What Is CBM in Shipping? Formula and Examples",
            description: "Understand carton volume and when rough estimates are acceptable.",
          },
          {
            slug: "how-to-request-a-shipping-quote",
            title: "How to Request a Shipping Quote: A Practical Template",
            description: "See the usual details forwarders need before they can quote clearly.",
          },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {sizingMethod === "known_cbm" ? (
          <Field
            label="Total CBM"
            error={errors.totalCbm?.message}
            required
          >
            <Input {...register("totalCbm")} inputMode="decimal" placeholder="1.250" />
          </Field>
        ) : null}
        <Field
          label="Total gross weight (kg)"
          error={errors.totalWeightKg?.message}
          required
        >
          <Input {...register("totalWeightKg")} inputMode="decimal" placeholder="120" />
        </Field>
        {sizingMethod === "dimensions" ? (
          <>
            <Field
              label="Package or carton count"
              error={errors.packageCount?.message}
              required
            >
              <Input {...register("packageCount")} inputMode="numeric" placeholder="20" />
            </Field>
            <Field
              label="Length per carton (cm)"
              error={errors.lengthCm?.message}
              required
            >
              <Input {...register("lengthCm")} inputMode="decimal" placeholder="50" />
            </Field>
            <Field
              label="Width per carton (cm)"
              error={errors.widthCm?.message}
              required
            >
              <Input {...register("widthCm")} inputMode="decimal" placeholder="40" />
            </Field>
            <Field
              label="Height per carton (cm)"
              error={errors.heightCm?.message}
              required
            >
              <Input {...register("heightCm")} inputMode="decimal" placeholder="30" />
            </Field>
          </>
        ) : null}
      </div>
      {sizingMethod === "dimensions" && estimatedTotalCbm ? (
        <div className="rounded-md border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-cyan-950">
          Calculated shipment volume:{" "}
          <span className="font-semibold">{estimatedTotalCbm} CBM</span>
          <span className="block pt-1 text-cyan-900">
            This CBM will be saved together with the carton measurements.
          </span>
        </div>
      ) : null}
      <details className="rounded-md border bg-muted/30 p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Add declared cargo value (optional)
        </summary>
        <div className="mt-4 max-w-sm">
          <Field
            label="Declared value"
            helper="Use the invoice value if available."
            error={errors.declaredValue?.message}
          >
            <Input {...register("declaredValue")} inputMode="decimal" placeholder="50000" />
          </Field>
        </div>
      </details>
    </div>
  );
}

function SizingMethodCard({
  checked,
  title,
  description,
  onSelect,
}: {
  checked: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        "rounded-lg border bg-background p-4 text-left transition-colors",
        checked && "border-cyan-600 ring-2 ring-cyan-600/20",
      )}
    >
      <span className="block font-semibold">{title}</span>
      <span className="mt-1 block text-sm leading-6 text-muted-foreground">
        {description}
      </span>
    </button>
  );
}

function RouteAndDeliveryStep({
  control,
  register,
  setValue,
  errors,
}: StepComponentProps<FormValues> & {
  setValue: UseFormSetValue<FormValues>;
}) {
  const destinationSelection = useWatch({
    control,
    name: [
      "destinationRegionCode",
      "destinationRegionName",
      "destinationProvinceCode",
      "destinationProvinceName",
      "destinationCityMunicipalityCode",
      "destinationCityMunicipalityName",
      "destinationBarangayCode",
      "destinationBarangayName",
    ],
  });
  const origin = useWatch({ control, name: "origin" });
  const [originOption, setOriginOption] = useState<string | undefined>(() =>
    originToOptionValue(origin),
  );
  const [
    destinationRegionCode,
    destinationRegionName,
    destinationProvinceCode,
    destinationProvinceName,
    destinationCityMunicipalityCode,
    destinationCityMunicipalityName,
    destinationBarangayCode,
    destinationBarangayName,
  ] = destinationSelection;

  const destinationValue: DestinationSelection = {
    regionCode: destinationRegionCode,
    regionName: destinationRegionName,
    provinceCode: destinationProvinceCode,
    provinceName: destinationProvinceName,
    cityMunicipalityCode: destinationCityMunicipalityCode,
    cityMunicipalityName: destinationCityMunicipalityName,
    barangayCode: destinationBarangayCode,
    barangayName: destinationBarangayName,
  };

  function updateDestination(next: DestinationSelection) {
    const displayName = buildDestinationDisplayName(next);
    const options = { shouldDirty: true, shouldValidate: true };

    setValue("destinationRegionCode", next.regionCode || "", options);
    setValue("destinationRegionName", next.regionName || "", options);
    setValue("destinationProvinceCode", next.provinceCode || "", options);
    setValue("destinationProvinceName", next.provinceName || "", options);
    setValue(
      "destinationCityMunicipalityCode",
      next.cityMunicipalityCode || "",
      options,
    );
    setValue(
      "destinationCityMunicipalityName",
      next.cityMunicipalityName || "",
      options,
    );
    setValue("destinationBarangayCode", next.barangayCode || undefined, options);
    setValue("destinationBarangayName", next.barangayName || undefined, options);
    setValue("destinationDisplayName", displayName || undefined, options);
    setValue("destination", displayName || undefined, options);
  }

  function updateOrigin(nextValue: string | undefined) {
    const options = { shouldDirty: true, shouldValidate: true };

    setOriginOption(nextValue);
    setValue(
      "origin",
      nextValue && nextValue !== otherChinaOriginValue ? nextValue : "",
      options,
    );
  }

  const selectedOriginOption = originOption ?? originToOptionValue(origin);
  const usesCustomOrigin = selectedOriginOption === otherChinaOriginValue;

  return (
    <div className="grid gap-4">
      <input type="hidden" {...register("destination")} />
      <input type="hidden" {...register("destinationRegionCode")} />
      <input type="hidden" {...register("destinationRegionName")} />
      <input type="hidden" {...register("destinationProvinceCode")} />
      <input type="hidden" {...register("destinationProvinceName")} />
      <input type="hidden" {...register("destinationCityMunicipalityCode")} />
      <input type="hidden" {...register("destinationCityMunicipalityName")} />
      <input type="hidden" {...register("destinationBarangayCode")} />
      <input type="hidden" {...register("destinationBarangayName")} />
      <input type="hidden" {...register("destinationDisplayName")} />
      <Field
        label="Pickup city in China"
        helper="Choose the nearest supplier or consolidation city. You can enter the exact pickup address later."
        error={!usesCustomOrigin ? errors.origin?.message : undefined}
        required
      >
        {!usesCustomOrigin ? (
          <input type="hidden" {...register("origin")} />
        ) : null}
        <OptionCombobox
          options={chinaOriginOptions}
          value={selectedOriginOption}
          onValueChange={updateOrigin}
          placeholder="Select a common city or choose Other"
          emptyMessage="No China origin found."
          invalid={Boolean(errors.origin) && !usesCustomOrigin}
        />
      </Field>
      {usesCustomOrigin ? (
        <Field
          label="Exact pickup city or location"
          helper="Enter the supplier city, factory area, or consolidation point in China."
          error={errors.origin?.message}
          required
        >
          <Input
            {...register("origin")}
            placeholder="Example: Wuhan, China"
            autoComplete="off"
          />
        </Field>
      ) : null}
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Pickup and receiving setup"
          helper="Supplier pickup means the forwarder collects from your supplier. China warehouse means your supplier or agent will send the goods to the forwarder's China warehouse."
          error={errors.deliveryPreference?.message}
          required
        >
          <Controller
            control={control}
            name="deliveryPreference"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" aria-invalid={Boolean(errors.deliveryPreference) || undefined}>
                  <SelectValue placeholder="Select pickup and receiving setup" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryPreferenceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field
          label="Shipping mode preference"
          helper="Choose how you prefer this shipment to move. Select open to either if you want forwarders to recommend the best option."
          error={errors.shippingModePreference?.message}
          required
        >
          <Controller
            control={control}
            name="shippingModePreference"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className="w-full"
                  aria-invalid={Boolean(errors.shippingModePreference) || undefined}
                >
                  <SelectValue placeholder="Select shipping mode preference" />
                </SelectTrigger>
                <SelectContent>
                  {shippingModePreferenceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>
      <LocationPicker
        value={destinationValue}
        onChange={updateDestination}
        errors={{
          region: errors.destinationRegionCode?.message,
          province: errors.destinationProvinceCode?.message,
          cityMunicipality: errors.destinationCityMunicipalityCode?.message,
          barangay: errors.destinationBarangayCode?.message,
        }}
      />
      {destinationValue.cityMunicipalityName ? (
        <div className="rounded-md border bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
          Destination preview:{" "}
          <span className="font-medium text-foreground">
            {buildDestinationDisplayName(destinationValue)}
          </span>
        </div>
      ) : null}
      <Field
        label="Address details / landmark"
        helper="Add a landmark, warehouse, barangay, or delivery note if helpful."
        error={errors.destinationAddressDetails?.message}
      >
        <Textarea {...register("destinationAddressDetails")} rows={3} />
      </Field>
    </div>
  );
}

function originToOptionValue(value: unknown) {
  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }

  return chinaOriginOptionValues.has(value) ? value : otherChinaOriginValue;
}

function PreferencesAndDocumentsStep({
  control,
  register,
  errors,
  attachments,
  onAttachmentsChange,
  disabled,
}: StepComponentProps<FormValues> & {
  attachments: UploadedAttachment[];
  onAttachmentsChange: (attachments: UploadedAttachment[]) => void;
  disabled: boolean;
}) {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4">
        <Field
          label="Quote priority"
          helper="Choose whether you prefer lower cost, faster delivery, or a balanced recommendation."
          error={errors.shippingPreference?.message}
          required
        >
          <Controller
            control={control}
            name="shippingPreference"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={Boolean(errors.shippingPreference) || undefined}>
                  <SelectValue placeholder="Select quote priority" />
                </SelectTrigger>
                <SelectContent>
                  {shippingPreferenceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <div className="rounded-md border bg-muted p-4 text-sm leading-6 text-muted-foreground">
          Add MSDS, permits, special handling, supplier coordination, or document
          requirements here.
        </div>
      </section>

      <NotesStep
        control={control}
        register={register}
        errors={errors}
        attachments={attachments}
        onAttachmentsChange={onAttachmentsChange}
        disabled={disabled}
      />
    </div>
  );
}

function NotesStep({
  register,
  errors,
  attachments,
  onAttachmentsChange,
  disabled,
}: StepComponentProps<FormValues> & {
  attachments: UploadedAttachment[];
  onAttachmentsChange: (attachments: UploadedAttachment[]) => void;
  disabled: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const reachedMax = attachments.length >= shipmentAttachmentMaxCount;

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0 || disabled) {
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      let nextAttachments = attachments;

      for (const file of Array.from(files)) {
        if (nextAttachments.length >= shipmentAttachmentMaxCount) {
          setUploadError(`You can attach up to ${shipmentAttachmentMaxCount} files.`);
          break;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/media/shipment-request-attachments", {
          method: "POST",
          body: formData,
        });
        const payload = await response.json();

        if (!response.ok) {
          setUploadError(payload.message || "Upload failed. Try again.");
          break;
        }

        nextAttachments = [...nextAttachments, payload.file];
      }

      onAttachmentsChange(nextAttachments);
    } catch {
      setUploadError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  async function removeAttachment(fileId: string) {
    if (disabled) {
      return;
    }

    setRemovingId(fileId);
    setUploadError(null);

    try {
      const response = await fetch(
        `/api/media/shipment-request-attachments/${fileId}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const payload = await response.json();
        setUploadError(payload.message || "Could not remove the file.");
        return;
      }

      onAttachmentsChange(attachments.filter((file) => file.id !== fileId));
    } catch {
      setUploadError("Could not remove the file. Try again.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-dashed bg-muted/30 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground">
            <FileUp className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium">Upload supporting documents</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Add product photos, packing lists, supplier invoices, or other
              shipment references.
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {acceptedFileDescription("shipment_request_attachment")}
            </p>
          </div>
          <div className="shrink-0">
            <Input
              type="file"
              multiple
              className="hidden"
              id="shipment-attachments"
              accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv"
              disabled={disabled || uploading || reachedMax}
              onChange={(event) => {
                void uploadFiles(event.currentTarget.files);
                event.currentTarget.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              disabled={disabled || uploading || reachedMax}
              asChild
            >
              <Label htmlFor="shipment-attachments" className="cursor-pointer">
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FileUp className="size-4" aria-hidden="true" />
                )}
                Add files
              </Label>
            </Button>
          </div>
        </div>
        {attachments.length > 0 ? (
          <ul className="mt-4 grid gap-2">
            {attachments.map((file) => (
              <li
                key={file.id}
                className="flex min-w-0 items-center justify-between gap-3 rounded-md border bg-background p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {file.originalFilename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(file.sizeBytes)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled || removingId === file.id}
                  onClick={() => void removeAttachment(file.id)}
                  aria-label={`Remove ${file.originalFilename}`}
                >
                  {removingId === file.id ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <X className="size-4" aria-hidden="true" />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        {uploadError ? (
          <p className="mt-3 text-sm font-medium text-red-700">{uploadError}</p>
        ) : null}
      </div>
      <Field
        label="Notes"
        helper="Add handling needs, supplier readiness timing, or document concerns here. Avoid supplier contact details or private payment information unless you want forwarders to see it."
        error={errors.notes?.message}
      >
        <Textarea {...register("notes")} rows={4} />
      </Field>
      <Field
        label="Supporting document notes"
        helper="Use this to describe attached files or mention documents that are not ready yet."
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

function ReviewStep({
  values,
  attachments,
}: {
  values: Partial<FormValues>;
  attachments: UploadedAttachment[];
}) {
  const reviewGroups = useMemo<ReviewGroup[]>(
    () => [
      {
        title: "Cargo details",
        items: [
          ["Shipment title and cargo description", values.cargoDescription],
          ["Cargo type", cargoTypeLabel(values.cargoType)],
          ["Total CBM", valueWithUnit(values.totalCbm, "CBM")],
          ["Total weight", valueWithUnit(values.totalWeightKg, "kg")],
          ["Package or carton count", values.packageCount],
          ["Dimensions", dimensionsValue(values)],
          ["Declared value", values.declaredValue],
        ],
      },
      {
        title: "Route and delivery",
        items: [
          ["Pickup city in China", values.origin],
          ["Pickup and receiving setup", formatDeliveryPreference(values.deliveryPreference)],
          [
            "Shipping mode preference",
            formatShippingModePreference(values.shippingModePreference),
          ],
          ["Destination region", values.destinationRegionName],
          ["Destination province", values.destinationProvinceName],
          ["Destination city or municipality", values.destinationCityMunicipalityName],
          ["Barangay", values.destinationBarangayName],
          [
            "Destination",
            values.destinationDisplayName ||
              buildDestinationDisplayName({
                provinceName: values.destinationProvinceName,
                cityMunicipalityName: values.destinationCityMunicipalityName,
                barangayName: values.destinationBarangayName,
              }),
          ],
          ["Address details", values.destinationAddressDetails],
        ],
      },
      {
        title: "Preferences and documents",
        items: [
          ["Quote priority", titleFromEnum(values.shippingPreference)],
          ["Notes", values.notes],
          ["Supporting document notes", values.attachmentNotes],
          [
            "Uploaded attachments",
            attachments.length > 0
              ? attachments
                  .map((file) => `${file.originalFilename} (${formatBytes(file.sizeBytes)})`)
                  .join(", ")
              : undefined,
          ],
        ],
      },
    ],
    [values, attachments],
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
  control: ReturnType<typeof useForm<T>>["control"];
  register: ReturnType<typeof useForm<T>>["register"];
  errors: ReturnType<typeof useForm<T>>["formState"]["errors"];
};

function OptionCombobox({
  options,
  value,
  onValueChange,
  placeholder,
  emptyMessage,
  invalid,
}: {
  options: Option[];
  value?: string;
  onValueChange: (value: string | undefined) => void;
  placeholder: string;
  emptyMessage: string;
  invalid?: boolean;
}) {
  const selectedOption = options.find((option) => option.value === value) ?? null;

  return (
    <Combobox
      items={options}
      itemToStringLabel={(option: Option) => option.label}
      itemToStringValue={(option: Option) => option.value}
      value={selectedOption}
      onValueChange={(nextValue: Option | string | null) =>
        onValueChange(
          typeof nextValue === "string" ? nextValue || undefined : nextValue?.value,
        )
      }
      autoHighlight
    >
      <ComboboxInput
        className="w-full"
        placeholder={placeholder}
        showClear
        aria-invalid={invalid || undefined}
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {options.map((option) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function Field({
  label,
  helper,
  error,
  required,
  children,
}: {
  label: string;
  helper?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const helperId = useId();
  const errorId = useId();
  const describedBy = [
    helper ? helperId : null,
    error ? errorId : null,
  ].filter(Boolean).join(" ") || undefined;
  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        "aria-describedby": describedBy,
        "aria-invalid": Boolean(error) || undefined,
      })
    : children;

  return (
    <div className="grid min-w-0 gap-2">
      <Label className="flex items-center gap-2">
        <span>{label}</span>
        {required ? (
          <span className="text-xs font-medium uppercase tracking-wide text-primary">
            Required
          </span>
        ) : null}
      </Label>
      {child}
      {helper ? (
        <p id={helperId} className="text-xs leading-5 text-muted-foreground">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs font-medium text-red-700">
          {error}
        </p>
      ) : null}
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

function cargoTypeLabel(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  return cargoTypeOptions.find((option) => option.value === value)?.label ?? titleFromEnum(value);
}

function getCurrentStepErrorMessages(
  stepIndex: number,
  errors: ReturnType<typeof useForm<FormValues>>["formState"]["errors"],
) {
  type StepErrorField =
    | "cargoDescription"
    | "cargoType"
    | "totalCbm"
    | "totalWeightKg"
    | "packageCount"
    | "lengthCm"
    | "widthCm"
    | "heightCm"
    | "origin"
    | "deliveryPreference"
    | "shippingModePreference"
    | "destinationRegionCode"
    | "destinationProvinceCode"
    | "destinationCityMunicipalityCode"
    | "destinationBarangayCode"
    | "shippingPreference"
    | "notes"
    | "attachmentNotes";

  const stepFieldsByIndex: Array<Array<StepErrorField>> = [
    [
      "cargoDescription",
      "cargoType",
      "totalCbm",
      "totalWeightKg",
      "packageCount",
      "lengthCm",
      "widthCm",
      "heightCm",
    ],
    [
      "origin",
      "deliveryPreference",
      "shippingModePreference",
      "destinationRegionCode",
      "destinationProvinceCode",
      "destinationCityMunicipalityCode",
      "destinationBarangayCode",
    ],
    ["shippingPreference", "notes", "attachmentNotes"],
    [],
  ];

  return stepFieldsByIndex[stepIndex]
    .map((field) => errors[field]?.message)
    .filter((message): message is string => typeof message === "string");
}
