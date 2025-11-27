import { Router } from "express";
import { logger } from "../utils/logger";

const router = Router();

// Placeholder routes - will be implemented later

router.get("/", (_req, res) => {
  logger.info("GET /api/transactions - Not implemented yet");
  res.json({
    success: true,
    data: [],
    message: "Transaction endpoints coming soon",
  });
});

export default router;

