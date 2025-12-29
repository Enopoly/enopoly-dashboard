import { Router } from "express";
import { logger } from "../utils/logger";
import { InvoiceService } from "../services/invoice";
import { PdfService } from "../services/pdf";
import { EmailService } from "../services/email";
import { AppError, HttpStatus } from "../utils/errors";

const router = Router();

// GET /api/invoices - List all invoices
router.get("/", async (_req, res, next) => {
  try {
    const invoices = await InvoiceService.getAllInvoices();
    res.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/invoices/:id - Get invoice details
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Invalid invoice ID");
    }

    const invoice = await InvoiceService.getInvoiceById(id);
    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/invoices/:id/pdf - Download invoice PDF
router.get("/:id/pdf", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Invalid invoice ID");
    }

    const invoice = await InvoiceService.getInvoiceById(id);
    // PDF generation likely remains sync for now as it's CPU bound, not I/O bound
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
router.post("/", async (req, res, next) => {
  try {
    const { customer_email, customer_name, customer_address, amount, description, currency, items, processing_fee, send_email = true } = req.body;

    if (!customer_email || !customer_name || !amount) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Missing required fields");
    }

    const invoice = await InvoiceService.createInvoice({
      customer_email,
      customer_name,
      customer_address,
      amount: parseFloat(amount),
      processing_fee: processing_fee ? parseFloat(processing_fee) : 0,
      description,
      currency,
      items,
    });

    logger.info(`Created invoice ${invoice.invoice_number} for ${customer_email}`);

    // Generate Payment Link
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    const paymentLink = `${frontendUrl}/invoice/${invoice.id}`;

    // Send Email (Async - don't await to return fast)
    if (send_email) {
      EmailService.sendInvoiceLink(
        customer_email,
        paymentLink,
        invoice.amount,
        customer_name,
        invoice.invoice_number
      ).catch(err => logger.error("Failed to send background email", err));
    }

    res.status(201).json({
      success: true,
      data: { ...invoice, paymentLink }, // Return link for immediate testing
      message: send_email ? "Invoice created and sent successfully" : "Invoice created successfully (Email skipped)",
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/invoices/:id - Update invoice status (placeholder for now)
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { customer_email, customer_name, customer_address, amount, description, currency, items, processing_fee, status, send_email } = req.body;

    if (isNaN(id)) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Invalid invoice ID");
    }

    // If only status is provided, use the status update method (legacy support or quick status flip)
    // But if other fields are present, do a full update
    if (status && !amount && !customer_email) {
      await InvoiceService.updateStatus(id, status);
    } else {
      // Full update
      logger.info(`Updating invoice ${id} with payload:`, JSON.stringify(req.body));

      if (!customer_email || !customer_name || !amount) {
        logger.error(`Update failed: Missing fields. Email: ${customer_email}, Name: ${customer_name}, Amount: ${amount}`);
        throw new AppError(HttpStatus.BAD_REQUEST, "Missing required fields for update");
      }

      await InvoiceService.updateInvoice(id, {
        customer_email,
        customer_name,
        customer_address,
        amount: parseFloat(amount),
        processing_fee: processing_fee ? parseFloat(processing_fee) : 0,
        description,
        currency,
        items,
      });
    }

    const updatedInvoice = await InvoiceService.getInvoiceById(id);
    logger.info(`Invoice ${id} updated. New Amount in DB: ${updatedInvoice.amount}`);

    if (send_email) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
      const paymentLink = `${frontendUrl}/invoice/${updatedInvoice.id}`;

      EmailService.sendInvoiceLink(
        updatedInvoice.customer_email,
        paymentLink,
        updatedInvoice.amount,
        updatedInvoice.customer_name,
        updatedInvoice.invoice_number
      ).catch(err => logger.error("Failed to send background email on update", err));
    }

    res.json({
      success: true,
      data: updatedInvoice,
      message: send_email ? "Invoice updated and email sent successfully" : "Invoice updated successfully",
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Invalid invoice ID");
    }
    await InvoiceService.deleteInvoice(id);
    res.status(HttpStatus.OK).json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
