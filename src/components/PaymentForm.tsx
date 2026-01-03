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
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
    invoiceId: string;
    amount: number;
    onSuccess: (transactionId: string) => void;
}

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
        },
    });

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
                                <FormLabel>Card Number</FormLabel>
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
