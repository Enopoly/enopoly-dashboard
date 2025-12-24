import PDFDocument from "pdfkit";
import { Invoice } from "./invoice";
import fs from "fs";
import path from "path";

export class PdfService {
    /**
     * Generate Invoice PDF
     */
    /**
     * Generate Invoice PDF
     */
    static generateInvoicePDF(invoice: Invoice): PDFKit.PDFDocument {
        const doc = new PDFDocument({ margin: 50, size: 'LETTER' });

        this.generateHeader(doc);
        this.generateAddressSection(doc, invoice);
        this.generateOrderDetails(doc, invoice);
        this.generateInvoiceTable(doc, invoice);
        this.generatePaymentFooter(doc);

        return doc;
    }

    private static generateHeader(doc: PDFKit.PDFDocument) {
        const defaultLogoPath = path.join(__dirname, "../../logo.png");
        const logoPath = process.env.COMPANY_LOGO_PATH || (fs.existsSync(defaultLogoPath) ? defaultLogoPath : null);

        // 1. Logo (Top Left)
        if (logoPath && fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 45, { width: 180 });
        }

        // 2. Title "SALES INVOICE" (Top Right)
        doc
            .font("Helvetica-Bold")
            .fontSize(24)
            .text("SALES INVOICE", 300, 45, { align: "right" });

        // 3. Company Info (Top Right Below Title)
        doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .text("ENOPOLY DISTRIBUTION", 300, 80, { align: "right" })
            .font("Helvetica")
            .text("11710 N 51st", 300, 95, { align: "right" })
            .text("Temple Terrace, Florida 33617", 300, 110, { align: "right" })
            .text("United States", 300, 125, { align: "right" })
            .moveDown()
            .text("Phone: (561) 515-7267", 300, 150, { align: "right" })
            .text("Fax: /Email: sales@enopolydistribution.com", 300, 165, { align: "right" })
            .text("www.enopolybrands.com/www.enopolydistribution.com", 300, 180, { align: "right" });

        // HR Line
        this.generateHr(doc, 200);
    }

    private static generateAddressSection(doc: PDFKit.PDFDocument, invoice: Invoice) {
        const top = 220;

        // BILL TO
        doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .fillColor("#aaaaaa")
            .text("BILL TO", 50, top)
            .fillColor("#000000")
            .text(invoice.customer_name, 50, top + 15)
            .font("Helvetica")
            .text(invoice.customer_email, 50, top + 30, { width: 155 });

        if (invoice.customer_address) {
            doc.text(invoice.customer_address, 50, doc.y, { width: 155 });
        }

        // SHIP TO
        doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .fillColor("#aaaaaa")
            .text("SHIP TO", 215, top)
            .fillColor("#000000")
            .text(invoice.customer_name, 215, top + 15)
            .font("Helvetica")
            .text(invoice.customer_email, 215, top + 30, { width: 155 });

        if (invoice.customer_address) {
            doc.text(invoice.customer_address, 215, doc.y, { width: 155 });
        }
    }

    private static generateOrderDetails(doc: PDFKit.PDFDocument, invoice: Invoice) {
        const top = 220;
        const lineHeight = 15;

        // Define columns to prevent overlap
        // Label Column: Start 380, Width 100 (Fits "P.O./S.O. Number:")
        // Value Column: Start 485, Width 75
        const labelX = 380;
        const labelWidth = 100;
        const valueX = 485;
        const valueWidth = 75;

        doc.font("Helvetica-Bold").fontSize(10);

        // Invoice Number
        doc.text("Invoice Number:", labelX, top, { width: labelWidth, align: "right" });
        doc.text(invoice.invoice_number, valueX, top, { width: valueWidth, align: "right" });

        // P.O./S.O. Number
        const poNumber = invoice.invoice_number.replace('PO', '') || invoice.id.toString();
        doc.text("P.O./S.O. Number:", labelX, top + lineHeight, { width: labelWidth, align: "right" });
        doc.text(poNumber, valueX, top + lineHeight, { width: valueWidth, align: "right" });

        // Invoice Date
        doc.text("Invoice Date:", labelX, top + lineHeight * 2, { width: labelWidth, align: "right" });
        doc.font("Helvetica").text(new Date(invoice.created_at).toLocaleDateString(), valueX, top + lineHeight * 2, { width: valueWidth, align: "right" });

        // Payment Due
        const dueDate = new Date(invoice.created_at);
        dueDate.setDate(dueDate.getDate() + 7);
        doc.font("Helvetica-Bold").text("Payment Due:", labelX, top + lineHeight * 3, { width: labelWidth, align: "right" });
        doc.font("Helvetica").text(dueDate.toLocaleDateString(), valueX, top + lineHeight * 3, { width: valueWidth, align: "right" });

        // Amount Due
        doc.rect(labelX + 60, top + lineHeight * 4 - 2, (labelWidth - 60) + valueWidth + 10, 18).fill("#f4f4f4");

        doc.fillColor("#000000");
        doc.font("Helvetica-Bold").text("Amount Due (USD):", labelX, top + lineHeight * 4, { width: labelWidth, align: "right" });
        doc.text(this.formatCurrency(invoice.amount, invoice.currency), valueX, top + lineHeight * 4, { width: valueWidth, align: "right" });
    }

    private static generateInvoiceTable(doc: PDFKit.PDFDocument, invoice: Invoice) {
        const tableTop = 320;

        // Header Background
        doc.rect(50, tableTop, 512, 25).fill("#231f20");
        doc.fillColor("#ffffff");

        doc.font("Helvetica-Bold").fontSize(10);

        // Columns: Item | Quantity | Price | Amount
        doc.text("Items", 60, tableTop + 7);
        doc.text("Quantity", 300, tableTop + 7, { width: 50, align: "center" });
        doc.text("Price", 400, tableTop + 7, { width: 80, align: "right" });
        doc.text("Amount", 500, tableTop + 7, { width: 50, align: "right" }); // Manually adjusting right align pos

        doc.fillColor("#000000");
        doc.font("Helvetica");

        let currentPosition = tableTop + 35;
        let subtotal = 0;

        if (invoice.items && invoice.items.length > 0) {
            invoice.items.forEach((item) => {
                const amount = item.price * item.quantity;
                subtotal += amount;

                // Item Code/Desc
                doc.font("Helvetica-Bold").text("ITEM", 60, currentPosition); // Placeholder code
                doc.font("Helvetica").text(item.description, 60, currentPosition + 12, { width: 220 });

                doc.text(item.quantity.toString(), 300, currentPosition + 5, { width: 50, align: "center" });
                doc.text(this.formatCurrency(item.price, invoice.currency), 400, currentPosition + 5, { width: 80, align: "right" });
                doc.text(this.formatCurrency(amount, invoice.currency), 470, currentPosition + 5, { width: 80, align: "right" });

                currentPosition += 40; // Spacing
            });
        }

        // Horizontal Line
        this.generateHr(doc, currentPosition);
        currentPosition += 15;

        // Totals Section
        const totalX = 400;
        const valX = 470;

        doc.font("Helvetica-Bold");

        // Subtotal
        doc.text("Subtotal:", totalX, currentPosition, { width: 80, align: "right" });
        doc.text(this.formatCurrency(subtotal, invoice.currency), valX, currentPosition, { width: 80, align: "right" });
        currentPosition += 15;

        // Processing Fee
        if (invoice.processing_fee > 0) {
            doc.text("Processing Fee:", totalX, currentPosition, { width: 80, align: "right" });
            doc.text(this.formatCurrency(invoice.processing_fee, invoice.currency), valX, currentPosition, { width: 80, align: "right" });
            currentPosition += 15;
        }

        // Total
        doc.text("Total:", totalX, currentPosition, { width: 80, align: "right" });
        doc.text(this.formatCurrency(invoice.amount, invoice.currency), valX, currentPosition, { width: 80, align: "right" });

        currentPosition += 20;

        // Amount Due Bottom
        doc.font("Helvetica-Bold");
        doc.text("Amount Due (USD):", totalX - 50, currentPosition, { width: 130, align: "right" });
        doc.text(this.formatCurrency(invoice.amount, invoice.currency), valX, currentPosition, { width: 80, align: "right" });
    }

    private static generatePaymentFooter(doc: PDFKit.PDFDocument) {
        const top = 550; // Ensure enough space

        doc.font("Helvetica-Bold").fontSize(10).fillColor("#aaaaaa");
        doc.text("Notes / Terms", 50, top);
        doc.text("PAYMENT INFO:", 50, top + 15);

        doc.fillColor("#000000").font("Helvetica").fontSize(9);
        const startY = top + 35;
        let y = startY;

        // Zelle
        doc.text("Zelle Account Details:", 50, y);
        doc.text("enopdistributionbofa@gmail.com", 50, y + 12);
        y += 30;

        // Wire
        doc.text("Bank Wire Account Details:", 50, y);
        doc.text("Enopoly Distribution Llc", 50, y + 12);
        doc.text("ACCT: 229059578827", 50, y + 24);
        doc.text("Routing: 026009593", 50, y + 36);
        doc.text("11710 N 51st, Temple Terrace, Florida,", 50, y + 48);
        doc.text("33617  U.S.A", 50, y + 60);
        y += 80;

        // ACH
        doc.text("ACH Account Details:", 50, y);
        doc.text("Enopoly Distribution Llc", 50, y + 12);
        doc.text("ACCT: 229059578827", 50, y + 24);
        doc.text("Routing: 063100277", 50, y + 36);
    }

    private static generateHr(doc: PDFKit.PDFDocument, y: number) {
        doc
            .strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, y)
            .lineTo(562, y) // 50 margin + 512 width
            .stroke();
    }

    private static formatCurrency(amount: number, currency: string = "USD"): string {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
        }).format(amount);
    }
}
