import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Clock, TrendingUp, Upload } from "lucide-react";

const recentPayouts = [
  { id: "pt-1B5sHxq3gi1D6", recipient: "merchant-123", date: "2024-01-15 10:00", amount: "$1,000.00 USD", status: "succeeded" },
  { id: "pt-2B5tlyr9h2D07", recipient: "merchant-456", date: "2024-01-15 09:30", amount: "$500.00 USD", status: "processing" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "succeeded":
      return "bg-success/10 text-success hover:bg-success/20";
    case "processing":
      return "bg-info/10 text-info hover:bg-info/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Payouts = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Payouts</h1>
        <p className="text-muted-foreground">Send payments to recipients and manage payout batches</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="AVAILABLE BALANCE"
          value="$25,430.00"
          change="USD"
          icon={Wallet}
        />
        <StatCard
          title="PENDING PAYOUTS"
          value="3"
          change="In progress"
          icon={Clock}
        />
        <StatCard
          title="TOTAL SENT"
          value="$142,540"
          change="This month"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" placeholder="100.00" type="number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="gbp">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient-id">Recipient ID</Label>
                <Input id="recipient-id" placeholder="merchant-123" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipient-name">Recipient Name</Label>
                <Input id="recipient-name" placeholder="John Doe" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Payment Reason (Optional)</Label>
                <Textarea 
                  id="reason" 
                  placeholder="Invoice payment for services..." 
                  rows={3}
                />
              </div>
              
              <Button className="w-full" size="lg">
                Create Payout
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Batch Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-muted rounded-full">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Upload CSV file</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop or click to browse
                </p>
                <Button variant="outline">Select File</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                CSV Format: recipient_id, amount, currency, name, reason
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPayouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-semibold">{payout.id}</p>
                    <Badge className={getStatusColor(payout.status)} variant="secondary">
                      {payout.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {payout.recipient} • {payout.date}
                  </p>
                </div>
                <p className="text-lg font-bold">{payout.amount}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payouts;
