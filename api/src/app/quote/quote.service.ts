import { eq, desc, and } from "drizzle-orm";
import { db } from "@/databases/drizzle/connection";
import { quotes, shipments } from "@/models/drizzle";
import { CreateQuoteInput, UpdateQuoteInput } from "./quote.validators";

export default class QuoteService {
  async getQuotesByShipmentId(shipmentId: string) {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.shipment_id, shipmentId))
      .orderBy(desc(quotes.created_at));
  }

  async getQuotesByForwarderId(forwarderId: string) {
    return await db
      .select({
        id: quotes.id,
        shipment_id: quotes.shipment_id,
        forwarder_id: quotes.forwarder_id,
        all_in_cost: quotes.all_in_cost,
        eta_to_ph: quotes.eta_to_ph,
        eta_to_door: quotes.eta_to_door,
        service_type: quotes.service_type,
        notes: quotes.notes,
        status: quotes.status,
        created_at: quotes.created_at,
        shipment: {
          origin_city: shipments.origin_city,
          destination: shipments.destination,
          cargo_volume: shipments.cargo_volume,
          status: shipments.status,
        },
      })
      .from(quotes)
      .leftJoin(shipments, eq(quotes.shipment_id, shipments.id))
      .where(eq(quotes.forwarder_id, forwarderId))
      .orderBy(desc(quotes.created_at));
  }

  async createQuote(data: CreateQuoteInput & { forwarder_id: string }) {
    // Check if shipment exists and is open
    const [shipment] = await db
      .select()
      .from(shipments)
      .where(eq(shipments.id, data.shipment_id));

    if (!shipment || shipment.status !== "open") {
      throw new Error("Shipment not found or not available for quotes");
    }

    // Check if forwarder already submitted a quote for this shipment
    const [existingQuote] = await db
      .select()
      .from(quotes)
      .where(and(
        eq(quotes.shipment_id, data.shipment_id),
        eq(quotes.forwarder_id, data.forwarder_id)
      ));

    if (existingQuote) {
      throw new Error("You have already submitted a quote for this shipment");
    }

    const [quote] = await db
      .insert(quotes)
      .values(data)
      .returning();

    // Update shipment status to "quoted" if it's the first quote
    const quoteCount = await db
      .select({ count: quotes.id })
      .from(quotes)
      .where(eq(quotes.shipment_id, data.shipment_id));

    if (quoteCount.length === 1) {
      await db
        .update(shipments)
        .set({ status: "quoted" })
        .where(eq(shipments.id, data.shipment_id));
    }

    return quote;
  }

  async acceptQuote(quoteId: string, importerId: string) {
    // Get the quote with shipment info
    const [quote] = await db
      .select({
        id: quotes.id,
        shipment_id: quotes.shipment_id,
        forwarder_id: quotes.forwarder_id,
        status: quotes.status,
        shipment_user_id: shipments.user_id,
      })
      .from(quotes)
      .leftJoin(shipments, eq(quotes.shipment_id, shipments.id))
      .where(eq(quotes.id, quoteId));

    if (!quote || quote.shipment_user_id !== importerId) {
      return null;
    }

    if (quote.status !== "submitted") {
      throw new Error("Quote is not in submitted status");
    }

    // Accept the quote
    await db
      .update(quotes)
      .set({ status: "accepted" })
      .where(eq(quotes.id, quoteId));

    // Reject all other quotes for this shipment
    await db
      .update(quotes)
      .set({ status: "rejected" })
      .where(and(
        eq(quotes.shipment_id, quote.shipment_id),
        eq(quotes.status, "submitted")
      ));

    // Update shipment status to "accepted"
    await db
      .update(shipments)
      .set({ status: "accepted" })
      .where(eq(shipments.id, quote.shipment_id));

    return await this.getQuoteById(quoteId);
  }

  async rejectQuote(quoteId: string, importerId: string) {
    // Get the quote with shipment info
    const [quote] = await db
      .select({
        id: quotes.id,
        shipment_id: quotes.shipment_id,
        status: quotes.status,
        shipment_user_id: shipments.user_id,
      })
      .from(quotes)
      .leftJoin(shipments, eq(quotes.shipment_id, shipments.id))
      .where(eq(quotes.id, quoteId));

    if (!quote || quote.shipment_user_id !== importerId) {
      return null;
    }

    if (quote.status !== "submitted") {
      throw new Error("Quote is not in submitted status");
    }

    // Reject the quote
    await db
      .update(quotes)
      .set({ status: "rejected" })
      .where(eq(quotes.id, quoteId));

    return await this.getQuoteById(quoteId);
  }

  async getQuoteById(id: string) {
    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, id));

    return quote;
  }

  async updateQuote(id: string, data: UpdateQuoteInput) {
    const [quote] = await db
      .update(quotes)
      .set(data)
      .where(eq(quotes.id, id))
      .returning();

    return quote;
  }

  async deleteQuote(id: string) {
    await db.delete(quotes).where(eq(quotes.id, id));
  }
}
