import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TopNav = () => {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4">
      <Badge variant="secondary" className="font-mono font-semibold">
        SANDBOX
      </Badge>
      
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search transactions, sessions..." 
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="ml-auto flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
        <Avatar>
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
