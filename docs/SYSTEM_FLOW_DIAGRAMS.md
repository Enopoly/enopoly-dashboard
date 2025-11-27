# System Flow Diagrams

## 1. Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT DEVICE                            │
│                    (Browser - Customer/Admin)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    FRONTEND (React + Vite)                       │
│                    http://localhost:8080                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Customer Portal          │  Admin Dashboard            │  │
│  │  - View Invoice           │  - Manage Invoices         │  │
│  │  - Make Payment           │  - View Transactions       │  │
│  │  - Download PDF           │  - Process Refunds         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ API Calls (REST)
                             │ http://localhost:3001/api
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                   BACKEND API (Node.js + Express)                │
│                    http://localhost:3001                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Routes:                                              │  │
│  │  /api/invoices  │  /api/payments  │  /api/transactions  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────┬───────────────────────────────────────────────┬────┘
             │                                                │
             │                                                │
┌────────────▼────────────┐                    ┌─────────────▼──────────┐
│   SQLite DATABASE       │                    │   AUTHORIZE.NET API    │
│                         │                    │                        │
│  ┌──────────────────┐  │                    │  - Process Payments    │
│  │  invoices        │  │                    │  - Refunds             │
│  │  transactions    │  │                    │  - Transaction Status  │
│  │  payment_logs    │  │                    │                        │
│  └──────────────────┘  │                    └────────────────────────┘
└─────────────────────────┘
```

---

## 2. Invoice Creation & Payment Flow (Customer Journey)

```
STEP 1: ADMIN CREATES INVOICE
┌─────────────┐
│ Admin Panel │
└──────┬──────┘
       │
       │ POST /api/invoices
       │ { customer_email, amount, etc. }
       │
       ▼
┌──────────────────┐
│ Backend API      │
│ Creates Invoice  │
│ Status: pending  │
└──────┬───────────┘
       │
       │ Save to DB
       │
       ▼
┌──────────────────┐
│ Database         │
│ invoices table   │
│ Invoice #123     │
│ Status: pending  │
└──────────────────┘
       │
       │
       │ Admin sends invoice link to customer
       │


STEP 2: CUSTOMER VIEWS INVOICE
┌──────────────┐
│   Customer   │
│ Opens Link   │
│ /invoice/123 │
└──────┬───────┘
       │
       │ GET /api/invoices/123
       │
       ▼
┌──────────────────┐
│ Frontend         │
│ Invoice Viewer   │
│ Shows:           │
│ - Amount         │
│ - Status         │
│ - Payment Form   │
└──────┬───────────┘
       │
       │ Customer enters payment details
       │


STEP 3: CUSTOMER MAKES PAYMENT
┌──────────────┐
│   Customer   │
│ Fills Form   │
│ Clicks Pay   │
└──────┬───────┘
       │
       │ POST /api/payments/charge
       │ { invoice_id, payment_data }
       │
       ▼
┌──────────────────┐
│ Backend API      │
│ Processes Payment│
└──────┬───────────┘
       │
       │ Calls Authorize.Net API
       │
       ▼
┌──────────────────┐
│ Authorize.Net    │
│ Validates Card   │
│ Charges Amount   │
└──────┬───────────┘
       │
       │ Response (success/failure)
       │
       ▼
┌──────────────────┐
│ Backend API      │
│ Updates Invoice  │
│ Status: paid     │
│ Saves Transaction│
└──────┬───────────┘
       │
       │ Save to DB
       │
       ▼
┌──────────────────┐
│ Database         │
│ invoices.status  │
│ = "paid"         │
│ transactions     │
│ (new record)     │
└──────────────────┘
       │
       │
       ▼
┌──────────────────┐
│ Frontend         │
│ Success Page     │
│ Shows Receipt    │
│ Download PDF     │
└──────────────────┘
```

---

## 3. Admin Dashboard Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                            │
│                  http://localhost:8080                        │
└──────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Dashboard  │   │  Invoices    │   │ Transactions │
│  Overview    │   │  Management  │   │   History    │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       │                  │                  │
       │ GET /api/invoices?status=paid
       │ GET /api/transactions?filter=...
       │
       ▼
┌──────────────────────────────────┐
│         BACKEND API              │
│                                  │
│  - Fetch invoices from DB        │
│  - Calculate statistics          │
│  - Return filtered data          │
└──────────────┬───────────────────┘
               │
               │ Query Database
               │
               ▼
┌──────────────────────────────────┐
│         SQLite DATABASE          │
│                                  │
│  invoices    │  transactions     │
│  payment_logs                    │
└──────────────────────────────────┘

ADMIN ACTIONS:
1. Create Invoice → POST /api/invoices
2. View Invoice List → GET /api/invoices
3. View Invoice Detail → GET /api/invoices/:id
4. Issue Refund → POST /api/payments/refund/:id
5. View Transaction Logs → GET /api/transactions
6. Download Invoice PDF → GET /api/invoices/:id/pdf
```

---

## 4. Payment Processing Flow (Detailed)

```
┌──────────────────────────────────────────────────────────────┐
│                    PAYMENT PROCESSING                         │
└──────────────────────────────────────────────────────────────┘

CUSTOMER INITIATES PAYMENT
        │
        ▼
┌──────────────────────┐
│  Payment Form        │
│  (Frontend)          │
│  - Card Number       │
│  - Expiry            │
│  - CVV               │
└──────────┬───────────┘
           │
           │ User submits
           │
           ▼
┌──────────────────────┐
│  Frontend sends      │
│  POST /api/payments/ │
│  charge              │
│  {                   │
│    invoice_id: 123,  │
│    amount: 100.00,   │
│    card_data: {...}  │
│  }                   │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│  BACKEND: Payment Route Handler             │
│  /api/payments/charge                       │
└──────────┬──────────────────────────────────┘
           │
           │ Validate request
           │ Check invoice exists
           │ Verify amount matches
           │
           ▼
┌─────────────────────────────────────────────┐
│  Authorize.Net Service                      │
│  Create Transaction Request                 │
└──────────┬──────────────────────────────────┘
           │
           │ Prepare Authorize.Net API call
           │
           ▼
┌─────────────────────────────────────────────┐
│  Authorize.Net API                          │
│  (External Service)                         │
│                                             │
│  Process Payment                            │
│  - Validate card                            │
│  - Charge amount                            │
│  - Return transaction ID                    │
└──────────┬──────────────────────────────────┘
           │
           │ Response:
           │ { transactionId, status, code }
           │
           ▼
┌─────────────────────────────────────────────┐
│  BACKEND: Process Response                  │
│                                             │
│  IF SUCCESS:                                │
│  - Update invoice status → "paid"           │
│  - Save transaction record                  │
│  - Create payment log                       │
│                                             │
│  IF FAILED:                                 │
│  - Save failed transaction                  │
│  - Log error details                        │
└──────────┬──────────────────────────────────┘
           │
           │ Save to Database
           │
           ▼
┌─────────────────────────────────────────────┐
│  DATABASE UPDATES                           │
│                                             │
│  invoices:                                  │
│    status = "paid"                          │
│    authorizenet_transaction_id = "..."      │
│                                             │
│  transactions: (new record)                 │
│    invoice_id = 123                         │
│    status = "approved"                      │
│    type = "charge"                          │
│                                             │
│  payment_logs: (new record)                 │
│    action = "charge"                        │
│    status = "approved"                      │
└──────────┬──────────────────────────────────┘
           │
           │ Return response to frontend
           │
           ▼
┌─────────────────────────────────────────────┐
│  FRONTEND: Display Result                   │
│                                             │
│  IF SUCCESS:                                │
│  - Show success message                     │
│  - Display receipt                          │
│  - Offer PDF download                       │
│                                             │
│  IF FAILED:                                 │
│  - Show error message                       │
│  - Allow retry                              │
└─────────────────────────────────────────────┘
```

---

## 5. Refund Processing Flow

```
ADMIN INITIATES REFUND
        │
        ▼
┌──────────────────────┐
│  Admin Dashboard     │
│  Clicks "Refund"     │
│  on Transaction      │
└──────────┬───────────┘
           │
           │ POST /api/payments/refund/:transactionId
           │
           ▼
┌──────────────────────┐
│  Backend API         │
│  Validates:          │
│  - Transaction exists│
│  - Can be refunded   │
│  - Amount verified   │
└──────────┬───────────┘
           │
           │ Call Authorize.Net Refund API
           │
           ▼
┌──────────────────────┐
│  Authorize.Net API   │
│  Process Refund      │
│  Returns refund ID   │
└──────────┬───────────┘
           │
           │ Response received
           │
           ▼
┌──────────────────────┐
│  Backend Updates     │
│  - Invoice status →  │
│    "refunded"        │
│  - Save refund       │
│    transaction       │
│  - Create payment    │
│    log entry         │
└──────────┬───────────┘
           │
           │ Save to Database
           │
           ▼
┌──────────────────────┐
│  Database            │
│  invoices.status =   │
│  "refunded"          │
│                      │
│  transactions:       │
│  (new refund record) │
│                      │
│  payment_logs:       │
│  (new refund log)    │
└──────────────────────┘
```

---

## 6. Invoice PDF Generation Flow

```
USER REQUESTS PDF
        │
        │ GET /api/invoices/:id/pdf
        │
        ▼
┌──────────────────────┐
│  Backend API         │
│  /api/invoices/:id/  │
│  pdf                 │
└──────────┬───────────┘
           │
           │ Fetch invoice data from DB
           │
           ▼
┌──────────────────────┐
│  Database            │
│  Get invoice +       │
│  related data        │
└──────────┬───────────┘
           │
           │ Data retrieved
           │
           ▼
┌──────────────────────┐
│  PDF Service         │
│  Generate PDF        │
│  - Invoice header    │
│  - Customer info     │
│  - Line items        │
│  - Totals            │
│  - Footer            │
└──────────┬───────────┘
           │
           │ PDF generated (on-demand)
           │
           ▼
┌──────────────────────┐
│  Backend streams     │
│  PDF to response     │
│  Content-Type:       │
│  application/pdf     │
└──────────┬───────────┘
           │
           │ PDF file streamed
           │
           ▼
┌──────────────────────┐
│  Browser             │
│  Downloads PDF       │
│  invoice-123.pdf     │
└──────────────────────┘
```

---

## 7. Webhook/Transaction Response Flow (Authorize.Net)

```
AUTHORIZE.NET PROCESSES PAYMENT
        │
        │ (Async notification)
        │
        ▼
┌──────────────────────┐
│  Authorize.Net       │
│  Sends Transaction   │
│  Response            │
└──────────┬───────────┘
           │
           │ Response contains:
           │ - Transaction ID
           │ - Status
           │ - Response code
           │
           ▼
┌──────────────────────┐
│  Backend API         │
│  Receives Response   │
│  (Synchronous)       │
│                      │
│  OR                  │
│                      │
│  Webhook Handler     │
│  (if async webhooks) │
└──────────┬───────────┘
           │
           │ Update invoice status
           │ based on response
           │
           ▼
┌──────────────────────┐
│  Database Updated    │
│  - Invoice status    │
│  - Transaction saved │
│  - Logs created      │
└──────────────────────┘
```

---

## 8. Complete User Journey Map

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPLETE USER JOURNEY                     │
└─────────────────────────────────────────────────────────────┘

ADMIN WORKFLOW:
1. Login to Admin Dashboard
   │
   ▼
2. Create Invoice
   - Enter customer details
   - Set amount
   - Add description
   │
   ▼
3. Invoice Created
   - Invoice number generated
   - Status: "pending"
   │
   ▼
4. Send Invoice Link to Customer
   (Email, SMS, etc.)
   │
   ▼
5. Monitor Invoice Status
   - View in dashboard
   - See payment updates
   │
   ▼
6. Process Refund (if needed)
   - Find transaction
   - Click refund
   - Confirm amount
   │
   ▼
7. View Reports
   - Transaction history
   - Payment logs
   - Export data

──────────────────────────────────────────────────────────────

CUSTOMER WORKFLOW:
1. Receive Invoice Link
   (Email, SMS, etc.)
   │
   ▼
2. Click Link
   Opens: /invoice/:id
   │
   ▼
3. View Invoice Details
   - See amount due
   - View invoice number
   - Check status
   │
   ▼
4. Enter Payment Information
   - Card number
   - Expiry date
   - CVV
   - Name on card
   │
   ▼
5. Submit Payment
   │
   ▼
6. Payment Processing
   - Validating card
   - Processing payment
   │
   ├──► SUCCESS
   │    │
   │    ▼
   │    View Success Page
   │    - Payment confirmed
   │    - Receipt shown
   │    - Download PDF option
   │
   └──► FAILURE
        │
        ▼
        View Error Page
        - Error message
        - Try again option
        - Contact support
```

---

## 9. Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      DATA FLOW                                │
└──────────────────────────────────────────────────────────────┘

CREATE INVOICE:
Frontend → Backend API → Database
{email, name, amount} → Validate → Save → Return invoice_id


PROCESS PAYMENT:
Frontend → Backend → Authorize.Net → Backend → Database
{card_data} → Validate → Process → Response → Update invoice


VIEW INVOICES:
Frontend → Backend API → Database → Backend → Frontend
Request → Query → Fetch Data → Format → Display


GENERATE PDF:
Frontend → Backend API → Database → PDF Service → Frontend
Request → Fetch → Generate → Stream → Download


ISSUE REFUND:
Frontend → Backend API → Authorize.Net → Backend → Database
{refund_request} → Validate → Process → Response → Update
```

---

## 10. System Components Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                  SYSTEM COMPONENTS                           │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   FRONTEND   │◄───────►│   BACKEND    │◄───────►│  DATABASE    │
│              │  HTTP   │              │  SQL    │              │
│ React + Vite │         │ Express API  │         │ SQLite       │
│              │         │              │         │              │
│ Components:  │         │ Routes:      │         │ Tables:      │
│ - Invoice UI │         │ - /invoices  │         │ - invoices   │
│ - Payment    │         │ - /payments  │         │ - trans...   │
│ - Dashboard  │         │ - /trans...  │         │ - logs       │
└──────────────┘         └──────┬───────┘         └──────────────┘
                                 │
                                 │ HTTPS API Calls
                                 │
                        ┌────────▼────────┐
                        │ AUTHORIZE.NET   │
                        │                 │
                        │ Payment Gateway │
                        │                 │
                        │ - Charge        │
                        │ - Refund        │
                        │ - Void          │
                        └─────────────────┘
```

---

These diagrams show how all components interact and work together in the system!
