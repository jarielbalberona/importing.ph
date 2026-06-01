import Link from "next/link";

import { PageHeader } from "@/components/app-shell";
import { NewShipmentRequestForm } from "@/components/forms/new-shipment-request-form";
import { Button } from "@/components/ui/button";
import { requireImporterProfile } from "@/lib/shipment-requests";

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
      <PageHeader
        eyebrow="Importer"
        title="New shipment request"
        description="Post the shipment once so forwarders can send private quotes."
        actions={
          <Button asChild variant="outline">
            <Link href="/app/requests">Back to requests</Link>
          </Button>
        }
      />

      {params.error === "validation" ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Complete the required fields and provide total CBM, total weight, or
          dimensions with package count.
        </div>
      ) : null}

      <NewShipmentRequestForm />
    </>
  );
}
