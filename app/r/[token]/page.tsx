import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicSiteFooter } from "@/components/public/site-footer";
import { PublicSiteHeader } from "@/components/public/site-header";
import { PublicRequestCta } from "@/components/requests/public-request-cta";
import {
  formatDate,
  formatDeliveryPreference,
  formatMeasure,
  formatShippingModePreference,
  titleFromEnum,
} from "@/lib/format";
import { publicRequestPath, publicShareTokenSchema } from "@/lib/public-request-links";
import { getPublicRequestViewer } from "@/lib/public-request-viewer";
import { getPublicShipmentRequestByToken } from "@/lib/request-sharing";

export const dynamic = "force-dynamic";

type PublicRequestPageProps = {
  params: Promise<{ token: string }>;
};

const getRequest = cache(getPublicShipmentRequestByToken);

function destinationLabel(input: {
  destinationCity: string | null;
  destinationProvince: string | null;
}) {
  return (
    [input.destinationCity, input.destinationProvince].filter(Boolean).join(", ") ||
    "Philippines"
  );
}

export async function generateMetadata({
  params,
}: PublicRequestPageProps): Promise<Metadata> {
  const { token } = await params;
  if (!publicShareTokenSchema.safeParse(token).success) {
    return { robots: { index: false, follow: false } };
  }

  const record = await getRequest(token);
  if (!record) return { robots: { index: false, follow: false } };

  const destination = destinationLabel(record.request);
  const title = `${formatShippingModePreference(record.request.shippingMode)} request: ${record.request.origin} to ${destination}`;
  const description = record.request.publicSummary;
  const canonical = publicRequestPath(token);

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      images: ["/assets/importingph-logo-bg-blue.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/assets/importingph-logo-bg-blue.png"],
    },
  };
}

export default async function PublicRequestPage({
  params,
}: PublicRequestPageProps) {
  const { token } = await params;
  if (!publicShareTokenSchema.safeParse(token).success) notFound();

  const record = await getRequest(token);
  if (!record) notFound();

  const viewer = await getPublicRequestViewer(record.requestId);
  const request = record.request;
  const destination = destinationLabel(request);

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-[#202020]">
      <PublicSiteHeader />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 md:pb-12 md:pt-12">
        <div className="rounded-xl border border-[#e7e2dd] bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
              Public shipment request
            </span>
            <span
              className={
                request.isAcceptingQuotes
                  ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                  : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
              }
            >
              {request.isAcceptingQuotes
                ? "Accepting quotations"
                : "Request closed"}
            </span>
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-4xl">
            {titleFromEnum(request.cargoType)} from {request.origin} to{" "}
            {destination}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
            {request.publicSummary}
          </p>

          <dl className="mt-8 grid gap-4 border-t border-[#e7e2dd] pt-6 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Cargo type" value={titleFromEnum(request.cargoType)} />
            <Detail label="Origin" value={request.origin} />
            <Detail label="Destination" value={destination} />
            <Detail
              label="Shipping mode"
              value={formatShippingModePreference(request.shippingMode)}
            />
            <Detail
              label="Delivery preference"
              value={formatDeliveryPreference(request.deliveryPreference)}
            />
            <Detail
              label="Shipping priority"
              value={titleFromEnum(request.shippingPriority)}
            />
            <Detail label="Total CBM" value={formatMeasure(request.totalCbm, "CBM")} />
            <Detail
              label="Total weight"
              value={formatMeasure(request.totalWeightKg, "kg")}
            />
            <Detail
              label="Package count"
              value={request.packageCount?.toString() ?? "Not provided"}
            />
            <Detail label="Posted" value={formatDate(request.postedAt)} />
          </dl>

          <PublicRequestCta
            isAcceptingQuotes={request.isAcceptingQuotes}
            requestId={record.requestId}
            token={token}
            viewer={viewer}
          />
        </div>
      </main>
      <PublicSiteFooter />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-6 text-slate-900">{value}</dd>
    </div>
  );
}
