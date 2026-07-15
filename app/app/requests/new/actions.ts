"use server";

import { redirect } from "next/navigation";

import {
  createShipmentRequestForCurrentImporter,
} from "@/lib/shipment-requests";
import {
  createShipmentRequestSchema,
  shipmentRequestInputFromFormData,
} from "@/lib/validation";
import { RateLimitError } from "@/lib/rate-limit";
import { recordRequestFunnelEvent } from "@/lib/funnel-events";
import { runBestEffort } from "@/lib/best-effort";

export async function createShipmentRequest(formData: FormData) {
  await createShipmentRequestWithStatus(formData, "posted");
}

export async function saveDraftShipmentRequest(formData: FormData) {
  await createShipmentRequestWithStatus(formData, "draft");
}

async function createShipmentRequestWithStatus(
  formData: FormData,
  status: "draft" | "posted",
) {
  const input = shipmentRequestInputFromFormData(formData);
  const parsed = createShipmentRequestSchema.safeParse(input);

  if (!parsed.success) {
    redirect("/app/requests/new?error=validation");
  }

  try {
    const request = await createShipmentRequestForCurrentImporter(parsed.data, {
      status,
    });

    if (status === "posted") {
      await runBestEffort(
        "funnel.request_posted_failed",
        () =>
          recordRequestFunnelEvent({
            eventName: "request_posted",
            role: "importer",
            entityType: "shipment_request",
            entityId: request.id,
          }),
        { requestId: request.id },
      );
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      redirect("/app/requests/new?error=rate_limited");
    }
    throw error;
  }

  redirect(`/app/requests?request=${status}`);
}
