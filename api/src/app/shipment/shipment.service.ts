import { eq, desc } from "drizzle-orm";
import { db } from "@/databases/drizzle/connection";
import { shipments, quotes } from "@/models/drizzle";
import { CreateShipmentInput, UpdateShipmentInput } from "./shipment.validators";

export default class ShipmentService {
  async getAllShipments() {
    return await db
      .select({
        id: shipments.id,
        user_id: shipments.user_id,
        origin_city: shipments.origin_city,
        destination: shipments.destination,
        delivery_type: shipments.delivery_type,
        cargo_volume: shipments.cargo_volume,
        item_type: shipments.item_type,
        target_delivery_date: shipments.target_delivery_date,
        notes: shipments.notes,
        status: shipments.status,
        created_at: shipments.created_at,
        quote_count: quotes.id,
      })
      .from(shipments)
      .leftJoin(quotes, eq(quotes.shipment_id, shipments.id))
      .where(eq(shipments.status, "open"))
      .orderBy(desc(shipments.created_at));
  }

  async getShipmentsByUserId(userId: string) {
    return await db
      .select()
      .from(shipments)
      .where(eq(shipments.user_id, userId))
      .orderBy(desc(shipments.created_at));
  }

  async createShipment(data: CreateShipmentInput & { user_id: string }) {
    const [shipment] = await db
      .insert(shipments)
      .values({
        ...data,
        target_delivery_date: data.target_delivery_date ? new Date(data.target_delivery_date) : null,
      })
      .returning();

    return shipment;
  }

  async getShipmentById(id: string) {
    const [shipment] = await db
      .select()
      .from(shipments)
      .where(eq(shipments.id, id));

    return shipment;
  }

  async updateShipment(id: string, data: UpdateShipmentInput) {
    const [shipment] = await db
      .update(shipments)
      .set({
        ...data,
        target_delivery_date: data.target_delivery_date ? new Date(data.target_delivery_date) : undefined,
      })
      .where(eq(shipments.id, id))
      .returning();

    return shipment;
  }

  async deleteShipment(id: string) {
    await db.delete(shipments).where(eq(shipments.id, id));
  }

  async getShipmentWithQuotes(id: string) {
    const shipment = await this.getShipmentById(id);
    if (!shipment) return null;

    const shipmentQuotes = await db
      .select()
      .from(quotes)
      .where(eq(quotes.shipment_id, id))
      .orderBy(desc(quotes.created_at));

    return {
      ...shipment,
      quotes: shipmentQuotes,
    };
  }
}
