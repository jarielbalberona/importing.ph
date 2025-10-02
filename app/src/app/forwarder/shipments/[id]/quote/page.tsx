"use client"

import type React from "react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, FileText, Package } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { mockShipments } from "@/lib/mock-data"

export default function SubmitQuotePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Find the shipment (in real app, fetch from API)
  const shipment = mockShipments.find((s) => s.id === params.id)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Redirect to dashboard
    router.push("/forwarder/dashboard")
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader role="forwarder" />
        <main className="container px-4 py-8">
          <p>Shipment not found</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader role="forwarder" />

      <main className="container px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/forwarder/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Submit Quote</h1>
              <p className="text-muted-foreground">Provide your competitive quote for this shipment</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Shipment Details */}
          <Card className="p-6 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Shipment Details</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-muted-foreground">Shipment ID</div>
                <div className="font-medium">{shipment.id}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Origin</div>
                <div className="font-medium">{shipment.origin}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Destination</div>
                <div className="font-medium">{shipment.destination}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Cargo Volume</div>
                <div className="font-medium">{shipment.cargoVolume}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Delivery Type</div>
                <div className="font-medium capitalize">{shipment.deliveryType.replace("-", " ")}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Target Date</div>
                <div className="font-medium">{new Date(shipment.targetDate).toLocaleDateString()}</div>
              </div>
            </div>
          </Card>

          {/* Quote Form */}
          <Card className="p-8 lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cost */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cost">Total Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    placeholder="2500"
                    required
                    min="0"
                    step="0.01"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="usd" required>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="php">PHP</SelectItem>
                      <SelectItem value="cny">CNY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ETA */}
              <div className="space-y-2">
                <Label htmlFor="eta">Estimated Time of Arrival (ETA)</Label>
                <Input id="eta" placeholder="e.g., 12-15 days, 2-3 weeks" required className="bg-background" />
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select required>
                  <SelectTrigger id="serviceType">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sea-fcl">Sea Freight - FCL (Full Container Load)</SelectItem>
                    <SelectItem value="sea-lcl">Sea Freight - LCL (Less than Container Load)</SelectItem>
                    <SelectItem value="air-standard">Air Freight - Standard</SelectItem>
                    <SelectItem value="air-express">Air Freight - Express</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Include details about your service, insurance options, customs clearance, tracking, etc."
                  rows={5}
                  className="bg-background resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Highlight what makes your service competitive and reliable
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" size="lg" className="flex-1 rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Quote"}
                </Button>
                <Button type="button" variant="outline" size="lg" asChild className="rounded-xl bg-transparent">
                  <Link href="/forwarder/dashboard">Cancel</Link>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
