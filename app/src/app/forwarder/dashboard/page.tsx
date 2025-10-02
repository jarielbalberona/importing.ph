import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShipmentStatusBadge } from "@/components/dashboard/shipment-status-badge"
import { Package, FileText, CheckCircle, MessageSquare } from "lucide-react"
import Link from "next/link"
import { mockShipments, mockQuotes } from "@/lib/mock-data"

export default function ForwarderDashboardPage() {
  const availableShipments = mockShipments.filter((s) => s.status === "open").length
  const myQuotes = mockQuotes.length
  const acceptedQuotes = mockQuotes.filter((q) => q.status === "accepted").length

  // Filter open shipments for forwarders to quote on
  const openShipments = mockShipments.filter((s) => s.status === "open" || s.status === "quoted")

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader role="forwarder" />

      <main className="container px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Forwarder</h1>
          <p className="text-muted-foreground">Browse available shipments and submit competitive quotes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <StatsCard
            title="Available Shipments"
            value={availableShipments}
            icon={Package}
            description="Ready to quote"
          />
          <StatsCard title="My Quotes" value={myQuotes} icon={FileText} description="Submitted" />
          <StatsCard title="Accepted Quotes" value={acceptedQuotes} icon={CheckCircle} description="Won deals" />
        </div>

        {/* Quick Info */}
        <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">New Opportunities Available</h3>
              <p className="text-sm text-muted-foreground">
                There are {availableShipments} open shipments waiting for quotes. Submit your best rates to win new
                business.
              </p>
            </div>
          </div>
        </Card>

        {/* Open Shipments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Open Shipments</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/forwarder/shipments">View All</Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Delivery Type</TableHead>
                  <TableHead>Target Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">{shipment.id}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{shipment.origin}</div>
                        <div className="text-muted-foreground">→ {shipment.destination}</div>
                      </div>
                    </TableCell>
                    <TableCell>{shipment.cargoVolume}</TableCell>
                    <TableCell className="capitalize">{shipment.deliveryType.replace("-", " ")}</TableCell>
                    <TableCell>{new Date(shipment.targetDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <ShipmentStatusBadge status={shipment.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" className="rounded-lg">
                        <Link href={`/forwarder/shipments/${shipment.id}/quote`}>Quote Now</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {openShipments.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No open shipments available at the moment</p>
              <p className="text-sm text-muted-foreground mt-1">Check back later for new opportunities</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
