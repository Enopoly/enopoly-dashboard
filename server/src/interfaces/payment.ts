
export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    message: string;
    errors?: string[];
    rawResponse?: any;
}

export interface CardData {
    cardNumber: string;
    expirationDate: string; // MMYY or YYYY-MM
    cvv: string;
    cardHolderName?: string;
    zipCode?: string;
    email?: string;
}

export interface PaymentGateway {
    charge(amount: number, cardData: CardData, invoiceId: string): Promise<PaymentResult>;
    refund(transactionId: string, amount?: number): Promise<PaymentResult>;
    void(transactionId: string): Promise<PaymentResult>;
}
