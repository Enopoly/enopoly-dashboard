export const fakeApiCall = (ms = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const generateApiKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'sk_live_51';
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

export const generatePayoutId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'pt-';
  for (let i = 0; i < 13; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002/api";

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_email: string;
  customer_name: string;
  amount: number;
  processing_fee?: number;
  currency: string;
  status: "pending" | "paid" | "refunded" | "voided";
  description?: string;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
}

export const fetchInvoices = async (): Promise<Invoice[]> => {
  const response = await fetch(`${API_URL}/invoices`);
  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

export const createInvoice = async (invoiceData: any): Promise<Invoice> => {
  const response = await fetch(`${API_URL}/invoices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invoiceData),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

export const getInvoice = async (id: number): Promise<Invoice> => {
  const response = await fetch(`${API_URL}/invoices/${id}`);
  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

export const fetchTransactions = async (): Promise<any[]> => {
  const response = await fetch(`${API_URL}/transactions`);
  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

export const refundTransaction = async (transactionId: string): Promise<any> => {
  const response = await fetch(`${API_URL}/payments/refund/${transactionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message || "Refund failed");
  return data;
};
