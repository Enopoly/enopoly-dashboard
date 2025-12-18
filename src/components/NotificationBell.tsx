import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { fetchInvoices } from "@/lib/api";

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const invoices = await fetchInvoices();
            // Get last 5 invoices as notifications
            const recent = invoices.slice(0, 5).map(inv => ({
                id: inv.id,
                message: `New invoice ${inv.invoice_number} for ${inv.customer_name}`,
                time: new Date(inv.created_at).toLocaleString(),
                read: false
            }));
            setNotifications(recent);
            setUnreadCount(recent.filter(n => !n.read).length);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Notifications</h4>
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                                Mark all as read
                            </Button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {notifications.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No notifications
                            </p>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-3 rounded-lg border ${notif.read ? 'bg-background' : 'bg-muted'
                                        }`}
                                >
                                    <p className="text-sm">{notif.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};
