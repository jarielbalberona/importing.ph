import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { PublicSiteFooter } from "@/components/public/site-footer";
import { PublicSiteHeader } from "@/components/public/site-header";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  buildGuideArticleJsonLd,
  buildGuideBreadcrumbJsonLd,
} from "@/features/public-content/seo/jsonLd";
import { buildGuideMetadata } from "@/features/public-content/seo/metadata";
import {
  getPublishedGuideBySlug,
  getPublishedGuides,
} from "@/features/public-content/seo/routes";
import {
  POST_SHIPMENT_REQUEST_INTENT,
  appendAuthRedirectParams,
} from "@/lib/auth-redirect";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

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

export async function generateStaticParams() {
  return getPublishedGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getPublishedGuideBySlug(slug);
  return guide ? buildGuideMetadata(guide) : {};
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getPublishedGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicSiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildGuideArticleJsonLd(guide)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildGuideBreadcrumbJsonLd(guide)) }} />

      <section className="border-b border-border bg-primary/5">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-20">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/guides">Guides</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>{guide.title}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-primary">{guide.category}</p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl">{guide.title}</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{guide.description}</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <span>Published {formatGuideDate(guide.publishedAt)}</span>
            {guide.updatedAt ? <><span aria-hidden="true">•</span><span>Updated {formatGuideDate(guide.updatedAt)}</span></> : null}
            {guide.readingTimeMinutes ? <><span aria-hidden="true">•</span><span>{guide.readingTimeMinutes} min read</span></> : null}
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-14">
          {guide.sections.map((section, sectionIndex) => (
            <section key={section.heading} className="grid gap-5 border-t border-border pt-10 sm:grid-cols-[3rem_1fr]">
              <span className="font-mono text-sm font-bold text-primary" aria-hidden="true">{String(sectionIndex + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight">{section.heading}</h2>
                {section.body?.map((paragraph) => <p key={paragraph} className="mt-5 text-base leading-8 text-muted-foreground">{paragraph}</p>)}
                {section.bullets?.length ? (
                  <ul className="mt-6 grid gap-3 text-base leading-7 text-muted-foreground">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span aria-hidden="true" className="mt-2.5 size-2 shrink-0 rounded-full bg-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {section.steps?.length ? (
                  <ol className="mt-6 grid gap-4 text-base leading-7 text-muted-foreground">
                    {section.steps.map((step, index) => (
                      <li key={step} className="flex gap-4">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{index + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                ) : null}
                {section.callout ? (
                  <div className="mt-7 border-l-4 border-primary bg-primary/5 px-6 py-5">
                    <p className="font-bold">{section.callout.title ?? "Take note"}</p>
                    <p className="mt-2 text-base leading-7 text-muted-foreground">{section.callout.body}</p>
                  </div>
                ) : null}
                {section.faqs?.length ? (
                  <div className="mt-7 grid gap-6">
                    {section.faqs.map((faq) => (
                      <div key={faq.question} className="border-t border-border pt-5">
                        <h3 className="text-lg font-bold">{faq.question}</h3>
                        <p className="mt-2 text-base leading-7 text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </article>

      {guide.sources?.length ? (
        <section className="border-y border-border bg-primary/5">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Official references</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Check the current rules before you ship</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Import rules can change and product-specific requirements vary. Use these official sources to confirm the current requirements for your shipment.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {guide.sources.map((source) => (
                <li key={`${guide.slug}:${source.href}`}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-border bg-background p-5 transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <span className="block font-bold">{source.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{source.publisher}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {guide.relatedLinks?.length ? (
        <section className="border-y border-border bg-muted/60">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Keep reading</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight">More guides you may find useful</h2>
            <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
              {guide.relatedLinks.map((relatedLink) => (
                <Link key={`${guide.slug}:${relatedLink.href}`} href={relatedLink.href} className="bg-background p-6 transition-colors hover:bg-primary/5 hover:text-primary">
                  <p className="text-lg font-bold">{relatedLink.label}</p>
                  {relatedLink.description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{relatedLink.description}</p> : null}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-primary py-14 text-primary-foreground">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold leading-tight">Ready to post your first shipment request?</h2>
            <p className="mt-2 max-w-2xl leading-7 text-primary-foreground/75">Create a free account and post one consistent set of cargo details for forwarders to quote.</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="shrink-0 font-bold">
            <Link href={requestHref}>Post a shipment request <ArrowRight aria-hidden="true" /></Link>
          </Button>
        </div>
      </section>

      <PublicSiteFooter />
    </main>
  );
}
