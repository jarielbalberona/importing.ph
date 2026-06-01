CREATE INDEX "shipment_requests_cargo_type_idx" ON "shipment_requests" USING btree ("cargo_type");--> statement-breakpoint
CREATE INDEX "shipment_requests_delivery_preference_idx" ON "shipment_requests" USING btree ("delivery_preference");--> statement-breakpoint
CREATE INDEX "shipment_requests_shipping_preference_idx" ON "shipment_requests" USING btree ("shipping_preference");