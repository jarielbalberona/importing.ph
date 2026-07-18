import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PublicSiteFooter } from "@/components/public/site-footer";
import { PublicSiteHeader } from "@/components/public/site-header";
import { Button } from "@/components/ui/button";
import { buildGuidesIndexMetadata } from "@/features/public-content/seo/metadata";
import { getGuidePath, getPublishedGuides } from "@/features/public-content/seo/routes";
import {
  POST_SHIPMENT_REQUEST_INTENT,
  appendAuthRedirectParams,
} from "@/lib/auth-redirect";

export const metadata = buildGuidesIndexMetadata();

const requestHref = appendAuthRedirectParams("/sign-up", {
  intent: POST_SHIPMENT_REQUEST_INTENT,
});

function formatGuideDate(date: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function GuidesPage() {
  const publishedGuides = getPublishedGuides();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicSiteHeader />

      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_0.65fr] lg:items-end lg:py-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/65">Guides</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-7xl">
              Beginner Guides for Importing to the Philippines
            </h1>
          </div>
          <p className="max-w-xl text-lg leading-8 text-primary-foreground/75">
            These guides help you understand China-to-Philippines quote basics, shipping terms like CBM, and how to compare air and sea options before you post.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        {publishedGuides.length === 0 ? (
          <p className="text-base leading-7 text-muted-foreground">New beginner guides are being added.</p>
        ) : null}
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
          {publishedGuides.map((guide, index) => (
            <article key={guide.slug} className="group min-h-80 bg-background p-7 transition-colors hover:bg-muted/60 sm:p-10">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-sm font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{guide.category}</span>
              </div>
              <h2 className="mt-12 max-w-xl text-2xl font-extrabold leading-tight tracking-tight">
                <Link href={getGuidePath(guide.slug)} className="transition-colors group-hover:text-primary">
                  {guide.title}
                </Link>
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-muted-foreground">{guide.description}</p>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <time dateTime={guide.publishedAt}>{formatGuideDate(guide.publishedAt)}</time>
                {guide.readingTimeMinutes ? <span>{guide.readingTimeMinutes} min read</span> : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-primary/5 py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Ready to compare?</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Start with one shipment request.</h2>
          </div>
          <Button asChild size="lg" className="font-bold">
            <Link href={requestHref}>Post a shipment request <ArrowRight aria-hidden="true" /></Link>
          </Button>
        </div>
      </section>

      <PublicSiteFooter />
    </main>
  );
}
