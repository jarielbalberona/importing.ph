import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Clock3,
  MapPin,
  MessageCircle,
  PackageCheck,
  Route,
  Search,
  ShieldCheck,
  Ship,
  X,
} from "lucide-react";

import { PublicSiteFooter } from "@/components/public/site-footer";
import { PublicSiteHeader } from "@/components/public/site-header";
import { Button } from "@/components/ui/button";

const painPoints = [
  "Repeating cargo details",
  "Asking forwarders one by one",
  "Losing quotes in different chats",
  "Comparing rates, timelines, and inclusions",
  "Not knowing where to start",
];

const workflow = [
  {
    title: "Post your shipment",
    description: "Cargo, route, timing, and handling notes.",
    icon: Boxes,
  },
  {
    title: "Receive private quotes",
    description: "Forwarders respond with pricing and service details.",
    icon: MessageCircle,
  },
  {
    title: "Compare and continue",
    description: "Compare options and continue with the forwarder you choose.",
    icon: Search,
  },
  {
    title: "Message after quoting",
    description: "Keep follow-up questions tied to the shipment.",
    icon: Clock3,
  },
];

const solutions = [
  {
    title: "Shipment requests",
    description: "Share cargo, route, timing, and handling details once.",
    className: "sm:col-span-2",
    image: "/assets/shipment-request.jpg",
  },
  {
    title: "Private quotes",
    description: "Forwarders send pricing, timelines, inclusions, and notes privately.",
    className: "",
    image: "/assets/shipment-quote.jpg",
  },
  {
    title: "Quote comparison",
    description: "Review options side by side before continuing.",
    className: "",
    image: "/assets/shipment-comparison.jpg",
  },
  {
    title: "Quote-based messaging",
    description: "Keep follow-up questions tied to the shipment.",
    className: "sm:col-span-2 lg:col-span-1",
    image: "/assets/shipment-message.jpg",
  },
];

const offerItems = [
  {
    title: "Forwarder defaults",
    description: "Save common quote details for faster submissions.",
    icon: PackageCheck,
  },
  {
    title: "Notifications",
    description: "See important quote and message updates in your account.",
    icon: Ship,
  },
  {
    title: "Importer privacy",
    description: "Importer details are not shown as a public directory.",
    icon: Route,
  },
  {
    title: "Private conversations",
    description: "Quotes are sent privately and conversations stay tied to the shipment.",
    icon: ShieldCheck,
  },
];

const coverageLocations = [
  {
    label: "Guangzhou",
    detail: "China supplier pickup",
    image: "/assets/shipment-request.jpg",
    className: "left-[6%] top-[18%]",
  },
  {
    label: "Shenzhen",
    detail: "Factory and warehouse handoff",
    image: "/assets/shipment-quote.jpg",
    className: "left-[18%] top-[62%]",
  },
  {
    label: "Manila",
    detail: "Metro Manila delivery",
    image: "/assets/cargoes.jpg",
    className: "left-[43%] top-[6%]",
  },
  {
    label: "Cebu",
    detail: "Visayas receiving point",
    image: "/assets/shipment-comparison.jpg",
    className: "right-[4%] top-[28%]",
  },
  {
    label: "Davao",
    detail: "Mindanao receiving point",
    image: "/assets/shipment-message.jpg",
    className: "right-[18%] bottom-[7%]",
  },
];

export function HomeMarketingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f7f4] text-[#202020]">
      <PublicSiteHeader />

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
            <h1 className="mt-6 max-w-3xl text-3xl font-semibold leading-[0.98] tracking-normal text-[#1f1f1f] sm:text-4xl lg:text-5xl">
              Get China-to-Philippines shipping quotes without chasing every forwarder.
            </h1>
          </div>

          <div className="relative z-10 max-w-md justify-self-start pt-3 lg:justify-self-end lg:pt-16">
            <p className="text-sm font-medium leading-6 text-[#343434]">
              Post your shipment once, receive private quotes from cargo
              forwarders, and compare options in one organized workspace.
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              No scattered chats. No repeated details. Just one request,
              multiple quotes, and a clear conversation trail.
            </p>
            <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
              <Button asChild className="rounded-full bg-[#202020] px-5 text-white shadow-xl hover:bg-[#343434]">
                <Link href="/sign-up">
                  Post a shipment request
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-[#202020] bg-transparent px-5">
                <Link href="/sign-up">Join as forwarder</Link>
              </Button>
            </div>
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
          <div className="absolute bottom-8 left-6 max-w-[calc(100%-3rem)] rounded-md bg-red-500 px-4 py-2 text-xs font-bold uppercase leading-tight tracking-normal text-white sm:left-10 sm:max-w-3xl lg:text-xl">
            Get quotes for sea or air cargo shipments
          </div>
        </div>
      </section>



      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            How it works
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            One request. Private quotes. Clear next steps.
          </h2>
        </div>
        <p className="max-w-md justify-self-start text-sm leading-6 text-slate-600 lg:justify-self-end">
          Importers share the shipment details forwarders need. Forwarders send
          private quotes. Both sides can continue the conversation from the quote.
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
                <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
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
                Keep the quote process in one place.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-600">
                Requests, quotes, messages, and updates stay connected to the
                shipment, so both sides can follow the conversation clearly.
              </p>
            </div>
            <Button asChild variant="outline" className="w-fit rounded-full border-[#202020] bg-transparent px-5">
              <Link href="/sign-up">
                Create free account
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
                  src={item.image}
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
          Quote search
        </p>
        <h2 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
          Your quote search should not be scattered across chats.
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-sm leading-6 text-slate-600">
          Most quote requests happen through Messenger, Viber, referrals, and
          contact lists. Importing Philippines gives you one place to describe
          the shipment, receive private quotes, and decide which forwarder to
          continue with.
        </p>
        <div className="relative mx-auto mt-10 h-[26rem] max-w-6xl overflow-hidden rounded-md bg-white sm:h-[34rem]">
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 520"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern
                id="coverage-dot-pattern"
                width="12"
                height="12"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.7" fill="#1f2937" opacity="0.72" />
              </pattern>
              <clipPath id="coverage-map-shape">
                <path d="M96 138C149 73 278 85 354 126C420 161 470 142 538 123C625 98 735 118 804 175C873 233 911 338 856 413C803 486 671 473 586 432C514 397 463 433 383 451C273 476 154 437 95 354C46 284 45 200 96 138Z" />
                <path d="M840 82C899 66 947 90 957 142C965 183 941 220 896 229C857 238 822 215 813 176C804 136 812 91 840 82Z" />
                <path d="M694 64C735 52 767 70 771 106C775 141 750 165 715 162C682 159 658 136 663 104C666 84 676 69 694 64Z" />
                <path d="M457 452C481 481 474 512 438 517C405 522 377 497 382 466C386 440 432 423 457 452Z" />
              </clipPath>
            </defs>

            <rect
              x="0"
              y="0"
              width="1000"
              height="520"
              fill="url(#coverage-dot-pattern)"
              clipPath="url(#coverage-map-shape)"
            />

            <g fill="none" stroke="#111827" strokeLinecap="round" strokeWidth="2.8">
              <path d="M205 158C320 136 450 172 555 282" />
              <path d="M300 382C384 268 497 276 555 282" />
              <path d="M526 126C581 164 597 226 555 282" />
              <path d="M555 282C625 191 756 164 860 202" />
              <path d="M555 282C663 307 726 367 744 442" />
            </g>

            <g fill="#ffffff" stroke="#e83b52" strokeWidth="7">
              <circle cx="205" cy="158" r="16" />
              <circle cx="300" cy="382" r="16" />
              <circle cx="526" cy="126" r="16" />
              <circle cx="860" cy="202" r="16" />
              <circle cx="744" cy="442" r="16" />
            </g>
          </svg>

          <div className="absolute left-[54%] top-[54%] flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#e83b52] text-white shadow-[0_18px_35px_rgba(232,59,82,0.28)]">
            <MapPin aria-hidden="true" className="size-9 fill-white/30" />
          </div>

          {coverageLocations.map((location) => (
            <CoverageLocationCard key={location.label} location={location} />
          ))}
        </div>
        <div className="mx-auto mt-8 grid max-w-5xl gap-3 sm:grid-cols-5">
          {painPoints.map((point) => (
            <div key={point} className="flex items-start gap-2 rounded-md bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <X aria-hidden="true" className="size-3.5" />
              </span>
              <span>{point}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              What we offer
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              A quote platform, not another forwarder.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600">
              Importing Philippines connects importers with cargo forwarders.
              The platform helps organize requests, quotes, and conversations,
              while the forwarder provides the actual shipping service.
            </p>
            <div className="relative mt-8 min-h-80 overflow-hidden rounded-md">
              <Image
                src="/assets/cargoes.jpg"
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
                </article>
              );
            })}

            <div className="sm:col-span-2">
              <Button asChild className="rounded-full bg-[#202020] px-5 text-white hover:bg-[#343434]">
                <Link href="/sign-up">
                  Create free account
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="rounded-md bg-[#e83b52] px-6 py-14 text-center text-white sm:px-10 lg:py-18">
          <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-6xl">
            Ready to find shipment quotes?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-white/80">
            Create a free account, post your shipment details, and receive
            private quotes from forwarders.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-full bg-[#202020] px-5 text-white hover:bg-[#343434]">
              <Link href="/sign-up">
                Create free account
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/70 bg-transparent px-5 text-white hover:bg-white/10">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicSiteFooter />
    </main>
  );
}

function CoverageLocationCard({
  location,
}: {
  location: {
    label: string;
    detail: string;
    image: string;
    className: string;
  };
}) {
  return (
    <div
      className={`absolute flex w-[10.75rem] items-center gap-2 rounded-full bg-white px-2.5 py-2 text-left shadow-[0_16px_35px_rgba(15,23,42,0.14)] ring-1 ring-slate-200/70 sm:w-[18rem] sm:gap-3 sm:px-3 ${location.className}`}
    >
      <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-slate-100 sm:size-12">
        <Image
          src={location.image}
          alt=""
          fill
          sizes="(min-width: 640px) 48px, 32px"
          className="object-cover"
        />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold leading-tight text-[#202020] sm:text-lg">
          {location.label}
        </span>
        <span className="mt-1 flex items-center gap-1 text-[0.65rem] leading-tight text-slate-500 sm:text-sm">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
          <span>{location.detail}</span>
        </span>
      </span>
    </div>
  );
}
