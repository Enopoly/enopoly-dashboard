import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Upload, ExternalLink, Copy, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useData } from "@/contexts/DataContext";
import { useState } from "react";
import { fakeApiCall } from "@/lib/api";

const getStatusColor = (status: string) => {
  switch (status) {
    case "succeeded": return "bg-success/10 text-success hover:bg-success/20";
    case "processing": return "bg-info/10 text-info hover:bg-info/20";
    case "failed": return "bg-destructive/10 text-destructive hover:bg-destructive/20";
    case "refunded": return "bg-warning/10 text-warning hover:bg-warning/20";
    case "expired": return "bg-muted text-muted-foreground hover:bg-muted/80";
    default: return "bg-muted text-muted-foreground";
  }
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTransactions, refundTransaction } from "@/lib/api";
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


const Transactions = () => {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [refundData, setRefundData] = useState<{ id: string, amount: string } | null>(null);

  const queryClient = useQueryClient();

  const refundMutation = useMutation({
    mutationFn: refundTransaction,
    onSuccess: () => {
      toast.success("Refund processed successfully");
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setRefundData(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleRefund = () => {
    if (refundData) {
      refundMutation.mutate(refundData.id);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    toast.loading("Exporting transactions...");

    await fakeApiCall(1500); // Simulate network delay

    try {
      const filteredData = filteredTransactions;

      // 1. Convert data to CSV format
      const headers = ["ID", "Status", "Amount", "Customer", "Date"];
      const csvRows = [
        headers.join(','),
        ...filteredData.map(t => [
          `"${t.id}"`,
          `"${t.status}"`,
          `"${t.amount}"`,
          `"${t.customer}"`,
          `"${t.date}"`
        ].join(','))
      ];
      const csvString = csvRows.join('\n');

      // 2. Create a Blob
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

      // 3. Create a temporary URL
      const url = URL.createObjectURL(blob);

      // 4. Create a temporary anchor element
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "transactions.csv");

      // 5. Trigger download
      document.body.appendChild(link);
      link.click();

      // 6. Clean up
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

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) || transaction.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Transactions</h1>
          <p className="text-sm md:text-base text-muted-foreground">View and manage all payment transactions</p>
        </div>
        <Button onClick={handleExport} disabled={isExporting} className="w-full sm:w-auto">
          {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by ID, customer, or reference..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">Showing {filteredTransactions.length} of {transactions.length} transactions</div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[120px] sm:max-w-none">{transaction.id}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => { navigator.clipboard.writeText(transaction.id); toast.success("Copied!"); }}><Copy className="w-3 h-3" /></Button>
                      </div>
                      <div className="sm:hidden text-xs text-muted-foreground mt-1">{transaction.customer} • {transaction.date}</div>
                    </TableCell>
                    <TableCell><Badge className={`${getStatusColor(transaction.status)} text-xs`} variant="secondary">{transaction.status}</Badge></TableCell>
                    <TableCell className="font-semibold">{transaction.amount}</TableCell>
                    <TableCell className="hidden sm:table-cell">{transaction.customer}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{transaction.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {transaction.status === "succeeded" && (
                          <Button
                            variant="default" // Using default variant but stylized
                            size="sm"
                            className="bg-white hover:bg-red-50 text-red-600 border border-red-200 shadow-sm transition-all h-8 px-3"
                            onClick={() => setRefundData({ id: transaction.id, amount: transaction.amount })}
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                            Refund
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`/invoice/${transaction.invoiceId}`, '_blank')}><ExternalLink className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!refundData} onOpenChange={(open) => !open && setRefundData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process Refund</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refund this transaction? This action cannot be undone.
              {refundData && (
                <div className="mt-2 p-3 bg-muted rounded-md font-mono text-sm">
                  Transaction: {refundData.id}<br />
                  Amount: {refundData.amount}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleRefund}
              disabled={refundMutation.isPending}
            >
              {refundMutation.isPending ? "Processing..." : "Confirm Refund"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Transactions;
