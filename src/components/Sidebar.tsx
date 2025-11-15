import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  Key, 
  Webhook, 
  FileText,
  Waves
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Payouts", url: "/payouts", icon: Wallet },
  { title: "API Keys", url: "/api-keys", icon: Key },
  { title: "Webhooks", url: "/webhooks", icon: Webhook },
  { title: "Documentation", url: "/documentation", icon: FileText },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Waves className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">WaveFlow</h1>
            <p className="text-xs text-sidebar-foreground/60">Payment Platform</p>
          </div>
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
    </aside>
  );
};
