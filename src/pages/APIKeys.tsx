import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Copy, Eye, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const apiKeys = [
  {
    name: "Production API Key",
    key: "wave_prod_sk...cdef",
    scopes: ["checkout", "payout", "webhooks"],
    created: "2024-01-01",
    lastUsed: "2024-01-15 14:32",
  },
  {
    name: "Development API Key",
    key: "wave_dev_sk...dcba",
    scopes: ["checkout"],
    created: "2023-12-15",
    lastUsed: "2024-01-14 09:15",
  },
];

const APIKeys = () => {
  const [keys, setKeys] = useState(apiKeys);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

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

  const handleCreateKey = () => {
    toast.info("Create API key dialog would open here");
  };

  const handleDeleteKey = (name: string) => {
    setKeys(keys.filter(key => key.name !== name));
    toast.success(`${name} deleted successfully!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Keys</h1>
          <p className="text-muted-foreground">Manage your API keys for authentication</p>
        </div>
        <Button onClick={handleCreateKey}>
          <Plus className="w-4 h-4 mr-2" />
          Create API Key
        </Button>
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
              {keys.map((apiKey) => (
                <TableRow key={apiKey.key}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {revealedKeys.has(apiKey.key) ? apiKey.key : apiKey.key}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => handleToggleReveal(apiKey.key)}
                      >
                        <Eye className="w-3 h-3" />
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
                    >
                      <Trash2 className="w-4 h-4" />
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
