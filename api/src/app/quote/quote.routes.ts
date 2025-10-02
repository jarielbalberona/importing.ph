import express, { Router } from "express";

import QuoteController from "@/app/quote/quote.controller";
import { clerkAuthMiddleware } from "@/middlewares/clerk-auth.middleware";

export const quoteRouter: Router = (() => {
	const router = express.Router();

	// Get quotes for a specific shipment
	router.get("/shipment/:shipmentId", clerkAuthMiddleware, (req, res) => {
		new QuoteController(req, res).getQuotesByShipment();
	});

	// Get quotes submitted by current user (forwarder)
	router.get("/my-quotes", clerkAuthMiddleware, (req, res) => {
		new QuoteController(req, res).getMyQuotes();
	});

	// Submit a quote (forwarder only)
	router.post("/", clerkAuthMiddleware, (req, res) => {
		new QuoteController(req, res).createQuote();
	});

	// Accept a quote (importer only)
	router.put("/:id/accept", clerkAuthMiddleware, (req, res) => {
		new QuoteController(req, res).acceptQuote();
	});

	// Reject a quote (importer only)
	router.put("/:id/reject", clerkAuthMiddleware, (req, res) => {
		new QuoteController(req, res).rejectQuote();
	});

	// Get specific quote
	router.get("/:id", clerkAuthMiddleware, (req, res) => {
		new QuoteController(req, res).getQuoteById();
	});

	// Update quote (forwarder only, before acceptance)
	router.put("/:id", clerkAuthMiddleware, (req, res) => {
		new QuoteController(req, res).updateQuote();
	});

	// Delete quote (forwarder only, before acceptance)
	router.delete("/:id", clerkAuthMiddleware, (req, res) => {
		new QuoteController(req, res).deleteQuote();
	});

	return router;
})();
