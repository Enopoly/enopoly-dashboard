import { Router } from "express";
import { logger } from "../utils/logger";
import { AuthorizeNetService } from "../services/authorizenet";
import { getDatabase } from "../db/connection";
import { EmailService } from "../services/email";

const router = Router();
const paymentGateway = new AuthorizeNetService();

router.post("/charge", async (req, res) => {
  try {
    const { amount, cardData, invoiceId } = req.body;
    const db = getDatabase();

    if (!amount || !cardData || !invoiceId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: amount, cardData, or invoiceId",
      });
    }

    logger.info(`Processing payment for invoice ${invoiceId}`);

    // Fetch invoice to get customer email (Async)
    const invoice = await db.get<{ customer_email: string }>("SELECT customer_email FROM invoices WHERE id = ?", [invoiceId]);

    if (invoice && invoice.customer_email) {
      cardData.email = invoice.customer_email;
    }

    // Payment gateway is already async
    const result = await paymentGateway.charge(amount, cardData, invoiceId);

    if (result.success) {
      // Update invoice status and transaction ID (Async)
      await db.execute(
        "UPDATE invoices SET status = 'paid', authorizenet_transaction_id = ? WHERE id = ?",
        [result.transactionId, invoiceId]
      );

      // Log transaction (Async)
      await db.execute(`
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
      `, [
        invoiceId,
        result.transactionId || `TRANS-${Date.now()}`,
        amount,
        result.message || "Payment successful"
      ]);

      logger.info(`Payment successful for invoice ${invoiceId}. Transaction ID: ${result.transactionId}`);

      // Send Receipt Email (Async)
      if (invoice && invoice.customer_email) {
        EmailService.sendReceiptEmail(
          invoice.customer_email,
          amount,
          'Customer', // Ideally we fetch customer name too from invoice join
          `INV-${invoiceId}`, // Fallback if we don't have full object
          result.transactionId || "UNKNOWN" || "UNKNOWN"
        ).catch(err => logger.error("Failed to send receipt email", err));
      }

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
      // Update local DB
      const db = getDatabase();

      // Get invoice ID from transaction
      const tx = await db.get<{ invoice_id: number }>("SELECT invoice_id FROM transactions WHERE authorizenet_transaction_id = ?", [transactionId]);

      // Update transaction status
      await db.execute("UPDATE transactions SET status = 'refunded' WHERE authorizenet_transaction_id = ?", [transactionId]);

      // Update invoice status if found
      if (tx && tx.invoice_id) {
        await db.execute("UPDATE invoices SET status = 'refunded' WHERE id = ?", [tx.invoice_id]);
      }

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
