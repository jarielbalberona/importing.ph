"use client";

import { useActionState, useState } from "react";

import { PendingSubmitButton } from "@/components/forms/pending-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  completeOnboarding,
  initialOnboardingActionState,
} from "./actions";

type OnboardingRole = "importer" | "forwarder";

export function OnboardingForm({
  initialRole,
  lockForwarderRole,
  redirectUrl,
  intent,
}: {
  initialRole: OnboardingRole;
  lockForwarderRole: boolean;
  redirectUrl?: string;
  intent?: string;
}) {
  const [role, setRole] = useState<OnboardingRole>(initialRole);
  const [state, formAction] = useActionState(
    completeOnboarding,
    initialOnboardingActionState,
  );

  const fieldError = (name: string) => state.fieldErrors?.[name]?.[0];

  return (
    <form action={formAction} className="mt-8 grid gap-6" noValidate>
      <input type="hidden" name="redirectUrl" value={redirectUrl ?? ""} />
      <input type="hidden" name="intent" value={intent ?? ""} />
      <input type="hidden" name="role" value={role} />

      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium">Choose your account type</legend>
        <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
          <RoleCard
            checked={role === "importer"}
            disabled={lockForwarderRole}
            title="I am an importer"
            description="Post shipment requests and compare quotes from forwarders."
            onSelect={() => setRole("importer")}
          />
          <RoleCard
            checked={role === "forwarder"}
            title="I am a forwarder"
            description="Browse shipment requests and send quotes as a logistics provider."
            onSelect={() => setRole("forwarder")}
          />
        </div>
        {lockForwarderRole ? (
          <p className="text-sm text-muted-foreground">
            A forwarder account is required to quote this shipment.
          </p>
        ) : null}
        <FieldError message={fieldError("role")} />
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          required
          minLength={2}
          aria-invalid={Boolean(fieldError("fullName"))}
        />
        <FieldError message={fieldError("fullName")} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="companyName">
          {role === "forwarder" ? "Forwarding company name" : "Company name"}
        </Label>
        <Input
          id="companyName"
          name="companyName"
          required
          minLength={2}
          aria-invalid={Boolean(fieldError("companyName"))}
        />
        <FieldError message={fieldError("companyName")} />
      </div>

      {role === "forwarder" ? (
        <section className="grid gap-5 rounded-lg border bg-muted/30 p-4 sm:p-5">
          <div>
            <h2 className="font-semibold">Minimum company profile</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Importers see these details before deciding whether to engage with
              your quote.
            </p>
          </div>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">Supported shipping modes</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                ["sea", "Sea freight"],
                ["air", "Air freight"],
                ["both", "Sea and air"],
              ].map(([value, label]) => (
                <Label
                  key={value}
                  className="flex cursor-pointer items-center gap-2 rounded-md border bg-background p-3 font-normal"
                >
                  <input type="radio" name="shippingModes" value={value} required />
                  {label}
                </Label>
              ))}
            </div>
            <FieldError message={fieldError("shippingModes")} />
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="originCities">Main China origin cities</Label>
              <Textarea
                id="originCities"
                name="originCities"
                rows={3}
                required
                placeholder="Guangzhou, Shenzhen, Yiwu"
                aria-invalid={Boolean(fieldError("originCities"))}
              />
              <FieldError message={fieldError("originCities")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="destinationAreas">Philippine destination areas</Label>
              <Textarea
                id="destinationAreas"
                name="destinationAreas"
                rows={3}
                required
                placeholder="Metro Manila, Cebu, Davao"
                aria-invalid={Boolean(fieldError("destinationAreas"))}
              />
              <FieldError message={fieldError("destinationAreas")} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="serviceDescription">Service description</Label>
            <Textarea
              id="serviceDescription"
              name="serviceDescription"
              rows={4}
              required
              minLength={20}
              placeholder="Describe your main lanes, services, and the shipments you handle best."
              aria-invalid={Boolean(fieldError("serviceDescription"))}
            />
            <FieldError message={fieldError("serviceDescription")} />
          </div>
        </section>
      ) : null}

      {state.formError ? (
        <p role="alert" className="text-sm text-destructive">
          {state.formError}
        </p>
      ) : null}

      <PendingSubmitButton
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        pendingText="Creating account…"
      >
        {role === "forwarder"
          ? "Create forwarder account"
          : "Create importer account"}
      </PendingSubmitButton>
    </form>
  );
}

function RoleCard({
  checked,
  disabled = false,
  title,
  description,
  onSelect,
}: {
  checked: boolean;
  disabled?: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "rounded-lg border bg-background p-4 text-left transition-colors",
        checked && "border-cyan-600 ring-2 ring-cyan-600/20",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span className="block font-semibold">{title}</span>
      <span className="mt-1 block text-sm font-normal leading-6 text-muted-foreground">
        {description}
      </span>
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}
