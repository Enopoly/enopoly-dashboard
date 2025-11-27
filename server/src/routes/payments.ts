import { Router } from "express";
import { logger } from "../utils/logger";

const router = Router();

// Placeholder routes - will be implemented in Day 3-4

router.post("/charge", (_req, res) => {
  logger.info("POST /api/payments/charge - Not implemented yet");
  res.json({
    success: true,
    data: null,
    message: "Payment charge endpoint coming soon",
  });
});

router.post("/refund/:id", (req, res) => {
  logger.info(`POST /api/payments/refund/${req.params.id} - Not implemented yet`);
  res.json({
    success: true,
    data: null,
    message: "Refund endpoint coming soon",
  });
});

router.post("/void/:id", (req, res) => {
  logger.info(`POST /api/payments/void/${req.params.id} - Not implemented yet`);
  res.json({
    success: true,
    data: null,
    message: "Void endpoint coming soon",
  });
});

export default router;

