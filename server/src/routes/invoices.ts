import { Router } from "express";
import { logger } from "../utils/logger";

const router = Router();

// Placeholder routes - will be implemented in Day 5

router.get("/", (_req, res) => {
  logger.info("GET /api/invoices - Not implemented yet");
  res.json({
    success: true,
    data: [],
    message: "Invoice endpoints coming soon",
  });
});

router.get("/:id", (req, res) => {
  logger.info(`GET /api/invoices/${req.params.id} - Not implemented yet`);
  res.json({
    success: true,
    data: null,
    message: "Invoice detail endpoint coming soon",
  });
});

router.post("/", (_req, res) => {
  logger.info("POST /api/invoices - Not implemented yet");
  res.json({
    success: true,
    data: null,
    message: "Create invoice endpoint coming soon",
  });
});

router.put("/:id", (req, res) => {
  logger.info(`PUT /api/invoices/${req.params.id} - Not implemented yet`);
  // Use req for params
  res.json({
    success: true,
    data: null,
    message: "Update invoice endpoint coming soon",
  });
});

export default router;

