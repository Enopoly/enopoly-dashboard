import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Receipt, Wallet, TrendingUp, ExternalLink, Copy } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";

const revenueData = [
  { date: "Jan 8", revenue: 42000 },
  { date: "Jan 9", revenue: 45000 },
  { date: "Jan 10", revenue: 43000 },
  { date: "Jan 11", revenue: 48000 },
  { date: "Jan 12", revenue: 46000 },
  { date: "Jan 13", revenue: 52000 },
  { date: "Jan 14", revenue: 54000 },
];

const recentActivity = [
  { event: "Payment received from john.doe@example.com", status: "succeeded", time: "2 minutes ago" },
  { event: "Payout sent to merchant-123", status: "processing", time: "12 minutes ago" },
  { event: "Payment failed for customer jane.smith@example.com", status: "failed", time: "1 hour ago" },
  { event: "Refund processed for ORDER-98765", status: "refunded", time: "2 hours ago" },
];

const recentTransactions = [
  { id: "cos-lbD1sphpgl0Bj", status: "succeeded", amount: "$1,250.00 USD", customer: "john.doe@example.com", date: "2024-01-15 14:32" },
  { id: "cos-2cD2tlhpn201k", status: "processing", amount: "$850.50 USD", customer: "jane.smith@example.com", date: "2024-01-15 13:18" },
  { id: "cos-3dD3ujir1302l", status: "failed", amount: "$2,100.00 USD", customer: "bob.wilson@example.com", date: "2024-01-15 12:05" },
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
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your payment processing activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="TOTAL REVENUE"
          value="$45,231.89"
          change="+ 20.1% from last month"
          icon={DollarSign}
        />
        <StatCard
          title="TRANSACTIONS"
          value="2,350"
          change="+ 15.3% from last month"
          icon={Receipt}
        />
        <StatCard
          title="PAYOUTS"
          value="$12,234.00"
          change="+ 4.3% from last month"
          icon={Wallet}
        />
        <StatCard
          title="SUCCESS RATE"
          value="98.5%"
          change="+ 2.1% from last month"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm flex-1">{activity.event}</p>
                    <Badge className={getStatusColor(activity.status)} variant="secondary">
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
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
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      {transaction.id}
                      <Button variant="ghost" size="icon" className="h-6 w-6">
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
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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

export default Dashboard;
