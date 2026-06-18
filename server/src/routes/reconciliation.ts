import { Router, Request, Response } from "express";
import { AuthorizeNetService } from "../services/authorizenet";
import { InvoiceService } from "../services/invoice";
import { logger } from "../utils/logger";
import { cache, CACHE_KEYS, TTL } from "../utils/cache";

const router = Router();
const authorizeNetService = new AuthorizeNetService();

/**
 * GET /api/reconciliation
 * Reconcile database invoices with Authorize.Net transactions
 * Query params: startDate (YYYY-MM-DD), endDate (YYYY-MM-DD)
 */
router.get("/", async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        // Default to last 30 days
        const end = endDate ? new Date(endDate as string) : new Date();
        const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Check cache before hitting DB + AuthNet
        const startStr = start.toISOString().split("T")[0];
        const endStr = end.toISOString().split("T")[0];
        const cacheKey = CACHE_KEYS.RECONCILIATION(startStr, endStr);

        const cached = cache.get<any>(cacheKey);
        if (cached) {
          res.set("Cache-Control", "private, max-age=600");
          res.set("X-Cache", "HIT");
          return res.json(cached);
        }

        logger.info(`Running reconciliation from ${start.toISOString()} to ${end.toISOString()}`);

        // Fetch data from both sources
        const [dbInvoices, authNetTransactions] = await Promise.all([
            InvoiceService.getAllInvoices(),
            authorizeNetService.getTransactionHistory(start, end)
        ]);

        // Filter DB invoices to date range and paid status
        const filteredInvoices = dbInvoices.filter(inv => {
            const invDate = new Date(inv.created_at);
            return invDate >= start && invDate <= end && inv.status === 'paid';
        });

        // Create lookup maps
        const authNetMap = new Map();
        authNetTransactions.forEach((txn: any) => {
            authNetMap.set(txn.transactionId, txn);
        });

        const dbMap = new Map();
        filteredInvoices.forEach(inv => {
            if (inv.authorizenet_transaction_id) {
                dbMap.set(inv.authorizenet_transaction_id, inv);
            }
        });

        // Categorize results
        const matched: any[] = [];
        const amountMismatches: any[] = [];
        const missingInAuthNet: any[] = [];

        // Check each DB invoice
        filteredInvoices.forEach(invoice => {
            if (!invoice.authorizenet_transaction_id) {
                // Invoice marked as paid but no transaction ID (shouldn't happen)
                return;
            }

            const authNetTxn = authNetMap.get(invoice.authorizenet_transaction_id);

            if (!authNetTxn) {
                // Invoice has transaction ID but not found in AuthNet
                missingInAuthNet.push({
                    invoiceNumber: invoice.invoice_number,
                    invoiceId: invoice.id,
                    dbAmount: invoice.amount,
                    transactionId: invoice.authorizenet_transaction_id,
                    customerName: invoice.customer_name,
                    date: invoice.created_at
                });
            } else {
                // Transaction found, check amount
                const dbAmount = parseFloat(invoice.amount.toString());
                const authNetAmount = parseFloat(authNetTxn.settleAmount);

                if (Math.abs(dbAmount - authNetAmount) < 0.01) {
                    // Perfect match
                    matched.push({
                        invoiceNumber: invoice.invoice_number,
                        invoiceId: invoice.id,
                        transactionId: invoice.authorizenet_transaction_id,
                        amount: dbAmount,
                        customerName: invoice.customer_name,
                        date: invoice.created_at,
                        authNetStatus: authNetTxn.transactionStatus
                    });
                } else {
                    // Amount mismatch
                    amountMismatches.push({
                        invoiceNumber: invoice.invoice_number,
                        invoiceId: invoice.id,
                        transactionId: invoice.authorizenet_transaction_id,
                        dbAmount: dbAmount,
                        authNetAmount: authNetAmount,
                        difference: authNetAmount - dbAmount,
                        customerName: invoice.customer_name,
                        date: invoice.created_at
                    });
                }
            }
        });

        // Find orphan transactions (in AuthNet but not in DB)
        const orphanTransactions: any[] = [];
        authNetTransactions.forEach((txn: any) => {
            if (!dbMap.has(txn.transactionId)) {
                orphanTransactions.push({
                    transactionId: txn.transactionId,
                    amount: txn.settleAmount,
                    customerName: `${txn.firstName} ${txn.lastName}`,
                    date: txn.submitTime,
                    status: txn.transactionStatus,
                    invoiceNumber: txn.invoiceNumber || null
                });
            }
        });

        // Calculate totals
        const dbTotal = filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount.toString()), 0);
        const authNetTotal = authNetTransactions
            .filter((txn: any) => txn.transactionStatus === 'settledSuccessfully')
            .reduce((sum: number, txn: any) => sum + txn.settleAmount, 0);

        const payload = {
            success: true,
            summary: {
                totalMatched: matched.length,
                totalDiscrepancies: amountMismatches.length + missingInAuthNet.length + orphanTransactions.length,
                dbTotal,
                authNetTotal,
                difference: authNetTotal - dbTotal
            },
            matched,
            amountMismatches,
            missingInAuthNet,
            orphanTransactions,
            startDate: start.toISOString(),
            endDate: end.toISOString()
        };

        cache.set(cacheKey, payload, TTL.RECONCILIATION);
        res.set("Cache-Control", "private, max-age=600");
        res.set("X-Cache", "MISS");
        return res.json(payload);
    } catch (error) {
        logger.error("Failed to run reconciliation:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to run reconciliation",
            error: (error as Error).message
        });
    }
});

export default router;
