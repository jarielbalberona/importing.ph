import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Check,
  LockKeyhole,
  MessagesSquare,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";

import { PublicSiteFooter } from "@/components/public/site-footer";
import { PublicSiteHeader } from "@/components/public/site-header";
import { Button } from "@/components/ui/button";
import {
  JOIN_AS_FORWARDER_INTENT,
  POST_SHIPMENT_REQUEST_INTENT,
  appendAuthRedirectParams,
} from "@/lib/auth-redirect";

const requestHref = appendAuthRedirectParams("/sign-up", {
  intent: POST_SHIPMENT_REQUEST_INTENT,
});
const forwarderHref = appendAuthRedirectParams("/sign-up", {
  intent: JOIN_AS_FORWARDER_INTENT,
});

const trustItems = [
  { icon: ShieldCheck, text: "Your shipment details stay private." },
  { icon: LockKeyhole, text: "Quotes are shared privately." },
  { icon: MessagesSquare, text: "Conversations stay tied to your shipment." },
  {
    icon: Users,
    text: "The platform organizes requests and quotes; forwarders provide shipping services.",
  },
];

const processSteps = [
  {
    title: "Post your shipment",
    body: "Share cargo, route, timing, and handling notes.",
    icon: Boxes,
  },
  {
    title: "Receive private quotes",
    body: "Forwarders respond with pricing and service details.",
    icon: LockKeyhole,
  },
  {
    title: "Compare and continue",
    body: "Compare options and continue with the forwarder you choose.",
    icon: MessagesSquare,
  },
];

const capabilities = [
  {
    title: "Shipment requests",
    body: "Share cargo, route, timing, and handling details once.",
    icon: Boxes,
  },
  {
    title: "Private quotes",
    body: "Forwarders send pricing, timelines, inclusions, and notes privately.",
    icon: LockKeyhole,
  },
  {
    title: "Quote comparison",
    body: "Review options side by side before continuing.",
    icon: Scale,
  },
];

const painPoints = [
  "Repeating cargo details",
  "Asking forwarders one by one",
  "Losing quotes in different chats",
  "Comparing rates, timelines, and inclusions",
];

const platformFeatures = [
  ["Forwarder defaults", "Save common quote details for faster submissions."],
  ["Notifications", "See important quote and message updates in your account."],
  ["Importer privacy", "Importer details are not shown as a public directory."],
  ["Private conversations", "Quotes and conversations stay tied to the shipment."],
];

export function HomeMarketingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <PublicSiteHeader />

      <section className="overflow-hidden border-b border-border bg-primary/5">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:min-h-[650px] lg:grid-cols-2 lg:gap-12 lg:pb-24 lg:pt-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              China-to-Philippines cargo quotes
            </p>
            <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-[3.45rem]">
              Get China-to-Philippines shipping quotes without chasing every forwarder.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Post your shipment once, receive private quotes from cargo forwarders, and compare options in one organized workspace.
            </p>
            <ul className="mt-7 flex flex-col gap-3 text-sm font-semibold sm:flex-row sm:gap-6">
              {["No scattered chats.", "No repeated details."].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check aria-hidden="true" className="size-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="font-bold shadow-xl shadow-primary/20">
                <Link href={requestHref}>
                  Post a shipment request <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold">
                <Link href={forwarderHref}>Join as a forwarder</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">It&apos;s free to post. No obligation.</p>
          </div>

          <div className="relative min-h-[22rem] overflow-hidden rounded-3xl border border-border bg-muted shadow-2xl shadow-primary/10 sm:min-h-[30rem] lg:min-h-[34rem]">
            <Image src="/assets/hero.jpg" alt="Cargo ships viewed from an aircraft approaching the Philippines" fill priority sizes="(min-width: 1024px) 52vw, calc(100vw - 2rem)" className="object-cover object-center" />
            <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/40 bg-background/95 p-5 shadow-xl backdrop-blur sm:inset-x-auto sm:bottom-7 sm:left-7 sm:max-w-sm sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">One organized request</p>
              <p className="mt-2 text-lg font-bold leading-6">Sea or air cargo. Private forwarder quotes. Clear comparison.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 -mt-8 pb-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-2xl md:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex min-h-28 items-center gap-4 border-primary-foreground/20 p-5 lg:border-r lg:last:border-r-0">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full border border-primary-foreground/30">
                    <Icon aria-hidden="true" className="size-7" />
                  </span>
                  <p className="text-sm leading-5">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.78fr_2.22fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">How it works</p>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-4xl">
              One request. Private quotes. Clear next steps.
            </h2>
            <p className="leading-7 text-muted-foreground">Importers share the shipment details forwarders need.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="relative text-center">
                  <span className="absolute left-1/2 top-2 z-10 -translate-x-13 rounded-full bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div className="mx-auto grid size-28 place-items-center rounded-full border border-border bg-background shadow-sm">
                    <Icon aria-hidden="true" className="size-12 text-primary" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
                  {index < processSteps.length - 1 ? (
                    <span aria-hidden="true" className="absolute -right-6 top-12 hidden text-3xl text-primary/40 lg:block">→</span>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Both sides can continue the conversation from the quote.
        </p>
      </section>

      <section className="bg-primary/5 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">What you can do</p>
          <div className="grid gap-5 md:grid-cols-3">
            {capabilities.map((capability) => {
              const Icon = capability.icon;
              return (
                <article key={capability.title} className="group rounded-xl border border-primary/20 bg-background p-6 shadow-sm transition-transform hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Icon aria-hidden="true" className="size-6" />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold">{capability.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{capability.body}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/60 py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.75fr_auto]">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Keep everything in one place</p>
            <h2 className="text-4xl font-extrabold tracking-tight">Keep the quote process in one place.</h2>
            <p className="max-w-2xl leading-7 text-muted-foreground">
              Requests, quotes, messages, and updates stay connected to the shipment, so both sides can follow the conversation clearly.
            </p>
          </div>
          <div aria-hidden="true" className="relative mx-auto w-full max-w-sm">
            <div className="rounded-xl border border-border bg-background p-5 shadow-lg">
              {["Shipment request", "Private quote", "Conversation"].map((label) => (
                <div key={label} className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
                  <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary"><Check className="size-4" /></span>
                  <span className="text-sm font-semibold">{label}</span>
                </div>
              ))}
            </div>
            <span className="absolute -right-4 top-7 rounded-xl bg-primary p-3 text-primary-foreground shadow-lg">
              <MessagesSquare className="size-7" />
            </span>
          </div>
          <div className="space-y-2 text-center lg:text-left">
            <Button asChild size="lg" className="font-bold"><Link href="/sign-up">Create free account <ArrowRight /></Link></Button>
            <p className="text-xs text-muted-foreground">It&apos;s free to create an account.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="grid overflow-hidden rounded-xl border border-border lg:grid-cols-3">
          <article className="space-y-6 border-b border-border p-7 lg:border-b-0 lg:border-r">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">No more scattered chats</p>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight">Your quote search should not be scattered across chats.</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Most quote requests happen through Messenger, Viber, referrals, and contact lists. Importing Philippines gives you one place to describe the shipment, receive private quotes, and decide which forwarder to continue with.
              </p>
            </div>
            <div className="relative min-h-64 rounded-xl bg-primary/5 p-5">
              <span className="absolute left-1/2 top-1/2 z-10 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl">
                <MessagesSquare aria-hidden="true" className="size-6" />
              </span>
              {["Guangzhou", "Shenzhen", "Manila", "Cebu", "Davao"].map((city, index) => (
                <span
                  key={city}
                  className={`absolute z-10 rounded-full border border-border bg-background px-3 py-2 text-xs font-bold shadow-sm ${[
                    "left-4 top-5",
                    "bottom-5 left-8",
                    "right-6 top-7",
                    "bottom-8 right-5",
                    "left-1/2 top-3 -translate-x-1/2",
                  ][index]}`}
                >
                  {city}
                </span>
              ))}
              <svg aria-hidden="true" className="absolute inset-0 size-full text-primary/30" viewBox="0 0 320 250">
                <path d="M160 125 48 38M160 125 55 210M160 125 275 45M160 125 275 205M160 125 160 25" fill="none" stroke="currentColor" strokeDasharray="5 6" />
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {painPoints.map((label) => (
                <p key={label} className="rounded-lg border border-border p-3 text-xs leading-5 text-muted-foreground">
                  <span className="mr-1 font-bold text-primary">×</span> {label}
                </p>
              ))}
            </div>
            <Button asChild className="w-full font-bold"><Link href={requestHref}>Post a shipment request <ArrowRight /></Link></Button>
          </article>

          <article className="space-y-6 border-b border-border p-7 lg:border-b-0 lg:border-r">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">A platform, not a forwarder</p>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight">A quote platform, not another forwarder.</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Importing Philippines connects importers with cargo forwarders. The platform organizes requests, quotes, and conversations, while the forwarder provides the actual shipping service.
              </p>
            </div>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
              {capabilities.map((capability) => {
                const Icon = capability.icon;
                return (
                  <div key={`platform-${capability.title}`} className="flex gap-4 p-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-primary/25 text-primary"><Icon className="size-5" /></span>
                    <div><h3 className="font-bold">{capability.title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{capability.body}</p></div>
                  </div>
                );
              })}
            </div>
            <div className="rounded-xl bg-primary p-5 text-primary-foreground">
              <p className="font-bold">Quote-based messaging</p>
              <p className="mt-2 text-sm leading-6 text-primary-foreground/75">Keep follow-up questions tied to the shipment.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {platformFeatures.map(([title, body]) => (
                <div key={title} className="border-l-2 border-primary pl-4">
                  <h3 className="text-sm font-bold">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="space-y-6 p-7">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Private and direct</p>
              <p className="text-sm font-bold text-primary">Ready to find shipment quotes?</p>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight">Private quotes. Clear next steps.</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Forwarders send pricing, timelines, inclusions, and notes privately. You decide who to move forward with.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image src="/assets/cargoes.jpg" alt="Stacked shipping containers" fill sizes="33vw" className="object-cover" />
            </div>
            <div className="space-y-3">
              <Button asChild className="w-full font-bold"><Link href={requestHref}>Post a shipment request <ArrowRight /></Link></Button>
              <Link className="block text-center text-sm font-semibold text-primary underline-offset-4 hover:underline" href={forwarderHref}>Join as a forwarder</Link>
              <Link className="block text-center text-sm font-semibold text-primary underline-offset-4 hover:underline" href="/guides">Beginner Guides for Importing to the Philippines</Link>
              <p className="text-center text-xs text-muted-foreground">It&apos;s free to post. No obligation.</p>
            </div>
          </article>
        </div>
      </section>

      <PublicSiteFooter />
    </main>
  );
}
