# Waveflow Dashboard - Implementation Plan

## Project Overview

Build a payment and invoice management system with Authorize.Net integration, customer portal, and admin dashboard.

**Key Requirements:**

- Authorize.Net API integration (client will provide API credentials)
- Payment processing (charge, refund, void)
- Invoice generation & PDF export
- Customer portal (payment form + invoice viewer)
- Admin dashboard (invoice tracking, transaction history, refunds)
- Transaction response handling for payment updates
- Traceability/logging for all payment actions

## Current Status

✅ Frontend dashboard UI (React + TypeScript + Vite)
✅ UI components library (shadcn/ui)
✅ Mock data structure
❌ Backend API server
❌ Authorize.Net integration
❌ Invoice system
❌ Customer portal
❌ PDF generation

---

## Tech Stack Decision

### Backend (New - to be built)

- **Node.js + Express** - Simple, fast setup, works with Authorize.Net
- **TypeScript** - Type safety
- **Authorize.Net SDK** - Official Authorize.Net Node.js SDK
- **PostgreSQL or SQLite** - For invoices and transactions (SQLite for quick setup, PostgreSQL for production)
- **PDFKit or @react-pdf/renderer** - PDF generation
- **express-validator** - Input validation
- **dotenv** - Environment variables

### Frontend (Existing)

- React + TypeScript + Vite ✅
- shadcn/ui components ✅
- React Router ✅
- TanStack Query ✅

### Database Schema (Minimal but functional)

```sql
-- Invoices
- id, customer_email, customer_name, amount, currency, status, created_at, updated_at
- stripe_payment_intent_id, invoice_number, description

-- Transactions (linked to invoices)
- id, invoice_id, stripe_charge_id, amount, status, type (charge/refund/void)
- created_at, metadata (JSON for traceability)

-- Payment Logs (for traceability)
- id, invoice_id, action (charge/refund/void), status, details, timestamp
```

---

## Implementation Plan (10 Days - Practical Focus)

### **Day 1-2: Backend Setup & Stripe Integration**

#### Day 1 Tasks:

1. **Setup Backend Project Structure**

   - Create `server/` directory
   - Initialize Node.js project with Express + TypeScript
   - Setup basic Express server with CORS
   - Environment variables setup (.env.example)

2. **Database Setup**

   - Choose SQLite for quick start (or PostgreSQL if preferred)
   - Setup database connection (better-sqlite3 or pg)
   - Create migration script for initial tables
   - Basic database utility functions

3. **Authorize.Net Integration Foundation**
   - Install Authorize.Net SDK
   - Create Authorize.Net service wrapper
   - Environment variables for API Login ID and Transaction Key
   - Test Authorize.Net connection

**Deliverable:** Backend server running, database tables created, Authorize.Net SDK ready

#### Day 2 Tasks:

1. **Payment Processing API Endpoints**

   - `POST /api/payments/charge` - Create payment intent
   - `POST /api/payments/refund/:paymentIntentId` - Process refund
   - `POST /api/payments/void/:paymentIntentId` - Cancel payment
   - Basic error handling and validation

2. **Database Integration**
   - Save payment attempts to database
   - Link payments to invoices
   - Transaction logging

**Deliverable:** Working payment endpoints that integrate with Authorize.Net

---

### **Day 3-4: Invoice System**

#### Day 3 Tasks:

1. **Invoice API Endpoints**

   - `POST /api/invoices` - Create invoice
   - `GET /api/invoices` - List invoices (with filters)
   - `GET /api/invoices/:id` - Get invoice details
   - `PUT /api/invoices/:id` - Update invoice status

2. **Invoice-Payment Linking**
   - Associate invoices with payment intents
   - Update invoice status based on payment
   - Invoice status flow: pending → paid → refunded/voided

**Deliverable:** Invoice CRUD operations working

#### Day 4 Tasks:

1. **PDF Generation**

   - Install PDF library (PDFKit)
   - Create invoice PDF template
   - `GET /api/invoices/:id/pdf` - Generate PDF on-demand from database
   - Stream PDF directly to user (no file storage needed for MVP)
   - See `PDF_STORAGE_STRATEGY.md` for storage options

2. **Invoice Number Generation**
   - Auto-generate invoice numbers (INV-YYYY-0001 format)
   - Ensure uniqueness

**Deliverable:** Can generate PDF invoices via API

---

### **Day 5: Transaction Response Handler**

#### Tasks:

1. **Authorize.Net Transaction Response Handling**

   - Handle transaction responses from Authorize.Net API calls
   - Process payment success/failure responses
   - Handle refund responses
   - Verify transaction signatures (if using Silent POST or Webhooks)

2. **Transaction Processing**
   - Update invoice status based on transaction responses
   - Update transaction records
   - Log all transaction responses for debugging

**Deliverable:** Transaction responses updating invoice/transaction status automatically

---

### **Day 6-7: Customer Portal**

#### Day 6 Tasks:

1. **Customer Invoice Viewer Page**

   - Create `/invoice/:id` public route (no auth for MVP)
   - Display invoice details, status, amount
   - Show payment status and history
   - Download PDF button

2. **Payment Form Component**
   - Authorize.Net Accept.js or Hosted Payment Form integration
   - Card payment form
   - Link to invoice for payment

**Deliverable:** Customer can view invoice and see payment form

#### Day 7 Tasks:

1. **Payment Flow Integration**

   - Connect payment form to backend API
   - Handle payment success/failure
   - Redirect to success/failure pages
   - Update invoice status after payment

2. **Customer-Facing Features**
   - Payment history on invoice page
   - Receipt generation (PDF)
   - Mobile-responsive design

**Deliverable:** Complete customer payment flow working

---

### **Day 8-9: Admin Dashboard Enhancements**

#### Day 8 Tasks:

1. **Connect Frontend to Backend**

   - Replace mock data with API calls
   - Update DataContext to use real API
   - Setup API client utilities
   - Handle loading and error states

2. **Invoice Management Page**
   - List all invoices with filters
   - Search functionality
   - Invoice status indicators
   - View invoice details modal/page

**Deliverable:** Admin can see real invoices from database

#### Day 9 Tasks:

1. **Transaction History & Actions**

   - Display all transactions linked to invoices
   - Filter by status, date, customer
   - Refund button (with confirmation)
   - Void button for pending payments

2. **Traceability Features**
   - Payment action logs view
   - Show all actions (charge, refund, void) with timestamps
   - Action history per invoice
   - Export transaction logs (CSV)

**Deliverable:** Full admin functionality for managing invoices and payments

---

### **Day 10: Testing, Polish & Deployment**

#### Tasks:

1. **Testing**

   - Test payment flow end-to-end
   - Test refund/void operations
   - Test invoice PDF generation
   - Test transaction response handling
   - Manual security checks (API credentials in env, no hardcoded secrets)

2. **Frontend-Backend Integration**

   - Fix any remaining API integration issues
   - Error handling improvements
   - Loading states everywhere

3. **Deployment Prep**

   - Setup environment variables guide
   - Database migration scripts
   - Build scripts for production
   - Basic README with setup instructions

4. **Quick Polish**
   - Fix obvious bugs
   - Improve error messages
   - Basic responsive design checks

**Deliverable:** Working system ready for client testing

---

## File Structure (After Implementation)

```
waveflow-dashboard/
├── server/                    # NEW - Backend API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── invoices.ts
│   │   │   ├── payments.ts
│   │   │   └── webhooks.ts
│   │   ├── services/
│   │   │   ├── stripe.ts
│   │   │   ├── invoice.ts
│   │   │   └── pdf.ts
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   └── connection.ts
│   │   ├── utils/
│   │   │   └── logger.ts
│   │   └── index.ts          # Express server entry
│   ├── package.json
│   └── tsconfig.json
│
├── src/                       # EXISTING - Frontend
│   ├── pages/
│   │   ├── Dashboard.tsx     # UPDATE - Connect to API
│   │   ├── Transactions.tsx  # UPDATE - Connect to API
│   │   ├── InvoiceView.tsx   # NEW - Customer invoice view
│   │   └── InvoiceDetail.tsx # NEW - Admin invoice detail
│   ├── components/
│   │   └── PaymentForm.tsx   # NEW - Stripe payment form
│   └── lib/
│       └── api.ts            # UPDATE - Real API calls
│
├── .env.example              # NEW - Environment variables template
└── README.md                 # UPDATE - Setup instructions
```

---

## Key Dependencies to Install

### Backend (server/package.json)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "stripe": "^14.0.0",
    "better-sqlite3": "^9.2.0", // or "pg" for PostgreSQL
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "pdfkit": "^0.14.0",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2"
  }
}
```

### Frontend (package.json - additions)

```json
{
  "dependencies": {
    "@stripe/stripe-js": "^2.4.0",
    "@stripe/react-stripe-js": "^2.4.0"
  }
}
```

---

## Environment Variables Needed

```env
# Backend (.env)
PORT=3001
STRIPE_SECRET_KEY=sk_test_...  # Client will provide
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Client will provide
STRIPE_WEBHOOK_SECRET=whsec_...  # From Stripe dashboard
DATABASE_PATH=./database.sqlite  # or PostgreSQL connection string
NODE_ENV=development

# Frontend (.env)
VITE_API_URL=http://localhost:3001/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Same as backend publishable key
```

---

## Priority Levels (MVP vs Nice-to-Have)

### Must Have (Ship Fast):

- ✅ Basic payment processing (charge)
- ✅ Invoice creation and viewing
- ✅ PDF generation (basic template)
- ✅ Customer can pay invoice
- ✅ Admin can see invoices and transactions
- ✅ Basic refund functionality
- ✅ Webhook to update invoice status

### Can Add Later (If Time):

- ⏳ Authentication/authorization
- ⏳ Email notifications
- ⏳ Advanced filtering/search
- ⏳ Multiple payment methods
- ⏳ Recurring invoices
- ⏳ Customer portal login
- ⏳ Invoice templates customization

---

## Quick Start Commands (After Setup)

```bash
# Backend
cd server
npm install
npm run dev  # Runs on port 3001

# Frontend (root)
npm install
npm run dev  # Runs on port 5173

# Database (initial setup)
cd server
npm run migrate  # Creates database and tables
```

---

## Notes & Considerations

1. **Stripe API Keys**: Client will provide - use test keys initially, then switch to live
2. **Database**: Start with SQLite for speed, can migrate to PostgreSQL later
3. **Authentication**: Skip for MVP - add basic auth later if needed
4. **Error Handling**: Keep it simple but functional
5. **Security**: Never expose Stripe secret key, use environment variables
6. **Webhooks**: Use Stripe CLI for local testing (`stripe listen --forward-to localhost:3001/api/webhooks/stripe`)

---

## Success Criteria

✅ Admin can create invoices
✅ Customer can view invoice via link
✅ Customer can pay invoice with card
✅ Admin sees updated invoice status
✅ PDF can be generated and downloaded
✅ Admin can issue refunds
✅ Webhooks automatically update status

---

**Ready to start? Begin with Day 1 tasks!**
