import PDFDocument from "pdfkit";
import { Invoice } from "./invoice";
import fs from "fs";
import path from "path";

export class PdfService {
    /**
     * Generate Invoice PDF
     */
    static generateInvoicePDF(invoice: Invoice): PDFKit.PDFDocument {
        const doc = new PDFDocument({ margin: 50 });

        this.generateHeader(doc);
        this.generateCustomerInformation(doc, invoice);
        this.generateInvoiceTable(doc, invoice);
        this.generateFooter(doc);

        return doc;
    }

    private static generateHeader(doc: PDFKit.PDFDocument) {
        // Resolves to server/logo.png (assuming this file is in server/src/services/pdf.ts)
        const defaultLogoPath = path.join(__dirname, "../../logo.png");
        const logoPath = process.env.COMPANY_LOGO_PATH || (fs.existsSync(defaultLogoPath) ? defaultLogoPath : null);

        // Center Align Logic
        if (logoPath && fs.existsSync(logoPath)) {
            // Page width is typically around 612 (Letter). 
            // doc.page.width should be available. If not, default is 612.
            const pageWidth = doc.page.width;

            // INCREASED LOGO SIZE
            const logoWidth = 250;
            const logoX = (pageWidth - logoWidth) / 2;
            doc.image(logoPath, logoX, 45, { width: logoWidth });
        }

        doc.moveDown();
    }

    private static generateCustomerInformation(doc: PDFKit.PDFDocument, invoice: Invoice) {
        // Removed HR line for premium look
        // this.generateHr(doc, 185);

        doc
            .fillColor("#444444")
            .fontSize(20)
            .text("Invoice", 50, 160);

        const customerInformationTop = 200;

        doc
            .fontSize(10)
            .text("Invoice Number:", 50, customerInformationTop)
            .font("Helvetica-Bold")
            .text(invoice.invoice_number, 150, customerInformationTop)
            .font("Helvetica")
            .text("Invoice Date:", 50, customerInformationTop + 15)
            .text(new Date(invoice.created_at).toLocaleDateString(), 150, customerInformationTop + 15)
            .text("Balance Due:", 50, customerInformationTop + 30)
            .text(
                this.formatCurrency(invoice.amount, invoice.currency),
                150,
                customerInformationTop + 30
            )

            .font("Helvetica-Bold")
            .text(invoice.customer_name, 300, customerInformationTop)
            .font("Helvetica")
            .text(invoice.customer_email, 300, customerInformationTop + 15)
            .moveDown();

        // Removed HR line
        // this.generateHr(doc, 252);
    }

    private static generateInvoiceTable(doc: PDFKit.PDFDocument, invoice: Invoice) {
        let i = 0;
        const invoiceTableTop = 330;

        doc.font("Helvetica-Bold");
        this.generateTableRow(
            doc,
            invoiceTableTop,
            "Item",
            "Description",
            "Unit Cost",
            "Quantity",
            "Line Total"
        );
        // Removed HR line
        // this.generateHr(doc, invoiceTableTop + 20);
        doc.font("Helvetica");

        // For now, we treat the invoice as having a single item based on the description
        const position = invoiceTableTop + (i + 1) * 30;
        this.generateTableRow(
            doc,
            position,
            "1",
            invoice.description || "Service Charge",
            this.formatCurrency(invoice.amount, invoice.currency),
            "1",
            this.formatCurrency(invoice.amount, invoice.currency)
        );

        // Removed HR line
        // this.generateHr(doc, position + 20);

        const subtotalPosition = invoiceTableTop + (i + 1) * 30 + 20;
        this.generateTableRow(
            doc,
            subtotalPosition,
            "",
            "",
            "Subtotal",
            "",
            this.formatCurrency(invoice.amount, invoice.currency)
        );

        const totalPosition = subtotalPosition + 25;
        doc.font("Helvetica-Bold");
        this.generateTableRow(
            doc,
            totalPosition,
            "",
            "",
            "Total",
            "",
            this.formatCurrency(invoice.amount, invoice.currency)
        );
        doc.font("Helvetica");
    }

    private static generateFooter(doc: PDFKit.PDFDocument) {
        doc
            .fontSize(10)
            .text(
                "Payment is due within 15 days. Thank you for your business.",
                50,
                // Moved up to 730 to prevent extra page (780 might hit bottom margin)
                730,
                { align: "center", width: 500 }
            );
    }

    private static generateTableRow(
        doc: PDFKit.PDFDocument,
        y: number,
        item: string,
        description: string,
        unitCost: string,
        quantity: string,
        lineTotal: string
    ) {
        doc
            .fontSize(10)
            .text(item, 50, y)
            .text(description, 150, y)
            .text(unitCost, 280, y, { width: 90, align: "right" })
            .text(quantity, 370, y, { width: 90, align: "right" })
            .text(lineTotal, 0, y, { align: "right" });
    }



    private static formatCurrency(amount: number, currency: string = "USD"): string {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
        }).format(amount);
    }
}
