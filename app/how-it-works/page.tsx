import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Building2,
  Check,
  ClipboardCheck,
  EyeOff,
  FileStack,
  ListFilter,
  LockKeyhole,
  MessagesSquare,
  Milestone,
  Scale,
  ShieldCheck,
  Ship,
} from "lucide-react";

import { PublicSiteFooter } from "@/components/public/site-footer";
import { PublicSiteHeader } from "@/components/public/site-header";
import { Button } from "@/components/ui/button";
import { buildHowItWorksMetadata } from "@/features/public-content/seo/metadata";
import {
  JOIN_AS_FORWARDER_INTENT,
  POST_SHIPMENT_REQUEST_INTENT,
  appendAuthRedirectParams,
} from "@/lib/auth-redirect";

export const metadata = buildHowItWorksMetadata();

const importerHref = appendAuthRedirectParams("/sign-up", {
  intent: POST_SHIPMENT_REQUEST_INTENT,
});
const forwarderHref = appendAuthRedirectParams("/sign-up", {
  intent: JOIN_AS_FORWARDER_INTENT,
});

const comparisonRows = [
  {
    label: "Primary goal",
    importer: "Find and compare shipment quotations.",
    forwarder: "Quote shipment requests the company can serve.",
  },
  {
    label: "Starts by",
    importer: "Posting cargo, route, size, timing, and delivery needs.",
    forwarder: "Completing a company profile and reviewing open requests.",
  },
  {
    label: "Submits",
    importer: "One shipment request shared with eligible forwarders.",
    forwarder: "A private quotation with price, transit, coverage, and notes.",
  },
  {
    label: "Can see",
    importer: "Quotations submitted for the importer’s own request.",
    forwarder: "The shipment request and its own company’s quotation.",
  },
  {
    label: "Cannot see",
    importer: "Private forwarder operations outside the submitted quote.",
    forwarder: "Competitors’ prices, notes, inclusions, or transit details.",
  },
  {
    label: "Messaging",
    importer: "Available with a forwarder after that forwarder submits a quote.",
    forwarder: "Available with the importer after the company submits a quote.",
  },
  {
    label: "Final action",
    importer: "Select the quotation that best fits the shipment.",
    forwarder: "Deliver the agreed service if the quotation is selected.",
  },
];

const workflowSteps = [
  {
    number: "01",
    owner: "Importer",
    title: "Post one shipment request",
    body: "Describe the cargo, China origin, Philippine destination, measurements, timing, and delivery preference.",
    icon: Boxes,
  },
  {
    number: "02",
    owner: "Forwarder",
    title: "Review the request",
    body: "Forwarders decide whether the route, cargo, schedule, and service scope match what their company can handle.",
    icon: ClipboardCheck,
  },
  {
    number: "03",
    owner: "Forwarder",
    title: "Submit a private quotation",
    body: "Each forwarder sends its own price, transit range, inclusions, coverage, and notes without seeing competitor details.",
    icon: LockKeyhole,
  },
  {
    number: "04",
    owner: "Importer",
    title: "Compare and clarify",
    body: "The importer compares quotations and continues the conversation with forwarders that have quoted the shipment.",
    icon: Scale,
  },
  {
    number: "05",
    owner: "Both",
    title: "Continue with the selected quote",
    body: "The importer chooses. The selected forwarder provides the shipping service under the agreed quotation and terms.",
    icon: MessagesSquare,
  },
];

const boundaries = [
  {
    title: "The platform is not a forwarder",
    body: "importing.ph organizes requests, quotations, and conversations. The forwarder provides the actual logistics service.",
    icon: Ship,
  },
  {
    title: "Quotations stay private",
    body: "An importer can compare quotations for its request. Forwarders cannot inspect competitor pricing or terms.",
    icon: EyeOff,
  },
  {
    title: "Messaging follows a quotation",
    body: "A forwarder must submit a quotation before a shipment conversation becomes available.",
    icon: LockKeyhole,
  },
  {
    title: "Both sides still perform due diligence",
    body: "The marketplace improves comparison. It does not guarantee customs outcomes, service quality, pricing, or delivery results.",
    icon: ClipboardCheck,
  },
];

const comingNextFeatures = [
  {
    title: "Reusable shipment and quote templates",
    summary: "Make repeat requests and quotations faster without removing the details each shipment needs.",
    importer: "Save common cargo, route, and delivery details as a starting point for the next request.",
    forwarder: "Reuse company quote defaults, then adjust pricing, coverage, and exclusions for each shipment.",
    icon: FileStack,
  },
  {
    title: "Better request discovery",
    summary: "Reduce noise by helping each shipment reach providers that are more likely to serve it.",
    importer: "Get clearer guidance on the details forwarders use to decide whether a request is a fit.",
    forwarder: "Filter opportunities by route, transport mode, cargo type, and service coverage.",
    icon: ListFilter,
  },
  {
    title: "Decision and handoff tools",
    summary: "Carry the important context from quotation comparison into the selected service.",
    importer: "Shortlist quotations, keep decision notes, and create a clear selected-quote summary.",
    forwarder: "Receive a structured handoff that confirms the selected scope and outstanding questions.",
    icon: Scale,
  },
  {
    title: "Marketplace reputation signals",
    summary: "Build useful trust signals from real activity completed through the marketplace.",
    importer: "See transaction-based context that supports—not replaces—provider due diligence.",
    forwarder: "Build a visible service history from completed marketplace engagements.",
    icon: ShieldCheck,
  },
  {
    title: "Shared shipment milestones",
    summary: "Keep both sides aligned after a quotation is selected with lightweight status updates.",
    importer: "See key handoff and shipment checkpoints without chasing updates across channels.",
    forwarder: "Post concise milestones without turning importing.ph into a full freight-management system.",
    icon: Milestone,
  },
  {
    title: "Document readiness checklists",
    summary: "Make missing shipment information and requested documents easier to spot early.",
    importer: "Track what has been provided and what the selected forwarder still needs.",
    forwarder: "Request required details consistently without implying a customs or compliance guarantee.",
    icon: ClipboardCheck,
  },
];

const questions = [
  {
    question: "Can a forwarder see another forwarder’s quote?",
    answer:
      "No. A forwarder can see the shipment request and its own company’s quotation. Competitor prices, notes, transit details, and inclusions remain private.",
  },
  {
    question: "Can an importer message a forwarder before receiving a quote?",
    answer:
      "No. Messaging is tied to a shipment and becomes available with a forwarder after that forwarder submits a quotation.",
  },
  {
    question: "Does importing.ph provide the shipping service?",
    answer:
      "No. importing.ph is the quotation marketplace. The forwarder you choose is responsible for the logistics service described in its quotation and terms.",
  },
  {
    question: "Does joining the platform guarantee shipments or quotations?",
    answer:
      "No. Importers still need a clear, quote-ready request, and forwarders decide which requests they can serve. The platform organizes the opportunity and comparison; it does not guarantee a commercial result.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicSiteHeader />

      <section className="overflow-hidden border-b border-border bg-primary/5">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              How the marketplace works
            </p>
            <h1 className="mt-5 text-balance text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-7xl">
              Importers request. Forwarders quote. Both decide with the same shipment context.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              importing.ph is a quotation marketplace for China-to-Philippines shipments. Importers post what they need. Forwarders respond privately with the service they can provide.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="font-bold shadow-xl shadow-primary/20">
                <Link href={importerHref}>
                  I need shipment quotes <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold">
                <Link href={forwarderHref}>I provide forwarding services</Link>
              </Button>
            </div>
          </div>

          <RoleFlowArt />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Choose your role</p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            The difference is simple: one side needs a quote; the other provides it.
          </h2>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <RoleCard
            id="importers"
            eyebrow="I need shipment quotations"
            title="Importer"
            description="A Philippine business owner, buyer, or operator arranging cargo from a supplier or pickup point in China."
            icon={Building2}
            items={[
              "Post the shipment details once.",
              "Receive private quotations from forwarders.",
              "Compare pricing, transit, inclusions, and coverage.",
              "Ask follow-up questions after a forwarder quotes.",
              "Select the quotation that fits the shipment.",
            ]}
            responsibility="Provide accurate cargo information, confirm product and customs requirements, and perform due diligence before selecting a provider."
            href={importerHref}
            cta="Post a shipment request"
          />
          <RoleCard
            id="forwarders"
            eyebrow="I provide logistics services"
            title="Forwarder"
            description="A logistics provider that wants to find relevant shipment requests and compete through clear, private quotations."
            icon={Ship}
            items={[
              "Set up the forwarding company profile.",
              "Browse open shipment requests the company can serve.",
              "Submit pricing and service details privately.",
              "Keep competitor quotation details hidden.",
              "Continue the conversation after submitting a quote.",
            ]}
            responsibility="Quote truthfully, disclose scope and exclusions, protect importer information, and deliver the service agreed with the importer."
            href={forwarderHref}
            cta="Join as a forwarder"
          />
        </div>
      </section>

      <section className="bg-primary py-20 text-primary-foreground lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/60">
            Role comparison
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Same marketplace. Different responsibilities and visibility.
          </h2>

          <div className="mt-12 overflow-hidden rounded-2xl border border-primary-foreground/20">
            <div className="hidden grid-cols-[0.55fr_1fr_1fr] bg-primary-foreground/10 text-sm font-bold lg:grid">
              <div className="p-5">Difference</div>
              <div className="border-l border-primary-foreground/20 p-5">Importer</div>
              <div className="border-l border-primary-foreground/20 p-5">Forwarder</div>
            </div>
            {comparisonRows.map((row) => (
              <div
                key={row.label}
                className="grid gap-5 border-t border-primary-foreground/20 p-6 first:border-t-0 lg:grid-cols-[0.55fr_1fr_1fr] lg:gap-0 lg:p-0 lg:first:border-t"
              >
                <p className="text-sm font-bold lg:p-5">{row.label}</p>
                <div className="lg:border-l lg:border-primary-foreground/20 lg:p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground/55 lg:hidden">Importer</p>
                  <p className="mt-1 leading-7 text-primary-foreground/80 lg:mt-0">{row.importer}</p>
                </div>
                <div className="lg:border-l lg:border-primary-foreground/20 lg:p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground/55 lg:hidden">Forwarder</p>
                  <p className="mt-1 leading-7 text-primary-foreground/80 lg:mt-0">{row.forwarder}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">One shared process</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              A clear path from request to selected quotation.
            </h2>
            <p className="mt-6 leading-7 text-muted-foreground">
              The shipment request is the common reference. Quotations and conversations stay attached to it so both roles work from the same facts.
            </p>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.number} className="grid gap-5 bg-background p-6 sm:grid-cols-[4rem_1fr] sm:p-8">
                  <div>
                    <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Icon aria-hidden="true" className="size-6" />
                    </span>
                    <span className="mt-3 block font-mono text-xs font-bold text-primary">{step.number}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{step.owner}</p>
                    <h3 className="mt-2 text-2xl font-extrabold tracking-tight">{step.title}</h3>
                    <p className="mt-3 leading-7 text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="border-y border-border bg-muted/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Clear boundaries</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            What both roles should understand before joining.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
            {boundaries.map((boundary) => {
              const Icon = boundary.icon;
              return (
                <article key={boundary.title} className="bg-background p-7 sm:p-9">
                  <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold">{boundary.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{boundary.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-primary py-20 text-primary-foreground lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/60">
                Coming next
              </p>
              <h2 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl">
                Practical improvements for importers and forwarders—not a bloated logistics suite.
              </h2>
            </div>
            <div className="border-l-4 border-primary-foreground/30 pl-5">
              <p className="font-bold">The current release stays focused.</p>
              <p className="mt-2 leading-7 text-primary-foreground/70">
                Request → private quotes → compare → message → select. The items below are planned directions, not available features or committed release dates.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-primary-foreground/20 bg-primary-foreground/20 md:grid-cols-2 xl:grid-cols-3">
            {comingNextFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="bg-primary p-7 sm:p-8">
                  <span className="grid size-12 place-items-center rounded-full bg-primary-foreground/10">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-primary-foreground/70">{feature.summary}</p>
                  <div className="mt-6 grid gap-4 border-t border-primary-foreground/20 pt-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground/50">Importer</p>
                      <p className="mt-1 text-sm leading-6 text-primary-foreground/80">{feature.importer}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground/50">Forwarder</p>
                      <p className="mt-1 text-sm leading-6 text-primary-foreground/80">{feature.forwarder}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Common questions</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Before you choose a role</h2>
          </div>
          <div className="grid gap-6">
            {questions.map((item) => (
              <article key={item.question} className="border-t border-border pt-6">
                <h3 className="text-xl font-extrabold">{item.question}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-primary-foreground/20 p-7 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/60">For importers</p>
            <h2 className="mt-4 text-3xl font-extrabold">Ready to request shipment quotes?</h2>
            <p className="mt-3 leading-7 text-primary-foreground/75">
              Post one complete shipment request and compare private forwarder quotations in one place.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-7 font-bold">
              <Link href={importerHref}>Post a shipment request <ArrowRight aria-hidden="true" /></Link>
            </Button>
          </div>
          <div className="rounded-2xl border border-primary-foreground/20 p-7 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/60">For forwarders</p>
            <h2 className="mt-4 text-3xl font-extrabold">Ready to compete through clearer quotes?</h2>
            <p className="mt-3 leading-7 text-primary-foreground/75">
              Build your company profile, review relevant requests, and submit private quotations.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-7 font-bold">
              <Link href={forwarderHref}>Join as a forwarder <ArrowRight aria-hidden="true" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicSiteFooter />
    </main>
  );
}

function RoleFlowArt() {
  return (
    <div aria-hidden="true" className="relative overflow-hidden rounded-3xl border border-border bg-background p-6 shadow-2xl shadow-primary/10 sm:p-8">
      <div className="absolute -right-20 -top-20 size-56 rounded-full bg-primary/10 blur-2xl" />
      <p className="relative text-xs font-bold uppercase tracking-[0.16em] text-primary">One marketplace</p>
      <div className="relative mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="rounded-2xl border border-border bg-primary/5 p-5 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground">
            <Building2 className="size-7" />
          </span>
          <p className="mt-4 font-extrabold">Importer</p>
          <p className="mt-1 text-xs text-muted-foreground">Posts the request</p>
        </div>
        <ArrowRight className="size-6 text-primary" />
        <div className="rounded-2xl border border-border bg-primary/5 p-5 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground">
            <Ship className="size-7" />
          </span>
          <p className="mt-4 font-extrabold">Forwarder</p>
          <p className="mt-1 text-xs text-muted-foreground">Submits a quote</p>
        </div>
      </div>
      <div className="relative mt-6 rounded-2xl bg-primary p-5 text-primary-foreground">
        <div className="flex items-center gap-3">
          <LockKeyhole className="size-5 shrink-0" />
          <p className="font-bold">Private quotation</p>
        </div>
        <div className="mt-4 grid gap-2 text-xs text-primary-foreground/75 sm:grid-cols-3">
          {["Price and terms", "Transit and coverage", "Quote-linked messages"].map((label) => (
            <div key={label} className="flex items-center gap-2 rounded-lg bg-primary-foreground/10 p-3">
              <Check className="size-4 shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  id,
  eyebrow,
  title,
  description,
  icon: Icon,
  items,
  responsibility,
  href,
  cta,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof Building2;
  items: string[];
  responsibility: string;
  href: string;
  cta: string;
}) {
  return (
    <article id={id} className="scroll-mt-28 rounded-2xl border border-border p-7 shadow-sm sm:p-10">
      <div className="flex items-start gap-5">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <Icon aria-hidden="true" className="size-7" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
          <h3 className="mt-2 text-4xl font-extrabold tracking-tight">{title}</h3>
        </div>
      </div>
      <p className="mt-6 text-lg leading-8 text-muted-foreground">{description}</p>
      <ul className="mt-7 grid gap-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3 leading-7">
            <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Check aria-hidden="true" className="size-3.5" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 border-l-4 border-primary bg-primary/5 px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Your responsibility</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{responsibility}</p>
      </div>
      <Button asChild size="lg" className="mt-8 w-full font-bold sm:w-auto">
        <Link href={href}>{cta} <ArrowRight aria-hidden="true" /></Link>
      </Button>
    </article>
  );
}
