"use server";

import { redirect } from "next/navigation";

import {
  createShipmentRequestForCurrentImporter,
  createShipmentRequestSchema,
  shipmentRequestInputFromFormData,
} from "@/lib/shipment-requests";

export async function createShipmentRequest(formData: FormData) {
  const input = shipmentRequestInputFromFormData(formData);
  const parsed = createShipmentRequestSchema.safeParse(input);

  if (!parsed.success) {
    redirect("/app/requests/new?error=validation");
  }

  await createShipmentRequestForCurrentImporter(parsed.data);

  redirect("/app/requests");
}
