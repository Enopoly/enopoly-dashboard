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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold mb-2">Webhooks</h1><p className="text-muted-foreground">Manage webhook endpoints</p></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Create Webhook</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Create Webhook Endpoint</DialogTitle></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label>Endpoint URL</Label><Input placeholder="https://api.example.com/webhooks" value={newWebhookUrl} onChange={(e) => setNewWebhookUrl(e.target.value)} disabled={isCreating} /></div></div><DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateWebhook} disabled={isCreating}>{isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create</Button></DialogFooter></DialogContent></Dialog>
      </div>
      <Card><CardHeader><CardTitle>Webhook Endpoints</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>URL</TableHead><TableHead>Events</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{webhooks.map((w) => (<TableRow key={w.url}><TableCell className="font-mono text-sm">{w.url}</TableCell><TableCell><div className="flex gap-1">{w.events.map((e) => (<Badge key={e} variant="secondary" className="text-xs">{e}</Badge>))}</div></TableCell><TableCell><Badge>{w.status}</Badge></TableCell><TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleTestEndpoint(w.url)} disabled={isTesting === w.url}>{isTesting === w.url ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}</Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={async () => { setIsDeleting(w.url); await fakeApiCall(1000); deleteWebhook(w.url); setIsDeleting(null); toast.success("Deleted!"); }} disabled={isDeleting === w.url}>{isDeleting === w.url ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}</Button></div></TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
      <Card><CardHeader><CardTitle>Webhook Secret</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2"><code className="flex-1 text-sm font-mono bg-muted px-3 py-2 rounded">{secret}</code><Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(secret); toast.success("Copied!"); }}><Copy className="w-4 h-4" /></Button></div><Button variant="outline" className="mt-4" onClick={async () => { setIsRegenerating(true); await fakeApiCall(1500); setSecret("whsec_" + Math.random().toString(36).substring(2, 15)); setIsRegenerating(false); toast.success("Regenerated!"); }} disabled={isRegenerating}>{isRegenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}<RotateCw className="w-4 h-4 mr-2" />Regenerate</Button></CardContent></Card>
    </div>
  );
};

export default Webhooks;
