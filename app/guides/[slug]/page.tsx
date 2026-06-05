import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { buildGuideMetadata } from "@/features/public-content/seo/metadata";
import {
  getPublishedGuideBySlug,
  getPublishedGuides,
} from "@/features/public-content/seo/routes";
import {
  buildGuideArticleJsonLd,
  buildGuideBreadcrumbJsonLd,
} from "@/features/public-content/seo/jsonLd";

type GuidePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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

  if (!guide) {
    return {};
  }

  return buildGuideMetadata(guide);
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getPublishedGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const articleJsonLd = buildGuideArticleJsonLd(guide);
  const breadcrumbJsonLd = buildGuideBreadcrumbJsonLd(guide);

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-12">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/guides">Guides</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{guide.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <p className="mt-6 text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            {guide.category}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            {guide.title}
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
            {guide.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
            <time dateTime={guide.publishedAt}>{formatGuideDate(guide.publishedAt)}</time>
            {guide.updatedAt ? (
              <>
                <span aria-hidden="true">•</span>
                <span>Updated {formatGuideDate(guide.updatedAt)}</span>
              </>
            ) : null}
            {guide.readingTimeMinutes ? (
              <>
                <span aria-hidden="true">•</span>
                <span>{guide.readingTimeMinutes} min read</span>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-12">
        <div className="grid gap-10">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold leading-tight">{section.heading}</h2>

              {section.body?.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-base leading-7 text-slate-700">
                  {paragraph}
                </p>
              ))}

              {section.bullets?.length ? (
                <ul className="mt-4 grid gap-3 text-base leading-7 text-slate-700">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span aria-hidden="true" className="mt-2 h-2 w-2 rounded-full bg-cyan-700" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.steps?.length ? (
                <ol className="mt-4 grid gap-3 text-base leading-7 text-slate-700">
                  {section.steps.map((step, index) => (
                    <li key={step} className="flex gap-4">
                      <span className="font-semibold text-slate-950">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              ) : null}

              {section.callout ? (
                <div className="mt-5 border-l-4 border-cyan-700 bg-cyan-50 px-5 py-4">
                  <p className="font-semibold text-slate-950">
                    {section.callout.title ?? "Take note"}
                  </p>
                  <p className="mt-2 text-base leading-7 text-slate-700">
                    {section.callout.body}
                  </p>
                </div>
              ) : null}

              {section.faqs?.length ? (
                <div className="mt-6 grid gap-5">
                  {section.faqs.map((faq) => (
                    <div key={faq.question} className="border-t border-slate-200 pt-5">
                      <h3 className="text-lg font-semibold">{faq.question}</h3>
                      <p className="mt-2 text-base leading-7 text-slate-700">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </article>

      {guide.relatedLinks?.length ? (
        <section className="border-t border-slate-200">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-12">
            <h2 className="text-2xl font-semibold leading-tight">Related guides and routes</h2>
            <div className="mt-6 grid gap-4">
              {guide.relatedLinks.map((link) => (
                <Link
                  key={`${guide.slug}:${link.href}`}
                  href={link.href}
                  className="border-t border-slate-200 pt-4 transition-colors hover:text-cyan-700"
                >
                  <p className="text-lg font-semibold">{link.label}</p>
                  {link.description ? (
                    <p className="mt-2 text-sm leading-6 text-slate-600">{link.description}</p>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-slate-200 bg-cyan-50">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:py-12">
          <div>
            <h2 className="text-2xl font-semibold leading-tight">
              Ready to request shipment quotes?
            </h2>
            <p className="mt-2 text-base leading-7 text-slate-700">
              Create a free account and post one shipment request instead of repeating
              the same cargo details across scattered chats.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Create free account
          </Link>
        </div>
      </section>
    </main>
  );
}
