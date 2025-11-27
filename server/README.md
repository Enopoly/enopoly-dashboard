# Backend Server - Quick Start

## Setup (One-Time)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - The `.env` file should already exist (created from `.env.example`)
   - Update `AUTHORIZENET_API_LOGIN_ID` and `AUTHORIZENET_TRANSACTION_KEY` when you receive them from client
   - For now, placeholder values work for testing the server structure

## Running the Server

### Development Mode (Recommended)
```bash
npm run dev
```

This starts the server on port 3001 with auto-reload on file changes.

### Production Mode
```bash
npm run build  # Compile TypeScript
npm start      # Run compiled code
```

## Testing

### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

Or open in browser: http://localhost:3001/api/health

### 2. Test Endpoints

**Get Invoices (placeholder):**
```bash
curl http://localhost:3001/api/invoices
```

**Test Payments (placeholder):**
```bash
curl -X POST http://localhost:3001/api/payments/charge \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 3. Verify Database

When server starts, it automatically:
- Creates `database.sqlite` file
- Creates all tables (invoices, transactions, payment_logs)

Check database:
```bash
sqlite3 database.sqlite ".tables"
```

## Expected Output

When server starts successfully, you should see:
```
[INFO] Initializing database...
[INFO] Database connection established successfully
[INFO] Running database migrations...
[INFO] Database migrations completed successfully
[INFO] Database initialization complete
🚀 Server is running on port 3001
📍 Health check: http://localhost:3001/api/health
🌍 Environment: development
```

## Troubleshooting

**Port already in use?**
- Change `PORT=3001` to another port in `.env`
- Or kill the process using port 3001: `lsof -ti:3001 | xargs kill -9`

**Database errors?**
- Check write permissions in `server/` directory
- Delete `database.sqlite` and restart (will recreate automatically)

**Dependencies missing?**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Available Scripts

- `npm run dev` - Start development server (with auto-reload)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server (after build)
- `npm run migrate` - Run database migrations manually

## API Endpoints

### Current (Placeholder)
- `GET /api/health` - Health check ✅
- `GET /api/invoices` - List invoices (coming soon)
- `GET /api/invoices/:id` - Get invoice (coming soon)
- `POST /api/payments/charge` - Process payment (coming soon)

See `docs/BACKEND_TESTING_GUIDE.md` for detailed testing instructions.

