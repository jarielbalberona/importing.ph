import Link from "next/link";

import { PageHeader } from "@/components/app-shell";
import { NewShipmentRequestForm } from "@/components/forms/new-shipment-request-form";
import { QueryStateToast } from "@/components/query-state-toast";
import { Button } from "@/components/ui/button";
import { requireImporterProfile } from "@/lib/shipment-requests";
import { FunnelEntryEvent } from "@/components/funnel-entry-event";

export const dynamic = "force-dynamic";

type NewShipmentRequestPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewShipmentRequestPage({
  searchParams,
}: NewShipmentRequestPageProps) {
  await requireImporterProfile();
  const params = await searchParams;

  return (
    <>
      <FunnelEntryEvent eventName="request_started" role="importer" />
      <PageHeader
        title="New shipment request"
        description="Post the shipment once so forwarders can send private quotes."
        actions={
          <Button asChild variant="outline">
            <Link href="/app/requests">Back to requests</Link>
          </Button>
        }
      />

      <QueryStateToast
        errorMessage={
          params.error === "validation"
            ? "Complete the required fields and provide total CBM, total weight, or dimensions with package count."
            : params.error === "rate_limited"
              ? "Too many request changes. Wait a few minutes and try again."
            : null
        }
        clearKeys={["error"]}
      />

      <NewShipmentRequestForm />
    </>
  );
}
