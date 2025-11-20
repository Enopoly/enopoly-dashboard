import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Upload, ExternalLink, Copy, Loader2 } from "lucide-react";
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

const Transactions = () => {
  const { transactions } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

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
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[120px] sm:max-w-none">{transaction.id}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => { navigator.clipboard.writeText(transaction.id); toast.success("Copied!"); }}><Copy className="w-3 h-3" /></Button>
                      </div>
                      <div className="sm:hidden text-xs text-muted-foreground mt-1">{transaction.customer} • {transaction.date}</div>
                    </TableCell>
                    <TableCell><Badge className={getStatusColor(transaction.status)} variant="secondary" className="text-xs">{transaction.status}</Badge></TableCell>
                    <TableCell className="font-semibold">{transaction.amount}</TableCell>
                    <TableCell className="hidden sm:table-cell">{transaction.customer}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{transaction.date}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info(`Viewing ${transaction.id}`)}><ExternalLink className="w-4 h-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
