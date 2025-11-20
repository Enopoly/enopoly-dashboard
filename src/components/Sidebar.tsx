import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  Key, 
  Webhook
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Payouts", url: "/payouts", icon: Wallet },
  { title: "API Keys", url: "/api-keys", icon: Key },
  { title: "Webhooks", url: "/webhooks", icon: Webhook },
];

const SidebarContent = () => (
  <>
    <div className="p-6 border-b border-sidebar-border">
      <div className="flex flex-col items-center gap-2">
        <img 
          src="/sidebar_logo.png" 
          alt="Enopoly Automation" 
          className="h-auto w-full max-w-[180px]"
        />
        <p className="text-xs text-sidebar-foreground/60 text-center">E-commerce Automation</p>
      </div>
    </div>
    
    <nav className="flex-1 p-4">
      <div className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  </>
);

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar = ({ mobileOpen = false, onMobileClose }: SidebarProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose?.()}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
          <div className="flex flex-col h-full">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="hidden md:flex w-64 bg-sidebar border-r border-sidebar-border flex-col">
      <SidebarContent />
    </aside>
  );
};
