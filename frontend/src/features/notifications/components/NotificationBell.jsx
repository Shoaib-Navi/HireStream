import { useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getNotificationsPath } from "@/config/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { NOTIFICATIONS_POLL_MS, useGetNotificationsQuery, useMarkAllNotificationsReadMutation } from "../api";
import { useOpenNotification } from "../hooks/useOpenNotification";
import NotificationItem from "./NotificationItem";

const PREVIEW_LIMIT = 6;

const NotificationBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { data } = useGetNotificationsQuery({ limit: PREVIEW_LIMIT }, { pollingInterval: NOTIFICATIONS_POLL_MS, skipPollingIfUnfocused: true });
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();
  const openNotification = useOpenNotification();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.meta?.unreadCount ?? 0;

  const handleOpen = (notification) => {
    openNotification(notification);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        >
          <Bell />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-xs leading-4 font-semibold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
          <p className="type-h4 text-foreground">Notifications</p>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" className="h-auto px-0" disabled={markingAll} onClick={() => markAllRead()}>
              Mark all as read
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="type-body px-4 py-10 text-center text-muted-foreground">You're all caught up.</p>
        ) : (
          <ul className="max-h-96 overflow-y-auto p-1.5">
            {notifications.map((notification) => (
              <li key={notification._id}>
                <NotificationItem notification={notification} onOpen={handleOpen} compact />
              </li>
            ))}
          </ul>
        )}
        <div className="border-t p-1.5">
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link to={getNotificationsPath(user?.role)} onClick={() => setOpen(false)}>
              View all
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
