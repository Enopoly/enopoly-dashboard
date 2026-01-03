import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CreditCard, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/api";

const paymentSchema = z.object({
    cardNumber: z.string().min(13, "Card number must be at least 13 digits").max(19, "Card number must be at most 19 digits").regex(/^\d+$/, "Card number must contain only digits"),
    expirationDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid date format (MM/YY)"),
    cvv: z.string().min(3, "CVV must be 3 or 4 digits").max(4, "CVV must be 3 or 4 digits").regex(/^\d+$/, "CVV must contain only digits"),
    cardHolderName: z.string().min(2, "Name must be at least 2 characters"),
    zipCode: z.string().min(5, "Zip code must be at least 5 digits").regex(/^\d+$/, "Zip code must contain only digits"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
    invoiceId: string;
    amount: number;
    onSuccess: (transactionId: string) => void;
}

const getCardBrand = (number: string) => {
    const clean = number.replace(/\D/g, "");
    if (/^4/.test(clean)) return "Visa";
    if (/^5[1-5]/.test(clean)) return "Mastercard";
    if (/^3[47]/.test(clean)) return "Amex";
    if (/^6(?:011|5)/.test(clean)) return "Discover";
    if (/^(?:2131|1800|35)/.test(clean)) return "JCB";
    return "";
};

const CardIcon = ({ brand }: { brand: string }) => {
    const brandStyles: Record<string, {
        bg: string;
        text: string;
        className?: string;
        display: string;
    }> = {
        Visa: {
            bg: 'linear-gradient(135deg, #1A1F71 0%, #1434CB 100%)',
            text: '#FFF',
            className: 'font-black tracking-wider italic',
            display: 'VISA'
        },
        Mastercard: {
            bg: 'linear-gradient(90deg, #EB001B 0%, #EB001B 50%, #F79E1B 50%, #F79E1B 100%)',
            text: '#FFF',
            className: 'font-bold tracking-wide',
            display: 'mastercard'
        },
        Amex: {
            bg: '#006FCF',
            text: '#FFF',
            className: 'font-black tracking-tight',
            display: 'AMEX'
        },
        Discover: {
            bg: 'linear-gradient(135deg, #FF6000 0%, #F47421 100%)',
            text: '#FFF',
            className: 'font-bold tracking-wide',
            display: 'DISCOVER'
        },
        JCB: {
            bg: 'linear-gradient(135deg, #0E4C96 0%, #1A5FA8 100%)',
            text: '#FFF',
            className: 'font-black tracking-widest',
            display: 'JCB'
        }
    };

    const style = brandStyles[brand];
    if (!style) return null;

    return (
        <span
            className={`text-[10px] px-2.5 py-1 rounded shadow-sm ${style.className}`}
            style={{
                background: style.bg,
                color: style.text,
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)'
            }}
        >
            {style.display}
        </span>
    );
};

export function PaymentForm({ invoiceId, amount, onSuccess }: PaymentFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            cardNumber: "",
            expirationDate: "",
            cvv: "",
            cardHolderName: "",
            zipCode: "",
        },
    });

    // Auto-detect card type
    const cardNumber = form.watch("cardNumber");
    const cardBrand = getCardBrand(cardNumber);

    async function onSubmit(data: PaymentFormValues) {
        setIsLoading(true);
        try {
            // Format expiration date for API (MMYY)
            const [month, year] = data.expirationDate.split('/');
            const formattedExp = `${month}${year}`;

            const response = await fetch(`${API_URL}/payments/charge`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: amount,
                    invoiceId: invoiceId,
                    cardData: {
                        cardNumber: data.cardNumber,
                        expirationDate: formattedExp,
                        cvv: data.cvv,
                        cardHolderName: data.cardHolderName,
                        zipCode: data.zipCode,
                    },
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Payment failed");
            }

            toast({
                title: "Payment Successful",
                description: `Transaction ID: ${result.data.transactionId}`,
            });

            onSuccess(result.data.transactionId);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Payment Failed",
                description: error instanceof Error ? error.message : "An unexpected error occurred",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-card rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-primary/10 rounded-full">
                    <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Payment Details</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Secure Transaction
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="cardHolderName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cardholder Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex justify-between items-center">
                                    <FormLabel>Card Number</FormLabel>
                                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                                        {cardBrand && <CardIcon brand={cardBrand} />}
                                    </div>
                                </div>
                                <FormControl>
                                    <Input placeholder="0000 0000 0000 0000" {...field} maxLength={19} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="expirationDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Expiration (MM/YY)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="MM/YY"
                                            {...field}
                                            maxLength={5}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/\D/g, '');
                                                if (value.length >= 3) {
                                                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                                                }
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cvv"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CVV</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123" {...field} maxLength={4} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Zip Code <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="10001" {...field} maxLength={10} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            `Pay $${amount.toFixed(2)}`
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
