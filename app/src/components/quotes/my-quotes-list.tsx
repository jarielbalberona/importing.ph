"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMyQuotes } from "@/hooks/react-queries/quotes";
import { format } from "date-fns";

interface MyQuotesListProps {
  status?: "all" | "submitted" | "accepted" | "rejected";
}

export default function MyQuotesList({ status = "all" }: MyQuotesListProps) {
  const { data: quotes, isLoading, error } = useMyQuotes();

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
        <p className="text-red-600">Error loading quotes</p>
      </div>
    );
  }

  const filteredQuotes = status === "all" 
    ? quotes?.data || []
    : quotes?.data?.filter((quote: any) => quote.status === status) || [];

  if (filteredQuotes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No quotes found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredQuotes.map((quote: any) => (
        <Card key={quote.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  {quote.shipment?.origin_city} → {quote.shipment?.destination}
                </CardTitle>
                <CardDescription className="mt-1">
                  {quote.shipment?.cargo_volume}
                </CardDescription>
              </div>
              <Badge variant={
                quote.status === "submitted" ? "default" :
                quote.status === "accepted" ? "default" :
                quote.status === "rejected" ? "destructive" : "outline"
              }>
                {quote.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">Cost:</span>
                <span className="ml-2 font-bold text-green-600">₱{quote.all_in_cost}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">ETA to PH:</span>
                <span className="ml-2">{quote.eta_to_ph} days</span>
              </div>
              {quote.eta_to_door && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">ETA to Door:</span>
                  <span className="ml-2">{quote.eta_to_door} days</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">Service:</span>
                <span className="ml-2 capitalize">{quote.service_type.replace("_", " ")}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">Submitted:</span>
                <span className="ml-2">{format(new Date(quote.created_at), "MMM dd, yyyy")}</span>
              </div>
              {quote.notes && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Notes:</span>
                  <p className="mt-1 text-xs">{quote.notes}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1">
                View Details
              </Button>
              {quote.status === "submitted" && (
                <Button variant="outline" size="sm" className="flex-1">
                  Edit Quote
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
