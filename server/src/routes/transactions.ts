import { Router } from "express";
import { logger } from "../utils/logger";
import { getDatabase } from "../db/connection";
import { cache, CACHE_KEYS, TTL } from "../utils/cache";

const router = Router();

// GET /api/transactions - List all transactions
router.get("/", async (_req, res) => {
  try {
    // Serve from cache if available
    const cached = cache.get<any[]>(CACHE_KEYS.ALL_TRANSACTIONS);
    if (cached) {
      res.set("Cache-Control", "private, max-age=300");
      res.set("X-Cache", "HIT");
      return res.json({ success: true, data: cached, message: "Transactions retrieved successfully" });
    }

    const db = getDatabase();

    const transactions = await db.query<any>(`
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
        i.invoice_number,
        i.amount          AS invoice_amount,
        COALESCE(r.total_refunded, 0) AS total_refunded
      FROM transactions t
      LEFT JOIN invoices i ON t.invoice_id = i.id
      LEFT JOIN (
        SELECT invoice_id, SUM(amount) AS total_refunded
        FROM transactions
        WHERE type = 'refund' AND status = 'approved'
        GROUP BY invoice_id
      ) r ON r.invoice_id = t.invoice_id
      ORDER BY t.created_at DESC
    `);

    // Map to expected frontend format
    const formattedTransactions = transactions.map((t) => {
      const invoiceAmount = t.invoice_amount || 0;
      const totalRefunded = t.total_refunded || 0;
      const remainingBalance = Math.max(0, invoiceAmount - totalRefunded);

      return {
        id: (t.authorizenet_transaction_id && t.authorizenet_transaction_id !== '0')
          ? t.authorizenet_transaction_id
          : `TX-${t.id}`,
        invoiceId: t.invoice_id,
        invoiceAmount: invoiceAmount,
        refundedAmount: totalRefunded,
        remainingBalance: remainingBalance,
        status: t.status === 'approved' ? 'succeeded' : t.status, // Map 'approved' to 'succeeded' for UI badges
        amount: `$${t.amount.toFixed(2)}`,
        customer: t.customer_name || 'Unknown',
        date: new Date(t.created_at).toISOString().split('T')[0], // YYYY-MM-DD
        type: t.type
      };
    });

    cache.set(CACHE_KEYS.ALL_TRANSACTIONS, formattedTransactions, TTL.TRANSACTIONS);

    res.set("Cache-Control", "private, max-age=300");
    res.set("X-Cache", "MISS");
    return res.json({
      success: true,
      data: formattedTransactions,
      message: "Transactions retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
});

export default router;
