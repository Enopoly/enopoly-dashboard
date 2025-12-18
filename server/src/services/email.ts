import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export class EmailService {
    /**
     * Send an invoice link to the customer
     */
    static async sendInvoiceLink(
        to: string,
        link: string,
        amount: number,
        customerName: string,
        invoiceNumber: string
    ) {
        // Create a transporter using Gmail
        // Note: For this to work, you need an "App Password" from Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,      // your gmail address
                pass: process.env.GMAIL_APP_PASSWORD // your app password
            }
        });

        // Simulation Mode (if no credentials provided)
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            logger.info("============================================");
            logger.info("EMAIL SIMULATION (GMAIL_USER not found)");
            logger.info(`To: ${to}`);
            logger.info(`Subject: Invoice ${invoiceNumber} from ${process.env.COMPANY_NAME || 'ENOPOLY'}`);
            logger.info(`Message: Verify your invoice of $${amount} here: ${link}`);
            logger.info("============================================");
            return;
        }

        try {
            const companyName = process.env.COMPANY_NAME || 'ENOPOLY';

            const info = await transporter.sendMail({
                from: `"${companyName}" <${process.env.GMAIL_USER}>`,
                to: to,
                subject: `New Invoice ${invoiceNumber} from ${companyName}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1>New Invoice</h1>
                        <p>Hi ${customerName},</p>
                        <p>${companyName} has sent you an invoice for <strong>$${amount.toFixed(2)}</strong>.</p>
                        <p>Invoice Number: ${invoiceNumber}</p>
                        <br/>
                        <a href="${link}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Review and Pay</a>
                        <br/><br/>
                        <p>If the button doesn't work, copy this link:</p>
                        <p>${link}</p>
                    </div>
                `
            });

            logger.info(`Email sent: ${info.messageId}`);
        } catch (error) {
            logger.error('Failed to send email:', error);
            // Don't crash the invoice creation if email fails
        }
    }
}
