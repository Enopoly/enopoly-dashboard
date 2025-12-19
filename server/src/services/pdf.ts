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
        const companyName = process.env.COMPANY_NAME || "ENOPOLY";
        const companyAddress = process.env.COMPANY_ADDRESS || "";
        // Resolves to server/logo.png in Vercel or local
        const defaultLogoPath = path.join(process.cwd(), "logo.png");
        const logoPath = process.env.COMPANY_LOGO_PATH || (fs.existsSync(defaultLogoPath) ? defaultLogoPath : null);

        if (logoPath && fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 45, { width: 50 });
        }

        doc
            .fillColor("#444444")
            .fontSize(20)
            .text(companyName, 110, 57);

        if (companyAddress) {
            doc
                .fontSize(10)
                .text(companyAddress, 200, 65, { align: "right" });
        }

        doc.moveDown();
    }

    // ... (Customer Info is unchanged)

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
