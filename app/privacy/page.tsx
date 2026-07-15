import type { Metadata } from "next";

import { PublicSiteFooter } from "@/components/public/site-footer";
import { PublicSiteHeader } from "@/components/public/site-header";

export const metadata: Metadata = {
  title: "Privacy notice | importing.ph",
  description: "How importing.ph uses privacy-minimized first-party funnel measurement.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f4] text-[#202020]">
      <PublicSiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Privacy
        </p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Privacy notice</h1>
        <div className="mt-8 grid gap-8 text-sm leading-7 text-slate-700 sm:text-base">
          <section>
            <h2 className="text-xl font-semibold text-[#202020]">First-party funnel measurement</h2>
            <p className="mt-3">
              importing.ph uses an opaque first-party journey identifier to understand whether people can complete account setup, shipment requests, quotations, and their first marketplace conversation. The identifier is stored in a secure, HttpOnly, SameSite=Lax cookie for up to 30 days.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-[#202020]">What we record</h2>
            <p className="mt-3">
              We record a small allowlisted set of product milestones, the account role and signup intent when relevant, optional internal entity identifiers, and the time of the event. Administrators see aggregate journey counts and conversion percentages only.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-[#202020]">What we do not record</h2>
            <p className="mt-3">
              Funnel measurement does not store email addresses, IP addresses, user-agent strings, shipment contents, attachments, quote amounts, or message bodies. Funnel events are deleted after 90 days.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-[#202020]">Questions</h2>
            <p className="mt-3">
              Contact the importing.ph project owner if you have questions about this measurement or want more information about the data associated with your account.
            </p>
          </section>
        </div>
      </main>
      <PublicSiteFooter />
    </div>
  );
}
