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
    await createShipmentRequestForCurrentImporter(parsed.data, { status });
  } catch (error) {
    if (error instanceof RateLimitError) {
      redirect("/app/requests/new?error=rate_limited");
    }
    throw error;
  }

  redirect(`/app/requests?request=${status}`);
}
