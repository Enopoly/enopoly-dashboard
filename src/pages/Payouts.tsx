import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Clock, TrendingUp, Upload, Loader2 } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { fakeApiCall, generatePayoutId } from "@/lib/api";

const getStatusColor = (status: string) => status === "succeeded" ? "bg-success/10 text-success hover:bg-success/20" : "bg-info/10 text-info hover:bg-info/20";

const Payouts = () => {
  const { payouts, addPayout } = useData();
  const [isCreating, setIsCreating] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [recipientId, setRecipientId] = useState("");
  const [recipientName, setRecipientName] = useState("");

  const handleCreatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !recipientId || !recipientName) { toast.error("Fill all required fields"); return; }
    setIsCreating(true);
    toast.loading("Creating payout...");
    await fakeApiCall(2000);
    addPayout({ id: generatePayoutId(), recipient: recipientId, date: new Date().toISOString().slice(0, 16).replace('T', ' '), amount: `$${parseFloat(amount).toFixed(2)} ${currency.toUpperCase()}`, status: "processing" });
    setIsCreating(false);
    toast.dismiss();
    toast.success(`Payout of $${parseFloat(amount).toFixed(2)} scheduled!`);
    setAmount(""); setRecipientId(""); setRecipientName("");
  };

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      toast.success(`File "${file.name}" selected.`);
    }
  };

  const handleClearFile = () => {
    setUploadedFileName(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold mb-2">Payouts</h1><p className="text-muted-foreground">Send payments to recipients</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="AVAILABLE BALANCE" value="$25,430.00" change="USD" icon={Wallet} />
        <StatCard title="PENDING PAYOUTS" value={payouts.filter(p => p.status === 'processing').length.toString()} change="In progress" icon={Clock} />
        <StatCard title="TOTAL SENT" value="$142,540" change="This month" icon={TrendingUp} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle>Create Payout</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={handleCreatePayout}><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Amount *</Label><Input placeholder="100.00" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={isCreating} /></div><div className="space-y-2"><Label>Currency</Label><Select value={currency} onValueChange={setCurrency} disabled={isCreating}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="usd">USD</SelectItem><SelectItem value="eur">EUR</SelectItem><SelectItem value="gbp">GBP</SelectItem></SelectContent></Select></div></div><div className="space-y-2"><Label>Recipient ID *</Label><Input placeholder="merchant-123" value={recipientId} onChange={(e) => setRecipientId(e.target.value)} disabled={isCreating} /></div><div className="space-y-2"><Label>Recipient Name *</Label><Input placeholder="John Doe" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} disabled={isCreating} /></div><Button className="w-full" size="lg" type="submit" disabled={isCreating}>{isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create Payout</Button></form></CardContent></Card>
        <Card>
          <CardHeader><CardTitle>Batch Upload</CardTitle></CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center space-y-4">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv" />
              {uploadedFileName ? (
                <div className="space-y-4">
                  <p className="font-semibold text-success">File "{uploadedFileName}" ready for upload.</p>
                  <div className="flex justify-center gap-2">
                    <Button>Upload File</Button>
                    <Button variant="outline" onClick={handleClearFile}>Clear</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="p-4 bg-muted rounded-full">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Upload CSV file</h3>
                    <Button variant="outline" onClick={handleFileSelectClick}>Select File</Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card><CardHeader><CardTitle>Recent Payouts</CardTitle></CardHeader><CardContent><div className="space-y-4">{payouts.map((p) => (<div key={p.id} className="flex items-center justify-between p-4 border border-border rounded-lg"><div className="space-y-1"><div className="flex items-center gap-2"><p className="font-mono text-sm font-semibold">{p.id}</p><Badge className={getStatusColor(p.status)} variant="secondary">{p.status}</Badge></div><p className="text-sm text-muted-foreground">{p.recipient} • {p.date}</p></div><p className="text-lg font-bold">{p.amount}</p></div>))}</div></CardContent></Card>
    </div>
  );
};

export default Payouts;
