"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useShipments } from "@/hooks/react-queries/shipments";
import { format } from "date-fns";

export default function OpenShipmentsList() {
  const { data: shipments, isLoading, error } = useShipments();

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

  const openShipments = shipments?.data?.filter((shipment: any) => shipment.status === "open") || [];

  if (openShipments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No open shipments available</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {openShipments.map((shipment: any) => (
        <Card key={shipment.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{shipment.origin_city} → {shipment.destination}</CardTitle>
                <CardDescription className="mt-1">
                  {shipment.cargo_volume}
                </CardDescription>
              </div>
              <Badge variant="secondary">Open</Badge>
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
                <span className="font-medium">Posted:</span>
                <span className="ml-2">{format(new Date(shipment.created_at), "MMM dd, yyyy")}</span>
              </div>
              {shipment.notes && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Notes:</span>
                  <p className="mt-1 text-xs">{shipment.notes}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1">
                View Details
              </Button>
              <Button size="sm" className="flex-1">
                Submit Quote
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
