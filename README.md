# Link-Based Task Approval App

A full-stack web application where managers can create tasks, assign them to users via email, and receive approvals or rejections through unique tokenized email links.

## ✨ Features

### 🎯 Core Features
- **Manager Dashboard** – View, create, edit, and delete tasks
- **Task Assignment** – Assign tasks to users via email
- **Tokenized Approval Links** – Secure, single-use links for task approval/rejection
- **Email Notifications** – Automated email system for task assignments and responses

### 🔒 Security Features
- **Unique Tokens** – UUID-based tokens for each task assignment
- **Single-Use Links** – Links expire after use
- **Token Expiration** – Optional token expiration feature

## 🔧 Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Express.js API
- **Database:** PostgreSQL with Drizzle ORM
- **Email Service:** Resend
- **Authentication:** Local Authentication
- **Deployment:** AWS (ECS, RDS, Route53)
- **Infrastructure:** Terraform

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Resend API KEY
- Terraform CLI

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd link-based-task-approval-app
```

2. Set up environment variables
Create a `.env` file with the following variables:
```env
DATABASE_URL=""
PORT=""
NODE_ENV=""
SECRET=""
JWT_COOKIE_NAME=""
SESSION_COOKIE_NAME=""
ORIGIN_URL=""
APP_URL=""
API_URL=""
RESEND_EMAIL_KEY=""
RESEND_EMAIL_FROM=""
AWS_REGION=""
AWS_ACCESS_KEY=""
AWS_SECRET_KEY=""
AWS_S3_FPH_BUCKET_NAME=""
```

3. Start the development server
```bash
docker compose up
```

4. Run database migrations
```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

## 📝 Project Structure

```
├── api/                  # Express.js API
│   ├── routes/          # API routes
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   └── utils/           # Utility functions
├── app/                 # Next.js frontend
│   ├── src/            # Source files
│   │   ├── components/ # React components
│   │   ├── lib/        # Utility functions
│   │   └── types/      # TypeScript definitions
│   └── public/         # Static assets
├── terraform/          # Infrastructure as Code
│   ├── modules/        # Reusable Terraform modules
│   └── environments/   # Environment-specific configs
└── drizzle/           # Database migrations and schema
```

## 🏗️ Infrastructure

The application is deployed on AWS using Terraform for infrastructure management:

- **ECS (Elastic Container Service)** – Hosts the Express.js API and Next.js frontend
- **RDS (Relational Database Service)** – PostgreSQL database instance
- **Route 53** – Domain management and DNS configuration
- **Resend (Email Service)** – Email delivery service
- **VPC** – Network isolation and security
- **ALB (Application Load Balancer)** – Traffic distribution
- **CloudWatch** – Logging and monitoring

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📬 Contact

For any questions or support, please open an issue in the repository.
