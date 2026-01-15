import { getDatabase } from "../db/connection";
import { logger } from "../utils/logger";

export interface InvoiceItem {
    id: number;
    invoice_id: number;
    name?: string;
    description: string;
    quantity: number;
    price: number;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    customer_email: string;
    customer_name: string;
    customer_address?: string;
    amount: number;
    processing_fee: number;
    currency: string;
    status: "pending" | "paid" | "refunded" | "voided";
    description?: string;
    authorizenet_transaction_id?: string;
    created_at: string;
    updated_at: string;
    items?: InvoiceItem[];
    tax_rate?: number;
    tax_amount?: number;
}

export interface InvoiceItemDTO {
    name?: string;
    description: string;
    quantity: number;
    price: number;
}

export interface CreateInvoiceDTO {
    customer_email: string;
    customer_name: string;
    customer_address?: string;
    amount: number;
    processing_fee?: number;
    description?: string;
    currency?: string;
    items?: InvoiceItemDTO[];
    invoice_number?: string;
    tax_rate?: number;
    tax_amount?: number;
}

export class InvoiceService {
    /**
     * Generate a unique invoice number (POYYXXXX)
     * Example: PO251271 (PO + Year 25 + Random 1271)
     */
    static generateInvoiceNumber(): string {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2); // Last 2 digits (e.g., "25")
        const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0");
        return `PO${year}${random}`;
    }

    /**
     * Create a new invoice
     */
    static async createInvoice(data: CreateInvoiceDTO): Promise<Invoice> {
        const db = getDatabase();
        const invoiceNumber = data.invoice_number || this.generateInvoiceNumber();

        try {
            const sql = `
        INSERT INTO invoices (
          invoice_number, customer_email, customer_name, customer_address, amount, processing_fee, currency, description, status, tax_rate, tax_amount
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?
        )
      `;

            const info = await db.execute(sql, [
                invoiceNumber,
                data.customer_email,
                data.customer_name,
                data.customer_address || null,
                data.amount,
                data.processing_fee || 0,
                data.currency || "USD",
                data.description || null,
                data.tax_rate || 0,
                data.tax_amount || 0
            ]);

            const invoiceId = Number(info.lastInsertRowid);

            // Insert line items if present
            if (data.items && data.items.length > 0) {
                for (const item of data.items) {
                    await db.execute(
                        "INSERT INTO invoice_items (invoice_id, name, description, quantity, price) VALUES (?, ?, ?, ?, ?)",
                        [invoiceId, item.name || item.description, item.description, item.quantity, item.price]
                    );
                }
            }

            const invoice = await this.getInvoiceById(invoiceId);
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

        // Fetch items
        const items = await db.query<InvoiceItem>("SELECT * FROM invoice_items WHERE invoice_id = ?", [id]);
        invoice.items = items;

        return invoice;
    }

    /**
     * Get all invoices
     */
    static async getAllInvoices(): Promise<Invoice[]> {
        const db = getDatabase();
        const invoices = await db.query<Invoice>("SELECT * FROM invoices ORDER BY created_at DESC");

        // Fetch items for each invoice (to ensure Edit works correctly)
        for (const invoice of invoices) {
            const items = await db.query<InvoiceItem>("SELECT * FROM invoice_items WHERE invoice_id = ?", [invoice.id]);
            invoice.items = items;
        }

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
    /**
     * Update invoice details
     */
    static async updateInvoice(id: number, data: CreateInvoiceDTO): Promise<Invoice> {
        const db = getDatabase();

        try {
            // Update main invoice record
            await db.execute(
                `UPDATE invoices SET 
                customer_email = ?,
                customer_name = ?,
                customer_address = ?,
                amount = ?,
                processing_fee = ?,
                description = ?,
                invoice_number = ?,
                tax_rate = ?,
                tax_amount = ?,
                updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [
                    data.customer_email,
                    data.customer_name,
                    data.customer_address || null,
                    data.amount,
                    data.processing_fee || 0,
                    data.description || null,
                    data.invoice_number,
                    data.tax_rate || 0,
                    data.tax_amount || 0,
                    id
                ]
            );

            // Update items: Delete old ones and re-insert new ones
            await db.execute("DELETE FROM invoice_items WHERE invoice_id = ?", [id]);

            if (data.items && data.items.length > 0) {
                for (const item of data.items) {
                    await db.execute(
                        "INSERT INTO invoice_items (invoice_id, name, description, quantity, price) VALUES (?, ?, ?, ?, ?)",
                        [id, item.name || item.description, item.description, item.quantity, item.price]
                    );
                }
            }

            const invoice = await this.getInvoiceById(id);
            return invoice;
        } catch (error) {
            logger.error("Error updating invoice", error);
            throw error;
        }
    }
    static async deleteInvoice(id: number): Promise<void> {
        const db = getDatabase();

        try {
            await db.execute("DELETE FROM invoice_items WHERE invoice_id = ?", [id]);
            await db.execute("DELETE FROM invoices WHERE id = ?", [id]);
        } catch (error) {
            logger.error("Error deleting invoice", error);
            throw error;
        }
    }
}
