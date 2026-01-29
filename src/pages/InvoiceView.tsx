import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, CheckCircle2, ChevronLeft, Download, Eye } from "lucide-react";
import { PaymentForm } from "@/components/PaymentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { getInvoice } from "@/lib/api";

export default function InvoiceView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const { data: invoice, isLoading, error } = useQuery({
        queryKey: ["invoice", id],
        queryFn: () => getInvoice(parseInt(id || "0")),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <Card className="w-full max-w-md border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="w-5 h-5" />
                            Error Loading Invoice
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Could not load invoice details. Please check the link and try again.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button and Logo */}
                <div className="mb-6 flex flex-col md:flex-row items-center justify-center relative gap-4">
                    {isAuthenticated && (
                        <Button
                            variant="ghost"
                            className="self-start md:self-auto md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 gap-2"
                            onClick={() => navigate('/')}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>
                    )}
                    <div className="text-center">
                        <img
                            src="/logo.png"
                            alt="ENOPOLY"
                            className="h-16 mx-auto"
                        />
                    </div>
                </div>

                <Card>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                        {/* Invoice Summary */}
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 break-all">Invoice {invoice.invoice_number}</h1>
                                <div className="flex items-center gap-2 self-start md:self-auto">
                                    <Button
                                        variant="outline"
                                        onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3002/api'}/invoices/${invoice.id}/pdf`, '_blank')}
                                        className="gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Invoice
                                    </Button>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {invoice.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Bill To</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <p className="font-medium">{invoice.customer_name}</p>
                                    <p>{invoice.customer_email}</p>
                                    {/* Add invoice items summary here if available in API response */}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Invoice Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {invoice.items && invoice.items.length > 0 ? (
                                        <div className="border rounded-md overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted">
                                                    <tr>
                                                        <th className="p-3 text-left font-medium">Item</th>
                                                        <th className="p-3 text-right font-medium">Qty</th>
                                                        <th className="p-3 text-right font-medium">Price</th>
                                                        <th className="p-3 text-right font-medium">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {invoice.items.map((item, i) => (
                                                        <tr key={i}>
                                                            <td className="p-3">
                                                                <div className="font-semibold">{item.name}</div>
                                                                <div className="text-sm text-muted-foreground">{item.description}</div>
                                                            </td>
                                                            <td className="p-3 text-right">{Number(item.quantity)}</td>
                                                            <td className="p-3 text-right">${Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                            <td className="p-3 text-right">${(Number(item.quantity) * Number(item.price)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600">{invoice.description || "Services rendered"}</p>
                                    )}

                                    <Separator className="my-4" />

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>${(invoice.amount - (invoice.processing_fee || 0) - (invoice.tax_amount || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        {invoice.tax_amount && invoice.tax_amount > 0 ? (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Sales Tax ({((invoice.tax_rate || 0) * 100).toFixed(2)}%)</span>
                                                <span>${invoice.tax_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        ) : null}
                                        {invoice.processing_fee && invoice.processing_fee > 0 ? (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Processing Fee</span>
                                                <span>${invoice.processing_fee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        ) : null}
                                        <Separator />
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Amount Due</span>
                                            <span>${(invoice.status === 'paid' ? 0 : invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Payment Section */}
                        <div>
                            {invoice.status === 'paid' ? (
                                <Card className="border-green-200 bg-green-50">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                        <div className="p-4 bg-green-100 rounded-full">
                                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-green-900">Paid in Full</h2>
                                            <p className="text-green-700 mt-2">This invoice has been successfully paid.</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="mt-4 border-green-200 hover:bg-green-100 text-green-800"
                                            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3002/api'}/invoices/${invoice.id}/pdf`}
                                        >
                                            Download Receipt
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <PaymentForm
                                    invoiceId={invoice.id.toString()}
                                    amount={invoice.amount}
                                    onSuccess={(txId) => {
                                        // Refresh logic or redirect
                                        window.location.reload();
                                    }}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
