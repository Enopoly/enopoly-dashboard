import { logger } from '../utils/logger';

export class EmailService {
    /**
     * Send an invoice link to the customer via EmailJS
     */
    static async sendInvoiceLink(
        to: string,
        link: string,
        amount: number,
        customerName: string,
        invoiceNumber: string
    ) {
        return this.sendEmail(to, 'invoice_link', {
            link,
            amount,
            customerName,
            invoiceNumber
        });
    }

    /**
     * Send a payment receipt to the customer
     */
    static async sendReceiptEmail(
        to: string,
        amount: number,
        customerName: string,
        invoiceNumber: string,
        transactionId: string,
        invoiceId: number
    ) {
        return this.sendEmail(to, 'receipt', {
            amount,
            customerName,
            invoiceNumber,
            transactionId,
            invoiceId,
            date: new Date().toLocaleDateString()
        });
    }

    private static async sendEmail(to: string, type: 'invoice_link' | 'receipt', data: any) {
        const serviceId = process.env.EMAILJS_SERVICE_ID;
        // User might want different templates for invoice vs receipt.
        // For now, we assume one template is smart enough OR we use two env vars.
        // To be safe and simple: Let's use the SAME template ID env var for now unless user adds another.
        // BUT, ideally we send a "mode" or "type" param to the template so it can show/hide text.
        const templateId = process.env.EMAILJS_TEMPLATE_ID;
        const userId = process.env.EMAILJS_USER_ID;
        const accessToken = process.env.EMAILJS_PRIVATE_KEY;

        const companyName = process.env.COMPANY_NAME || 'ENOPOLY';

        const params: any = {
            email: to,
            customer_name: data.customerName,
            invoice_number: data.invoiceNumber,
            company_name: companyName,
            amount: typeof data.amount === 'number'
                ? new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.amount)
                : data.amount,
            year: new Date().getFullYear(),
            // Custom fields depending on type
            type: type
        };

        if (type === 'invoice_link') {
            params.link = data.link;
            params.action_text = "Pay Now";
            params.title = "Invoice Due";
            params.message = "Please click the link below to view and pay your invoice.";
        } else {
            params.transaction_id = data.transactionId;
            params.date = data.date;
            params.action_text = "Download Receipt";
            params.title = "Payment Receipt";
            params.message = `Thank you for your payment! Your transaction ID is ${data.transactionId}.`;
            // Link back to the frontend homepage or a specific dashboard
            const apiUrl = process.env.API_URL || process.env.VITE_API_URL || "http://localhost:3002/api";
            // Check if we are in production (simulated check) or just use the direct link
            // Ideally this link should be the frontend view /invoice/:id which has a download button,
            // OR direct API PDF link. Using direct API PDF link as requested.
            // If invoiceId is missing (legacy calls), fall back to frontend URL
            if (data.invoiceId) {
                params.link = `${apiUrl}/invoices/${data.invoiceId}/pdf`;
            } else {
                params.link = process.env.FRONTEND_URL || "http://localhost:8080";
            }
        }

        // Simulation / Log if keys missing
        if (!serviceId || !templateId || !userId || !accessToken) {
            logger.info("============================================");
            logger.info("EMAIL SIMULATION (EmailJS Keys not found)");
            logger.info(`To: ${to}`);
            logger.info(`Subject: ${params.title}`);
            logger.info(`Params: ${JSON.stringify(params, null, 2)}`);
            logger.info("============================================");
            return;
        }

        try {
            const payload = {
                service_id: serviceId,
                template_id: templateId,
                user_id: userId,
                accessToken: accessToken,
                template_params: params
            };

            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                logger.info(`Email sent via EmailJS to ${to} (${type})`);
            } else {
                const text = await response.text();
                logger.error(`EmailJS Failed: ${text}`);
            }
        } catch (error) {
            logger.error('Failed to send email:', error);
        }
    }
}
