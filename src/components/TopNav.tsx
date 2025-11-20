import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopNavProps {
  onMenuClick: () => void;
}

export const TopNav = ({ onMenuClick }: TopNavProps) => {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-4 md:px-6 gap-2 md:gap-4">
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </Button>
      
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search transactions, sessions..." 
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <Bell className="w-5 h-5" />
        </Button>
        <Avatar className="h-8 w-8 md:h-10 md:w-10">
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
