import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShipmentStatusBadge } from "@/components/dashboard/shipment-status-badge"
import { Package, FileText, CheckCircle, Plus, Eye } from "lucide-react"
import Link from "next/link"
import { mockShipments } from "@/lib/mock-data"

export default function ImporterDashboardPage() {
  const totalShipments = mockShipments.length
  const activeQuotes = mockShipments.reduce((sum, s) => sum + s.quotesCount, 0)
  const acceptedShipments = mockShipments.filter((s) => s.status === "accepted").length

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader role="importer" />

      <main className="container px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Importer</h1>
          <p className="text-muted-foreground">Manage your shipments and review quotes from cargo forwarders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <StatsCard title="Total Shipments" value={totalShipments} icon={Package} description="All time" />
          <StatsCard title="Active Quotes" value={activeQuotes} icon={FileText} description="Pending review" />
          <StatsCard
            title="Accepted Shipments"
            value={acceptedShipments}
            icon={CheckCircle}
            description="In progress"
          />
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Ready to ship?</h2>
              <p className="text-sm text-muted-foreground">
                Post a new shipment request and receive competitive quotes from verified forwarders
              </p>
            </div>
            <Button asChild size="lg" className="rounded-xl">
              <Link href="/importer/shipments/new">
                <Plus className="mr-2 h-5 w-5" />
                Post New Shipment
              </Link>
            </Button>
          </div>
        </Card>

        {/* Recent Shipments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Recent Shipments</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/importer/shipments">View All</Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Target Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quotes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">{shipment.id}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{shipment.origin}</div>
                        <div className="text-muted-foreground">→ {shipment.destination}</div>
                      </div>
                    </TableCell>
                    <TableCell>{shipment.cargoVolume}</TableCell>
                    <TableCell>{new Date(shipment.targetDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <ShipmentStatusBadge status={shipment.status} />
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{shipment.quotesCount}</span>
                      <span className="text-muted-foreground text-sm"> quotes</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/importer/shipments/${shipment.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  )
}
