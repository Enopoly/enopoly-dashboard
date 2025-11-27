# Backend Testing & Setup Guide

## Prerequisites Setup

### 1. Environment Variables

The backend needs a `.env` file in the `server/` directory. Copy the example file:

```bash
cd server
cp .env.example .env
```

**Edit `server/.env`** and add your Authorize.Net credentials (when you get them from client):

```env
PORT=3001
AUTHORIZENET_API_LOGIN_ID=your_login_id_here
AUTHORIZENET_TRANSACTION_KEY=your_transaction_key_here
AUTHORIZENET_ENVIRONMENT=sandbox
DATABASE_PATH=./database.sqlite
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

**Note:** For now, you can use placeholder values. The server will start even without valid Authorize.Net credentials (it just won't process payments until Day 3-4).

### 2. Install Dependencies

If you haven't already, install all dependencies:

```bash
cd server
npm install
```

This will install:
- Express server
- Authorize.Net SDK
- SQLite database driver
- All other dependencies

---

## Starting the Backend Server

### Development Mode (with auto-reload)

```bash
cd server
npm run dev
```

This starts the server on **port 3001** with nodemon (auto-reloads on file changes).

### Production Mode

```bash
cd server
npm run build    # Compile TypeScript to JavaScript
npm start        # Run compiled JavaScript
```

---

## Testing the Backend

### 1. Health Check Endpoint

Once the server is running, test the health endpoint:

**Using curl:**
```bash
curl http://localhost:3001/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-11-26T...",
    "uptime": 123.45
  }
}
```

**Using browser:**
Open: `http://localhost:3001/api/health`

### 2. Test Placeholder Endpoints

#### Invoices
```bash
# List invoices (placeholder)
curl http://localhost:3001/api/invoices

# Get invoice by ID (placeholder)
curl http://localhost:3001/api/invoices/1
```

#### Payments
```bash
# Charge endpoint (placeholder)
curl -X POST http://localhost:3001/api/payments/charge \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Transactions
```bash
# List transactions (placeholder)
curl http://localhost:3001/api/transactions
```

### 3. Verify Database Setup

When the server starts, it should:
- Create `server/database.sqlite` file (if it doesn't exist)
- Run migrations to create all tables
- Log "Database initialization complete"

**Check database:**
```bash
cd server
sqlite3 database.sqlite

# In SQLite prompt:
.tables                    # Should show: invoices, transactions, payment_logs
.schema invoices           # View invoices table structure
.quit
```

---

## Complete Testing Checklist

### ✅ Pre-Startup Checks

- [ ] Dependencies installed (`npm install` completed)
- [ ] `.env` file exists in `server/` directory
- [ ] Port 3001 is not in use by another application

### ✅ Server Startup

- [ ] Server starts without errors
- [ ] Server logs show "Server is running on port 3001"
- [ ] Database initialization logs appear
- [ ] No TypeScript compilation errors

### ✅ Endpoint Testing

- [ ] Health check returns 200 OK
- [ ] Health check shows correct data structure
- [ ] Placeholder endpoints return expected responses
- [ ] 404 handler works (test non-existent route)

### ✅ Database Verification

- [ ] `database.sqlite` file created
- [ ] All 3 tables exist (invoices, transactions, payment_logs)
- [ ] Tables have correct schema

---

## Troubleshooting

### Port Already in Use

If you get "Port 3001 already in use":

```bash
# Find process using port 3001
lsof -ti:3001

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or change port in .env file
PORT=3002
```

### Database Connection Errors

If you see database errors:

1. Check `DATABASE_PATH` in `.env`
2. Ensure write permissions in `server/` directory
3. Delete `database.sqlite` and restart (it will recreate)

### TypeScript Compilation Errors

```bash
cd server
npm run build
```

Fix any TypeScript errors shown, then restart.

### Missing Dependencies

```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

---

## Testing with Postman or HTTP Client

### Collection Setup

Import this collection or create requests manually:

**Health Check:**
- Method: `GET`
- URL: `http://localhost:3001/api/health`

**Get Invoices:**
- Method: `GET`
- URL: `http://localhost:3001/api/invoices`

**Create Invoice (placeholder):**
- Method: `POST`
- URL: `http://localhost:3001/api/invoices`
- Headers: `Content-Type: application/json`
- Body: `{}`

---

## Expected Server Output

When you start the server with `npm run dev`, you should see:

```
[2024-11-26T...] [INFO] Initializing database...
[2024-11-26T...] [INFO] Connecting to database at: ./database.sqlite
[2024-11-26T...] [INFO] Database connection established successfully
[2024-11-26T...] [INFO] Running database migrations...
[2024-11-26T...] [INFO] Database migrations completed successfully
[2024-11-26T...] [INFO] Database initialization complete
🚀 Server is running on port 3001
📍 Health check: http://localhost:3001/api/health
🌍 Environment: development
```

---

## Next Steps After Testing

Once the server is running and tested:

1. ✅ **Day 1-2 Complete**: Backend foundation is ready
2. **Day 3-4**: Add Authorize.Net integration
3. **Day 5**: Implement invoice API endpoints

---

## Quick Start Commands

```bash
# Navigate to server directory
cd server

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# In another terminal, test health check
curl http://localhost:3001/api/health

# Check database
sqlite3 database.sqlite ".tables"
```

---

**That's it! The backend is ready to test. Once it's running, you can proceed with Authorize.Net integration.**

