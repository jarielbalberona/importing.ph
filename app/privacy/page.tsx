import type { Metadata } from "next";

import { PublicSiteFooter } from "@/components/public/site-footer";
import { PublicSiteHeader } from "@/components/public/site-header";

export const metadata: Metadata = {
  title: "Privacy notice | importing.ph",
  description: "How importing.ph uses privacy-minimized first-party funnel measurement.",
};

const privacySections = [
  {
    heading: "First-party funnel measurement",
    body: "importing.ph uses an opaque first-party journey identifier to understand whether people can complete account setup, shipment requests, quotations, and their first marketplace conversation. The identifier is stored in a secure, HttpOnly, SameSite=Lax cookie for up to 30 days.",
  },
  {
    heading: "What we record",
    body: "We record a small allowlisted set of product milestones, the account role and signup intent when relevant, optional internal entity identifiers, and the time of the event. Administrators see aggregate journey counts and conversion percentages only.",
  },
  {
    heading: "What we do not record",
    body: "Funnel measurement does not store email addresses, IP addresses, user-agent strings, shipment contents, attachments, quote amounts, or message bodies. Funnel events are deleted after 90 days.",
  },
  {
    heading: "Questions",
    body: "Contact the importing.ph project owner if you have questions about this measurement or want more information about the data associated with your account.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PublicSiteHeader />

      <section className="border-b border-border bg-primary/5">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Privacy</p>
          <h1 className="mt-5 text-5xl font-extrabold tracking-[-0.04em] sm:text-7xl">Privacy notice</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            How importing.ph uses privacy-minimized first-party funnel measurement.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="max-w-4xl">
          {privacySections.map((section, index) => (
            <article key={section.heading} className="grid gap-5 border-t border-border py-10 sm:grid-cols-[3rem_1fr]">
              <span className="font-mono text-sm font-bold text-primary" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">{section.heading}</h2>
                <p className="mt-4 leading-8 text-muted-foreground">{section.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <PublicSiteFooter />
    </main>
  );
}
