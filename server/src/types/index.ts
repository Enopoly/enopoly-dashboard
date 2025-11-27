export type InvoiceStatus = "pending" | "paid" | "refunded" | "voided";

export type TransactionType = "charge" | "refund" | "void";

export type TransactionStatus = "pending" | "approved" | "declined" | "refunded" | "voided";

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_email: string;
  customer_name: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  description: string | null;
  authorizenet_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceRequest {
  customer_email: string;
  customer_name: string;
  amount: number;
  currency?: string;
  description?: string;
}

export interface Transaction {
  id: number;
  invoice_id: number | null;
  authorizenet_transaction_id: string;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
  response_code: string | null;
  response_message: string | null;
  metadata: string | null; // JSON string
  created_at: string;
}

export interface PaymentLog {
  id: number;
  invoice_id: number | null;
  transaction_id: number | null;
  action: TransactionType;
  status: string;
  details: string | null; // JSON string
  timestamp: string;
}

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
  };
}

