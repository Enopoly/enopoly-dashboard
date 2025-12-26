import { Router, Request, Response } from "express";
import { AuthorizeNetService } from "../services/authorizenet";
import { logger } from "../utils/logger";
import { getDatabase } from "../db/connection";

const router = Router();
const authorizeNetService = new AuthorizeNetService();

/**
 * GET /api/authorizenet/transactions
 * Fetch transaction history from Authorize.Net
 * Query params: startDate (YYYY-MM-DD), endDate (YYYY-MM-DD)
 */
router.get("/transactions", async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        // Default to last 30 days if no dates provided
        const end = endDate ? new Date(endDate as string) : new Date();
        const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        logger.info(`Fetching Authorize.Net transaction history from ${start.toISOString()} to ${end.toISOString()}`);

        const transactions = await authorizeNetService.getTransactionHistory(start, end);

        // Enhance transactions with local DB invoice numbers (PO Numbers)
        const db = getDatabase();

        // Extract IDs from invoiceNumber field (e.g. "INV-42" -> 42, or "42" -> 42)
        const invoiceIds = transactions
            .map(t => {
                const match = t.invoiceNumber?.match(/(\d+)/);
                return match ? parseInt(match[0]) : null;
            })
            .filter(id => id !== null);

        if (invoiceIds.length > 0) {
            // Fetch PO numbers for these IDs
            const placeholders = invoiceIds.map(() => '?').join(',');
            const invoices = await db.query<{ id: number, invoice_number: string }>(
                `SELECT id, invoice_number FROM invoices WHERE id IN (${placeholders})`,
                invoiceIds
            );

            // Create a map: ID -> PO Number
            const poMap = new Map(invoices.map(inv => [inv.id, inv.invoice_number]));

            // Update transactions with PO Numbers
            transactions.forEach(txn => {
                const match = txn.invoiceNumber?.match(/(\d+)/);
                if (match) {
                    const id = parseInt(match[0]);
                    const poNumber = poMap.get(id);
                    if (poNumber) {
                        txn.invoiceNumber = poNumber;
                    }
                }
            });
        }

        // Calculate total revenue
        const totalRevenue = transactions.reduce((sum, txn) => {
            // Only count settled transactions
            if (txn.transactionStatus === 'settledSuccessfully') {
                return sum + txn.settleAmount;
            }
            return sum;
        }, 0);

        res.json({
            success: true,
            transactions,
            totalRevenue,
            count: transactions.length,
            startDate: start.toISOString(),
            endDate: end.toISOString()
        });
    } catch (error) {
        logger.error("Failed to fetch transaction history:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch transaction history",
            error: (error as Error).message
        });
    }
});

export default router;
