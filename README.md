# 🛒 Modern Point of Sale (POS) & Store Management System

A high-performance, full-stack Point of Sale (POS) and Retail Management web application built with **Next.js 16 (App Router)**, **React 19**, **Prisma ORM**, **PostgreSQL**, **Tailwind CSS**, and integrated **AI Business Intelligence**.

---

## ✨ Features Overview

### 🛍️ Cashier & Terminal Point of Sale
- **Interactive POS Terminal**: Fast product search, category filtering, responsive product grid, and quick-add actions.
- **Dynamic Cart & Pricing Engine**:
  - Automated tiered spending discounts (e.g., tiered percentage or fixed amount discounts).
  - Item-level and order-level discount adjustments.
  - Automatic sales tax calculation and subtotal management.
- **Multiple Payment Methods**:
  - **Cash**: Smart tender input with instant change calculation.
  - **Card / PayHere Gateway**: Seamless online payment gateway checkout with PayHere integration.
- **Digital & PDF Receipts**:
  - Thermal-style receipt modal.
  - Instant client-side **jsPDF** receipt generation and download.
- **Transaction Logs**: View recent orders, filter by cashier, reprint receipts, and inspect breakdown details.

### 🛡️ Security & Role-Based Access Control (RBAC)
- **Role Separation**: Dedicated dashboards and permissions for **Cashiers** and **Managers**.
- **Quick-Lock & PIN Protection**: Lock terminal screen with 4-digit PIN authentication.
- **Manager Override Authorization**: Require elevated manager credentials or PIN to authorize special actions (e.g., custom discounts, voids, overrides).

### 📊 Admin Portal & Store Operations
- **📦 Inventory Management**:
  - Comprehensive Product CRUD (name, SKU, price, stock, category, supplier, image/icon).
  - Low-stock badges, out-of-stock warnings, and real-time inventory tracking.
- **📈 Reports & Analytics**:
  - Real-time revenue, total orders, average transaction value, and tax collected.
  - Visual sales charts, payment method distribution, and top-selling product summaries.
- **🤖 AI Business Advisor**:
  - Intelligent inventory health score calculation and sales velocity indicators.
  - Actionable recommendations and trend insights powered by **Google Gemini** / **OpenAI/Hugging Face** AI models with an analytical algorithmic fallback.
- **👥 Staff & User Management**:
  - Create, update, and manage cashier and manager accounts with secure PINs and passwords.
- **⚙️ Store Settings & Discount Engine**:
  - Global tax rate configuration.
  - Configurable spending discount threshold rules.
  - Spending limits and store policies.

### ⚡ Real-Time System Updates
- **Server-Sent Events (SSE)**: Built-in notification streaming for real-time order alerts and inventory notifications.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Actions, API Routes) |
| **Frontend** | [React 19](https://react.dev/), TypeScript, [Tailwind CSS v4](https://tailwindcss.com/) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) (e.g., Neon DB), [Prisma ORM 5](https://www.prisma.io/) |
| **AI Intelligence** | Google Gemini API / Hugging Face Inference Router / Rule Engine |
| **Payment Gateway** | [PayHere](https://www.payhere.lk/) Sandbox & Production Checkout |
| **Document Generation** | [jsPDF](https://github.com/parallax/jsPDF) |
| **Containerization** | [Docker](https://www.docker.com/) (Multi-stage Alpine image with Standalone output) |

---

## 📁 Project Structure

```text
pos-system/
├── prisma/
│   └── schema.prisma              # Database models (Products, Users, Transactions, Rules)
├── src/
│   ├── app/
│   │   ├── (admin)/               # Admin management portal
│   │   │   ├── advice/            # AI Business advisor & insights
│   │   │   ├── inventory/         # Product & stock management
│   │   │   ├── reports/           # Sales & revenue reports
│   │   │   ├── settings/          # Tax & spending discount rules
│   │   │   └── users/             # User & staff administration
│   │   ├── (cashier)/             # Cashier POS terminal
│   │   │   ├── transactions/      # Transaction history & logs
│   │   │   └── page.tsx           # Main POS checkout register
│   │   ├── actions/               # Server Actions (CRUD, Auth, PayHere, AI, Settings)
│   │   ├── api/                   # API routes (SSE notifications, webhooks)
│   │   ├── components/            # Reusable UI modals (Payment, Override, Staff, etc.)
│   │   ├── context/               # Global state contexts
│   │   └── login/                 # Authentication & login screen
│   └── lib/                       # Database client (Prisma) & utility helpers
├── Dockerfile                     # Multi-stage optimized Docker build
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**, **yarn**, or **pnpm**
- **PostgreSQL Database**: Local PostgreSQL instance or cloud provider like [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or [Railway](https://railway.app/).

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/KasunBandara921/pos-system.git
cd pos-system
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# PostgreSQL Database Connection URL (Prisma)
DATABASE_URL="postgresql://username:password@localhost:5432/pos_db?sslmode=require"

# PayHere Gateway Credentials (Optional / Sandbox)
NEXT_PUBLIC_PAYHERE_MERCHANT_ID="your_merchant_id"
PAYHERE_MERCHANT_SECRET="your_merchant_secret"

# AI Advisor Configuration (Optional)
GEMINI_API_KEY="your_gemini_api_key"
HF_TOKEN="your_hugging_face_token"
```

### 3. Setup Database Schema

Push the Prisma schema to your PostgreSQL database:

```bash
npx prisma db push
```

*(Optional) Launch Prisma Studio to inspect and manage records visually:*
```bash
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

The project includes an optimized multi-stage `Dockerfile` with Next.js standalone output and automatic database schema migration on startup.

### Build the Docker Image
```bash
docker build -t pos-system:latest .
```

### Run the Container
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://username:password@host:5432/pos_db?sslmode=require" \
  -e NEXT_PUBLIC_PAYHERE_MERCHANT_ID="your_merchant_id" \
  -e PAYHERE_MERCHANT_SECRET="your_merchant_secret" \
  -e GEMINI_API_KEY="your_gemini_api_key" \
  pos-system:latest
```

The application will be accessible at `http://localhost:3000`.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts local Next.js development server on port 3000 |
| `npm run build` | Builds optimized production standalone application |
| `npm run start` | Runs the built Next.js production server |
| `npm run lint` | Runs ESLint checks across the codebase |
| `npx prisma db push` | Syncs Prisma schema with the PostgreSQL database |
| `npx prisma studio` | Opens local web GUI to view/edit database records |

---

## 🔒 Security & Best Practices
- **Manager Override Mechanism**: Sensitive actions such as voiding orders or applying high custom discounts require authorization prompts.
- **PIN Screen Protection**: Cashier workstations can be quickly locked to prevent unauthorized tampering.
- **Data Validation & Sanitization**: Strict TypeScript schemas and Server Actions protect data integrity.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
