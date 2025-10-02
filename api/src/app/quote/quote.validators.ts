import { z } from "zod";

export const createQuoteSchema = z.object({
  shipment_id: z.string().uuid("Invalid shipment ID"),
  all_in_cost: z.number().positive("Cost must be positive"),
  eta_to_ph: z.number().positive("ETA to PH must be positive"),
  eta_to_door: z.number().positive("ETA to door must be positive").optional(),
  service_type: z.enum(["door_to_door", "to_manila_warehouse"]),
  notes: z.string().optional(),
});

export const updateQuoteSchema = z.object({
  all_in_cost: z.number().positive("Cost must be positive").optional(),
  eta_to_ph: z.number().positive("ETA to PH must be positive").optional(),
  eta_to_door: z.number().positive("ETA to door must be positive").optional(),
  service_type: z.enum(["door_to_door", "to_manila_warehouse"]).optional(),
  notes: z.string().optional(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
