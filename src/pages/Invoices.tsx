import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInvoices, createInvoice, refundTransaction, updateInvoice, deleteInvoice } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";  // Added Textarea import
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Copy, ExternalLink, RefreshCw, Trash2, RotateCcw, Pencil, Download, MoreHorizontal, Eye, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceItem } from "@/lib/api";

const US_STATES = [
    { name: "Alabama", code: "AL", rate: 0.04 }, { name: "Alaska", code: "AK", rate: 0.00 },
    { name: "Arizona", code: "AZ", rate: 0.056 }, { name: "Arkansas", code: "AR", rate: 0.065 },
    { name: "California", code: "CA", rate: 0.0725 }, { name: "Colorado", code: "CO", rate: 0.029 },
    { name: "Connecticut", code: "CT", rate: 0.0635 }, { name: "Delaware", code: "DE", rate: 0.00 },
    { name: "Florida", code: "FL", rate: 0.06 }, { name: "Georgia", code: "GA", rate: 0.04 },
    { name: "Hawaii", code: "HI", rate: 0.04 }, { name: "Idaho", code: "ID", rate: 0.06 },
    { name: "Illinois", code: "IL", rate: 0.0625 }, { name: "Indiana", code: "IN", rate: 0.07 },
    { name: "Iowa", code: "IA", rate: 0.06 }, { name: "Kansas", code: "KS", rate: 0.065 },
    { name: "Kentucky", code: "KY", rate: 0.06 }, { name: "Louisiana", code: "LA", rate: 0.0445 },
    { name: "Maine", code: "ME", rate: 0.055 }, { name: "Maryland", code: "MD", rate: 0.06 },
    { name: "Massachusetts", code: "MA", rate: 0.0625 }, { name: "Michigan", code: "MI", rate: 0.06 },
    { name: "Minnesota", code: "MN", rate: 0.06875 }, { name: "Mississippi", code: "MS", rate: 0.07 },
    { name: "Missouri", code: "MO", rate: 0.04225 }, { name: "Montana", code: "MT", rate: 0.00 },
    { name: "Nebraska", code: "NE", rate: 0.055 }, { name: "Nevada", code: "NV", rate: 0.0685 },
    { name: "New Hampshire", code: "NH", rate: 0.00 }, { name: "New JERSEY", code: "NJ", rate: 0.06625 },
    { name: "New Mexico", code: "NM", rate: 0.05125 }, { name: "New York", code: "NY", rate: 0.04 },
    { name: "North Carolina", code: "NC", rate: 0.0475 }, { name: "North Dakota", code: "ND", rate: 0.05 },
    { name: "Ohio", code: "OH", rate: 0.0575 }, { name: "Oklahoma", code: "OK", rate: 0.045 },
    { name: "Oregon", code: "OR", rate: 0.00 }, { name: "Pennsylvania", code: "PA", rate: 0.06 },
    { name: "Rhode Island", code: "RI", rate: 0.07 }, { name: "South Carolina", code: "SC", rate: 0.06 },
    { name: "South Dakota", code: "SD", rate: 0.045 }, { name: "Tennessee", code: "TN", rate: 0.07 },
    { name: "Texas", code: "TX", rate: 0.0625 }, { name: "Utah", code: "UT", rate: 0.061 },
    { name: "Vermont", code: "VT", rate: 0.06 }, { name: "Virginia", code: "VA", rate: 0.053 },
    { name: "Washington", code: "WA", rate: 0.065 }, { name: "West Virginia", code: "WV", rate: 0.06 },
    { name: "Wisconsin", code: "WI", rate: 0.05 }, { name: "Wyoming", code: "WY", rate: 0.04 }
];

const Invoices = () => {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState<InvoiceItem[]>([
        { description: "", quantity: 1, price: 0 }
    ]);
    const [autoFee, setAutoFee] = useState(true);
    const [customFee, setCustomFee] = useState("");
    const [sendEmail, setSendEmail] = useState(true);

    const [formData, setFormData] = useState({
        invoice_number: "",
        customer_name: "",
        customer_email: "",
        customer_address: "",
        tax_rate: 0,
        tax_state: "",
    });
    const [editingId, setEditingId] = useState<number | null>(null);

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
    const taxAmount = subtotal * formData.tax_rate;
    // Fee calculation typically includes tax in the base for payment processing
    const fee = autoFee ? Number(((subtotal + taxAmount) * 0.035).toFixed(2)) : (parseFloat(customFee) || 0);
    const totalAmount = subtotal + taxAmount + fee;

    const generatePONumber = () => {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        return `PO${year}${random}`;
    };

    const addItem = () => {
        setItems([...items, { name: "", description: "", quantity: 1, price: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const { data: invoices = [], isLoading } = useQuery({
        queryKey: ["invoices"],
        queryFn: fetchInvoices,
    });

    const createMutation = useMutation({
        mutationFn: createInvoice,
        onSuccess: (data: any) => {
            toast.success("Invoice created successfully!");
            if (data.paymentLink) {
                toast.info("Invoice sent! Click to copy link", {
                    action: {
                        label: "Copy Link",
                        onClick: () => navigator.clipboard.writeText(data.paymentLink),
                    },
                    duration: 10000,
                });
            }
            setIsOpen(false);
            setFormData({ invoice_number: "", customer_name: "", customer_email: "", customer_address: "", tax_rate: 0, tax_state: "" });
            setItems([{ name: "", description: "", quantity: 1, price: 0 }]);
            setAutoFee(true);
            setCustomFee("");
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create invoice");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateInvoice(id, data),
        onSuccess: () => {
            toast.success("Invoice updated successfully!");
            setIsOpen(false);
            setEditingId(null);
            setFormData({ invoice_number: "", customer_name: "", customer_email: "", customer_address: "", tax_rate: 0, tax_state: "" });
            setItems([{ name: "", description: "", quantity: 1, price: 0 }]);
            setAutoFee(true);
            setCustomFee("");
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update invoice");
        },
    });

    // Delete Invoice Mutation
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const deleteMutation = useMutation({
        mutationFn: deleteInvoice,
        onSuccess: () => {
            toast.success("Invoice deleted successfully");
            setDeleteId(null);
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete invoice");
        }
    });

    const startEdit = (invoice: any) => {
        setEditingId(invoice.id);
        const matchingState = US_STATES.find(s => Math.abs(s.rate - (invoice.tax_rate || 0)) < 0.0001);
        setFormData({
            invoice_number: invoice.invoice_number,
            customer_name: invoice.customer_name,
            customer_email: invoice.customer_email,
            customer_address: invoice.customer_address || "",
            tax_rate: invoice.tax_rate || 0,
            tax_state: matchingState?.code || "",
        });

        if (invoice.items && invoice.items.length > 0) {
            setItems(invoice.items.map((i: any) => ({
                name: i.name || "",
                description: i.description,
                quantity: Number(i.quantity) || 1,
                price: Number(i.price) || 0
            })));
        } else {
            const subtotal = Number(invoice.amount) - Number(invoice.processing_fee || 0) - Number(invoice.tax_amount || 0);
            setItems([{ name: "Service", description: invoice.description || "", quantity: 1, price: subtotal || 0 }]);
        }

        // Fix: If processing fee exists, enable autoFee (or custom).
        // If it looks like 3.5%, set auto. Otherwise custom.
        const fee = Number(invoice.processing_fee || 0);
        if (fee > 0) {
            // Check if it matches auto calc roughly
            // const expectedFee = ((Number(invoice.amount) - fee) * 0.035); // Approx
            // For now, simplify: if > 0, assume it's valid. Default to Auto if it is likely auto, or custom.
            // User requested: "If the toggle is used... switching on"
            // Let's default Auto on if fee > 0. User can switch off.
            setAutoFee(true);
            setCustomFee("");
        } else {
            setAutoFee(false);
            setCustomFee("0");
        }

        setIsOpen(true);
    };

    const handleOpenChange = (open: boolean) => {
        if (open && !editingId) {
            // Generate new PO number on open
            setFormData(prev => ({ ...prev, invoice_number: generatePONumber() }));
        }
        if (!open) {
            setEditingId(null);
            setFormData({ invoice_number: "", customer_name: "", customer_email: "", customer_address: "", tax_rate: 0, tax_state: "" });
            setItems([{ name: "", description: "", quantity: 1, price: 0 }]);
            setAutoFee(true);
            setCustomFee("");
            setSendEmail(true);
        }
        setIsOpen(open);
    }
    const [refundData, setRefundData] = useState<{ id: string, maxAmount: number } | null>(null);
    const [refundAmount, setRefundAmount] = useState<string>("");
    const [savedRefundId, setSavedRefundId] = useState<string>("");  // Preserve ID across dialogs
    const [confirmRefund, setConfirmRefund] = useState(false);

    const refundMutation = useMutation({
        mutationFn: ({ id, amount }: { id: string, amount: number }) => refundTransaction(id, amount),
        onSuccess: () => {
            toast.success("Invoice refunded successfully");
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            setRefundData(null);
            setRefundAmount("");
            setSavedRefundId("");
            setConfirmRefund(false);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to refund invoice");
        }
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const validItems = items.filter(i => i.description && Number(i.price) > 0);
        if (validItems.length === 0) {
            toast.error("Please add at least one valid item");
            return;
        }

        if (!formData.customer_name || !formData.customer_email) {
            toast.error("Please fill in customer details");
            return;
        }

        const payload = {
            ...formData,
            amount: totalAmount,
            processing_fee: fee,
            tax_amount: taxAmount,
            currency: "USD",
            items: validItems.map(i => ({
                ...i,
                quantity: Number(i.quantity) || 0,
                price: Number(i.price) || 0
            })),
            send_email: sendEmail
        };

        if (editingId) {
            updateMutation.mutate({ id: editingId, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const getStatusColor = (status: string, isPartial: boolean = false) => {
        if (isPartial) return "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400";
        switch (status) {
            case "paid": return "bg-success/10 text-success";
            case "pending": return "bg-warning/10 text-warning";
            case "voided": return "bg-destructive/10 text-destructive";
            case "refunded": return "bg-warning/10 text-warning";
            default: return "bg-muted text-muted-foreground";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">Manage and track your customer invoices.</p>
                </div>
                <div className="flex gap-2 self-end md:self-auto">
                    <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries({ queryKey: ["invoices"] })}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Create Invoice
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingId ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
                                <DialogDescription>
                                    {editingId ? "Update the invoice details below." : "Enter the invoice details below. An email will be sent to the customer automatically."}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="invoice_number">PO / Invoice #</Label>
                                        <Input
                                            id="invoice_number"
                                            value={formData.invoice_number}
                                            onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                                            placeholder="PO number"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_name">Customer Name</Label>
                                        <Input
                                            id="customer_name"
                                            placeholder="e.g. John Doe"
                                            value={formData.customer_name}
                                            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_email">Customer Email</Label>
                                        <Input
                                            id="customer_email"
                                            type="email"
                                            placeholder="john@example.com"
                                            value={formData.customer_email}
                                            onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tax_state">Billing State (Sales Tax)</Label>
                                        <select
                                            id="tax_state"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formData.tax_state}
                                            onChange={(e) => {
                                                const state = US_STATES.find(s => s.code === e.target.value);
                                                setFormData({
                                                    ...formData,
                                                    tax_state: e.target.value,
                                                    tax_rate: state ? state.rate : 0
                                                });
                                            }}
                                        >
                                            <option value="">Select State (No Tax)</option>
                                            {US_STATES.map(state => (
                                                <option key={state.code} value={state.code}>
                                                    {state.name} ({(state.rate * 100).toFixed(2)}%)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customer_address">Customer Address</Label>
                                    <Textarea
                                        id="customer_address"
                                        placeholder="123 Main St, City, State ZIP"
                                        value={formData.customer_address}
                                        onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                                    />
                                </div>
                                <Label>Line Items</Label>
                                <div className="border rounded-md overflow-hidden">
                                    <div className="hidden md:grid grid-cols-12 gap-4 bg-muted/50 p-3 text-sm font-medium">
                                        <div className="col-span-3">Item Name</div>
                                        <div className="col-span-4">Description</div>
                                        <div className="col-span-2">Qty</div>
                                        <div className="col-span-2">Price</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                    <div className="p-3 space-y-3">
                                        {items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-4 items-start border-b md:border-0 pb-4 md:pb-0">
                                                <div className="col-span-12 md:col-span-3">
                                                    <Label className="md:hidden text-xs text-muted-foreground mb-1 block">Item Name</Label>
                                                    <Input
                                                        placeholder="Item Name"
                                                        value={item.name || ""}
                                                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-span-12 md:col-span-4">
                                                    <Label className="md:hidden text-xs text-muted-foreground mb-1 block">Description</Label>
                                                    <Textarea
                                                        placeholder="Description"
                                                        className="min-h-[40px] resize-y"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-5 md:col-span-2">
                                                    <Label className="md:hidden text-xs text-muted-foreground mb-1 block">Qty</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        placeholder="Qty"
                                                        value={item.quantity || ''}
                                                        onChange={(e) => updateItem(index, 'quantity', e.target.value === '' ? '' : parseInt(e.target.value))}
                                                        className="px-2"
                                                    />
                                                </div>
                                                <div className="col-span-5 md:col-span-2">
                                                    <Label className="md:hidden text-xs text-muted-foreground mb-1 block">Price</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            placeholder="0.00"
                                                            value={item.price || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                updateItem(index, 'price', val === '' ? '' : parseFloat(val));
                                                            }}
                                                            onFocus={(e) => e.target.select()}
                                                            className="pl-7"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-span-2 md:col-span-1 text-center pt-1 md:pt-1 text-right md:text-center mt-6 md:mt-0">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => removeItem(index)}
                                                        disabled={items.length === 1}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full mt-2">
                                            <Plus className="mr-2 h-3 w-3" /> Add Item
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4 border-t pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>

                                    {/* Tax calculated display */}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Sales Tax ({(formData.tax_rate * 100).toFixed(2)}%):</span>
                                        <span>${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Switch id="auto-fee" checked={autoFee} onCheckedChange={setAutoFee} />
                                            <Label htmlFor="auto-fee">Auto-calculate 3.5% Fee</Label>
                                        </div>
                                        <div className="relative w-32">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                                            <Input
                                                type="number"
                                                value={autoFee ? fee : customFee}
                                                onChange={(e) => setCustomFee(e.target.value)}
                                                disabled={autoFee}
                                                className="h-8 pl-6 text-right"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>

                                    <div className="flex items-center space-x-2 pt-2 border-t mt-4">
                                        <Switch
                                            id="send-email"
                                            checked={sendEmail}
                                            onCheckedChange={setSendEmail}
                                        />
                                        <Label htmlFor="send-email">Email Invoice to Customer</Label>
                                    </div>

                                    <DialogFooter>
                                        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                            {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            {editingId
                                                ? (sendEmail ? "Update & Send" : "Update Draft")
                                                : (sendEmail ? "Create & Send" : "Save as Draft")
                                            }
                                        </Button>
                                    </DialogFooter>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">Loading invoices...</TableCell>
                                    </TableRow>
                                ) : invoices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No invoices found. Create one to get started!</TableCell>
                                    </TableRow>
                                ) : (
                                    invoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-mono font-medium whitespace-nowrap">{invoice.invoice_number}</TableCell>
                                            <TableCell className="whitespace-nowrap">{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="whitespace-nowrap">{invoice.customer_name}</span>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{invoice.customer_email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold whitespace-nowrap">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.amount)}
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const totalRefunded = invoice.total_refunded || 0;
                                                    const isPartial = totalRefunded > 0 && totalRefunded < invoice.amount;
                                                    const label = isPartial ? "partial refund" : invoice.status;
                                                    return (
                                                        <Badge variant="secondary" className={getStatusColor(invoice.status, isPartial)}>
                                                            {label}
                                                        </Badge>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(invoice.invoice_number)}>
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Copy Invoice #
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />

                                                        {invoice.status !== 'paid' && (
                                                            <DropdownMenuItem onClick={() => startEdit(invoice)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuItem onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3002/api'}/invoices/${invoice.id}/pdf`, '_blank')}>
                                                            {invoice.status === 'paid' ? (
                                                                <>
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    Download PDF
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Preview PDF
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={() => window.open(`/invoice/${invoice.id}`, '_blank')}>
                                                            <CreditCard className="mr-2 h-4 w-4" />
                                                            View Payment Page
                                                        </DropdownMenuItem>

                                                        {invoice.status === 'paid' && invoice.authorizenet_transaction_id && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setRefundData({ id: invoice.authorizenet_transaction_id!, maxAmount: invoice.amount });
                                                                        setRefundAmount("");  // Empty - user must enter manually
                                                                    }}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <RotateCcw className="mr-2 h-4 w-4" />
                                                                    Refund Invoice
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setDeleteId(invoice.id)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!refundData} onOpenChange={(open) => !open && setRefundData(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Refund Invoice</DialogTitle>
                        <DialogDescription>
                            Enter the amount to refund. Max: ${refundData?.maxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Refund Amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                    type="number"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    max={refundData?.maxAmount}
                                    className="pl-7"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setRefundData(null); setRefundAmount(""); }}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setSavedRefundId(refundData?.id || "");  // Save ID before closing dialog
                                setRefundData(null);
                                setConfirmRefund(true);
                            }}
                            disabled={!refundAmount || parseFloat(refundAmount) <= 0 || parseFloat(refundAmount) > (refundData?.maxAmount || 0)}
                        >
                            Next
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Refund Confirmation Dialog - Step 2 */}
            <AlertDialog open={confirmRefund} onOpenChange={(open) => !open && setConfirmRefund(false)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to refund <strong>${parseFloat(refundAmount || "0").toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>.
                            <br /><br />
                            This action cannot be undone. Are you absolutely sure?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setConfirmRefund(false); setRefundAmount(""); setSavedRefundId(""); }}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                const savedData = { id: savedRefundId, amount: parseFloat(refundAmount) };
                                refundMutation.mutate(savedData);
                            }}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {refundMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Yes, Refund ${parseFloat(refundAmount || "0").toFixed(2)}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this invoice and all its local data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
};

export default Invoices;
