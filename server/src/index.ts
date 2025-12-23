import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { logger } from "./utils/logger";
import { formatErrorResponse, AppError, HttpStatus } from "./utils/errors";
import { getDatabase, runMigrations } from "./db/connection";

// Load environment variables
dotenv.config();

// Import routes
import invoicesRouter from "./routes/invoices";
import paymentsRouter from "./routes/payments";
import transactionsRouter from "./routes/transactions";
import authorizenetRouter from "./routes/authorizenet";
import reconciliationRouter from "./routes/reconciliation";

const app = express();
const PORT = process.env.PORT || 3002;

// CORS configuration - allow frontend origin
// CORS configuration - allow frontend origin
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173", // Common Vite port fallback
    "http://localhost:8081",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// API Routes
app.use("/api/invoices", invoicesRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/authorizenet", authorizenetRouter);
app.use("/api/reconciliation", reconciliationRouter);

// 404 handler
app.use((req: Request, _res: Response, next: NextFunction) => {
  const error = new AppError(HttpStatus.NOT_FOUND, `Route ${req.path} not found`);
  next(error);
});

// Error handling middleware
app.use((err: Error | AppError, req: Request, res: Response, _next: NextFunction) => {
  const errorResponse = formatErrorResponse(err);
  logger.error("Error handling request", {
    path: req.path,
    method: req.method,
    error: err.message,
  });
  res.status(errorResponse.error.statusCode).json(errorResponse);
});

// Initialize database and run migrations
(async () => {
  try {
    logger.info("Initializing database...");
    getDatabase(); // Initialize connection

    // Run migrations
    await runMigrations();

    logger.info("Database initialization complete");
  } catch (error) {
    logger.error("Failed to initialize database", error);
    process.exit(1);
  }
})();

// Export app for Vercel
export default app;

// Start server if not running in Vercel (local dev or standalone)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`);
    logger.info(`📍 Health check: http://localhost:${PORT}/api/health`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

// Graceful shutdown
if (process.env.NODE_ENV !== "production") {
  process.on("SIGTERM", () => {
    logger.info("SIGTERM signal received: closing HTTP server");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    logger.info("SIGINT signal received: closing HTTP server");
    process.exit(0);
  });
}

