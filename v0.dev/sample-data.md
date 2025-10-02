```typescript
// importing.ph - Sample Data for v0.dev

export const sampleShipments = [
  {
    id: '1',
    originCity: 'Shanghai',
    destination: 'Manila',
    cargoVolume: '20ft container',
    deliveryType: 'door_to_door',
    targetDate: '2024-02-15',
    status: 'open',
    quotesCount: 3
  },
  {
    id: '2',
    originCity: 'Guangzhou',
    destination: 'Cebu',
    cargoVolume: '40ft container',
    deliveryType: 'to_manila_warehouse',
    targetDate: '2024-02-20',
    status: 'quoted',
    quotesCount: 5
  }
]

export const sampleQuotes = [
  {
    id: '1',
    forwarderName: 'FastCargo Logistics',
    allInCost: '$2,500',
    etaToPh: '15 days',
    etaToDoor: '18 days',
    serviceType: 'door_to_door',
    status: 'submitted'
  },
  {
    id: '2',
    forwarderName: 'China Express',
    allInCost: '$2,200',
    etaToPh: '12 days',
    etaToDoor: '15 days',
    serviceType: 'door_to_door',
    status: 'submitted'
  }
]
```