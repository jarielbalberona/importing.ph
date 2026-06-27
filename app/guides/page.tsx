import Link from "next/link";
import { PublicSiteFooter } from "@/components/public/site-footer";
import { PublicSiteHeader } from "@/components/public/site-header";
import { buildGuidesIndexMetadata } from "@/features/public-content/seo/metadata";
import { getGuidePath, getPublishedGuides } from "@/features/public-content/seo/routes";

export const metadata = buildGuidesIndexMetadata();

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
    <>
      <main className="min-h-screen bg-[#f7f7f4] text-[#202020]">
        <PublicSiteHeader />
        <section className="border-b border-[#e7e2dd]">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-18">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
              Guides
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
              Beginner Guides for Importing to the Philippines
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
              These guides help you understand China-to-Philippines quote basics,
              shipping terms like CBM, and how to compare air and sea options before you post.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
            {publishedGuides.length === 0 ? (
              <p className="text-base leading-7 text-slate-700">
                New beginner guides are being added. Start with our onboarding content
                and request a shipping quote from one forwarder while we improve this
                index.
              </p>
            ) : null}

            <div className="grid gap-5">
              {publishedGuides.map((guide) => (
                <article
                  key={guide.slug}
                  className="border-t border-[#e7e2dd] py-5 first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
                        <span>{guide.category}</span>
                        <span aria-hidden="true">•</span>
                        <time dateTime={guide.publishedAt}>{formatGuideDate(guide.publishedAt)}</time>
                      </div>
                      <h2 className="mt-2 text-2xl font-semibold leading-tight">
                        <Link
                          href={getGuidePath(guide.slug)}
                          className="transition-colors hover:text-cyan-700"
                        >
                          {guide.title}
                        </Link>
                      </h2>
                      <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
                        {guide.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-sm text-slate-500">
                      {guide.readingTimeMinutes ? `${guide.readingTimeMinutes} min read` : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <PublicSiteFooter />
      </main>
    </>
  );
}
