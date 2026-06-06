import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert, MessageSquareText } from "lucide-react";

import { PublicSiteHeader } from "@/components/public/site-header";
import { Button } from "@/components/ui/button";
import { buildAboutMetadata } from "@/features/public-content/seo/metadata";

export const metadata = buildAboutMetadata();

const scatteredChats = [
  "Cargo details get repeated to each forwarder.",
  "Supplier, agent, and forwarder messages end up in different apps.",
  "Rates, timelines, inclusions, pickup, and delivery notes are hard to compare.",
  "Follow-up questions lose context once the conversation moves.",
];

const backgroundPoints = [
  "Sourcing products from China and coordinating with suppliers through Alibaba and WeChat.",
  "Attending Canton Fair and visiting supplier and manufacturing locations in China.",
  "Using translators during supplier and factory visits when details had to be clear.",
  "Arranging pickup from a manufacturer or warehouse before shipment to the Philippines.",
  "Handling shipments to Manila and Cebu ports, plus door-to-door delivery arrangements.",
  "Working through common supplier payment channels such as WeChat Pay and Alipay.",
];

const productHelps = [
  "Post one shipment request with cargo details, size or CBM, weight, origin, destination, shipping preference, and notes.",
  "Receive private quotes from cargo forwarders.",
  "Compare rates, timelines, inclusions, and handling details in one place.",
  "Continue the conversation tied to the shipment request.",
];

const limits = [
  "Importing Philippines is not a cargo forwarder.",
  "It does not replace your own supplier, forwarder, or customs due diligence.",
  "It does not guarantee customs outcomes, timelines, pricing, or delivery results.",
  "It helps organize the quote-search process between importers and forwarders.",
];

export default function AboutPage() {
  return (
    <>
      <PublicSiteHeader />
      <main className="min-h-screen bg-white text-slate-950">
        <section className="border-b border-slate-200">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-18">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              About Importing Philippines
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              Built from real importing experience.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
              Importing Philippines was created after dealing with the real steps
              of sourcing from China, arranging pickup, talking to suppliers,
              comparing forwarders, and moving shipments to the Philippines.
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
                <Link href="/guides">Read importing guides</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
            <div>
              <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Why this exists
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-700">
                Importing from China to the Philippines can get messy fast.
                Conversations often spread across Messenger, Viber, WhatsApp,
                Alibaba, WeChat, referrals, supplier agents, and forwarder chats.
              </p>
              <p className="mt-4 text-base leading-7 text-slate-700">
                The goal is narrower and more useful: make the quote-search part
                clearer. Post the shipment once, receive private quotes, compare
                options, and continue with the forwarder you choose.
              </p>
            </div>
            <ul className="grid gap-4 border-t border-slate-200 pt-6 lg:border-t-0 lg:pt-0">
              {scatteredChats.map((point) => (
                <ListItem key={point}>{point}</ListItem>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:py-16">
            <div>
              <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Real importing background
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-700">
                Through actual sourcing trips, supplier visits, and factory
                visits in China, we have experienced the same details importers
                often deal with: supplier communication, pickup arrangements,
                cargo information, payment coordination, and choosing how to
                ship goods to the Philippines.
              </p>
            </div>
            <div className="grid gap-x-8 sm:grid-cols-2">
              {backgroundPoints.map((point) => (
                <div key={point} className="border-t border-slate-200 py-5">
                  <p className="text-sm leading-6 text-slate-700">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
            <div>
              <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                What it helps with
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-700">
                Importing Philippines gives importers a practical way to ask
                clearly and compare forwarder responses without starting the same
                conversation again and again.
              </p>
            </div>
            <ol className="grid gap-4 border-t border-slate-200 pt-6 lg:border-t-0 lg:pt-0">
              {productHelps.map((point, index) => (
                <li key={point} className="grid grid-cols-[2.5rem_1fr] gap-4">
                  <span className="text-sm font-semibold text-cyan-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-6 text-slate-700">{point}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-cyan-50">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
            <div className="max-w-3xl">
              <MessageSquareText aria-hidden="true" className="size-8 text-cyan-700" />
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
                A note from the founder
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-700">
                I built Importing Philippines because I have gone through the
                same messy process: talking to suppliers, checking pickup
                details, asking forwarders for quotes, and trying to keep
                everything organized across chats. The goal is simple: make it
                easier for importers to ask clearly and compare forwarder quotes
                in one place.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:py-16">
            <div>
              <CircleAlert aria-hidden="true" className="size-8 text-slate-500" />
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
                What it is not
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-700">
                Clear boundaries matter. The product helps with organization and
                comparison, but the shipping service itself is still provided by
                the forwarder you choose.
              </p>
            </div>
            <ul className="grid gap-4 border-t border-slate-200 pt-6 lg:border-t-0 lg:pt-0">
              {limits.map((point) => (
                <ListItem key={point}>{point}</ListItem>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:py-16">
            <div>
              <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Start with one shipment request.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
                Create a free account, describe the shipment once, and compare
                private forwarder quotes in one place.
              </p>
            </div>
            <div className="grid gap-3 sm:flex md:justify-end">
              <Button asChild size="lg" className="min-h-11 w-full px-4 text-base sm:w-auto">
                <Link href="/sign-up">Create a free account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-h-11 w-full px-4 text-base sm:w-auto"
              >
                <Link href="/guides">Read importing guides</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-6 text-slate-700">
      <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-cyan-700" />
      <span>{children}</span>
    </li>
  );
}
