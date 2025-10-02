import express, { Router } from "express";

import ShipmentController from "@/app/shipment/shipment.controller";
import { clerkAuthMiddleware } from "@/middlewares/clerk-auth.middleware";

export const shipmentRouter: Router = (() => {
	const router = express.Router();

	// Get all shipments (for forwarders to browse)
	router.get("/", clerkAuthMiddleware, (req, res) => {
		new ShipmentController(req, res).getAllShipments();
	});

	// Get shipments for current user (for importers)
	router.get("/my-shipments", clerkAuthMiddleware, (req, res) => {
		new ShipmentController(req, res).getMyShipments();
	});

	// Create new shipment (importer only)
	router.post("/", clerkAuthMiddleware, (req, res) => {
		new ShipmentController(req, res).createShipment();
	});

	// Get specific shipment
	router.get("/:id", clerkAuthMiddleware, (req, res) => {
		new ShipmentController(req, res).getShipmentById();
	});

	// Update shipment (importer only)
	router.put("/:id", clerkAuthMiddleware, (req, res) => {
		new ShipmentController(req, res).updateShipment();
	});

	// Delete shipment (importer only)
	router.delete("/:id", clerkAuthMiddleware, (req, res) => {
		new ShipmentController(req, res).deleteShipment();
	});

	return router;
})();
