import { Request, Response } from "express";
import { ClerkRequest } from "@/middlewares/clerk-auth.middleware";
import ShipmentService from "./shipment.service";
import { createShipmentSchema, updateShipmentSchema } from "./shipment.validators";

export default class ShipmentController {
  private req: ClerkRequest;
  private res: Response;
  private shipmentService: ShipmentService;

  constructor(req: ClerkRequest, res: Response) {
    this.req = req;
    this.res = res;
    this.shipmentService = new ShipmentService();
  }

  async getAllShipments() {
    try {
      const shipments = await this.shipmentService.getAllShipments();
      this.res.json({ success: true, data: shipments });
    } catch (error) {
      console.error("Get all shipments error:", error);
      this.res.status(500).json({ error: "Failed to fetch shipments" });
    }
  }

  async getMyShipments() {
    try {
      const userId = this.req.auth?.userId;
      if (!userId) {
        return this.res.status(401).json({ error: "User not authenticated" });
      }

      const shipments = await this.shipmentService.getShipmentsByUserId(userId);
      this.res.json({ success: true, data: shipments });
    } catch (error) {
      console.error("Get my shipments error:", error);
      this.res.status(500).json({ error: "Failed to fetch user shipments" });
    }
  }

  async createShipment() {
    try {
      const userId = this.req.auth?.userId;
      if (!userId) {
        return this.res.status(401).json({ error: "User not authenticated" });
      }

      const validatedData = createShipmentSchema.parse(this.req.body);
      const shipment = await this.shipmentService.createShipment({
        ...validatedData,
        user_id: userId
      });

      this.res.status(201).json({ success: true, data: shipment });
    } catch (error) {
      console.error("Create shipment error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return this.res.status(400).json({ error: "Invalid shipment data", details: error.message });
      }
      this.res.status(500).json({ error: "Failed to create shipment" });
    }
  }

  async getShipmentById() {
    try {
      const { id } = this.req.params;
      const shipment = await this.shipmentService.getShipmentById(id);
      
      if (!shipment) {
        return this.res.status(404).json({ error: "Shipment not found" });
      }

      this.res.json({ success: true, data: shipment });
    } catch (error) {
      console.error("Get shipment by ID error:", error);
      this.res.status(500).json({ error: "Failed to fetch shipment" });
    }
  }

  async updateShipment() {
    try {
      const userId = this.req.auth?.userId;
      if (!userId) {
        return this.res.status(401).json({ error: "User not authenticated" });
      }

      const { id } = this.req.params;
      const validatedData = updateShipmentSchema.parse(this.req.body);

      // Check if user owns the shipment
      const existingShipment = await this.shipmentService.getShipmentById(id);
      if (!existingShipment || existingShipment.user_id !== userId) {
        return this.res.status(403).json({ error: "Not authorized to update this shipment" });
      }

      const shipment = await this.shipmentService.updateShipment(id, validatedData);
      this.res.json({ success: true, data: shipment });
    } catch (error) {
      console.error("Update shipment error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return this.res.status(400).json({ error: "Invalid shipment data", details: error.message });
      }
      this.res.status(500).json({ error: "Failed to update shipment" });
    }
  }

  async deleteShipment() {
    try {
      const userId = this.req.auth?.userId;
      if (!userId) {
        return this.res.status(401).json({ error: "User not authenticated" });
      }

      const { id } = this.req.params;

      // Check if user owns the shipment
      const existingShipment = await this.shipmentService.getShipmentById(id);
      if (!existingShipment || existingShipment.user_id !== userId) {
        return this.res.status(403).json({ error: "Not authorized to delete this shipment" });
      }

      await this.shipmentService.deleteShipment(id);
      this.res.json({ success: true, message: "Shipment deleted successfully" });
    } catch (error) {
      console.error("Delete shipment error:", error);
      this.res.status(500).json({ error: "Failed to delete shipment" });
    }
  }
}
