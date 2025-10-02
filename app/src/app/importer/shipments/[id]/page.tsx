"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShipmentStatusBadge } from "@/components/dashboard/shipment-status-badge"
import { ArrowLeft, Package, MapPin, Calendar, Truck, CheckCircle, Clock, DollarSign, User } from "lucide-react"
import Link from "next/link"
import { mockShipments, mockQuotes } from "@/lib/mock-data"
import { useState } from "react"

export default function ShipmentDetailPage({ params }: { params: { id: string } }) {
  const [acceptingQuote, setAcceptingQuote] = useState<string | null>(null)

  // Find the shipment and its quotes
  const shipment = mockShipments.find((s) => s.id === params.id)
  const quotes = mockQuotes.filter((q) => q.shipmentId === params.id)

  const handleAcceptQuote = async (quoteId: string) => {
    setAcceptingQuote(quoteId)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setAcceptingQuote(null)
    // In real app, would update state and show success message
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader role="importer" />
        <main className="container px-4 py-8">
          <p>Shipment not found</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader role="importer" />

      <main className="container px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/importer/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Shipment Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">Shipment {shipment.id}</h1>
                <ShipmentStatusBadge status={shipment.status} />
              </div>
              <p className="text-muted-foreground">Posted on {new Date(shipment.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Shipment Details Card */}
          <Card className="p-6 lg:col-span-1 h-fit">
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Shipment Details</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Route</div>
                  <div className="font-medium">{shipment.origin}</div>
                  <div className="text-muted-foreground text-sm">→ {shipment.destination}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Cargo Volume</div>
                  <div className="font-medium">{shipment.cargoVolume}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Delivery Type</div>
                  <div className="font-medium capitalize">{shipment.deliveryType.replace("-", " ")}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Target Date</div>
                  <div className="font-medium">{new Date(shipment.targetDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-sm text-muted-foreground mb-1">Quotes Received</div>
              <div className="text-2xl font-bold text-primary">{quotes.length}</div>
            </div>
          </Card>

          {/* Quotes Comparison */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-foreground">Compare Quotes</h2>
              {quotes.length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {quotes.length} {quotes.length === 1 ? "quote" : "quotes"} available
                </Badge>
              )}
            </div>

            {quotes.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No quotes yet</h3>
                <p className="text-sm text-muted-foreground">
                  Forwarders will submit quotes soon. Check back later to compare and choose the best option.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {quotes.map((quote) => (
                  <Card key={quote.id} className="p-6 hover:shadow-lg transition-shadow relative">
                    {/* Best Value Badge (for lowest price) */}
                    {quote.cost === Math.min(...quotes.map((q) => q.cost)) && quotes.length > 1 && (
                      <Badge className="absolute -top-2 -right-2 bg-green-600 hover:bg-green-600">Best Value</Badge>
                    )}

                    {/* Forwarder Info */}
                    <div className="mb-4 pb-4 border-b border-border">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground truncate">{quote.forwarderName}</div>
                          <div className="text-sm text-muted-foreground truncate">{quote.forwarderCompany}</div>
                        </div>
                      </div>
                    </div>

                    {/* Quote Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">Total Cost</div>
                          <div className="text-2xl font-bold text-primary">
                            {quote.currency} {quote.cost.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">ETA</div>
                          <div className="font-medium">{quote.eta}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">Service Type</div>
                          <div className="font-medium text-sm">{quote.serviceType}</div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {quote.notes && (
                      <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Notes</div>
                        <p className="text-sm text-foreground leading-relaxed line-clamp-3">{quote.notes}</p>
                      </div>
                    )}

                    {/* Accept Button */}
                    <Button
                      onClick={() => handleAcceptQuote(quote.id)}
                      disabled={acceptingQuote !== null}
                      size="lg"
                      className="w-full rounded-xl"
                    >
                      {acceptingQuote === quote.id ? (
                        "Accepting..."
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Accept Quote
                        </>
                      )}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
