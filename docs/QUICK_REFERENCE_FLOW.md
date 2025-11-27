# Quick Reference - System Flow

## 🎯 Simple Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPLETE SYSTEM FLOW                      │
└─────────────────────────────────────────────────────────────┘

ADMIN CREATES INVOICE
        │
        ▼
┌──────────────────┐
│ Invoice Created  │
│ Status: pending  │
│ Link Generated   │
└────────┬─────────┘
         │
         │ Admin sends link to customer
         │
         ▼
┌──────────────────┐
│ Customer opens   │
│ invoice link     │
└────────┬─────────┘
         │
         │ Views invoice & payment form
         │
         ▼
┌──────────────────┐
│ Customer enters  │
│ payment details  │
│ & submits        │
└────────┬─────────┘
         │
         │ Payment sent to backend
         │
         ▼
┌──────────────────┐
│ Backend calls    │
│ Authorize.Net    │
│ API              │
└────────┬─────────┘
         │
         │ Payment processed
         │
         ▼
┌──────────────────┐
│ Invoice status   │
│ updated to:      │
│ "paid"           │
└────────┬─────────┘
         │
         │ Customer sees success
         │ Admin sees update in dashboard
         │
         ▼
┌──────────────────┐
│ Transaction      │
│ logged in DB     │
│ PDF available    │
└──────────────────┘
```

---

## 📋 What Client Needs - One Page Summary

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT REQUIREMENTS                        │
└─────────────────────────────────────────────────────────────┘

MUST HAVE (Start Development):
┌──────────────────────────────────────────────────────────────┐
│ 1. Authorize.Net Sandbox Credentials                         │
│    • API Login ID                                            │
│    • Transaction Key                                         │
│    • Get from: Authorize.Net Dashboard → API Credentials     │
└──────────────────────────────────────────────────────────────┘

NEED FOR INVOICES:
┌──────────────────────────────────────────────────────────────┐
│ 2. Business Information                                      │
│    • Company Name                                            │
│    • Company Email                                           │
│    • Company Address                                         │
│    • Logo (optional for now)                                 │
└──────────────────────────────────────────────────────────────┘

QUICK QUESTIONS:
┌──────────────────────────────────────────────────────────────┐
│ 3. Preferences                                               │
│    • Currency: ?                                             │
│    • Invoice format: Auto or Custom?                         │
└──────────────────────────────────────────────────────────────┘

LATER (Before Production):
┌──────────────────────────────────────────────────────────────┐
│ 4. Production Credentials                                    │
│    • Production API Login ID                                 │
│    • Production Transaction Key                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Payment Processing - Simple View

```
CUSTOMER PAYS → BACKEND → AUTHORIZE.NET → BACKEND → DATABASE
                      ↓                              ↓
                 Processes                    Updates Invoice
                      ↓                              ↓
                 Returns Result          Status: "paid"
                      ↓                              ↓
                 Frontend Shows          Transaction Saved
                 Success/Error
```

---

## 🎯 Three Main Flows

### 1. Invoice Creation Flow
```
Admin → Create Invoice → Save to DB → Generate Link → Send to Customer
```

### 2. Payment Flow
```
Customer → View Invoice → Enter Payment → Submit → Process → Success
```

### 3. Refund Flow
```
Admin → Find Transaction → Click Refund → Confirm → Process → Updated
```

---

## 📊 Data Flow - Where Things Go

```
INVOICE DATA:
Frontend Form → Backend API → SQLite Database (invoices table)


PAYMENT DATA:
Payment Form → Backend API → Authorize.Net → Response → Database
                                                           ↓
                                                    Update Invoice
                                                    Save Transaction


PDF GENERATION:
Request → Backend → Database (fetch invoice) → Generate PDF → Stream to User
```

---

## 🎨 Visual Component Map

```
┌─────────────────────────────────────────────────────────────┐
│                    WHAT'S WHERE                              │
└─────────────────────────────────────────────────────────────┘

FRONTEND (http://localhost:8080):
├── Admin Dashboard    → View/manage invoices
├── Invoice List       → See all invoices
├── Transaction View   → Payment history
└── Customer Portal    → Invoice viewer + payment

BACKEND (http://localhost:3001):
├── /api/health        → Server status check
├── /api/invoices      → Invoice CRUD operations
├── /api/payments      → Payment processing
└── /api/transactions  → Transaction history

DATABASE (database.sqlite):
├── invoices           → All invoice records
├── transactions       → All payment transactions
└── payment_logs       → Action history/logs

EXTERNAL:
└── Authorize.Net API  → Payment processing gateway
```

---

## 🔑 Key Points for Client

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT CHECKLIST                          │
└─────────────────────────────────────────────────────────────┘

TO GET STARTED:
  ✓ Provide Authorize.Net credentials (sandbox)
  ✓ Provide business information
  ✓ Answer currency preference

WHAT CLIENT GETS:
  ✓ Admin dashboard to manage invoices
  ✓ Payment processing system
  ✓ Customer portal for payments
  ✓ PDF invoice generation
  ✓ Transaction tracking & reporting
  ✓ Refund processing

HOW IT WORKS:
  1. Client creates invoice in admin panel
  2. System generates unique invoice link
  3. Client sends link to customer
  4. Customer views invoice and pays
  5. Payment processed via Authorize.Net
  6. Invoice status updates automatically
  7. Client sees payment in dashboard
```

---

These diagrams provide a clear, visual understanding of how everything works!

