import { getDatabase } from "../db/connection";
import { logger } from "../utils/logger";

export interface Invoice {
    id: number;
    invoice_number: string;
    customer_email: string;
    customer_name: string;
    amount: number;
    currency: string;
    status: "pending" | "paid" | "refunded" | "voided";
    description?: string;
    authorizenet_transaction_id?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateInvoiceDTO {
    customer_email: string;
    customer_name: string;
    amount: number;
    description?: string;
    currency?: string;
}

export class InvoiceService {
    /**
     * Generate a unique invoice number (INV-YYYY-XXXX)
     */
    static generateInvoiceNumber(): string {
        const date = new Date();
        const year = date.getFullYear();
        const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0");
        return `INV-${year}-${random}`;
    }

    /**
     * Create a new invoice
     */
    static async createInvoice(data: CreateInvoiceDTO): Promise<Invoice> {
        const db = getDatabase();
        const invoiceNumber = this.generateInvoiceNumber();

        try {
            const sql = `
        INSERT INTO invoices (
          invoice_number, customer_email, customer_name, amount, currency, description, status
        ) VALUES (
          ?, ?, ?, ?, ?, ?, 'pending'
        )
      `;

            const info = await db.execute(sql, [
                invoiceNumber,
                data.customer_email,
                data.customer_name,
                data.amount,
                data.currency || "USD",
                data.description || null
            ]);

            const invoice = await this.getInvoiceById(Number(info.lastInsertRowid));
            if (!invoice) throw new Error("Failed to retrieve created invoice");
            return invoice;
        } catch (error) {
            logger.error("Error creating invoice", error);
            throw error;
        }
    }

    /**
     * Get invoice by ID
     */
    static async getInvoiceById(id: number): Promise<Invoice> {
        const db = getDatabase();
        const invoice = await db.get<Invoice>("SELECT * FROM invoices WHERE id = ?", [id]);

        if (!invoice) {
            throw new Error(`Invoice with ID ${id} not found`);
        }

        return invoice;
    }

    /**
     * Get all invoices
     */
    static async getAllInvoices(): Promise<Invoice[]> {
        const db = getDatabase();
        const invoices = await db.query<Invoice>("SELECT * FROM invoices ORDER BY created_at DESC");
        return invoices;
    }

    /**
     * Update invoice status
     */
    static async updateStatus(id: number, status: string): Promise<void> {
        const db = getDatabase();
        await db.execute(
            "UPDATE invoices SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [status, id]
        );
    }
}
