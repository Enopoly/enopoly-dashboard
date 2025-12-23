import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, CheckCircle2, AlertTriangle, XCircle, HelpCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { fetchReconciliation } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reconciliation = () => {
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
        queryKey: ['reconciliation', dateRange.start, dateRange.end],
        queryFn: () => fetchReconciliation(dateRange.start, dateRange.end),
    });

    const summary = data?.summary || { totalMatched: 0, totalDiscrepancies: 0, dbTotal: 0, authNetTotal: 0, difference: 0 };
    const matched = data?.matched || [];
    const amountMismatches = data?.amountMismatches || [];
    const missingInAuthNet = data?.missingInAuthNet || [];
    const orphanTransactions = data?.orphanTransactions || [];

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Reconciliation Report</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Match database invoices with Authorize.Net transactions</p>
                </div>
            </div>

            {/* Date Range Filter */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <Input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-auto"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="w-auto"
                        />
                    </div>
                </CardHeader>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Matched</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-success">{summary.totalMatched}</div>
                        <p className="text-xs text-muted-foreground">Perfect matches</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Discrepancies</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-warning">{summary.totalDiscrepancies}</div>
                        <p className="text-xs text-muted-foreground">Issues found</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Database Total</CardTitle>
                        <span className="text-xs text-muted-foreground">DB</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${summary.dbTotal.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">From invoices</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Authorize.Net Total</CardTitle>
                        <span className="text-xs text-muted-foreground">AuthNet</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${summary.authNetTotal.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Difference: <span className={summary.difference >= 0 ? "text-success" : "text-destructive"}>
                                ${Math.abs(summary.difference).toFixed(2)}
                            </span>
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Reconciliation Results */}
            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground">Running reconciliation...</span>
                        </div>
                    ) : (
                        <Tabs defaultValue="matched" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="matched">
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Matched ({matched.length})
                                </TabsTrigger>
                                <TabsTrigger value="mismatches">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Amount Mismatches ({amountMismatches.length})
                                </TabsTrigger>
                                <TabsTrigger value="missing">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Missing in AuthNet ({missingInAuthNet.length})
                                </TabsTrigger>
                                <TabsTrigger value="orphans">
                                    <HelpCircle className="w-4 h-4 mr-2" />
                                    Orphan Transactions ({orphanTransactions.length})
                                </TabsTrigger>
                            </TabsList>

                            {/* Matched Tab */}
                            <TabsContent value="matched">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Transaction ID</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {matched.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    No matched transactions
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            matched.map((item: any) => (
                                                <TableRow key={item.transactionId}>
                                                    <TableCell className="font-mono">{item.invoiceNumber}</TableCell>
                                                    <TableCell className="font-mono text-xs">{item.transactionId}</TableCell>
                                                    <TableCell className="font-semibold">${item.amount.toFixed(2)}</TableCell>
                                                    <TableCell>{item.customerName}</TableCell>
                                                    <TableCell className="text-muted-foreground">{new Date(item.date).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Badge className="bg-success/10 text-success">✓ Matched</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TabsContent>

                            {/* Amount Mismatches Tab */}
                            <TabsContent value="mismatches">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Transaction ID</TableHead>
                                            <TableHead>DB Amount</TableHead>
                                            <TableHead>AuthNet Amount</TableHead>
                                            <TableHead>Difference</TableHead>
                                            <TableHead>Customer</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {amountMismatches.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    No amount mismatches
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            amountMismatches.map((item: any) => (
                                                <TableRow key={item.transactionId}>
                                                    <TableCell className="font-mono">{item.invoiceNumber}</TableCell>
                                                    <TableCell className="font-mono text-xs">{item.transactionId}</TableCell>
                                                    <TableCell className="font-semibold">${item.dbAmount.toFixed(2)}</TableCell>
                                                    <TableCell className="font-semibold">${item.authNetAmount.toFixed(2)}</TableCell>
                                                    <TableCell className="text-destructive font-semibold">
                                                        ${Math.abs(item.difference).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>{item.customerName}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TabsContent>

                            {/* Missing in AuthNet Tab */}
                            <TabsContent value="missing">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Transaction ID</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Issue</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {missingInAuthNet.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    No missing transactions
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            missingInAuthNet.map((item: any) => (
                                                <TableRow key={item.transactionId}>
                                                    <TableCell className="font-mono">{item.invoiceNumber}</TableCell>
                                                    <TableCell className="font-mono text-xs">{item.transactionId}</TableCell>
                                                    <TableCell className="font-semibold">${item.dbAmount.toFixed(2)}</TableCell>
                                                    <TableCell>{item.customerName}</TableCell>
                                                    <TableCell className="text-muted-foreground">{new Date(item.date).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="destructive">Not found in AuthNet</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TabsContent>

                            {/* Orphan Transactions Tab */}
                            <TabsContent value="orphans">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Transaction ID</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Invoice # (if any)</TableHead>
                                            <TableHead>Issue</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orphanTransactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    No orphan transactions
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            orphanTransactions.map((item: any) => (
                                                <TableRow key={item.transactionId}>
                                                    <TableCell className="font-mono text-xs">{item.transactionId}</TableCell>
                                                    <TableCell className="font-semibold">${item.amount.toFixed(2)}</TableCell>
                                                    <TableCell>{item.customerName}</TableCell>
                                                    <TableCell className="text-muted-foreground">{new Date(item.date).toLocaleDateString()}</TableCell>
                                                    <TableCell className="font-mono text-xs">{item.invoiceNumber || "-"}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="bg-warning/10 text-warning">Not in database</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Reconciliation;
