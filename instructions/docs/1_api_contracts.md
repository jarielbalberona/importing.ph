# 📊 API Contract Specification

## /api/shipments

### POST /api/shipments
Create a new shipment request.

#### Body
```json
{
  "origin_city": "Guangzhou",
  "destination": "Dumaguete",
  "delivery_type": "door_to_door",
  "cargo_volume": "2 CBM / 200kg",
  "item_type": "clothes",
  "target_delivery_date": "2025-08-15",
  "notes": "Handle with care"
}
```

### GET /api/shipments
Fetch all shipments for current importer.

---

## /api/quotes/:shipmentId

### POST /api/quotes/:shipmentId
Submit a quote for a shipment.

#### Body
```json
{
  "all_in_cost": 12000,
  "eta_to_ph": 12,
  "eta_to_door": 17,
  "service_type": "door_to_door",
  "notes": "Includes FDA permit and insurance"
}
```

---

## /api/users/me

### GET /api/users/me
Returns current logged-in user (importer or forwarder).

### Response
```json
{
  "id": "user_123",
  "email": "user@email.com",
  "role": "importer",
  "company_name": "Acme Imports",
  "location": "Dumaguete"
}
```