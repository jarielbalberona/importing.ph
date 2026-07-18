import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { PublicSiteFooter } from "@/components/public/site-footer";
import { PublicSiteHeader } from "@/components/public/site-header";
import { Button } from "@/components/ui/button";
import { buildAboutMetadata } from "@/features/public-content/seo/metadata";
import {
  POST_SHIPMENT_REQUEST_INTENT,
  appendAuthRedirectParams,
} from "@/lib/auth-redirect";

export const metadata = buildAboutMetadata();

const requestHref = appendAuthRedirectParams("/sign-up", {
  intent: POST_SHIPMENT_REQUEST_INTENT,
});

const problems = [
  "Cargo details get repeated to each forwarder.",
  "Supplier, agent, and forwarder messages end up in different apps.",
  "Rates, timelines, inclusions, pickup, and delivery notes are hard to compare.",
  "Follow-up questions lose context once the conversation moves.",
];

const background = [
  "Sourcing products from China and coordinating with suppliers through Alibaba and WeChat.",
  "Attending Canton Fair and visiting supplier and manufacturing locations in China.",
  "Using translators during supplier and factory visits when details had to be clear.",
  "Arranging pickup from a manufacturer or warehouse before shipment to the Philippines.",
  "Handling shipments to Manila and Cebu ports, plus door-to-door delivery arrangements.",
  "Working through common supplier payment channels such as WeChat Pay and Alipay.",
];

const steps = [
  "Post one shipment request with cargo details, size or CBM, weight, origin, destination, shipping preference, and notes.",
  "Receive private quotes from cargo forwarders.",
  "Compare rates, timelines, inclusions, and handling details in one place.",
  "Continue the conversation tied to the shipment request.",
];

const boundaries = [
  "Importing Philippines is not a cargo forwarder.",
  "It does not replace your own supplier, forwarder, or customs due diligence.",
  "It does not guarantee customs outcomes, timelines, pricing, or delivery results.",
  "It helps organize the quote-search process between importers and forwarders.",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicSiteHeader />

      <section className="overflow-hidden border-b border-border bg-primary/5">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:py-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">About Importing Philippines</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-7xl">
              Built from real importing experience.
            </h1>
          </div>
          <p className="max-w-xl border-l-4 border-primary pl-6 text-lg leading-8 text-foreground/75">
            Importing Philippines was created after dealing with the real steps of sourcing from China, arranging pickup, talking to suppliers, comparing forwarders, and moving shipments to the Philippines.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">The problem</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Why this exists</h2>
            <p className="mt-6 leading-7 text-muted-foreground">
              Importing from China to the Philippines can get messy fast. Conversations often spread across Messenger, Viber, WhatsApp, Alibaba, WeChat, referrals, supplier agents, and forwarder chats.
            </p>
            <p className="mt-4 leading-7 text-muted-foreground">
              The goal is narrower and more useful: make the quote-search part clearer. Post the shipment once, receive private quotes, compare options, and continue with the forwarder you choose.
            </p>
          </div>
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {problems.map((problem) => (
              <li key={problem} className="min-h-40 bg-background p-7 text-lg font-bold leading-7">
                <span className="mb-5 block text-primary" aria-hidden="true">×</span>
                {problem}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-primary py-20 text-primary-foreground lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/60">Experience behind the product</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Real importing background</h2>
            <p className="mt-6 leading-7 text-primary-foreground/75">
              Through actual sourcing trips, supplier visits, and factory visits in China, we have experienced the same details importers often deal with: supplier communication, pickup arrangements, cargo information, payment coordination, and choosing how to ship goods to the Philippines.
            </p>
          </div>
          <ol className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {background.map((item, index) => (
              <li key={item} className="border-t border-primary-foreground/20 pt-5">
                <span className="font-mono text-sm font-bold text-primary-foreground/55">{String(index + 1).padStart(2, "0")}</span>
                <p className="mt-3 leading-7 text-primary-foreground/85">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">A clearer workflow</p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">What it helps with</h2>
          <p className="mx-auto mt-5 max-w-3xl leading-7 text-muted-foreground">
            Importing Philippines gives importers a practical way to ask clearly and compare forwarder responses without starting the same conversation again and again.
          </p>
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step} className="rounded-xl border border-border p-7">
              <span className="font-mono text-2xl font-extrabold text-primary">{String(index + 1).padStart(2, "0")}</span>
              <p className="mt-8 font-semibold leading-7">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-muted/60 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
          <article className="rounded-2xl bg-background p-8 shadow-sm sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Founder note</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight">A note from the founder</h2>
            <blockquote className="mt-6 text-lg leading-8 text-foreground/75">
              I built Importing Philippines because I have gone through the same messy process: talking to suppliers, checking pickup details, asking forwarders for quotes, and trying to keep everything organized across chats. The goal is simple: make it easier for importers to ask clearly and compare forwarder quotes in one place.
            </blockquote>
          </article>
          <article className="rounded-2xl border border-border bg-background p-8 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Clear boundaries</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight">What it is not</h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              Clear boundaries matter. The product helps with organization and comparison, but the shipping service itself is still provided by the forwarder you choose.
            </p>
            <ul className="mt-6 space-y-4">
              {boundaries.map((boundary) => (
                <li key={boundary} className="flex gap-3 text-sm leading-6">
                  <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                  {boundary}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="bg-primary py-14 text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Start with one shipment request.</h2>
            <p className="mt-3 text-primary-foreground/80">Create a free account, describe the shipment once, and compare private forwarder quotes in one place.</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="font-bold">
            <Link href={requestHref}>Post a shipment request <ArrowRight aria-hidden="true" /></Link>
          </Button>
        </div>
      </section>

      <PublicSiteFooter />
    </main>
  );
}
