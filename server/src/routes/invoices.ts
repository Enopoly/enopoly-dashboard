import { Router } from "express";
import { logger } from "../utils/logger";
import { InvoiceService } from "../services/invoice";
import { PdfService } from "../services/pdf";
import { EmailService } from "../services/email";
import { AppError, HttpStatus } from "../utils/errors";

const router = Router();

// GET /api/invoices - List all invoices
router.get("/", (_req, res, next) => {
  try {
    const invoices = InvoiceService.getAllInvoices();
    res.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/invoices/:id - Get invoice details
router.get("/:id", (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Invalid invoice ID");
    }

    const invoice = InvoiceService.getInvoiceById(id);
    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/invoices/:id/pdf - Download invoice PDF
router.get("/:id/pdf", (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Invalid invoice ID");
    }

    const invoice = InvoiceService.getInvoiceById(id);
    const doc = PdfService.generateInvoicePDF(invoice);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${invoice.invoice_number}.pdf`
    );

    doc.pipe(res);
    doc.end();
  } catch (error) {
    next(error);
  }
});

// POST /api/invoices - Create new invoice
router.post("/", (req, res, next) => {
  try {
    const { customer_email, customer_name, amount, description, currency } = req.body;

    if (!customer_email || !customer_name || !amount) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Missing required fields");
    }

    const invoice = InvoiceService.createInvoice({
      customer_email,
      customer_name,
      amount: parseFloat(amount),
      description,
      currency,
    });

    logger.info(`Created invoice ${invoice.invoice_number} for ${customer_email}`);

    // Generate Payment Link
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    const paymentLink = `${frontendUrl}/invoice/${invoice.id}`;

    // Send Email (Async)
    EmailService.sendInvoiceLink(
      customer_email,
      paymentLink,
      invoice.amount,
      customer_name,
      invoice.invoice_number
    );

    res.status(201).json({
      success: true,
      data: { ...invoice, paymentLink }, // Return link for immediate testing
      message: "Invoice created and sent successfully",
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/invoices/:id - Update invoice status (placeholder for now)
router.put("/:id", (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(id)) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Invalid invoice ID");
    }

    if (!status) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Status is required");
    }

    InvoiceService.updateStatus(id, status);
    const updatedInvoice = InvoiceService.getInvoiceById(id);

    res.json({
      success: true,
      data: updatedInvoice,
      message: "Invoice updated successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
