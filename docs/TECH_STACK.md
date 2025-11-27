# Tech Stack - Waveflow Dashboard

## Frontend (Already Built ✅)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3 | UI framework for building user interfaces |
| **TypeScript** | 5.8 | Type safety and better developer experience |
| **Vite** | 5.4 | Fast build tool and development server |
| **Tailwind CSS** | 3.4 | Utility-first CSS framework for styling |
| **shadcn/ui** | Latest | High-quality React component library |
| **React Router** | 6.30 | Client-side routing and navigation |
| **TanStack Query** | 5.83 | Data fetching, caching, and state management |
| **Recharts** | 2.15 | Charts and data visualization |

### Frontend Key Dependencies
- Authorize.Net Accept.js (for payment forms) or Hosted Payment Form
- `react-hook-form` - Form handling and validation
- `zod` - Schema validation
- `date-fns` - Date manipulation utilities
- `lucide-react` - Icon library

---

## Backend (To Be Built 🔨)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime environment |
| **Express.js** | 4.18 | Web application framework |
| **TypeScript** | 5.3 | Type safety for backend code |
| **Authorize.Net SDK** | Latest | Authorize.Net Node.js SDK |
| **SQLite** | 3.x | Lightweight database (can upgrade to PostgreSQL) |
| **PDFKit** | 0.14 | PDF generation for invoices |

### Backend Key Dependencies
- `authorizenet` - Authorize.Net Node.js SDK
- `better-sqlite3` - SQLite database driver (or `pg` for PostgreSQL)
- `dotenv` - Environment variable management
- `cors` - Cross-Origin Resource Sharing middleware
- `express-validator` - Request validation middleware
- `ts-node` - TypeScript execution for Node.js
- `nodemon` - Development server auto-reload

---

## Infrastructure & Services

| Service | Purpose |
|---------|---------|
| **Authorize.Net** | Payment processing and gateway |
| **SQLite** | Development database |
| **PostgreSQL** | Production database (optional upgrade) |
| **Render.com** | Hosting platform (or preferred provider) |

---

## Development Tools

| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **npm / bun** | Package manager |
| **Authorize.Net Sandbox** | Test environment for payment processing |
| **VS Code** | Recommended IDE |

---

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│  (React + Vite) │
│   Port: 5173    │
└────────┬────────┘
         │
         │ HTTP API Calls
         │
┌────────▼────────┐
│   Backend API   │
│ (Node + Express)│
│   Port: 3001    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Auth.Net│ │ SQLite│
│  API   │ │  DB   │
└───────┘ └───────┘
```

---

## Key Features by Tech Stack

### Frontend Handles:
- ✅ Admin dashboard UI
- ✅ Customer invoice viewer
- ✅ Payment form (Authorize.Net Accept.js or Hosted Form)
- ✅ Invoice listing and filtering
- ✅ Transaction history display
- ✅ Real-time data updates

### Backend Handles:
- 🔨 Payment processing (Authorize.Net integration)
- 🔨 Invoice CRUD operations
- 🔨 PDF invoice generation
- 🔨 Database operations
- 🔨 Webhook handling
- 🔨 API endpoints for frontend

---

## Environment Requirements

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3001/api
```

### Backend (.env)
```env
PORT=3001
AUTHORIZENET_API_LOGIN_ID=your_login_id
AUTHORIZENET_TRANSACTION_KEY=your_transaction_key
AUTHORIZENET_ENVIRONMENT=sandbox  # or 'production'
DATABASE_PATH=./database.sqlite
NODE_ENV=development
```

---

## Why These Technologies?

### Frontend Choices:
- **React** - Industry standard, great ecosystem
- **Vite** - Lightning fast development and builds
- **TypeScript** - Catches errors early, better code quality
- **Tailwind + shadcn/ui** - Rapid UI development, beautiful components

### Backend Choices:
- **Node.js + Express** - Simple, fast, works well with Authorize.Net
- **TypeScript** - Type safety across full stack
- **SQLite** - Zero-config database, perfect for quick setup
- **Authorize.Net SDK** - Official SDK for payment processing

---

## Scalability Path

**Phase 1 (MVP):**
- SQLite for database
- Single server deployment
- Basic authentication (optional)

**Phase 2 (Production Ready):**
- PostgreSQL for production database
- Proper authentication system
- Email notifications
- Advanced features

---

**This tech stack prioritizes speed of development while maintaining code quality and scalability.**

