import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProfileForCurrentUser } from "@/lib/authz";
import { destinationForRole } from "@/lib/routes";
import { completeOnboarding } from "./actions";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { profile } = await getProfileForCurrentUser();

  if (profile) {
    redirect(destinationForRole(profile.role));
  }

  return (
    <main className="min-h-screen bg-muted px-6 py-10">
      <div className="mx-auto max-w-2xl rounded-lg border bg-card p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-700">
            Onboarding
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Set up your workspace</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This writes the business role to PostgreSQL. Clerk remains identity
            only.
          </p>
        </div>
        <form action={completeOnboarding} className="mt-8 grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" required minLength={2} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input id="companyName" name="companyName" required minLength={2} />
          </div>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-medium">Account type</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Label className="flex cursor-pointer gap-3 rounded-md border bg-background p-4">
                <input
                  type="radio"
                  name="role"
                  value="importer"
                  required
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold">Importer</span>
                  <span className="mt-1 block text-sm font-normal leading-6 text-muted-foreground">
                    Create import requests and collect forwarder responses.
                  </span>
                </span>
              </Label>
              <Label className="flex cursor-pointer gap-3 rounded-md border bg-background p-4">
                <input
                  type="radio"
                  name="role"
                  value="forwarder"
                  required
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold">Forwarder</span>
                  <span className="mt-1 block text-sm font-normal leading-6 text-muted-foreground">
                    Create a forwarder company and join as owner.
                  </span>
                </span>
              </Label>
            </div>
          </fieldset>
          <Button type="submit" size="lg">
            Continue
          </Button>
        </form>
      </div>
    </main>
  );
}
