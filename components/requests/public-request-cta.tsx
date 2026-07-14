import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  appendAuthRedirectParams,
  SUBMIT_QUOTE_INTENT,
} from "@/lib/auth-redirect";
import { publicRequestPath } from "@/lib/public-request-links";
import type { PublicRequestViewer } from "@/lib/public-request-viewer";

type PublicRequestCtaProps = {
  isAcceptingQuotes: boolean;
  requestId: string;
  token: string;
  viewer: PublicRequestViewer;
};

export function PublicRequestCta({
  isAcceptingQuotes,
  requestId,
  token,
  viewer,
}: PublicRequestCtaProps) {
  const className =
    "sticky bottom-3 z-20 rounded-lg border border-cyan-200 bg-white p-4 shadow-lg md:static md:mt-8 md:p-6";

  if (!isAcceptingQuotes) {
    return (
      <aside className={className} aria-label="Quotation status">
        <p className="font-semibold text-slate-950">
          No longer accepting quotations
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          The importer has selected a quotation or cancelled this request.
        </p>
      </aside>
    );
  }

  const returnPath = publicRequestPath(token);
  const authOptions = {
    redirectPath: returnPath,
    intent: SUBMIT_QUOTE_INTENT,
  };

  if (viewer.kind === "anonymous") {
    return (
      <aside className={className} aria-label="Submit a quotation">
        <p className="font-semibold text-slate-950">
          Interested in this shipment?
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Sign in or create a forwarder account to submit a private quotation.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href={appendAuthRedirectParams("/sign-in", authOptions)}>
              Sign in to quote
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={appendAuthRedirectParams("/sign-up", authOptions)}>
              Create forwarder account
            </Link>
          </Button>
        </div>
      </aside>
    );
  }

  if (viewer.kind === "onboarding") {
    return (
      <aside className={className} aria-label="Finish account setup">
        <p className="font-semibold text-slate-950">Finish your account setup</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Choose a forwarder account to continue to the quotation form.
        </p>
        <Button asChild className="mt-4">
          <Link href={appendAuthRedirectParams("/onboarding", authOptions)}>
            Finish account setup
          </Link>
        </Button>
      </aside>
    );
  }

  if (viewer.kind === "forwarder_eligible") {
    const href = viewer.hasExistingQuote
      ? `/app/forwarder/requests/${requestId}`
      : `/app/forwarder/requests/${requestId}/quote`;
    return (
      <aside className={className} aria-label="Submit a quotation">
        <p className="font-semibold text-slate-950">
          {viewer.hasExistingQuote
            ? "You already quoted this request"
            : "Ready to send your quotation?"}
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Quotations remain private between the forwarder and importer.
        </p>
        <Button asChild className="mt-4">
          <Link href={href}>
            {viewer.hasExistingQuote
              ? "View your quotation"
              : "Submit quotation"}
          </Link>
        </Button>
      </aside>
    );
  }

  const message =
    viewer.kind === "forwarder_suspended"
      ? "This forwarder company is suspended and cannot submit quotations."
      : viewer.kind === "forwarder_unavailable"
        ? "Your forwarder membership is unavailable. Contact support before quoting."
        : "Only forwarder accounts can submit quotations for shipment requests.";

  return (
    <aside className={className} aria-label="Quotation unavailable">
      <p className="font-semibold text-slate-950">Quotation unavailable</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{message}</p>
    </aside>
  );
}
