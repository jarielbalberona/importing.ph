# MVP SPECIFICATION: importing.ph

## 🚀 Overview

A marketplace for importers to post shipment requests and receive quotes from multiple cargo forwarders.

### 🧱 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, Tailwind CSS, Zustand, React Query |
| Backend | Node.js + Express, Drizzle ORM |
| DB | PostgreSQL (via RDS) |
| Auth | Clerk |
| Infra | AWS ECS, RDS, Route 53, S3, GitHub Actions, Terraform |
| Deployment | Docker + GitHub Actions (CI/CD) |
| Storage | S3 (documents, shipment photos if needed later) |

## 👥 User Roles

| Role | Capabilities |
|------|--------------|
| Importer | Post shipments, view incoming quotes, accept quote |
| Forwarder | View shipments, submit quotes, track accepted shipments |

## 🔐 Authentication (Clerk)

- Clerk-managed signup/login
- Role selection (`importer` or `forwarder`) saved in DB
- JWT used for secure API auth
- Middleware protects routes by role

## 📦 Modules

### 1. User Profile

| Field | Applies To | Notes |
|-------|------------|-------|
| id | All | Clerk `user.id` |
| email, name | All | From Clerk |
| role | All | 'importer' or 'forwarder' |
| company_name | Optional | Mainly for forwarders |
| location | Optional | PH or China location |
| created_at | All | Stored in DB |

### 2. Shipment Request (Importer)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| origin_city | string | ✅ | e.g. Guangzhou |
| destination | string | ✅ | e.g. Dumaguete |
| delivery_type | enum | ✅ | 'door_to_door', 'to_manila_warehouse' |
| cargo_volume | string | ✅ | e.g. 2 CBM / 200kg |
| item_type | string | ⛔ | Optional |
| target_delivery_date | date | ⛔ | Optional |
| notes | text | ⛔ | Additional instructions |
| status | enum | ✅ | 'open', 'quoted', 'accepted', 'closed' |

### 3. Quote Submission (Forwarder)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| shipment_id | FK | ✅ | Connect to shipment |
| forwarder_id | FK | ✅ | From Clerk session |
| all_in_cost | number | ✅ | In PHP or USD |
| eta_to_ph | number | ✅ | Days to PH |
| eta_to_door | number | ⛔ | Optional |
| service_type | enum | ✅ | 'door_to_door', 'to_manila_warehouse' |
| notes | text | ⛔ | With permits, insurance, etc |
| status | enum | ✅ | 'submitted', 'accepted', 'rejected' |

### 4. Quote Comparison (Importer)

- View quotes per shipment
- Accept one quote → others marked rejected
- Forwarder contact shown post-acceptance

### 5. Dashboards

#### Importer

- Post shipment
- View shipments + statuses
- View quotes per shipment
- Accepted forwarder summary

#### Forwarder

- Browse open shipments
- Submit quote
- View submitted quotes
- Track accepted shipments

## 🛠 Database Schema (Drizzle ORM compatible)

### users

```ts
id           UUID (Clerk user ID)
email        string
role         enum('importer', 'forwarder')
name         string
company_name string (optional)
location     string
created_at   timestamp
```

### shipments

```ts
id                    UUID
user_id               FK → users
origin_city           string
destination           string
delivery_type         enum('door_to_door', 'to_manila_warehouse')
cargo_volume          string
item_type             string (optional)
target_delivery_date  date (optional)
notes                 text (optional)
status                enum('open', 'quoted', 'accepted', 'closed')
created_at            timestamp
```

### quotes

```ts
id              UUID
shipment_id     FK → shipments
forwarder_id    FK → users
all_in_cost     number
eta_to_ph       number
eta_to_door     number (optional)
service_type    enum('door_to_door', 'to_manila_warehouse')
notes           text (optional)
status          enum('submitted', 'accepted', 'rejected')
created_at      timestamp
```

## ✅ MVP Checklist

| Module | Status |
|--------|--------|
| Clerk auth with role-based routing | ✅ |
| Importer: post shipment | ✅ |
| Forwarder: view & quote | ✅ |
| Importer: compare & accept | ✅ |
| Dashboards for both roles | ✅ |
| Role-based page protection | ✅ |
| API Routes (App Router / Express) | ✅ |
| Drizzle schema | ✅ |
