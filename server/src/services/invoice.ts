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
    static createInvoice(data: CreateInvoiceDTO): Invoice {
        const db = getDatabase();
        const invoiceNumber = this.generateInvoiceNumber();

        try {
            const stmt = db.prepare(`
        INSERT INTO invoices (
          invoice_number, customer_email, customer_name, amount, currency, description, status
        ) VALUES (
          ?, ?, ?, ?, ?, ?, 'pending'
        )
      `);

            const info = stmt.run(
                invoiceNumber,
                data.customer_email,
                data.customer_name,
                data.amount,
                data.currency || "USD",
                data.description || null
            );

            return this.getInvoiceById(info.lastInsertRowid as number);
        } catch (error) {
            logger.error("Error creating invoice", error);
            throw error;
        }
    }

    /**
     * Get invoice by ID
     */
    static getInvoiceById(id: number): Invoice {
        const db = getDatabase();
        const stmt = db.prepare("SELECT * FROM invoices WHERE id = ?");
        const invoice = stmt.get(id) as Invoice;

        if (!invoice) {
            throw new Error(`Invoice with ID ${id} not found`);
        }

        return invoice;
    }

    /**
     * Get all invoices
     */
    static getAllInvoices(): Invoice[] {
        const db = getDatabase();
        const stmt = db.prepare("SELECT * FROM invoices ORDER BY created_at DESC");
        return stmt.all() as Invoice[];
    }

    /**
     * Update invoice status
     */
    static updateStatus(id: number, status: string): void {
        const db = getDatabase();
        const stmt = db.prepare("UPDATE invoices SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        stmt.run(status, id);
    }
}
