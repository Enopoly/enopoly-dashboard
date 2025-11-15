import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Code, Zap, Shield } from "lucide-react";

const Documentation = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Documentation</h1>
        <p className="text-muted-foreground">Learn how to integrate WaveFlow into your application</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Getting Started</CardTitle>
                <p className="text-sm text-muted-foreground">Quick start guide and tutorials</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View Documentation</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>API Reference</CardTitle>
                <p className="text-sm text-muted-foreground">Complete API documentation</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View API Docs</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Webhooks Guide</CardTitle>
                <p className="text-sm text-muted-foreground">Set up real-time notifications</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View Guide</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Security Best Practices</CardTitle>
                <p className="text-sm text-muted-foreground">Keep your integration secure</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View Guide</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documentation;
