import { Router } from "express";
import { logger } from "../utils/logger";
import { AuthorizeNetService } from "../services/authorizenet";
import { getDatabase } from "../db/connection";

const router = Router();
const paymentGateway = new AuthorizeNetService();
const db = getDatabase();

router.post("/charge", async (req, res) => {
  try {
    const { amount, cardData, invoiceId } = req.body;

    if (!amount || !cardData || !invoiceId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: amount, cardData, or invoiceId",
      });
    }

    logger.info(`Processing payment for invoice ${invoiceId}`);

    // Fetch invoice to get customer email
    const invoice = db.prepare("SELECT customer_email FROM invoices WHERE id = ?").get(invoiceId) as { customer_email: string };

    if (invoice && invoice.customer_email) {
      cardData.email = invoice.customer_email;
    }

    const result = await paymentGateway.charge(amount, cardData, invoiceId);

    if (result.success) {
      // Update invoice status (simple implementation - would normally be more robust)
      db.prepare("UPDATE invoices SET status = 'paid' WHERE id = ?").run(invoiceId);

      // Log transaction
      db.prepare(`
        INSERT INTO transactions (
          invoice_id, 
          authorizenet_transaction_id, 
          amount, 
          status, 
          type, 
          response_message,
          created_at
        )
        VALUES (?, ?, ?, 'approved', 'charge', ?, datetime('now'))
      `).run(
        invoiceId,
        result.transactionId || `TRANS-${Date.now()}`,
        amount,
        result.message || "Payment successful"
      );

      logger.info(`Payment successful for invoice ${invoiceId}. Transaction ID: ${result.transactionId}`);
      return res.json({
        success: true,
        data: result,
        message: "Payment successful",
      });
    } else {
      logger.error(`Payment failed for invoice ${invoiceId}: ${result.message}`);
      return res.status(400).json({
        success: false,
        data: result,
        message: result.message || "Payment failed",
      });
    }
  } catch (error) {
    logger.error("Error processing payment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during payment processing",
    });
  }
});

router.post("/refund/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { amount } = req.body; // Optional partial refund amount

    logger.info(`Processing refund for transaction ${transactionId}`);

    const result = await paymentGateway.refund(transactionId, amount);

    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: "Refund processed successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || "Refund failed",
      });
    }
  } catch (error) {
    logger.error("Error processing refund:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during refund",
    });
  }
});

router.post("/void/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;

    logger.info(`Processing void for transaction ${transactionId}`);

    const result = await paymentGateway.void(transactionId);

    if (result.success) {
      res.json({
        success: true,
        data: result,
        message: "Transaction voided successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || "Void failed",
      });
    }
  } catch (error) {
    logger.error("Error processing void:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during void",
    });
  }
});

export default router;

