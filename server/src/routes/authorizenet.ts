import { Router, Request, Response } from "express";
import { AuthorizeNetService } from "../services/authorizenet";
import { logger } from "../utils/logger";

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
