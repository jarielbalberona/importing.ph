"use client"

import type React from "react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewShipmentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Redirect to dashboard
    router.push("/importer/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader role="importer" />

      <main className="container px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/importer/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Post New Shipment</h1>
              <p className="text-muted-foreground">Fill in your shipment details to receive quotes</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Origin City */}
            <div className="space-y-2">
              <Label htmlFor="origin">Origin City (China)</Label>
              <Select required>
                <SelectTrigger id="origin">
                  <SelectValue placeholder="Select origin city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guangzhou">Guangzhou</SelectItem>
                  <SelectItem value="shenzhen">Shenzhen</SelectItem>
                  <SelectItem value="shanghai">Shanghai</SelectItem>
                  <SelectItem value="ningbo">Ningbo</SelectItem>
                  <SelectItem value="yiwu">Yiwu</SelectItem>
                  <SelectItem value="beijing">Beijing</SelectItem>
                  <SelectItem value="tianjin">Tianjin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <Label htmlFor="destination">Destination (Philippines)</Label>
              <Input id="destination" placeholder="e.g., Manila, Cebu, Davao" required className="bg-background" />
            </div>

            {/* Cargo Volume */}
            <div className="space-y-2">
              <Label htmlFor="cargoVolume">Cargo Volume</Label>
              <Input id="cargoVolume" placeholder="e.g., 20 CBM, 1 container" required className="bg-background" />
              <p className="text-xs text-muted-foreground">Specify volume in CBM or container size</p>
            </div>

            {/* Delivery Type */}
            <div className="space-y-3">
              <Label>Delivery Type</Label>
              <RadioGroup defaultValue="door-to-door" required>
                <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="door-to-door" id="door-to-door" />
                  <Label htmlFor="door-to-door" className="flex-1 cursor-pointer">
                    <div className="font-medium">Door-to-Door</div>
                    <div className="text-sm text-muted-foreground">Delivery to your specified address</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="warehouse" id="warehouse" />
                  <Label htmlFor="warehouse" className="flex-1 cursor-pointer">
                    <div className="font-medium">To Manila Warehouse</div>
                    <div className="text-sm text-muted-foreground">Pickup from warehouse in Manila</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Delivery Date</Label>
              <Input
                id="targetDate"
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                className="bg-background"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special requirements, cargo details, or instructions..."
                rows={4}
                className="bg-background resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" size="lg" className="flex-1 rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Shipment"}
              </Button>
              <Button type="button" variant="outline" size="lg" asChild className="rounded-xl bg-transparent">
                <Link href="/importer/dashboard">Cancel</Link>
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
