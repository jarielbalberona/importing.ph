# 🤖 AI-Enhanced Rate Estimator – MVP 4

## 🎯 Goal
Enable importers to get **instant shipping cost estimates** using forwarder-submitted rate data — with **AI summarizing the best options** based on their shipment input.

---

## 🧱 System Components

### 1. `rates` Table (Forwarder-submitted)
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| forwarder_id | FK | From users table |
| origin_city | string | e.g. "Guangzhou" |
| destination | string | e.g. "Dumaguete" |
| delivery_type | enum | 'door_to_door' or 'to_manila_warehouse' |
| min_price | number | Base cost |
| price_per_cbm | number | Rate per CBM |
| price_per_kg | number | Rate per kg |
| eta_days | number | Delivery estimate |
| item_type | string (optional) | e.g. electronics, food |
| notes | text (optional) | Extra service info |
| active | boolean | Show/hide in estimator |

---

### 2. Importer Input Form
| Field | Example |
|-------|---------|
| Origin | Guangzhou |
| Destination | Dumaguete |
| Cargo Size | 2 CBM / 300 kg |
| Item Type | Dried food |

---

## 🤖 AI Logic

### Step 1: Filter Applicable Rates
- Match origin + destination
- Match service type and optionally item type

### Step 2: Generate AI Summary
Feed matching rows as context and prompt AI with:

```txt
Given this shipment:
- Origin: Guangzhou
- Destination: Dumaguete
- Cargo: 2 CBM / 300 kg
- Item: Dried food

And these rates:
1. Forwarder A – ₱12,000, ETA 14d, door-to-door
2. Forwarder B – ₱14,500, ETA 10d, door-to-door
3. Forwarder C – ₱13,000, ETA 12d, FDA handling

Summarize the best shipping options. Show cheapest, fastest, and most suitable.
```

### Sample AI Output:
> The cheapest is Forwarder A at ₱12,000 with 14-day delivery.  
> The fastest is Forwarder B at 10 days for ₱14,500.  
> If FDA compliance is needed, Forwarder C may be best at ₱13,000 with 12-day ETA.

---

## 🚀 Optional UI Flow

- User enters shipment specs → hits "Get Instant Estimate"
- Results:
  - AI summary block
  - Table of matching forwarder rates
  - CTA: "Post as shipment to get live quotes"

---

## 🧠 Benefits

| For Importers | For Forwarders |
|---------------|----------------|
| See ballpark rates instantly | Less repetitive quoting |
| Decide faster | Show transparent pricing |
| Better trust | Become discoverable via search |

---

## 🔧 Implementation

- Feature folder: `/features/rates`
- Files:
  - `api/ratesClient.ts`
  - `hooks/queries/useRateEstimate.ts`
  - `components/RateEstimator.tsx`
  - `ai/generateRateSummary.ts`

- Optionally use OpenAI, Groq, or local LLM with RAG-style prompt

---

## 📌 Summary
This feature complements the existing quote system by offering **instant, intelligent estimates** — improving UX, trust, and efficiency.

