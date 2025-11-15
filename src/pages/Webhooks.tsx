import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Copy, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const webhookEndpoints = [
  {
    url: "https://api.example.com/webhooks",
    events: ["checkout.session.completed", "payout.succeeded"],
    status: "succeeded",
    created: "2024-01-01",
    lastDelivery: "2024-01-15 14:32",
  },
];

const recentDeliveries = [
  { event: "checkout.session.completed", timestamp: "2024-01-15 14:32:15", status: "succeeded" },
  { event: "payout.succeeded", timestamp: "2024-01-15 13:18:42", status: "succeeded" },
  { event: "checkout.session.completed", timestamp: "2024-01-15 12:05:33", status: "failed" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "succeeded":
      return "bg-success/10 text-success hover:bg-success/20";
    case "failed":
      return "bg-destructive/10 text-destructive hover:bg-destructive/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Webhooks = () => {
  const [webhookSecret] = useState("whsec_1234567890abcdefghijklmnopqrstuv");
  const [endpoints, setEndpoints] = useState(webhookEndpoints);

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(webhookSecret);
      toast.success("Webhook secret copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleRegenerateSecret = () => {
    toast.success("Webhook secret regenerated successfully!");
  };

  const handleCreateWebhook = () => {
    toast.info("Create webhook dialog would open here");
  };

  const handleEditWebhook = (url: string) => {
    toast.info(`Editing webhook: ${url}`);
  };

  const handleDeleteWebhook = (url: string) => {
    setEndpoints(endpoints.filter(endpoint => endpoint.url !== url));
    toast.success("Webhook endpoint deleted successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Webhooks</h1>
          <p className="text-muted-foreground">Configure webhook endpoints for real-time notifications</p>
        </div>
        <Button onClick={handleCreateWebhook}>
          <Plus className="w-4 h-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Delivery</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {endpoints.map((endpoint, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{endpoint.url}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {endpoint.events.map((event) => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(endpoint.status)} variant="secondary">
                      {endpoint.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{endpoint.created}</TableCell>
                  <TableCell className="text-muted-foreground">{endpoint.lastDelivery}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEditWebhook(endpoint.url)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteWebhook(endpoint.url)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Webhook Secret</CardTitle>
            <Button variant="outline" size="sm" onClick={handleRegenerateSecret}>
              Regenerate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
            <code className="flex-1">{webhookSecret}</code>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleCopySecret}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Use this secret to verify webhook signatures and ensure requests come from WaveFlow
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentDeliveries.map((delivery, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="space-y-1">
                  <p className="font-mono text-sm font-medium">{delivery.event}</p>
                  <p className="text-xs text-muted-foreground">{delivery.timestamp}</p>
                </div>
                <Badge className={getStatusColor(delivery.status)} variant="secondary">
                  {delivery.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Webhooks;
