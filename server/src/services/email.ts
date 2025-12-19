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
        const serviceId = process.env.EMAILJS_SERVICE_ID;
        const templateId = process.env.EMAILJS_TEMPLATE_ID;
        const userId = process.env.EMAILJS_USER_ID;
        const accessToken = process.env.EMAILJS_PRIVATE_KEY;

        const companyName = process.env.COMPANY_NAME || 'ENOPOLY';

        // Simulation / Log if keys missing
        if (!serviceId || !templateId || !userId || !accessToken) {
            logger.info("============================================");
            logger.info("EMAIL SIMULATION (EmailJS Keys not found)");
            logger.info(`To: ${to}`);
            logger.info(`Template Params: customer=${customerName}, amount=${amount}, link=${link}, invoice=${invoiceNumber}`);
            logger.info("============================================");
            return;
        }

        try {
            const payload = {
                service_id: serviceId,
                template_id: templateId,
                user_id: userId,
                accessToken: accessToken,
                template_params: {
                    to_email: to, // Ensure your template checks this if needed, or EmailJS uses "to" from params if configured? 
                    // Usually EmailJS Service settings define who gets it. 
                    // For "Send to Customer", you need to map a param to the "To Email" field in the template settings on EmailJS dashboard.
                    // Let's assume user maps "to_email" or similar.
                    // Standard EmailJS practice: You map one of these params to the To field in the UI.
                    email: to, // Common field name
                    customer_name: customerName,
                    invoice_number: invoiceNumber,
                    company_name: companyName,
                    amount: amount.toFixed(2),
                    link: link,
                    year: new Date().getFullYear()
                }
            };

            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                logger.info(`Email sent via EmailJS to ${to}`);
            } else {
                const text = await response.text();
                logger.error(`EmailJS Failed: ${text}`);
            }
        } catch (error) {
            logger.error('Failed to send email:', error);
        }
    }
}
