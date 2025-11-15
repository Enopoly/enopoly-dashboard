import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Upload, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

const transactions = [
  { id: "cos-lbD1sphpgl0Bj", status: "succeeded", amount: "$1,250.00 USD", customer: "john.doe@example.com", date: "2024-01-15 14:32" },
  { id: "cos-2cD2tlhpn201k", status: "processing", amount: "$850.50 USD", customer: "jane.smith@example.com", date: "2024-01-15 13:18" },
  { id: "cos-3dD3ujir1302l", status: "failed", amount: "$2,100.00 USD", customer: "bob.wilson@example.com", date: "2024-01-15 12:05" },
  { id: "cos-6bBavk4js4D3e", status: "succeeded", amount: "$525.00 USD", customer: "alice.brown@example.com", date: "2024-01-15 11:22" },
  { id: "cos-5fD5wlkt6506n", status: "refunded", amount: "$1,750.00 USD", customer: "charlie.davis@example.com", date: "2024-01-15 10:45" },
  { id: "cos-6gD6xme7u605o", status: "expired", amount: "$399.99 USD", customer: "david.miller@example.com", date: "2024-01-15 09:30" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "succeeded":
      return "bg-success/10 text-success hover:bg-success/20";
    case "processing":
      return "bg-info/10 text-info hover:bg-info/20";
    case "failed":
      return "bg-destructive/10 text-destructive hover:bg-destructive/20";
    case "refunded":
      return "bg-warning/10 text-warning hover:bg-warning/20";
    case "expired":
      return "bg-muted text-muted-foreground hover:bg-muted/80";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Transactions = () => {
  const handleCopyTransactionId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Transaction ID copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleViewTransaction = (id: string) => {
    toast.info(`Viewing transaction: ${id}`);
  };

  const handleExport = () => {
    toast.success("Exporting transactions...");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transactions</h1>
          <p className="text-muted-foreground">View and manage all payment transactions</p>
        </div>
        <Button onClick={handleExport}>
          <Upload className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by ID, customer, or reference..." 
                className="pl-10"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      {transaction.id}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleCopyTransactionId(transaction.id)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(transaction.status)} variant="secondary">
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{transaction.amount}</TableCell>
                  <TableCell>{transaction.customer}</TableCell>
                  <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleViewTransaction(transaction.id)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
