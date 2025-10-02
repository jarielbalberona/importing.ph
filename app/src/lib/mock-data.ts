export interface Shipment {
  id: string
  origin: string
  destination: string
  cargoVolume: string
  deliveryType: "door-to-door" | "warehouse"
  targetDate: string
  status: "open" | "quoted" | "accepted" | "closed"
  quotesCount: number
  createdAt: string
}

export interface Quote {
  id: string
  shipmentId: string
  forwarderName: string
  forwarderCompany: string
  cost: number
  currency: string
  eta: string
  serviceType: string
  notes: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
}

export const mockShipments: Shipment[] = [
  {
    id: "SH001",
    origin: "Guangzhou, China",
    destination: "Manila, Philippines",
    cargoVolume: "20 CBM",
    deliveryType: "door-to-door",
    targetDate: "2025-03-15",
    status: "quoted",
    quotesCount: 3,
    createdAt: "2025-02-01",
  },
  {
    id: "SH002",
    origin: "Shenzhen, China",
    destination: "Cebu, Philippines",
    cargoVolume: "15 CBM",
    deliveryType: "warehouse",
    targetDate: "2025-03-20",
    status: "open",
    quotesCount: 1,
    createdAt: "2025-02-05",
  },
  {
    id: "SH003",
    origin: "Shanghai, China",
    destination: "Manila, Philippines",
    cargoVolume: "40 CBM",
    deliveryType: "door-to-door",
    targetDate: "2025-03-10",
    status: "accepted",
    quotesCount: 5,
    createdAt: "2025-01-28",
  },
  {
    id: "SH004",
    origin: "Ningbo, China",
    destination: "Davao, Philippines",
    cargoVolume: "25 CBM",
    deliveryType: "warehouse",
    targetDate: "2025-03-25",
    status: "open",
    quotesCount: 0,
    createdAt: "2025-02-08",
  },
]

export const mockQuotes: Quote[] = [
  {
    id: "Q001",
    shipmentId: "SH001",
    forwarderName: "John Chen",
    forwarderCompany: "Pacific Logistics Co.",
    cost: 2500,
    currency: "USD",
    eta: "12-15 days",
    serviceType: "Sea Freight - FCL",
    notes: "Includes customs clearance and door delivery. Insurance available.",
    status: "pending",
    createdAt: "2025-02-02",
  },
  {
    id: "Q002",
    shipmentId: "SH001",
    forwarderName: "Maria Santos",
    forwarderCompany: "Global Shipping Solutions",
    cost: 2300,
    currency: "USD",
    eta: "14-16 days",
    serviceType: "Sea Freight - FCL",
    notes: "Competitive rates with reliable service. Track and trace included.",
    status: "pending",
    createdAt: "2025-02-03",
  },
  {
    id: "Q003",
    shipmentId: "SH001",
    forwarderName: "David Wong",
    forwarderCompany: "Express Cargo Forwarders",
    cost: 2800,
    currency: "USD",
    eta: "10-12 days",
    serviceType: "Sea Freight - FCL",
    notes: "Fastest delivery option. Premium service with dedicated support.",
    status: "pending",
    createdAt: "2025-02-03",
  },
]
