import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProfileForCurrentUser } from "@/lib/authz";
import { resolveAuthenticatedDestination } from "@/lib/auth-redirect";
import { completeOnboarding } from "./actions";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string; intent?: string }>;
}) {
  const { profile } = await getProfileForCurrentUser();
  const params = await searchParams;

  if (profile) {
    redirect(
      resolveAuthenticatedDestination({
        role: profile.role,
        redirectPath: params.redirect_url,
        intent: params.intent,
      }),
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-muted px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl rounded-lg border bg-card p-4 shadow-sm sm:p-6">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-700">
            Onboarding
          </p>
          <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
            Set up your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Tell us how you will use importing.ph so we can show the right
            tools.
          </p>
        </div>
        <form action={completeOnboarding} className="mt-8 grid gap-6">
          <input type="hidden" name="redirectUrl" value={params.redirect_url} />
          <input type="hidden" name="intent" value={params.intent} />
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
                  <span className="block font-semibold">I am an Importer</span>
                  <span className="mt-1 block text-sm font-normal leading-6 text-muted-foreground">
                    Post shipment requests and compare quotes from forwarders.
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
                  <span className="block font-semibold">
                    I am a forwarder
                  </span>
                  <span className="mt-1 block text-sm font-normal leading-6 text-muted-foreground">
                    Browse shipment requests and send quotes as a logistics
                    provider.
                  </span>
                </span>
              </Label>
            </div>
          </fieldset>
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Continue
          </Button>
        </form>
      </div>
    </main>
  );
}
