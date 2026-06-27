import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Clock3,
  MapPin,
  Menu,
  MessageCircle,
  PackageCheck,
  Route,
  Search,
  ShieldCheck,
  Ship,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "New Page Experiment | Importing PH",
  description: "An experimental Importing PH public landing page concept.",
  alternates: {
    canonical: "/new",
  },
};

const partnerNames = ["Lightbox", "Nietzsche", "GlobalBank", "Spherule", "FeatherDev"];

const workflow = [
  {
    title: "Post Import Details",
    description:
      "Share cargo type, pickup point, delivery location, size, weight, shipping mode, and special handling notes once.",
    icon: Boxes,
  },
  {
    title: "Receive Forwarder Quotes",
    description:
      "Forwarders respond privately with rates, timelines, inclusions, payment terms, and delivery coverage.",
    icon: MessageCircle,
  },
  {
    title: "Compare Before You Commit",
    description:
      "Review competing offers in one place before accepting the quote that fits the shipment.",
    icon: Search,
  },
  {
    title: "Track The Conversation",
    description:
      "Keep questions, quote changes, acceptance, and read states attached to the same request.",
    icon: Clock3,
  },
];

const solutions = [
  {
    title: "China Pickup Coordination",
    description:
      "Give forwarders the supplier or warehouse handoff details they need before cargo leaves China.",
    className: "sm:col-span-2",
  },
  {
    title: "Sea & Air Quote Search",
    description:
      "Compare delivery speed, rate basis, destination coverage, and included handling.",
    className: "",
  },
  {
    title: "Door-to-Door Delivery",
    description:
      "Clarify the local delivery endpoint early so quotes do not hide the final-mile cost.",
    className: "",
  },
  {
    title: "Customs & Handling Notes",
    description:
      "Record fragile cargo, documents, declared value notes, and other requirements in context.",
    className: "sm:col-span-2 lg:col-span-1",
  },
];

const offerItems = [
  {
    title: "Request Intake",
    description: "One structured request replaces repeated forwarder DMs.",
    icon: PackageCheck,
  },
  {
    title: "Forwarder Responses",
    description: "Quote details stay tied to the exact cargo request.",
    icon: Ship,
  },
  {
    title: "Shipment Discussion",
    description: "Messages are gated around accepted quotes and shipment context.",
    icon: Route,
  },
  {
    title: "Forwarder Profiles",
    description: "Importers can review basic forwarder details before deciding.",
    icon: ShieldCheck,
  },
];

const locations = [
  { label: "Manila", x: "50%", y: "46%" },
  { label: "Cebu", x: "58%", y: "58%" },
  { label: "Davao", x: "67%", y: "72%" },
  { label: "Guangzhou", x: "34%", y: "33%" },
  { label: "Shenzhen", x: "38%", y: "40%" },
];

export default function NewPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f7f4] text-[#202020]">
      <header className="relative z-30 mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="importing.ph home">
          <span className="size-4 rounded-full bg-[#202020]" aria-hidden="true" />
          <Image
            src="/assets/importingph.png"
            alt="importing.ph"
            width={173}
            height={50}
            priority
            className="h-8 w-auto"
          />
        </Link>
        <div className="hidden items-center gap-4 text-xs font-medium text-[#202020] sm:flex">
          <Link href="/guides" className="hover:text-cyan-700">
            Guides
          </Link>
          <Link href="/about" className="hover:text-cyan-700">
            About
          </Link>
          <Button asChild variant="outline" className="rounded-full border-[#202020] bg-transparent px-4">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild className="rounded-full bg-[#202020] px-4 text-white hover:bg-[#343434]">
            <Link href="/sign-up">Create account</Link>
          </Button>
        </div>
        <details className="group relative sm:hidden">
          <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-full bg-white text-[#202020] shadow-sm ring-1 ring-black/10 [&::-webkit-details-marker]:hidden">
            <Menu aria-hidden="true" className="size-4" />
            <span className="sr-only">Open menu</span>
          </summary>
          <nav className="absolute right-0 top-12 grid w-56 gap-2 rounded-md border border-[#e7e2dd] bg-white p-3 text-sm font-medium shadow-xl">
            <Link href="/guides" className="rounded-md px-3 py-2 hover:bg-slate-100">
              Guides
            </Link>
            <Link href="/about" className="rounded-md px-3 py-2 hover:bg-slate-100">
              About
            </Link>
            <Link href="/sign-in" className="rounded-md px-3 py-2 hover:bg-slate-100">
              Sign in
            </Link>
            <Link href="/sign-up" className="rounded-md bg-[#202020] px-3 py-2 text-white">
              Create account
            </Link>
          </nav>
        </details>
      </header>

      <section className="relative mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 lg:pb-12 lg:pt-14">
        <div
          className="pointer-events-none absolute right-[-12rem] top-[-16rem] size-[38rem] rounded-full border border-[#e5d7d4]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-[-5rem] top-[-8rem] size-[24rem] rounded-full border border-[#eee4e1]"
          aria-hidden="true"
        />

        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Importing Philippines
            </p>
            <h1 className="mt-6 max-w-3xl text-6xl font-semibold leading-[0.92] tracking-normal text-[#1f1f1f] sm:text-7xl lg:text-8xl">
              Seamless Cargo Control
            </h1>
          </div>

          <div className="relative z-10 max-w-md justify-self-start pt-3 lg:justify-self-end lg:pt-16">
            <p className="text-sm font-medium leading-6 text-[#343434]">
              Ship confidently with up to date quotes from cargo forwarders.
              Post once, compare clearly, and keep the conversation attached to
              the shipment.
            </p>
            <Button asChild className="mt-6 rounded-full bg-[#202020] px-5 text-white shadow-xl hover:bg-[#343434]">
              <Link href="/sign-up">
                Start request
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-8 min-h-[22rem] overflow-hidden rounded-md bg-white lg:min-h-[34rem]">
          <Image
            src="/assets/hero.jpg"
            alt="Cargo containers and logistics equipment"
            fill
            priority
            loading="eager"
            sizes="(min-width: 1024px) 1184px, 100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f7f7f4] via-transparent to-transparent" />
          <div className="absolute bottom-8 left-6 rounded-md bg-red-500 px-5 py-3 text-5xl font-bold uppercase leading-none tracking-normal text-white sm:left-10 sm:text-7xl">
            Cargo
          </div>
        </div>
      </section>

      <section className="border-y border-[#e7e2dd] bg-white/70">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-5 text-xs font-semibold text-slate-500 sm:grid-cols-5 sm:px-6">
          {partnerNames.map((name) => (
            <div key={name} className="flex items-center justify-center gap-2">
              <span className="size-5 rounded-full border-4 border-slate-400" aria-hidden="true" />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            How it works
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            The more efficient way to search for shipment quotes.
          </h2>
        </div>
        <p className="max-w-md justify-self-start text-sm leading-6 text-slate-600 lg:justify-self-end">
          The core product is simple: structured request, private forwarder
          quotes, side by side comparison, and quote-gated messaging.
        </p>

        <div className="grid gap-4 lg:col-span-2 sm:grid-cols-2 lg:grid-cols-4">
          {workflow.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === 2;

            return (
              <article
                key={item.title}
                className={
                  isActive
                    ? "rounded-md bg-[#202020] p-5 text-white shadow-2xl"
                    : "rounded-md border border-[#e7e2dd] bg-white p-5"
                }
              >
                <div
                  className={
                    isActive
                      ? "flex size-9 items-center justify-center rounded-full bg-white text-[#202020]"
                      : "flex size-9 items-center justify-center rounded-full bg-[#202020] text-white"
                  }
                >
                  <Icon aria-hidden="true" className="size-4" />
                </div>
                <h3 className="mt-12 text-base font-semibold">{item.title}</h3>
                <p className={isActive ? "mt-3 text-sm leading-6 text-white/70" : "mt-3 text-sm leading-6 text-slate-600"}>
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Logistic solutions
              </p>
              <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
                Comprehensive and reliable logistics coordination.
              </h2>
            </div>
            <Button asChild variant="outline" className="w-fit rounded-full border-[#202020] bg-transparent px-5">
              <Link href="/sign-up">
                See all
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((item) => (
              <article
                key={item.title}
                className={`relative min-h-64 overflow-hidden rounded-md ${item.className}`}
              >
                <Image
                  src="/assets/hero.jpg"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-white/75">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Find coverage
        </p>
        <h2 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
          Wide-reaching customer care.
        </h2>
        <div className="relative mx-auto mt-10 h-[22rem] max-w-5xl overflow-hidden rounded-md bg-white [background-image:radial-gradient(#c8c8c8_1.3px,transparent_1.3px)] [background-size:10px_10px] sm:h-[30rem]">
          <div className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-[0_0_0_8px_rgba(239,68,68,0.14)]" />
          {locations.map((location) => (
            <div
              key={location.label}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white px-3 py-2 text-left text-xs font-semibold shadow-lg"
              style={{ left: location.x, top: location.y }}
            >
              <MapPin aria-hidden="true" className="size-4 text-red-500" />
              <span>{location.label}</span>
            </div>
          ))}
          <div className="absolute left-[35%] top-[36%] h-px w-[26%] rotate-[18deg] bg-slate-500/60" />
          <div className="absolute left-[49%] top-[48%] h-px w-[19%] rotate-[42deg] bg-slate-500/60" />
          <div className="absolute left-[50%] top-[48%] h-px w-[17%] rotate-[63deg] bg-slate-500/60" />
          <div className="absolute left-[38%] top-[41%] h-px w-[15%] rotate-[30deg] bg-slate-500/60" />
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              What we offer
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              Streamline your order fulfillment process.
            </h2>
            <div className="relative mt-8 min-h-80 overflow-hidden rounded-md">
              <Image
                src="/assets/hero.jpg"
                alt="Cargo handling equipment"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:pt-28">
            {offerItems.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className="border-t border-[#e7e2dd] pt-6">
                  <Icon aria-hidden="true" className="size-6 text-cyan-700" />
                  <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                  <Link
                    href="/sign-up"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#202020] hover:text-cyan-700"
                  >
                    View flow
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="rounded-md bg-[#e83b52] px-6 py-14 text-center text-white sm:px-10 lg:py-18">
          <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-6xl">
            Are you ready to get started?
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-full bg-[#202020] px-5 text-white hover:bg-[#343434]">
              <Link href="/sign-up">
                Start shipping now
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/70 bg-transparent px-5 text-white hover:bg-white/10">
              <Link href="/about">Learn more</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 border-t border-[#e7e2dd] pt-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2" aria-label="importing.ph home">
              <span className="size-4 rounded-full bg-[#202020]" aria-hidden="true" />
              <Image
                src="/assets/importingph.png"
                alt="importing.ph"
                width={173}
                height={50}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-6 text-slate-600">
              Stay updated as the importing marketplace improves.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <FooterColumn title="Services" links={["Quote requests", "Forwarder quotes", "Messaging"]} />
            <FooterColumn title="About" links={["Our story", "Guides", "Support"]} />
            <FooterColumn title="Help" links={["FAQs", "Contact us", "Privacy"]} />
          </div>
        </div>
      </footer>
    </main>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="font-semibold text-[#202020]">{title}</h3>
      <ul className="mt-4 grid gap-3 text-slate-500">
        {links.map((link) => (
          <li key={link}>{link}</li>
        ))}
      </ul>
    </div>
  );
}
