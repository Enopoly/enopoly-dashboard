
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

import { EmailService } from './src/services/email';

async function testEmail() {
    console.log('--- Starting Email Test ---');
    console.log('Service ID:', process.env.EMAILJS_SERVICE_ID);
    console.log('Template ID:', process.env.EMAILJS_TEMPLATE_ID);
    console.log('User ID:', process.env.EMAILJS_USER_ID);
    console.log('Access Token:', process.env.EMAILJS_PRIVATE_KEY ? '****' : 'MISSING');

    try {
        await EmailService.sendInvoiceLink(
            'jeffjoji6@gmail.com', // Updated to user's new test email
            'https://test-link.com',
            100.00,
            'Test Customer',
            'TEST-001'
        );
        console.log('--- Test Completed (Check logs above for result) ---');
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testEmail();
