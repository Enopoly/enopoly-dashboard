import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Copy, Trash2, RotateCw, CheckCircle2, XCircle, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { fakeApiCall } from "@/lib/api";

const Webhooks = () => {
  const { webhooks, addWebhook, deleteWebhook } = useData();
  const [secret, setSecret] = useState("whsec_" + Math.random().toString(36).substring(2, 15));
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>(["checkout.session.completed"]);

  const handleTestEndpoint = async (url: string) => {
    setIsTesting(url);
    toast.loading(`Sending test event...`);
    await fakeApiCall(2000);
    setIsTesting(null);
    toast.dismiss();
    toast.info(`Test event 'payment_intent.succeeded' sent to ${url}`);
  };

  const handleCreateWebhook = async () => {
    if (!newWebhookUrl.trim() || (!newWebhookUrl.startsWith('http://') && !newWebhookUrl.startsWith('https://'))) { toast.error("Enter valid URL"); return; }
    setIsCreating(true);
    toast.loading("Creating webhook...");
    await fakeApiCall(1500);
    addWebhook({ url: newWebhookUrl, events: newWebhookEvents, status: "active", created: new Date().toISOString().split('T')[0], lastDelivery: "Never" });
    setIsCreating(false);
    setIsDialogOpen(false);
    toast.dismiss();
    toast.success("Webhook created!");
    setNewWebhookUrl("");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Webhooks</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage webhook endpoints</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Webhook Endpoint</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Endpoint URL</Label>
                <Input placeholder="https://api.example.com/webhooks" value={newWebhookUrl} onChange={(e) => setNewWebhookUrl(e.target.value)} disabled={isCreating} />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button onClick={handleCreateWebhook} disabled={isCreating} className="w-full sm:w-auto">
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Webhook Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">URL</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((w) => (
                  <TableRow key={w.url}>
                    <TableCell className="font-mono text-xs sm:text-sm break-all">{w.url}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {w.events.map((e) => (
                          <Badge key={e} variant="secondary" className="text-xs">
                            {e}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="text-xs">{w.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleTestEndpoint(w.url)} disabled={isTesting === w.url}>
                          {isTesting === w.url ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={async () => { setIsDeleting(w.url); await fakeApiCall(1000); deleteWebhook(w.url); setIsDeleting(null); toast.success("Deleted!"); }} disabled={isDeleting === w.url}>
                          {isDeleting === w.url ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Webhook Secret</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <code className="flex-1 text-xs sm:text-sm font-mono bg-muted px-3 py-2 rounded break-all">{secret}</code>
            <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => { navigator.clipboard.writeText(secret); toast.success("Copied!"); }}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" className="mt-4 w-full sm:w-auto" onClick={async () => { setIsRegenerating(true); await fakeApiCall(1500); setSecret("whsec_" + Math.random().toString(36).substring(2, 15)); setIsRegenerating(false); toast.success("Regenerated!"); }} disabled={isRegenerating}>
            {isRegenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <RotateCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Webhooks;
