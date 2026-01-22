import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Activity, TrendingUp, CheckCircle, Copy } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTransactions, refundTransaction } from "@/lib/api";
import { toast } from "sonner";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, RotateCcw } from "lucide-react";

const getStatusColor = (status: string, isPartialRefund: boolean = false) => {
  if (isPartialRefund) return "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400";
  switch (status) {
    case "succeeded": return "bg-success/10 text-success hover:bg-success/20";
    case "processing": return "bg-info/10 text-info hover:bg-info/20";
    case "failed": return "bg-destructive/10 text-destructive hover:bg-destructive/20";
    case "refunded": return "bg-warning/10 text-warning hover:bg-warning/20";
    default: return "bg-muted text-muted-foreground";
  }
};

const Dashboard = () => {
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
    initialData: [],
    select: (data) => {
      // Sort by date desc just in case
      return data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  });

  const [refundData, setRefundData] = useState<{ id: string, maxAmount: number } | null>(null);
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [savedRefundId, setSavedRefundId] = useState<string>("");  // Preserve ID across dialogs
  const [confirmRefund, setConfirmRefund] = useState(false);
  const queryClient = useQueryClient();

  const refundMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string, amount: number }) => refundTransaction(id, amount),
    onSuccess: () => {
      toast.success("Transaction refunded successfully");
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setRefundData(null);
      setRefundAmount("");
      setSavedRefundId("");
      setConfirmRefund(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to refund transaction");
    }
  });

  const handleCopyTransactionId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Transaction ID copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const succeededTransactions = transactions.filter(t => t.status === 'succeeded' || t.status === 'refunded' || t.status === 'approved');
  const totalRevenue = succeededTransactions.reduce((acc, t) => {
    const rawAmount = parseFloat(t.amount.replace(/[^0-9.-]+/g, ""));
    if (t.type === 'refund') {
      return acc - rawAmount;
    }
    return acc + rawAmount;
  }, 0);

  const totalRefunded = transactions
    .filter(t => t.type === 'refund')
    .reduce((acc, t) => acc + parseFloat(t.amount.replace(/[^0-9.-]+/g, "")), 0);

  const successRate = transactions.length > 0
    ? ((succeededTransactions.length / transactions.length) * 100).toFixed(1)
    : "0.0";

  // Derive recent activity from transactions
  const recentActivity = transactions.slice(0, 5).map((t, index) => {
    const amountStr = t.type === 'refund' ? `(${t.amount})` : `(${t.amount})`;
    const action = t.type === 'refund' ? 'Refunded' : `Payment ${t.status}`;

    return {
      id: index,
      event: `${action} ${amountStr} for ${t.customer}`,
      status: t.status,
      time: t.date
    };
  });

  // Derive revenue data (last 7 days)
  const revenueData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toISOString().slice(0, 10);

    const dayRevenue = succeededTransactions
      .filter(t => t.date.startsWith(dateStr))
      .reduce((acc, t) => {
        const rawAmount = parseFloat(t.amount.replace(/[^0-9.-]+/g, ""));
        if (t.type === 'refund') {
          return acc - rawAmount;
        }
        return acc + rawAmount;
      }, 0);

    return { name: dayName, revenue: parseFloat(dayRevenue.toFixed(2)) };
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Welcome back! Here's what's happening with your payments today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="TOTAL REVENUE" value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} change="+20.1% from last month" icon={DollarSign} />
        <StatCard title="TRANSACTIONS" value={transactions.length.toString()} change="+180 today" icon={Activity} />
        <StatCard title="TOTAL REFUNDED" value={`$${Math.abs(totalRefunded).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} change="Last 30 days" icon={RotateCcw} />
        <StatCard title="SUCCESS RATE" value={`${successRate}%`} change="+2.5% from last week" icon={CheckCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Revenue Overview</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-1))', r: 4 }} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs sm:text-sm">{activity.event}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge className={`${getStatusColor(activity.status)} text-xs`} variant="secondary">{activity.status}</Badge>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 md:p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs sm:text-sm font-mono font-semibold truncate">{transaction.id}</code>
                    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => handleCopyTransactionId(transaction.id)}><Copy className="w-3 h-3" /></Button>
                    {(() => {
                      const amount = parseFloat(transaction.amount.replace(/[^0-9.-]+/g, ""));
                      const isPartial = transaction.type === 'refund' && transaction.invoiceAmount && amount < transaction.invoiceAmount;
                      const label = isPartial ? "partial refund" : (transaction.type === 'refund' ? "refunded" : transaction.status);

                      return (
                        <Badge className={`${getStatusColor(transaction.status, isPartial)} text-xs`} variant="secondary">
                          {label}
                        </Badge>
                      );
                    })()}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{transaction.customer} • {transaction.date}</p>
                </div>
                <p className={`text-base sm:text-lg font-bold sm:text-right ${transaction.type === 'refund' ? 'text-destructive' : ''}`}>
                  {transaction.type === 'refund' ? '-' : ''}{transaction.amount}
                </p>
                {transaction.status === 'succeeded' && transaction.type === 'charge' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="sm:ml-4 text-xs h-8 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      const amount = parseFloat(transaction.amount.replace(/[^0-9.-]+/g, ""));
                      setRefundData({ id: transaction.id, maxAmount: amount });
                      setRefundAmount("");  // Empty - user must enter manually
                    }}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Refund
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Refund Amount Entry Dialog - Step 1 */}
          <Dialog open={!!refundData} onOpenChange={(open) => !open && setRefundData(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Refund Transaction</DialogTitle>
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
                      placeholder="0.00"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
