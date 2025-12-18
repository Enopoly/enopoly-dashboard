import { Router } from "express";
import { logger } from "../utils/logger";
import { getDatabase } from "../db/connection";

const router = Router();

// GET /api/transactions - List all transactions
router.get("/", (_req, res) => {
  try {
    const db = getDatabase();

    const transactions = db.prepare(`
      SELECT 
        t.id,
        t.authorizenet_transaction_id,
        t.invoice_id,
        t.status,
        t.amount,
        t.type,
        t.created_at,
        i.customer_name,
        i.customer_email,
        i.invoice_number
      FROM transactions t
      LEFT JOIN invoices i ON t.invoice_id = i.id
      ORDER BY t.created_at DESC
    `).all();

    // Map to expected frontend format
    const formattedTransactions = transactions.map((t: any) => ({
      id: (t.authorizenet_transaction_id && t.authorizenet_transaction_id !== '0')
        ? t.authorizenet_transaction_id
        : `TX-${t.id}`,
      invoiceId: t.invoice_id,
      status: t.status === 'approved' ? 'succeeded' : t.status, // Map 'approved' to 'succeeded' for UI badges
      amount: `$${t.amount.toFixed(2)}`,
      customer: t.customer_name || 'Unknown',
      date: new Date(t.created_at).toISOString().split('T')[0], // YYYY-MM-DD
      type: t.type
    }));

    res.json({
      success: true,
      data: formattedTransactions,
      message: "Transactions retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
});

export default router;
