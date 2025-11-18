import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Activity, TrendingUp, CheckCircle, Copy } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";

const revenueData = [
  { name: 'Mon', revenue: 12400 },
  { name: 'Tue', revenue: 19800 },
  { name: 'Wed', revenue: 15600 },
  { name: 'Thu', revenue: 22100 },
  { name: 'Fri', revenue: 28300 },
  { name: 'Sat', revenue: 18900 },
  { name: 'Sun', revenue: 24500 },
];

const recentActivity = [
  { id: 1, event: "Payment received from john.doe@example.com", status: "succeeded", time: "2 min ago" },
  { id: 2, event: "Payout sent to merchant-456", status: "processing", time: "5 min ago" },
  { id: 3, event: "Payment failed for bob.wilson@example.com", status: "failed", time: "12 min ago" },
  { id: 4, event: "Refund processed for alice.brown@example.com", status: "refunded", time: "28 min ago" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "succeeded": return "bg-success/10 text-success hover:bg-success/20";
    case "processing": return "bg-info/10 text-info hover:bg-info/20";
    case "failed": return "bg-destructive/10 text-destructive hover:bg-destructive/20";
    case "refunded": return "bg-warning/10 text-warning hover:bg-warning/20";
    default: return "bg-muted text-muted-foreground";
  }
};

const Dashboard = () => {
  const { transactions } = useData();

  const handleCopyTransactionId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Transaction ID copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const succeededTransactions = transactions.filter(t => t.status === 'succeeded');
  const totalRevenue = succeededTransactions.reduce((acc, t) => {
    const amount = parseFloat(t.amount.replace(/[^0-9.-]+/g,""));
    return acc + amount;
  }, 0);
  
  const successRate = ((succeededTransactions.length / transactions.length) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your payments today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="TOTAL REVENUE" value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} change="+20.1% from last month" icon={DollarSign} />
        <StatCard title="TRANSACTIONS" value={transactions.length.toString()} change="+180 today" icon={Activity} />
        <StatCard title="PAYOUTS" value="$48,574" change="+12 this week" icon={TrendingUp} />
        <StatCard title="SUCCESS RATE" value={`${successRate}%`} change="+2.5% from last week" icon={CheckCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Revenue Overview</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
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
                    <p className="text-sm">{activity.event}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(activity.status)} variant="secondary">{activity.status}</Badge>
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
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono font-semibold">{transaction.id}</code>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyTransactionId(transaction.id)}><Copy className="w-3 h-3" /></Button>
                    <Badge className={getStatusColor(transaction.status)} variant="secondary">{transaction.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{transaction.customer} • {transaction.date}</p>
                </div>
                <p className="text-lg font-bold">{transaction.amount}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
