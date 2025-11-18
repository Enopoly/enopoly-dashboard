import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Copy, Eye, EyeOff, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { fakeApiCall, generateApiKey } from "@/lib/api";

const APIKeys = () => {
  const { apiKeys, addApiKey, deleteApiKey } = useData();
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(["checkout"]);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleCopyKey = async (key: string, name: string) => {
    try {
      await navigator.clipboard.writeText(key);
      toast.success(`${name} copied to clipboard!`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleToggleReveal = (key: string) => {
    setRevealedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    setIsCreating(true);
    toast.loading("Generating API key...");
    
    await fakeApiCall(1500);
    
    const newKey = generateApiKey();
    const newApiKey = {
      name: newKeyName,
      key: newKey,
      scopes: newKeyScopes,
      created: new Date().toISOString().split('T')[0],
      lastUsed: "Never"
    };
    
    addApiKey(newApiKey);
    setGeneratedKey(newKey);
    
    setIsCreating(false);
    toast.dismiss();
    toast.success("API Key created successfully!");
  };

  const handleDeleteKey = async (name: string) => {
    setIsDeleting(name);
    toast.loading("Revoking API key...");
    
    await fakeApiCall(1000);
    
    deleteApiKey(name);
    
    setIsDeleting(null);
    toast.dismiss();
    toast.error(`${name} revoked successfully!`);
  };

  const toggleScope = (scope: string) => {
    setNewKeyScopes(prev => 
      prev.includes(scope) 
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    );
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setNewKeyName("");
    setNewKeyScopes(["checkout"]);
    setGeneratedKey(null);
  };

  const maskKey = (key: string) => {
    return key.slice(0, 15) + "..." + key.slice(-4);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Keys</h1>
          <p className="text-muted-foreground">Manage your API keys for authentication</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {generatedKey ? "API Key Created" : "Create New API Key"}
              </DialogTitle>
              <DialogDescription>
                {generatedKey 
                  ? "Save this API key now. You won't be able to see it again!"
                  : "Generate a new API key for your application"
                }
              </DialogDescription>
            </DialogHeader>
            
            {generatedKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <code className="text-sm font-mono break-all">{generatedKey}</code>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleCopyKey(generatedKey, "API Key")}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Key
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="Production API Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Scopes</Label>
                  <div className="flex flex-wrap gap-2">
                    {["checkout", "payout", "webhooks", "refunds"].map(scope => (
                      <Badge
                        key={scope}
                        variant={newKeyScopes.includes(scope) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleScope(scope)}
                      >
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              {generatedKey ? (
                <Button onClick={closeDialog} className="w-full">
                  Done
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={closeDialog} disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateKey} disabled={isCreating}>
                    {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Generate Key
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.key}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {revealedKeys.has(apiKey.key) ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => handleToggleReveal(apiKey.key)}
                      >
                        {revealedKeys.has(apiKey.key) ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => handleCopyKey(apiKey.key, apiKey.name)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {apiKey.scopes.map((scope) => (
                        <Badge key={scope} variant="secondary" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{apiKey.created}</TableCell>
                  <TableCell className="text-muted-foreground">{apiKey.lastUsed}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteKey(apiKey.name)}
                      disabled={isDeleting === apiKey.name}
                    >
                      {isDeleting === apiKey.name ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Never expose API keys in client-side code or public repositories</li>
                <li>Rotate keys regularly and revoke unused keys</li>
                <li>Use different keys for different environments (sandbox vs. live)</li>
                <li>Grant minimum necessary scopes for each key</li>
                <li>Monitor API key usage and set up alerts for unusual activity</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIKeys;
