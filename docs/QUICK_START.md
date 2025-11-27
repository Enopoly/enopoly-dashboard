# Quick Start Checklist

## Pre-requisites
- [ ] Node.js 18+ installed
- [ ] Git repository initialized (or clone existing)
- [ ] Authorize.Net API credentials from client (sandbox keys to start)

## Setup Steps (Day 1)

### 1. Initialize Backend Server
```bash
# Create server directory
mkdir server
cd server

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express authorizenet better-sqlite3 dotenv cors pdfkit express-validator
npm install -D typescript @types/express @types/node @types/better-sqlite3 ts-node nodemon

# Initialize TypeScript
npx tsc --init
```

### 2. Setup Environment Variables
```bash
# In server/ directory
touch .env
touch .env.example

# Add to .env.example:
# PORT=3001
# AUTHORIZENET_API_LOGIN_ID=your_login_id
# AUTHORIZENET_TRANSACTION_KEY=your_transaction_key
# AUTHORIZENET_ENVIRONMENT=sandbox
# DATABASE_PATH=./database.sqlite
# NODE_ENV=development
```

### 3. Create Frontend .env
```bash
# In root directory
touch .env
touch .env.local

# Add to .env.local:
# VITE_API_URL=http://localhost:3001/api
```

### 5. Basic Server Structure
Create these files in `server/src/`:
- `index.ts` - Express server entry point
- `db/connection.ts` - Database setup
- `db/schema.sql` - Database tables
- `services/authorizenet.ts` - Authorize.Net service
- `routes/invoices.ts` - Invoice routes
- `routes/payments.ts` - Payment routes
- `routes/transactions.ts` - Transaction response routes

## Testing Setup

### Test Authorize.Net Connection
```bash
# In server directory
npm run dev
# Should start server on port 3001
```

### Test Frontend
```bash
# In root directory
npm run dev
# Should start on port 5173
```

### Test Authorize.Net Transactions
```bash
# Use Authorize.Net Sandbox environment
# Test transactions will be processed in sandbox
# Check Authorize.Net Sandbox dashboard for transaction logs
```

## Daily Progress Tracker

### Day 1-2: ✅ Backend Setup
- [ ] Server running
- [ ] Database tables created
- [ ] Authorize.Net SDK connected
- [ ] Payment endpoints working

### Day 3-4: ✅ Invoice System
- [ ] Invoice CRUD APIs
- [ ] PDF generation working
- [ ] Invoice numbers auto-generated

### Day 5: ✅ Transaction Responses
- [ ] Transaction response handling works
- [ ] Invoice status updates automatically

### Day 6-7: ✅ Customer Portal
- [ ] Invoice viewer page
- [ ] Payment form working
- [ ] Payment flow complete

### Day 8-9: ✅ Admin Dashboard
- [ ] Real data from API
- [ ] Invoice management
- [ ] Refund functionality

### Day 10: ✅ Testing & Deploy
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] Ready for client

## Common Issues & Solutions

### CORS Errors
- Make sure backend has CORS enabled
- Check VITE_API_URL matches backend port

### Authorize.Net Credentials Not Working
- Verify API Login ID and Transaction Key are correct in .env
- Check if using sandbox vs production environment
- Ensure Authorize.Net account is active

### Database Errors
- Check DATABASE_PATH in .env
- Ensure server/ directory has write permissions
- Run migration script if needed

### PDF Generation Fails
- Check PDFKit installation
- Verify file paths are correct
- Check server has write permissions

## Next Steps After Setup

1. Get Authorize.Net API credentials from client
2. Add credentials to server/.env
3. Start with Day 1 tasks in IMPLEMENTATION_PLAN.md
4. Test each feature as you build it
5. See AUTHORIZENET_NOTES.md for integration details

