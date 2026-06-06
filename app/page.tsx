import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const painPoints = [
  "Repeating cargo details",
  "Asking forwarders one by one",
  "Losing quotes in different chats",
  "Comparing rates, timelines, and inclusions",
  "Not knowing where to start",
];

const importerSteps = ["Post your shipment", "Receive private quotes", "Compare and continue"];

const forwarderSteps = ["Browse shipment requests", "Send a quote", "Message after quoting"];

const features = [
  {
    title: "Shipment requests",
    body: "Share cargo, route, timing, and handling details once.",
  },
  {
    title: "Private quotes",
    body: "Forwarders send pricing, timelines, inclusions, and notes privately.",
  },
  {
    title: "Quote comparison",
    body: "Review options side by side before continuing.",
  },
  {
    title: "Quote-based messaging",
    body: "Keep follow-up questions tied to the shipment.",
  },
  {
    title: "Forwarder defaults",
    body: "Save common quote details for faster submissions.",
  },
  {
    title: "Notifications",
    body: "See important quote and message updates in your account.",
  },
];

const trustPoints = [
  "Importer details are not shown as a public directory.",
  "Quotes are sent privately.",
  "Conversations stay tied to the shipment.",
  "Importers choose who to continue with.",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/" className="shrink-0" aria-label="importing.ph home">
            <Image
              src="/assets/importingph.png"
              alt="importing.ph"
              width={173}
              height={50}
              priority
              className="h-10 w-auto"
            />
          </Link>
          <nav
            aria-label="Account links"
            className="grid grid-cols-2 gap-3 sm:flex sm:items-center"
          >
            <Button asChild variant="ghost" className="w-full sm:w-auto">
              <Link href="/guides">Guides</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full sm:w-auto">
              <Link href="/about">About</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full sm:w-auto">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/sign-up">Create free account</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div className="min-w-0">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              Get China-to-Philippines shipping quotes without chasing every forwarder.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
              Post your shipment once, receive private quotes from cargo forwarders, and compare options in one organized workspace.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              No scattered chats. No repeated details. Just one request, multiple quotes, and a clear conversation trail.
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <Button asChild size="lg" className="min-h-11 w-full px-4 text-base sm:w-auto">
                <Link href="/sign-up">
                  Post a shipment request
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-h-11 w-full px-4 text-base sm:w-auto"
              >
                <Link href="/sign-up">Join as forwarder</Link>
              </Button>
            </div>
          </div>

          <div className="min-w-0 border-l border-slate-200 pl-6 sm:pl-8">
            <div className="grid gap-6">
              <FlowStep
                number="01"
                title="Post once"
                body="Cargo, route, timing, and handling notes."
              />
              <FlowStep
                number="02"
                title="Get private quotes"
                body="Forwarders respond with pricing and service details."
              />
              <FlowStep
                number="03"
                title="Choose the next step"
                body="Compare options and continue with the forwarder you choose."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          <div>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Your quote search should not be scattered across chats.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-700">
              Most quote requests happen through Messenger, Viber, referrals, and
              contact lists. Importing Philippines gives you one place to describe
              the shipment, receive private quotes, and decide which forwarder to
              continue with.
            </p>
          </div>
          <ul className="grid gap-x-8 gap-y-4 border-t border-slate-200 pt-6 sm:grid-cols-2 lg:border-t-0 lg:pt-0">
            {painPoints.map((point) => (
              <ChecklistItem key={point}>{point}</ChecklistItem>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              One request. Private quotes. Clear next steps.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-700">
              Importers share the shipment details forwarders need. Forwarders
              send private quotes. Both sides can continue the conversation from
              the quote.
            </p>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <StepList title="For importers" steps={importerSteps} />
            <StepList title="For forwarders" steps={forwarderSteps} />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:py-16">
          <div>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Keep the quote process in one place.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-700">
              Requests, quotes, messages, and updates stay connected to the
              shipment, so both sides can follow the conversation clearly.
            </p>
          </div>
          <div className="grid gap-x-8 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="border-t border-slate-200 py-5">
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-cyan-50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:py-12">
          <div>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Start with a free account.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
              Importers can post a shipment request. Forwarders can browse
              requests and send quotes through the platform.
            </p>
          </div>
          <Button asChild size="lg" className="min-h-11 w-full px-4 text-base sm:w-auto">
            <Link href="/sign-up">Create free account</Link>
          </Button>
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:py-16">
          <div>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              A quote platform, not another forwarder.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-700">
              Importing Philippines connects importers with cargo forwarders. The
              platform helps organize requests, quotes, and conversations, while
              the forwarder provides the actual shipping service.
            </p>
          </div>
          <ul className="grid gap-4 border-t border-slate-200 pt-6 lg:border-t-0 lg:pt-0">
            {trustPoints.map((point) => (
              <ChecklistItem key={point}>{point}</ChecklistItem>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:py-16">
          <div>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Ready to find shipment quotes?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
              Create a free account, post your shipment details, and receive
              private quotes from forwarders.
            </p>
          </div>
          <div className="grid gap-3 sm:flex md:justify-end">
            <Button asChild size="lg" className="min-h-11 w-full px-4 text-base sm:w-auto">
              <Link href="/sign-up">Create free account</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-11 w-full px-4 text-base sm:w-auto"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function FlowStep({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div className="grid grid-cols-[3rem_1fr] gap-4">
      <span className="text-sm font-semibold text-cyan-700">{number}</span>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
      </div>
    </div>
  );
}

function ChecklistItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-6 text-slate-700">
      <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-cyan-700" />
      <span>{children}</span>
    </li>
  );
}

function StepList({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <ol className="mt-5 grid gap-4">
        {steps.map((step, index) => (
          <li
            key={step}
            className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-slate-200 pt-4"
          >
            <span className="text-sm font-semibold text-cyan-700">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-medium">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
