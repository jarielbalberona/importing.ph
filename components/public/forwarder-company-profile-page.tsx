import Link from "next/link";

import {
  formatForwarderShippingModes,
  type ForwarderProfileCta,
} from "@/lib/forwarder-profile-page";
import type { PublicForwarderCompanyProfile } from "@/lib/profile-route-queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ForwarderCompanyProfilePage({
  profile,
  cta,
}: {
  profile: PublicForwarderCompanyProfile;
  cta: ForwarderProfileCta;
}) {
  const memberSince = new Intl.DateTimeFormat("en-PH", {
    month: "long",
    year: "numeric",
  }).format(profile.createdAt);
  const description =
    profile.serviceDescription?.trim() ||
    "This forwarder has not added a public service description yet.";

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-18">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              Forwarder profile
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
                {profile.name}
              </h1>
              <Badge variant="outline">Company profile</Badge>
            </div>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span>Member since {memberSince}</span>
              <span aria-hidden="true">•</span>
              <span>{formatForwarderShippingModes(profile.shippingModes)}</span>
            </div>
          </div>

          <Card className="self-start border-slate-200">
            <CardHeader>
              <CardTitle>Work with this forwarder</CardTitle>
              <CardDescription>{cta.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button
                asChild
                size="lg"
                variant={cta.variant}
                className="min-h-11 w-full px-4 text-base"
              >
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
              <p className="text-sm leading-6 text-slate-600">
                Importers should post a shipment request through the platform so
                quotes and follow-up conversations stay tied to the shipment.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid gap-6 md:grid-cols-3">
            <ProfileFact
              title="Shipping modes"
              value={formatForwarderShippingModes(profile.shippingModes)}
            />
            <ProfileFact
              title="China pickup or origin cities"
              value={profile.originCities || "Origin cities not listed yet"}
            />
            <ProfileFact
              title="Philippines destination coverage"
              value={
                profile.destinationAreas || "Destination coverage not listed yet"
              }
            />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
          <div>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              About and services
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-700">
              Keep this profile practical. Importers still need to post a
              shipment request so quotes stay comparable and conversations stay
              tied to the shipment.
            </p>
          </div>
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Service summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-7 text-slate-700">{description}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          <div>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              How to work with this forwarder
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-700">
              Importing Philippines is built around the shipment request flow.
              Post one request, receive private quotes, compare details, and
              continue on-platform after a quote exists.
            </p>
          </div>
          <ol className="grid gap-4 border-t border-slate-200 pt-6 lg:border-t-0 lg:pt-0">
            <WorkflowStep
              number="01"
              text="Create an account and post a shipment request with your cargo, route, and delivery needs."
            />
            <WorkflowStep
              number="02"
              text="Receive private quotes from forwarders that want to handle the shipment."
            />
            <WorkflowStep
              number="03"
              text="Compare rates, timelines, and inclusions before continuing the conversation through the shipment."
            />
          </ol>
        </div>
      </section>
    </main>
  );
}

function ProfileFact({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-700">{value}</p>
      </CardContent>
    </Card>
  );
}

function WorkflowStep({ number, text }: { number: string; text: string }) {
  return (
    <li className="grid grid-cols-[2.5rem_1fr] gap-4">
      <span className="text-sm font-semibold text-cyan-700">{number}</span>
      <span className="text-sm leading-6 text-slate-700">{text}</span>
    </li>
  );
}
