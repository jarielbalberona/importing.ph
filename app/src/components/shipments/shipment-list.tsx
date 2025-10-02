"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMyShipments } from "@/hooks/react-queries/shipments";
import { format } from "date-fns";

interface ShipmentListProps {
  status?: "all" | "open" | "quoted" | "accepted" | "closed";
}

export default function ShipmentList({ status = "all" }: ShipmentListProps) {
  const { data: shipments, isLoading, error } = useMyShipments();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading shipments</p>
      </div>
    );
  }

  const filteredShipments = status === "all" 
    ? shipments?.data || []
    : shipments?.data?.filter((shipment: any) => shipment.status === status) || [];

  if (filteredShipments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No shipments found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredShipments.map((shipment: any) => (
        <Card key={shipment.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{shipment.origin_city} → {shipment.destination}</CardTitle>
                <CardDescription className="mt-1">
                  {shipment.cargo_volume}
                </CardDescription>
              </div>
              <Badge variant={
                shipment.status === "open" ? "secondary" :
                shipment.status === "quoted" ? "default" :
                shipment.status === "accepted" ? "default" : "outline"
              }>
                {shipment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">Delivery:</span>
                <span className="ml-2 capitalize">{shipment.delivery_type.replace("_", " ")}</span>
              </div>
              {shipment.item_type && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Items:</span>
                  <span className="ml-2">{shipment.item_type}</span>
                </div>
              )}
              {shipment.target_delivery_date && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">Target Date:</span>
                  <span className="ml-2">{format(new Date(shipment.target_delivery_date), "MMM dd, yyyy")}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">Created:</span>
                <span className="ml-2">{format(new Date(shipment.created_at), "MMM dd, yyyy")}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1">
                View Details
              </Button>
              {shipment.status === "quoted" && (
                <Button size="sm" className="flex-1">
                  View Quotes
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
