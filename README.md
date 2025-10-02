# importing.ph - Shipment Marketplace

A full-stack marketplace application connecting importers with cargo forwarders for shipments from China to the Philippines. Importers can post shipment requests and receive competitive quotes from multiple forwarders.

## ✨ Features

### 🎯 Core Features
- **Importer Dashboard** – Post shipments, view quotes, accept best offers
- **Forwarder Dashboard** – Browse open shipments, submit competitive quotes
- **Quote Comparison** – Compare multiple quotes side-by-side
- **Role-Based Access** – Separate interfaces for importers and forwarders

### 🔒 Security Features
- **Clerk Authentication** – Secure user management and role-based access
- **JWT Tokens** – Secure API authentication
- **Role Protection** – Importer and forwarder specific features

## 🔧 Tech Stack

- **Frontend:** Next.js 15, React, Tailwind CSS, Zustand, React Query
- **Backend:** Express.js API with TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Clerk
- **Deployment:** AWS (ECS, RDS, Route53, S3)
- **Infrastructure:** Terraform
- **Email Service:** Resend (for notifications)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Clerk API Keys
- Resend API KEY (for notifications)
- Terraform CLI

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd importing-ph
```

2. Set up environment variables
Create a `.env` file with the following variables:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/importing_ph"

# API Configuration
PORT="4000"
NODE_ENV="development"
API_URL="http://localhost:4000"

# Clerk Authentication
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Email Service
RESEND_EMAIL_KEY=""
RESEND_EMAIL_FROM=""

# AWS (for production)
AWS_REGION=""
AWS_ACCESS_KEY=""
AWS_SECRET_KEY=""
AWS_S3_BUCKET_NAME=""
```

3. Start the development server
```bash
docker compose up
```

4. Run database migrations
```bash
cd api
pnpm db:push
pnpm db:seed
```

## 📝 Project Structure

```
├── api/                  # Express.js API
│   ├── src/
│   │   ├── app/
│   │   │   ├── shipment/    # Shipment management
│   │   │   ├── quote/       # Quote management
│   │   │   └── user/        # User management
│   │   ├── models/drizzle/  # Database models
│   │   ├── routes/          # API routes
│   │   └── middlewares/     # Custom middleware
│   └── .drizzle/           # Database migrations
├── app/                 # Next.js frontend
│   ├── src/
│   │   ├── app/        # App router pages
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom hooks
│   │   └── config/     # Configuration
│   └── public/         # Static assets
├── terraform/          # Infrastructure as Code
│   ├── modules/        # Reusable Terraform modules
│   └── environments/   # Environment-specific configs
└── importingph_mvps/   # MVP specifications
```

## 🏗️ Infrastructure

The application is deployed on AWS using Terraform for infrastructure management:

- **ECS (Elastic Container Service)** – Hosts the Express.js API and Next.js frontend
- **RDS (Relational Database Service)** – PostgreSQL database instance
- **Route 53** – Domain management and DNS configuration
- **S3** – File storage for documents and images
- **Resend** – Email delivery service for notifications
- **VPC** – Network isolation and security
- **ALB (Application Load Balancer)** – Traffic distribution
- **CloudWatch** – Logging and monitoring

## 👥 User Roles

### Importer
- Post shipment requests with origin, destination, and cargo details
- View and compare quotes from multiple forwarders
- Accept the best quote and track shipment status

### Forwarder
- Browse open shipment requests
- Submit competitive quotes with pricing and delivery estimates
- Track accepted quotes and manage ongoing shipments

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📬 Contact

For any questions or support, please open an issue in the repository.
