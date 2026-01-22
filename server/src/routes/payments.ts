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

    logger.info(`Processing payment for invoice ${invoiceId}. Amount from request: ${amount}`);

    const numericAmount = parseFloat(Number(amount).toFixed(2));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid Amount: Payment amount must be greater than 0."
      });
    }

    // Fetch invoice to get customer email (Async)
    const invoice = await db.get<{ customer_email: string; customer_name: string; invoice_number: string }>(
      "SELECT customer_email, customer_name, invoice_number FROM invoices WHERE id = ?",
      [invoiceId]
    );

    if (invoice && invoice.customer_email) {
      cardData.email = invoice.customer_email;
    }

    // Payment gateway is already async
    const result = await paymentGateway.charge(numericAmount, cardData, invoiceId);

    if (result.success) {
      let finalTransactionId = result.transactionId;

      // Check if we got a valid transaction ID (not 0 and not empty)
      if (!result.transactionId || result.transactionId === '0') {
        if (result.transactionId === '0') {
          // Allow Test Mode for testing purposes
          finalTransactionId = `TEST-TX-${Date.now()}`;
          logger.warn(`Payment Gateway in Test Mode (ID: 0). Using fallback ID: ${finalTransactionId}`);
        } else {
          // Real failure (no ID at all)
          logger.error(`Payment successful but Invalid Transaction ID returned: ${result.transactionId}`);
          return res.status(400).json({
            success: false,
            message: "Payment Gateway Error: No Transaction ID returned."
          });
        }
      }

      // Update invoice status and transaction ID (Async)
      await db.execute(
        "UPDATE invoices SET status = 'paid', authorizenet_transaction_id = ? WHERE id = ?",
        [finalTransactionId, invoiceId]
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
        finalTransactionId,
        amount,
        result.message || "Payment successful"
      ]);

      logger.info(`Payment successful for invoice ${invoiceId}. Transaction ID: ${finalTransactionId}`);

      // Send Receipt Email (Async)
      if (invoice && invoice.customer_email) {
        EmailService.sendReceiptEmail(
          invoice.customer_email,
          amount,
          invoice.customer_name || 'Customer',
          invoice.invoice_number || `INV-${invoiceId}`,
          result.transactionId || "UNKNOWN",
          Number(invoiceId)
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

      // Insert new refund transaction record
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
        VALUES (?, ?, ?, 'approved', 'refund', ?, datetime('now'))
      `, [
        tx?.invoice_id || null,
        result.transactionId, // The new refund transaction ID
        amount || 0, // The specific refunded amount
        result.message || "Refund successful"
      ]);

      // Calculate total refunded amount for this invoice to check if we should update invoice status
      if (tx && tx.invoice_id) {
        const refundStats = await db.get<{ total_refunded: number }>(`
          SELECT SUM(amount) as total_refunded 
          FROM transactions 
          WHERE invoice_id = ? AND type = 'refund' AND status = 'approved'
        `, [tx.invoice_id]);

        const invoice = await db.get<{ amount: number }>(`SELECT amount FROM invoices WHERE id = ?`, [tx.invoice_id]);

        // Only mark invoice as refunded if fully refunded
        if (invoice && (refundStats?.total_refunded || 0) >= invoice.amount) {
          await db.execute("UPDATE invoices SET status = 'refunded' WHERE id = ?", [tx.invoice_id]);
        }
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
