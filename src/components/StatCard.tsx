import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend?: "up" | "down";
}

export const StatCard = ({ title, value, change, icon: Icon, trend = "up" }: StatCardProps) => {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl sm:text-3xl font-bold mb-2 truncate">{value}</h3>
            <p className={cn(
              "text-xs sm:text-sm font-medium",
              trend === "up" ? "text-success" : "text-destructive"
            )}>
              {change}
            </p>
          </div>
          <div className="p-2 sm:p-3 bg-muted rounded-lg flex-shrink-0 ml-2">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
