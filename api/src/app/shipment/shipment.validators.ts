import { z } from "zod";

export const createShipmentSchema = z.object({
  origin_city: z.string().min(1, "Origin city is required"),
  destination: z.string().min(1, "Destination is required"),
  delivery_type: z.enum(["door_to_door", "to_manila_warehouse"]),
  cargo_volume: z.string().min(1, "Cargo volume is required"),
  item_type: z.string().optional(),
  target_delivery_date: z.string().optional(),
  notes: z.string().optional(),
});

export const updateShipmentSchema = z.object({
  origin_city: z.string().min(1, "Origin city is required").optional(),
  destination: z.string().min(1, "Destination is required").optional(),
  delivery_type: z.enum(["door_to_door", "to_manila_warehouse"]).optional(),
  cargo_volume: z.string().min(1, "Cargo volume is required").optional(),
  item_type: z.string().optional(),
  target_delivery_date: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["open", "quoted", "accepted", "closed"]).optional(),
});

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type UpdateShipmentInput = z.infer<typeof updateShipmentSchema>;