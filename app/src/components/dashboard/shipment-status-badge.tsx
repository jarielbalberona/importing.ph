import { Badge } from "@/components/ui/badge"

type ShipmentStatus = "open" | "quoted" | "accepted" | "closed"

interface ShipmentStatusBadgeProps {
  status: ShipmentStatus
}

export function ShipmentStatusBadge({ status }: ShipmentStatusBadgeProps) {
  const variants: Record<ShipmentStatus, { label: string; className: string }> = {
    open: {
      label: "Open",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    quoted: {
      label: "Quoted",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
    accepted: {
      label: "Accepted",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    closed: {
      label: "Closed",
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    },
  }

  const variant = variants[status]

  return <Badge className={variant.className}>{variant.label}</Badge>
}
