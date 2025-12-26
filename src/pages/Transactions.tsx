import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Upload, ExternalLink, Copy, Loader2, DollarSign, TrendingUp, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { fakeApiCall, fetchAuthorizeNetTransactions } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const Transactions = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isExporting, setIsExporting] = useState(false);

    // Default to last 30 days
    const getDefaultDates = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    };

    const [dateRange, setDateRange] = useState(getDefaultDates());

    const { data, isLoading } = useQuery({
        queryKey: ['authorizenet-transactions', dateRange.start, dateRange.end],
        queryFn: () => fetchAuthorizeNetTransactions(dateRange.start, dateRange.end),
    });

    const transactions = data?.transactions || [];
    const totalRevenue = data?.totalRevenue || 0;
    const transactionCount = data?.count || 0;

    const handleExport = async () => {
        setIsExporting(true);
        toast.loading("Exporting transactions...");

        await fakeApiCall(1500);

        try {
            const filteredData = filteredTransactions;

            const headers = ["Transaction ID", "Status", "Amount", "Invoice #", "Date", "Card Type"];
            const csvRows = [
                headers.join(','),
                ...filteredData.map(t => [
                    `"${t.transactionId}"`,
                    `"${t.transactionStatus}"`,
                    `"${t.settleAmount}"`,
                    `"${t.invoiceNumber || ''}"`,
                    `"${new Date(t.submitTime).toLocaleDateString()}"`,
                    `"${t.accountType}"`
                ].join(','))
            ];
            const csvString = csvRows.join('\n');

            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `transactions_${dateRange.start}_to_${dateRange.end}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.dismiss();
            toast.success("Transactions exported to CSV successfully!");

        } catch (error) {
            toast.dismiss();
            toast.error("Failed to export transactions.");
            console.error("Export error:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const filteredTransactions = transactions.filter((transaction: any) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = (
            transaction.transactionId?.toLowerCase().includes(searchLower) ||
            transaction.firstName?.toLowerCase().includes(searchLower) ||
            transaction.lastName?.toLowerCase().includes(searchLower) ||
            transaction.invoiceNumber?.toLowerCase().includes(searchLower)
        );

        let matchesStatus = true;
        if (statusFilter === "successful") {
            matchesStatus = ["settledSuccessfully", "capturedPendingSettlement", "refundSettledSuccessfully"].includes(transaction.transactionStatus);
        } else if (statusFilter === "declined") {
            matchesStatus = transaction.transactionStatus === "declined";
        }

        return matchesSearch && matchesStatus;
    }).sort((a: any, b: any) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime());

    const getStatusColor = (status: string) => {
        if (status === "settledSuccessfully") return "bg-success/10 text-success hover:bg-success/20";
        if (status === "refundSettledSuccessfully") return "bg-warning/10 text-warning hover:bg-warning/20";
        if (status === "voided") return "bg-destructive/10 text-destructive hover:bg-destructive/20";
        return "bg-muted text-muted-foreground";
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Transaction History</h1>
                    <p className="text-sm md:text-base text-muted-foreground">All Authorize.Net transactions</p>
                </div>
                <Button onClick={handleExport} disabled={isExporting} className="w-full sm:w-auto">
                    {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    Export
                </Button>
            </div>

            {/* Total Revenue Card */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Total Revenue</h3>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            From {new Date(dateRange.start).toLocaleDateString()} to {new Date(dateRange.end).toLocaleDateString()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium">Total Transactions</h3>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{transactionCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Settled transactions in date range
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Date Range Filter */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 flex-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <Input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="flex-1"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="flex-1"
                            />
                        </div>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by ID, customer, or invoice..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-[180px]">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-muted-foreground" />
                                        <SelectValue placeholder="Filter by status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Transactions</SelectItem>
                                    <SelectItem value="successful">Successful</SelectItem>
                                    <SelectItem value="declined">Declined</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                        Showing {filteredTransactions.length} of {transactions.length} transactions
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[150px]">Transaction ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="hidden sm:table-cell">Invoice #</TableHead>
                                    <TableHead className="hidden md:table-cell">Card</TableHead>
                                    <TableHead className="hidden md:table-cell">Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            Loading transactions...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No transactions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((transaction: any) => (
                                        <TableRow key={transaction.transactionId}>
                                            <TableCell className="font-mono text-xs sm:text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate max-w-[120px] sm:max-w-none">{transaction.transactionId}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 flex-shrink-0"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(transaction.transactionId);
                                                            toast.success("Copied!");
                                                        }}
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                <div className="sm:hidden text-xs text-muted-foreground mt-1">
                                                    {transaction.invoiceNumber || "No Invoice"} • {new Date(transaction.submitTime).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusColor(transaction.transactionStatus)} text-xs`} variant="secondary">
                                                    {transaction.transactionStatus === "settledSuccessfully" ? "Settled" : transaction.transactionStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold">${transaction.settleAmount.toFixed(2)}</TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                {transaction.invoiceNumber || "-"}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {transaction.accountType} ****{transaction.accountNumber}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                                {new Date(transaction.submitTime).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {transaction.invoiceNumber && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => window.open(`/invoice/${transaction.invoiceNumber}`, '_blank')}
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Transactions;
