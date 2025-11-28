import PDFDocument from "pdfkit";
import { Invoice } from "./invoice";

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
        doc
            .fillColor("#444444")
            .fontSize(20)
            .text("Waveflow Dashboard", 110, 57)
            .fontSize(10)
            .text("123 Main Street", 200, 65, { align: "right" })
            .text("New York, NY, 10025", 200, 80, { align: "right" })
            .moveDown();
    }

    private static generateCustomerInformation(doc: PDFKit.PDFDocument, invoice: Invoice) {
        doc
            .fillColor("#444444")
            .fontSize(20)
            .text("Invoice", 50, 160);

        this.generateHr(doc, 185);

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

        this.generateHr(doc, 252);
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
        this.generateHr(doc, invoiceTableTop + 20);
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

        this.generateHr(doc, position + 20);

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
                780,
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

    private static generateHr(doc: PDFKit.PDFDocument, y: number) {
        doc
            .strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, y)
            .lineTo(550, y)
            .stroke();
    }

    private static formatCurrency(amount: number, currency: string = "USD"): string {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
        }).format(amount);
    }
}
