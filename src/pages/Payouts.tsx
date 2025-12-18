import { Card, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";

const Payouts = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Payouts</h1>
        <p className="text-sm md:text-base text-muted-foreground">Send payments to recipients</p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="p-4 bg-blue-100 rounded-full">
            <Wallet className="w-12 h-12 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Outgoing Payouts</h2>
            <p className="text-blue-700 mt-2 max-w-md mx-auto">
              This section is for sending money to others (e.g. Payroll).
              To view your <b>Incoming Customer Payments</b>, please visit the <a href="/transactions" className="underline font-bold">Transactions Page</a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payouts;
