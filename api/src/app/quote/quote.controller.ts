import { Request, Response } from "express";
import { ClerkRequest } from "@/middlewares/clerk-auth.middleware";
import QuoteService from "./quote.service";
import { createQuoteSchema, updateQuoteSchema } from "./quote.validators";

export default class QuoteController {
  private req: ClerkRequest;
  private res: Response;
  private quoteService: QuoteService;

  constructor(req: ClerkRequest, res: Response) {
    this.req = req;
    this.res = res;
    this.quoteService = new QuoteService();
  }

  async getQuotesByShipment() {
    try {
      const { shipmentId } = this.req.params;
      const quotes = await this.quoteService.getQuotesByShipmentId(shipmentId);
      this.res.json({ success: true, data: quotes });
    } catch (error) {
      console.error("Get quotes by shipment error:", error);
      this.res.status(500).json({ error: "Failed to fetch quotes" });
    }
  }

  async getMyQuotes() {
    try {
      const userId = this.req.auth?.userId;
      if (!userId) {
        return this.res.status(401).json({ error: "User not authenticated" });
      }

      const quotes = await this.quoteService.getQuotesByForwarderId(userId);
      this.res.json({ success: true, data: quotes });
    } catch (error) {
      console.error("Get my quotes error:", error);
      this.res.status(500).json({ error: "Failed to fetch user quotes" });
    }
  }

  async createQuote() {
    try {
      const userId = this.req.auth?.userId;
      if (!userId) {
        return this.res.status(401).json({ error: "User not authenticated" });
      }

      const validatedData = createQuoteSchema.parse(this.req.body);
      const quote = await this.quoteService.createQuote({
        ...validatedData,
        forwarder_id: userId
      });

      this.res.status(201).json({ success: true, data: quote });
    } catch (error) {
      console.error("Create quote error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return this.res.status(400).json({ error: "Invalid quote data", details: error.message });
      }
      this.res.status(500).json({ error: "Failed to create quote" });
    }
  }

  async acceptQuote() {
    try {
      const userId = this.req.auth?.userId;
      if (!userId) {
        return this.res.status(401).json({ error: "User not authenticated" });
      }

      const { id } = this.req.params;
      const quote = await this.quoteService.acceptQuote(id, userId);
      
      if (!quote) {
        return this.res.status(404).json({ error: "Quote not found or not authorized" });
      }

      this.res.json({ success: true, data: quote });
    } catch (error) {
      console.error("Accept quote error:", error);
      this.res.status(500).json({ error: "Failed to accept quote" });
    }
  }

  async rejectQuote() {
    try {
      const userId = this.req.auth?.userId;
      if (!userId) {
        return this.res.status(401).json({ error: "User not authenticated" });
      }

      const { id } = this.req.params;
      const quote = await this.quoteService.rejectQuote(id, userId);
      
      if (!quote) {
        return this.res.status(404).json({ error: "Quote not found or not authorized" });
      }

      this.res.json({ success: true, data: quote });
    } catch (error) {
      console.error("Reject quote error:", error);
      this.res.status(500).json({ error: "Failed to reject quote" });
    }
  }

  async getQuoteById() {
    try {
      const { id } = this.req.params;
      const quote = await this.quoteService.getQuoteById(id);
      
      if (!quote) {
        return this.res.status(404).json({ error: "Quote not found" });
      }

      this.res.json({ success: true, data: quote });
    } catch (error) {
      console.error("Get quote by ID error:", error);
      this.res.status(500).json({ error: "Failed to fetch quote" });
    }
  }

  async updateQuote() {
    try {
      const userId = this.req.auth?.userId;
      if (!userId) {
        return this.res.status(401).json({ error: "User not authenticated" });
      }

      const { id } = this.req.params;
      const validatedData = updateQuoteSchema.parse(this.req.body);

      // Check if user owns the quote and it's still editable
      const existingQuote = await this.quoteService.getQuoteById(id);
      if (!existingQuote || existingQuote.forwarder_id !== userId || existingQuote.status !== "submitted") {
        return this.res.status(403).json({ error: "Not authorized to update this quote" });
      }

      const quote = await this.quoteService.updateQuote(id, validatedData);
      this.res.json({ success: true, data: quote });
    } catch (error) {
      console.error("Update quote error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return this.res.status(400).json({ error: "Invalid quote data", details: error.message });
      }
      this.res.status(500).json({ error: "Failed to update quote" });
    }
  }

  async deleteQuote() {
    try {
      const userId = this.req.auth?.userId;
      if (!userId) {
        return this.res.status(401).json({ error: "User not authenticated" });
      }

      const { id } = this.req.params;

      // Check if user owns the quote and it's still editable
      const existingQuote = await this.quoteService.getQuoteById(id);
      if (!existingQuote || existingQuote.forwarder_id !== userId || existingQuote.status !== "submitted") {
        return this.res.status(403).json({ error: "Not authorized to delete this quote" });
      }

      await this.quoteService.deleteQuote(id);
      this.res.json({ success: true, message: "Quote deleted successfully" });
    } catch (error) {
      console.error("Delete quote error:", error);
      this.res.status(500).json({ error: "Failed to delete quote" });
    }
  }
}
